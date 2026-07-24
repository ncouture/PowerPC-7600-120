import { TestBed } from '@angular/core/testing';
import { firstValueFrom, toArray } from 'rxjs';
import { BitHacksService, CardResult } from './bit-hacks.service';

describe('BitHacksService', () => {
  let service: BitHacksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitHacksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('LFSR Bit-Hack PRNG', () => {
    it('should generate bounded pseudo-random numbers using 16-bit LFSR Xorshift', () => {
      const min = 0;
      const max = 9;
      for (let i = 0; i < 50; i++) {
        const val = service.nextBitHackRandom(min, max);
        expect(val).toBeGreaterThanOrEqual(min);
        expect(val).toBeLessThanOrEqual(max);
      }
    });
  });

  describe('Stanford SWAR Bitwise Routines', () => {
    it('should execute SWAR parallel bit count reduction correctly', () => {
      const count = service.swarParallelBitCount(0b101101); // 4 bits set
      expect(count).toBe(4);
    });
  });

  describe('ISO/IEC 7812 Mod-10 Luhn Checksum Algorithm', () => {
    it('should calculate exact Mod-10 Luhn check digit for partial card strings', () => {
      const partialVisa = '453201511283036';
      const checkDigit = service.calculateLuhnChecksum(partialVisa);
      expect(checkDigit).toBe(6);
    });

    it('should validate complete Luhn card numbers', () => {
      const validVisa = '4532015112830366';
      const invalidVisa = '4532015112830367';
      expect(service.validateLuhn(validVisa)).toBe(true);
      expect(service.validateLuhn(invalidVisa)).toBe(false);
    });
  });

  describe('Card Batch Generation & Exact Count Streaming', () => {
    it('should generate exact requested count of 5 cards when count is 5', async () => {
      const cardsStream$ = service.streamCardBatch('visa', 5, 'lfsr').pipe(toArray());
      const cards = await firstValueFrom(cardsStream$);
      expect(cards.length).toBe(5);
      cards.forEach(card => {
        expect(card.issuer).toBe('visa');
        expect(card.cardNumber.startsWith('4')).toBe(true);
        expect(card.cardNumber.length).toBe(16);
        expect(card.isValid).toBe(true);
        expect(service.validateLuhn(card.cardNumber)).toBe(true);
      });
    });

    it('should generate exact requested count for batch sizes of 1, 8, and 12', async () => {
      const batch1 = await firstValueFrom(service.streamCardBatch('visa', 1, 'lfsr').pipe(toArray()));
      expect(batch1.length).toBe(1);

      const batch8 = await firstValueFrom(service.streamCardBatch('mc', 8, 'scase').pipe(toArray()));
      expect(batch8.length).toBe(8);

      const batch12 = await firstValueFrom(service.streamCardBatch('amex', 12, 'ppc_tb').pipe(toArray()));
      expect(batch12.length).toBe(12);
    });

    it('should correctly handle MasterCard 16-digit cards with prefixes 51-55', () => {
      const batch: CardResult[] = service.generateCardBatch('mc', 10, 'scase');
      expect(batch.length).toBe(10);
      batch.forEach((card: CardResult) => {
        expect(card.issuer).toBe('mc');
        expect(['51', '52', '53', '54', '55'].some(prefix => card.cardNumber.startsWith(prefix))).toBe(true);
        expect(card.cardNumber.length).toBe(16);
        expect(card.isValid).toBe(true);
      });
    });

    it('should correctly handle American Express 15-digit cards with prefixes 34/37', () => {
      const batch: CardResult[] = service.generateCardBatch('amex', 5, 'ppc_tb');
      expect(batch.length).toBe(5);
      batch.forEach((card: CardResult) => {
        expect(card.issuer).toBe('amex');
        expect(['34', '37'].some(prefix => card.cardNumber.startsWith(prefix))).toBe(true);
        expect(card.cardNumber.length).toBe(15);
        expect(card.isValid).toBe(true);
      });
    });

    it('should correctly handle Discover 16-digit cards with prefix 6011', () => {
      const batch: CardResult[] = service.generateCardBatch('discover', 5, 'lfsr');
      expect(batch.length).toBe(5);
      batch.forEach((card: CardResult) => {
        expect(card.issuer).toBe('discover');
        expect(card.cardNumber.startsWith('6011')).toBe(true);
        expect(card.cardNumber.length).toBe(16);
        expect(card.isValid).toBe(true);
      });
    });
  });
});
