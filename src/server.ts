import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// LFSR seed state for server generator
let lfsrState = 0xACE1;
function serverNextRandom(min: number, max: number): number {
  lfsrState ^= (lfsrState << 7) & 0xFFFF;
  lfsrState ^= (lfsrState >> 9) & 0xFFFF;
  lfsrState ^= (lfsrState << 8) & 0xFFFF;
  const val = Math.abs(lfsrState);
  return min + (val % (max - min + 1));
}

function calculateLuhnChecksum(partialNumberStr: string): number {
  let sum = 0;
  let alt = true;
  for (let i = partialNumberStr.length - 1; i >= 0; i--) {
    let n = parseInt(partialNumberStr.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

function validateLuhn(fullNumberStr: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = fullNumberStr.length - 1; i >= 0; i--) {
    let n = parseInt(fullNumberStr.charAt(i), 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return (sum % 10 === 0);
}

/**
 * Server-Sent Events (SSE) Batch Card Generation Endpoint
 */
app.get('/api/generate-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const issuer = (req.query['issuer'] as string) || 'visa';
  const batchCount = Math.min(20, Math.max(1, parseInt(req.query['batchCount'] as string, 10) || 5));
  const entropy = (req.query['entropy'] as string) || 'lfsr';

  let prefixList = ['4'];
  let targetLength = 16;
  if (issuer === 'visa') { prefixList = ['4']; targetLength = 16; }
  else if (issuer === 'mc') { prefixList = ['51', '52', '53', '54', '55']; targetLength = 16; }
  else if (issuer === 'amex') { prefixList = ['34', '37']; targetLength = 15; }
  else if (issuer === 'discover') { prefixList = ['6011']; targetLength = 16; }

  let index = 0;
  const interval = setInterval(() => {
    if (index >= batchCount) {
      res.write(`event: complete\ndata: ${JSON.stringify({ status: 'COMPLETE', total: batchCount })}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }

    let cardNum = prefixList[serverNextRandom(0, prefixList.length - 1)];
    while (cardNum.length < targetLength - 1) {
      cardNum += serverNextRandom(0, 9).toString();
    }

    const checkDigit = calculateLuhnChecksum(cardNum);
    const finalCard = cardNum + checkDigit.toString();
    const isValid = validateLuhn(finalCard);

    const payload = {
      cardNumber: finalCard,
      issuer,
      length: targetLength,
      mode: entropy === 'ppc_tb' ? 'PowerPC Time Base (SSR)' : entropy === 'scase' ? 'Stanford SWAR (SSR)' : '16-bit LFSR PRNG (SSR)',
      isValid,
      checkDigit
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    index++;
  }, 100);

  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * Serve static assets from /assets URI route
 */
app.use(
  '/assets',
  express.static(join(browserDistFolder, 'assets'), {
    maxAge: '1y',
    redirect: false,
  }),
);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
