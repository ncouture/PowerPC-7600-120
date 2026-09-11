# PowerPC 1996 Bit-Hacks Credit Card Generator Utility (Angular SSR)

A moderately bad retro computing web application built for fun in an attempt to recreate a memory running my first internet connected computer, on Macintosh System 7 on PowerPC 7600/120 in 1996/1997.

Built with **Angular v22+ Standalone Components**, and **Server-Side Rendering (`@angular/ssr`)** for fun, **Server-Sent Events (SSE)** to fool around angular signals, **Tailwind CSS v4**, and **Firebase App Hosting**.

---

## Core Features

- **Angular v22+ Standalone Architecture & SSR:** Server-side rendered Angular backend offloading bitwise calculations and serving period-accurate static UI assets.
- **Stanford SWAR Bit-Hacks Engine:**
  - Sean Anderson's SWAR (SIMD Within A Register) parallel bit manipulation algorithms.
  - 16-bit Maximal Period LFSR (Xorshift) pseudo-random bit generator.
  - ISO/IEC 7812 Mod-10 Luhn checksum bitmask calculation & verification.
- **Server-Sent Events (SSE) Real-Time Stream:** Real-time card batch datastreams via `/api/generate-stream` with automatic client-side fallback.
- **Period-Accurate Macintosh System 7 UI:**
  - Classic System 7 window manager with CRT scanline overlay filters and vintage typography (`Geneva`, `Chicago FLF`, `VT323`).
  - Interactive menu bar with global keyboard shortcuts (`⌘+G` / `Ctrl+G` to generate, `⌘+K` / `Ctrl+K` to clear logs).
  - ARIA live region terminal console (`aria-live="polite"`) with text/JSON log export capability.
  - Retro System Notice alert modal with focus trapping and retro system error codes.
  - Synthesized Web Audio API System 7 audio cues (click, chime, alert beep).

---

## Tech Stack

- **Framework:** Angular v22+ (SSR enabled via `@angular/ssr`)
- **Backend API:** Node.js Express server (`src/server.ts`) with SSE endpoints
- **Styling:** Tailwind CSS v4
- **State Management:** Angular Signals & RxJS streams
- **Testing:** Vitest & Jasmine unit test suite
- **Hosting & CI/CD:** Firebase App Hosting 

---

## Getting Started

### Prerequisites

- Node.js v22+
- npm v10+

### Installation

```bash
# Clone the repository
git clone git@github.com:ncouture/credit-card-generator.git 
cd credit-card-generator

# Install dependencies
npm install
```

### Development Server

Run local development server:

```bash
NG_ALLOWED_HOSTS=localhost npm run dev
```

Navigate to `http://localhost:4200/`.

### Server-Side Rendering (SSR) Production Build & Serve

```bash
# Build production bundle with SSR
npm run build

# Serve production SSR server
NG_ALLOWED_HOSTS=localhost npm run serve:ssr:bit-hack
```

The Node.js Express SSR server will listen on `http://localhost:4000/`.

### Unit Tests

Run test suite:

```bash
npm test -- --watch=false --coverage
```

