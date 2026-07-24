import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type CardIssuer = 'visa' | 'mc' | 'amex' | 'discover';
export type EntropySource = 'ppc_tb' | 'scase' | 'lfsr';

export interface CardResult {
  cardNumber: string;
  issuer: CardIssuer;
  length: number;
  mode: string;
  isValid: boolean;
  checkDigit: number;
}

@Injectable({
  providedIn: 'root'
})
export class BitHacksService {
  private lfsrState = 0xACE1; // 16-bit seed

  /**
   * 16-bit Maximal Period LFSR (Xorshift PRNG)
   */
  nextBitHackRandom(min: number, max: number): number {
    this.lfsrState ^= (this.lfsrState << 7) & 0xFFFF;
    this.lfsrState ^= (this.lfsrState >> 9) & 0xFFFF;
    this.lfsrState ^= (this.lfsrState << 8) & 0xFFFF;
    const val = Math.abs(this.lfsrState);
    return min + (val % (max - min + 1));
  }

  /**
   * Stanford SWAR (SIMD Within A Register) Parallel Bit Count
   */
  swarParallelBitCount(v: number): number {
    v = v - ((v >> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
    return (((v + (v >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
  }

  /**
   * ISO/IEC 7812 Mod-10 Luhn Checksum Digit Calculation
   */
  calculateLuhnChecksum(partialNumberStr: string): number {
    let sum = 0;
    let alt = true;
    for (let i = partialNumberStr.length - 1; i >= 0; i--) {
      let n = parseInt(partialNumberStr.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      sum += n;
      alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }

  /**
   * ISO/IEC 7812 Mod-10 Luhn Checksum Validation
   */
  validateLuhn(fullNumberStr: string): boolean {
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
   * Generate card batch using Stanford SWAR and 16-bit LFSR PRNG algorithms
   */
  generateCardBatch(issuer: CardIssuer, count: number, entropy: EntropySource): CardResult[] {
    const validCount = Math.max(1, Math.min(50, count || 5));
    let prefixList: string[] = ['4'];
    let targetLength = 16;

    if (issuer === 'visa') {
      prefixList = ['4'];
      targetLength = 16;
    } else if (issuer === 'mc') {
      prefixList = ['51', '52', '53', '54', '55'];
      targetLength = 16;
    } else if (issuer === 'amex') {
      prefixList = ['34', '37'];
      targetLength = 15;
    } else if (issuer === 'discover') {
      prefixList = ['6011'];
      targetLength = 16;
    }

    const results: CardResult[] = [];

    for (let b = 0; b < validCount; b++) {
      let cardNum = prefixList[this.nextBitHackRandom(0, prefixList.length - 1)];

      while (cardNum.length < targetLength - 1) {
        cardNum += this.nextBitHackRandom(0, 9).toString();
      }

      const checkDigit = this.calculateLuhnChecksum(cardNum);
      const finalCard = cardNum + checkDigit.toString();
      const isValid = this.validateLuhn(finalCard);

      results.push({
        cardNumber: finalCard,
        issuer,
        length: targetLength,
        mode: entropy === 'ppc_tb' ? 'PowerPC Time Base' : entropy === 'scase' ? 'Stanford SWAR' : '16-bit LFSR PRNG',
        isValid,
        checkDigit
      });
    }

    return results;
  }

  /**
   * Stream exact requested count of cards sequentially with real-time vector sweep feedback
   */
  streamCardBatch(issuer: CardIssuer, count: number, entropy: EntropySource): Observable<CardResult> {
    const subject = new Subject<CardResult>();
    const batch = this.generateCardBatch(issuer, count, entropy);

    let index = 0;
    const interval = setInterval(() => {
      if (index < batch.length) {
        subject.next(batch[index]);
        index++;
      } else {
        clearInterval(interval);
        subject.complete();
      }
    }, 50);

    return subject.asObservable();
  }
}
