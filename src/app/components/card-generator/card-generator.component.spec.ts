import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { vi } from 'vitest';
import { CardGeneratorComponent } from './card-generator.component';
import { BitHacksService, CardResult } from '../../services/bit-hacks.service';
import { SoundEffectsService } from '../../services/sound-effects.service';
import { of, Subject } from 'rxjs';

describe('CardGeneratorComponent', () => {
  let component: CardGeneratorComponent;
  let fixture: ComponentFixture<CardGeneratorComponent>;
  let mockBitHacks: any;
  let mockSound: any;

  const mockCard: CardResult = {
    cardNumber: '4111111111111111',
    issuer: 'visa',
    length: 16,
    mode: '16-bit LFSR PRNG',
    isValid: true,
    checkDigit: 1,
  };

  beforeEach(async () => {
    mockBitHacks = {
      streamCardBatch: vi.fn(),
    };

    mockSound = {
      playClick: vi.fn(),
      playSuccess: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CardGeneratorComponent],
      providers: [
        { provide: BitHacksService, useValue: mockBitHacks },
        { provide: SoundEffectsService, useValue: mockSound },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default visa issuer, lfsr entropy, batch count 1, and autoLuhn true', () => {
    expect(component.selectedIssuer).toBe('visa');
    expect(component.selectedEntropy).toBe('lfsr');
    expect(component.batchCount).toBe(1);
    expect(component.autoLuhn).toBe(true);
    expect(component.generatedCards().length).toBe(0);
    expect(component.isStreaming()).toBe(false);
  });

  it('should generate cards and emit log events when generate() is called', () => {
    const subject = new Subject<CardResult>();
    mockBitHacks.streamCardBatch.and
      ? mockBitHacks.streamCardBatch.and.returnValue(subject.asObservable())
      : (mockBitHacks.streamCardBatch = vi.fn().mockReturnValue(subject.asObservable()));

    const logSpy = vi.spyOn(component.logEvent, 'emit');

    component.generate();

    expect(mockSound.playClick).toHaveBeenCalled();
    expect(component.isStreaming()).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('VISA'));

    // Emit a card
    subject.next(mockCard);
    expect(component.generatedCards().length).toBe(1);
    expect(component.generatedCards()[0].cardNumber).toBe('4111111111111111');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('4111111111111111'));

    // Complete
    subject.complete();
    expect(component.isStreaming()).toBe(false);
    expect(mockSound.playSuccess).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
  });

  it('should handle stream error gracefully', () => {
    const subject = new Subject<CardResult>();
    mockBitHacks.streamCardBatch = vi.fn().mockReturnValue(subject.asObservable());

    component.generate();
    expect(component.isStreaming()).toBe(true);

    subject.error(new Error('Stream failed'));
    expect(component.isStreaming()).toBe(false);
  });

  it('should clear results and emit log event', () => {
    component.generatedCards.set([mockCard, mockCard]);
    const logSpy = vi.spyOn(component.logEvent, 'emit');

    component.clearResults();

    expect(mockSound.playClick).toHaveBeenCalled();
    expect(component.generatedCards().length).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('cleared'));
  });

  it('should format card number into space-separated groups of 4', () => {
    expect(component.formatDisplay('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(component.formatDisplay('341111111111111')).toBe('3411 1111 1111 111');
    expect(component.formatDisplay('')).toBe('');
  });

  it('should copy card to clipboard via navigator API and emit events', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    });

    const alertSpy = vi.spyOn(component.alertEvent, 'emit');
    const logSpy = vi.spyOn(component.logEvent, 'emit');

    await component.copyCard('4111111111111111');

    // Allow promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockSound.playClick).toHaveBeenCalled();
    expect(writeTextSpy).toHaveBeenCalledWith('4111111111111111');
  });

  it('should use fallback copy when clipboard API is unavailable', () => {
    // Remove clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Mock execCommand on document since jsdom doesn't define it
    (document as any).execCommand = vi.fn().mockReturnValue(true);
    const alertSpy = vi.spyOn(component.alertEvent, 'emit');

    component.copyCard('4111111111111111');

    expect((document as any).execCommand).toHaveBeenCalledWith('copy');
    expect(alertSpy).toHaveBeenCalledWith('Copied buffer to clipboard successfully!');
    delete (document as any).execCommand;
  });

  it('should handle fallback copy failure', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    (document as any).execCommand = vi.fn().mockImplementation(() => {
      throw new Error('Copy failed');
    });

    const alertSpy = vi.spyOn(component.alertEvent, 'emit');
    component.copyCard('4111111111111111');

    expect(alertSpy).toHaveBeenCalledWith('Clipboard access restricted.');
    delete (document as any).execCommand;
  });
});
