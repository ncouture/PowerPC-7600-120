import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-about-modal',
  standalone: true,
  imports: [],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 select-none"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <div
          #modalContainer
          class="mac-window bg-white p-5 w-full max-w-md shadow-2xl space-y-4 border-2 border-black"
        >
          <!-- Mac OS About Header -->
          <div class="flex items-center space-x-3 border-b-2 border-black pb-3">
            <div
              class="w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center text-xl font-bold font-mono shadow-sm"
            >
              
            </div>
            <div>
              <h2 [id]="titleId" class="font-bold text-xs uppercase tracking-wider text-black">
                About PowerPC Bit-Hacks Utility
              </h2>
              <div class="text-[10px] font-mono text-gray-600">
                System 7 Macintosh Desktop Environment (1996/1997)
              </div>
            </div>
          </div>
          <!-- Specifications & Help Content -->
          <div class="space-y-3 text-xs font-mono">
            <div class="mac-inset p-3 bg-amber-50/40 space-y-1.5 text-[11px]">
              <div class="font-bold text-black border-b border-gray-300 pb-1">
                Hardware & Emulation Context
              </div>
              <div>• CPU: PowerPC 604e @ 200 MHz (Backside L2 Cache 512KB)</div>
              <div>• SIMD Unit: AltiVec Vector Acceleration (Stanford SWAR)</div>
              <div>• OS Environment: Mac OS System 7.5.5 / Open Firmware v2.4</div>
              <div>• Audio Engine: System 7 Web Audio Synthesizer (6 Themes)</div>
            </div>
            <!-- Nested Help & Shortcuts Section -->
            <div class="bg-white p-3 border border-black space-y-1.5">
              <div
                class="font-bold text-black flex items-center justify-between text-[11px] border-b border-gray-200 pb-1"
              >
                <span>Help & Keyboard Shortcuts Guide</span>
                <span class="text-[9px] bg-gray-200 px-1 border border-black">System 7</span>
              </div>
              <div class="text-[10px] space-y-1 pt-1">
                <div class="flex justify-between">
                  <span>Generate Card Datastream:</span>
                  <span class="font-bold text-black">⌘+G (or Ctrl+G)</span>
                </div>
                <div class="flex justify-between">
                  <span>Run PowerPC Hardware Benchmarks:</span>
                  <span class="font-bold text-black">⌘+B (or Ctrl+B)</span>
                </div>
                <div class="flex justify-between">
                  <span>Sound Control Panel:</span>
                  <span class="font-bold text-black">⌘+S (or Ctrl+S)</span>
                </div>
                <div class="flex justify-between">
                  <span>Toggle Quick Audio Mute:</span>
                  <span class="font-bold text-black">⌘+M (or Ctrl+M)</span>
                </div>
                <div class="flex justify-between">
                  <span>Clear Assembly Log Buffer:</span>
                  <span class="font-bold text-black">⌘+K (or Ctrl+K)</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Footer Button -->
          <div class="flex justify-end pt-2">
            <button
              #closeBtn
              (click)="closeModal()"
              class="mac-button px-5 py-1 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AboutModalComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  titleId = 'about-modal-title-' + Math.random().toString(36).substring(2, 9);

  ngAfterViewInit(): void {
    if (this.isOpen && this.closeBtn) {
      this.closeBtn.nativeElement.focus();
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
