import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitHacksService, CardIssuer, EntropySource, CardResult } from '../../services/bit-hacks.service';
import { SoundEffectsService } from '../../services/sound-effects.service';

@Component({
  selector: 'app-card-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      <!-- Left Controls Panel -->
      <div class="md:col-span-5 space-y-4">
        
        <!-- 1. Issuer Selection -->
        <div class="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000]">
          <h2 class="text-xs uppercase bg-black text-white px-2 py-1 font-bold mb-3 tracking-wider">1. Select ISO/IEC 7812 Issuer</h2>
          <div class="space-y-2 text-xs">
            <label class="block flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="issuer" value="visa" [(ngModel)]="selectedIssuer" class="accent-black">
              <span><b>Visa (4xxx)</b> - Standard 16-Digit</span>
            </label>
            <label class="block flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="issuer" value="mc" [(ngModel)]="selectedIssuer" class="accent-black">
              <span><b>MasterCard (51-55)</b> - 16-Digit</span>
            </label>
            <label class="block flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="issuer" value="amex" [(ngModel)]="selectedIssuer" class="accent-black">
              <span><b>American Express (34/37)</b> - 15-Digit</span>
            </label>
            <label class="block flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="issuer" value="discover" [(ngModel)]="selectedIssuer" class="accent-black">
              <span><b>Discover (6011)</b> - 16-Digit</span>
            </label>
          </div>
        </div>

        <!-- 2. Bit-Hacks Configuration -->
        <div class="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#000]">
          <h2 class="text-xs uppercase bg-black text-white px-2 py-1 font-bold mb-3 tracking-wider">2. PowerPC Bit-Hacks Engine</h2>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold mb-1">Bitwise Entropy Source:</label>
              <select [(ngModel)]="selectedEntropy" class="w-full mac-inset p-1 text-xs font-mono">
                <option value="ppc_tb">PowerPC 603e Time Base Register (TB)</option>
                <option value="scase">Sean Anderson's SWAR Parallel Sum Bit-Hack</option>
                <option value="lfsr">16-bit Maximal Period LFSR (Xorshift)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">Batch Generation Count:</label>
              <input type="number" [(ngModel)]="batchCount" min="1" max="20" class="w-full mac-inset p-1 text-xs font-mono">
            </div>
            <div class="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="autoLuhn" [(ngModel)]="autoLuhn" class="accent-black">
              <label for="autoLuhn" class="font-bold cursor-pointer">Enforce Luhn Checksum Mod-10 BitMask</label>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button (click)="generate()" 
                [disabled]="isStreaming()"
                class="w-full mac-button py-3 text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer hover:bg-gray-100 active:bg-gray-300 disabled:opacity-50">
          <span class="text-base">⚡</span>
          <span>{{ isStreaming() ? 'Sweeping Bit Vectors...' : 'Generate' }}</span>
        </button>

      </div>

      <!-- Right Datastream Output Panel -->
      <div class="md:col-span-7 flex flex-col space-y-4">
        <ng-content select="app-console-log"></ng-content>

        <div class="bg-white border-2 border-black p-4 flex-1 flex flex-col shadow-[3px_3px_0px_#000]">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-xs uppercase font-bold tracking-wide">Generated Valid Datastreams (Luhn Verified)</h2>
            <button (click)="clearResults()" class="mac-button px-2 py-0.5 text-[10px] cursor-pointer">Clear Buffer</button>
          </div>

          <div class="mac-inset flex-1 p-3 font-mono text-xs overflow-y-auto min-h-[160px] max-h-[240px] bg-amber-50/30 space-y-2">
            <div *ngIf="generatedCards().length === 0" class="text-gray-400 italic">
              No datastreams generated yet. Click 'Go' above.
            </div>

            <div *ngFor="let card of generatedCards()" 
                 class="bg-white border border-black p-2 flex items-center justify-between shadow-xs hover:bg-yellow-50 transition-colors">
              <div class="space-y-0.5">
                <div class="font-bold text-black flex items-center space-x-2">
                  <span>💳</span>
                  <span class="tracking-widest font-mono text-sm">{{ formatDisplay(card.cardNumber) }}</span>
                </div>
                <div class="text-[10px] text-gray-600">
                  Issuer: <span class="uppercase font-bold text-black">{{ card.issuer }}</span> 
                  | Length: {{ card.length }} 
                  | Mode: {{ card.mode }}
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 bg-green-200 border border-green-600 text-[10px] font-bold text-green-900">VERIFIED VALID</span>
                <button (click)="copyCard(card.cardNumber)" class="mac-button px-2 py-1 text-[10px] cursor-pointer">Copy</button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class CardGeneratorComponent {
  selectedIssuer: CardIssuer = 'visa';
  selectedEntropy: EntropySource = 'lfsr';
  batchCount = 1;
  autoLuhn = true;

  generatedCards = signal<CardResult[]>([]);
  isStreaming = signal<boolean>(false);

  @Output() logEvent = new EventEmitter<string>();
  @Output() alertEvent = new EventEmitter<string>();

  constructor(
    private bitHacksService: BitHacksService,
    private soundEffects: SoundEffectsService
  ) {}

  generate(): void {
    this.soundEffects.playClick();
    this.isStreaming.set(true);
    this.logEvent.emit(`Initiating vector sweep for issuer: ${this.selectedIssuer.toUpperCase()} via ${this.selectedEntropy}...`);

    this.bitHacksService.streamCardBatch(this.selectedIssuer, this.batchCount, this.selectedEntropy).subscribe({
      next: (card) => {
        this.generatedCards.update(cards => [card, ...cards]);
        this.logEvent.emit(`Generated [${card.cardNumber}] -> Luhn Checksum: ${card.checkDigit} [Valid: ${card.isValid}]`);
      },
      complete: () => {
        this.isStreaming.set(false);
        this.soundEffects.playSuccess();
        this.logEvent.emit(`Batch execution completed successfully. ${this.batchCount} records verified.`);
      },
      error: () => {
        this.isStreaming.set(false);
      }
    });
  }

  clearResults(): void {
    this.soundEffects.playClick();
    this.generatedCards.set([]);
    this.logEvent.emit('System buffer cleared by operator.');
  }

  copyCard(cardNumber: string): void {
    this.soundEffects.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cardNumber).then(() => {
        this.alertEvent.emit('Copied buffer to clipboard successfully!');
        this.logEvent.emit(`Copied datastream [${cardNumber}] to clipboard.`);
      }).catch(() => this.fallbackCopy(cardNumber));
    } else {
      this.fallbackCopy(cardNumber);
    }
  }

  private fallbackCopy(text: string): void {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      this.alertEvent.emit('Copied buffer to clipboard successfully!');
      this.logEvent.emit(`Copied datastream [${text}] to clipboard.`);
    } catch (e) {
      this.alertEvent.emit('Clipboard access restricted.');
    }
    document.body.removeChild(textarea);
  }

  formatDisplay(cardNumber: string): string {
    return cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber;
  }
}
