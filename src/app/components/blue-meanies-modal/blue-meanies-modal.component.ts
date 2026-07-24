import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blue-meanies-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-blue-950/80 z-[350] flex items-center justify-center p-4 select-none"
         role="dialog" 
         aria-modal="true">
      
      <div class="mac-window bg-blue-900 text-white border-2 border-white p-6 w-full max-w-lg shadow-2xl space-y-5 relative font-mono">
        
        <!-- Retro CRT Overlay -->
        <div class="absolute inset-0 crt-scanlines opacity-40 pointer-events-none"></div>

        <!-- Title Header -->
        <div class="flex justify-between items-center border-b border-blue-400 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🫐</span>
            <h2 class="font-bold text-sm uppercase tracking-wider text-blue-200">System 7 "Blue Meanies" Engineering Credits</h2>
          </div>
          <button (click)="closeModal()" class="mac-button bg-white text-black px-2 py-0.5 text-xs font-bold">×</button>
        </div>

        <!-- System 7 Easter Egg Banner & History -->
        <div class="space-y-3 text-xs leading-relaxed text-blue-100 bg-blue-950 p-4 border border-blue-400 shadow-inner">
          <p class="font-bold text-yellow-300">"Special Thanks to the Apple Computer Blue Meanies Group (1988–1991)"</p>
          <p>The "Blue Meanies" was the code-name for the System 7 OS development team at Apple Computer who architected Virtual Memory, QuickDraw 32-Bit, Alias Manager, and System 7 Finder.</p>
          <div class="text-[10px] text-blue-300 border-t border-blue-800 pt-2 font-mono">
            Unlocked via: ⌘+Option+Shift+B / "Blue Meanies" command string
          </div>
        </div>

        <!-- Footer OK Action -->
        <div class="flex justify-end pt-2">
          <button (click)="closeModal()" class="mac-button bg-white text-black px-6 py-1 text-xs font-bold uppercase cursor-pointer">
            Acknowledge
          </button>
        </div>

      </div>

    </div>
  `
})
export class BlueMeaniesModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
