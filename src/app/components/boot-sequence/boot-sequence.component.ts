import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SoundEffectsService } from '../../services/sound-effects.service';

export interface ExtensionIcon {
  name: string;
  icon: string;
  loaded: boolean;
}

@Component({
  selector: 'app-boot-sequence',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!isBootComplete()) {
      <div
        (click)="onContainerClick($event)"
        class="fixed inset-0 bg-gray-400 z-[200] flex flex-col items-center justify-between p-6 select-none font-mono overflow-hidden"
      >
        <!-- CRT Screen Scanlines & Glitch Effect Overlay -->
        <div class="absolute inset-0 crt-scanlines opacity-40 pointer-events-none"></div>
        <!-- Top Header / Skip Instruction -->
        <div class="w-full flex justify-between items-center text-xs text-gray-800 z-10">
          <span>Macintosh PowerPC System 7.5.5 ROM v2.4</span>
          <button (click)="skipBoot()" class="mac-button px-2 py-0.5 text-[10px] cursor-pointer">
            Press Esc / Click to Skip Boot
          </button>
        </div>
        <!-- Center Boot Dialog Box -->
        <div
          class="mac-window bg-white border-2 border-black p-6 w-full max-w-lg shadow-2xl space-y-5 relative z-10"
        >
          <!-- Happy Mac CRT Header -->
          <div class="flex items-center space-x-4 border-b-2 border-black pb-4">
            <div
              class="w-14 h-14 bg-black text-white border-2 border-black flex flex-col items-center justify-center text-2xl font-bold font-mono shadow-md animate-pulse"
            >
              <span>😃</span>
              <span class="text-[8px] tracking-tighter uppercase font-mono">System 7</span>
            </div>
            <div>
              <h1 class="text-sm font-bold uppercase tracking-wider text-black">
                Welcome to Macintosh
              </h1>
              <div class="text-[11px] text-gray-600 font-mono">
                Starting up PowerPC 604e @ 200 MHz...
              </div>
            </div>
          </div>
          <!-- Progress Bar & Speed Curve Indicator -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-[10px] font-mono">
              <span>System Extension Sweep:</span>
              <span class="font-bold text-black">{{ Math.round(progress()) }}%</span>
            </div>
            <!-- Vintage System 7 Progress Bar Container -->
            <div class="mac-inset p-1 bg-amber-50/50 border-2 border-black h-7 flex items-center">
              <div
                [style.width.%]="progress()"
                class="h-full bg-black transition-all duration-75 flex items-center justify-end pr-1"
              >
                @if (progress() > 10) {
                  <div class="w-1.5 h-full bg-white/40"></div>
                }
              </div>
            </div>
            <div class="flex justify-between text-[9px] text-gray-500">
              <span>0% Initialization</span>
              <span class="font-bold text-black">70% (2.3s Fake Slow Boot)</span>
              <span>100% (7.0s Ready)</span>
            </div>
          </div>
          <!-- Secret Easter Egg Prompt -->
          <div class="text-center pt-1 border-t border-gray-300">
            <button
              (click)="openEasterEgg(); $event.stopPropagation()"
              class="text-[10px] text-gray-700 hover:text-black underline cursor-pointer font-bold"
            >
              💡 Hold [Option/Alt] key during boot to view 1989 Mac IIci Dev Team Easter Egg
            </button>
          </div>
        </div>
        <!-- Bottom System 7 Extension Icon Strip (Expanded Width to Prevent Scrollbar) -->
        <div class="w-full max-w-4xl bg-white border-2 border-black p-3.5 shadow-xl z-10">
          <div
            class="text-[10px] font-bold text-black uppercase mb-1.5 flex justify-between items-center border-b border-black pb-1"
          >
            <span>Loaded System Extensions</span>
            <span>{{ loadedExtensionCount() }} / {{ extensionIcons.length }} Icons</span>
          </div>
          <div class="flex items-center justify-between flex-wrap gap-2 py-1">
            @for (ext of extensionIcons; track ext) {
              <div
                [ngClass]="{
                  'bg-black text-white': ext.loaded,
                  'bg-gray-200 text-gray-400 opacity-40': !ext.loaded,
                }"
                class="px-2.5 py-1 border border-black text-[10px] font-bold font-mono flex items-center space-x-1.5 shrink-0 transition-colors shadow-xs"
              >
                <span>{{ ext.icon }}</span>
                <span>{{ ext.name }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Apple IIci Dev Team Easter Egg Modal -->
    @if (isEasterEggOpen()) {
      <div
        class="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 select-none"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="mac-window bg-white border-2 border-black p-5 w-full max-w-2xl shadow-2xl space-y-4 relative"
        >
          <div class="flex justify-between items-center border-b-2 border-black pb-2">
            <div class="flex items-center space-x-2">
              <span class="text-lg"></span>
              <h2 class="font-bold text-xs uppercase tracking-wider text-black">
                Apple Macintosh IIci Engineering Dev Team - 1989
              </h2>
            </div>
            <button (click)="closeEasterEgg()" class="mac-button px-2 py-0.5 text-xs font-bold">
              × Close
            </button>
          </div>
          <div class="border-2 border-black bg-black p-1">
            <img
              src="assets/apple_iici_dev_team_1989.jpg"
              alt="Apple Macintosh IIci Engineering Development Team 1989"
              class="w-full h-auto object-contain"
            />
          </div>
          <div class="text-[11px] font-mono bg-amber-50 p-2 border border-black">
            <b>Secret Easter Egg Discovered!</b> "To the team that made the Mac IIci and System 7
            possible: Thank you for laying the bitwise foundations of desktop personal computing."
          </div>
          <div class="flex justify-end">
            <button (click)="closeEasterEgg()" class="mac-button px-5 py-1 text-xs font-bold">
              Continue System Boot
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BootSequenceComponent implements OnInit, OnDestroy {
  private soundService = inject(SoundEffectsService);
  private router = inject(Router);

  @Output() bootComplete = new EventEmitter<void>();

  isBootComplete = signal<boolean>(false);
  isEasterEggOpen = signal<boolean>(false);
  progress = signal<number>(0);

  Math = Math;
  private startTime = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  extensionIcons: ExtensionIcon[] = [
    { name: 'QuickTime', icon: '🎬', loaded: false },
    { name: 'AppleTalk', icon: '🌐', loaded: false },
    { name: 'Sound Manager', icon: '🔊', loaded: false },
    { name: 'PowerBook', icon: '💻', loaded: false },
    { name: 'ColorSync', icon: '🎨', loaded: false },
    { name: 'MacTCP', icon: '📡', loaded: false },
    { name: 'FileSharing', icon: '📁', loaded: false },
    { name: 'BitHacks SIMD', icon: '⚡', loaded: false },
  ];

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      this.isBootComplete.set(true);
      return;
    }

    if (this.shouldTriggerSadMac()) {
      this.router.navigateByUrl('/sad-mac');
      return;
    }

    this.soundService.playStartupChime();
    this.startTime = Date.now();
    this.timerId = setInterval(() => this.tickBootProgress(), 50);
  }

  shouldTriggerSadMac(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (
        params.has('sadmac') &&
        params.get('sadmac') !== '0' &&
        params.get('sadmac') !== 'false'
      ) {
        return true;
      }
    } catch {
      // Ignore URL parsing errors
    }
    return Math.random() < 0.001; // 0.1% random probability
  }

  calculateProgress(elapsedMs: number): number {
    if (elapsedMs <= 0) return 0;
    if (elapsedMs >= 7000) return 100;

    // Piecewise timing curve:
    // 0ms - 2300ms: Reaches 70% (fake slow boot lag)
    // 2300ms - 7000ms: Reaches 100% (smooth acceleration completion)
    if (elapsedMs <= 2300) {
      return (elapsedMs / 2300) * 70;
    } else {
      const remainingMs = elapsedMs - 2300;
      return 70 + (remainingMs / 4700) * 30;
    }
  }

  loadedExtensionCount(): number {
    return this.extensionIcons.filter((e) => e.loaded).length;
  }

  private tickBootProgress(): void {
    const elapsed = Date.now() - this.startTime;
    const currentProg = this.calculateProgress(elapsed);
    this.progress.set(currentProg);

    // Update extension icons loading state based on progress
    const iconsToLoad = Math.floor((currentProg / 100) * this.extensionIcons.length);
    this.extensionIcons.forEach((ext, idx) => {
      if (idx < iconsToLoad && !ext.loaded) {
        ext.loaded = true;
        this.soundService.playDiskSeek();
      }
    });

    if (elapsed >= 7000) {
      this.finishBoot();
    }
  }

  skipBoot(): void {
    this.soundService.playClick();
    this.finishBoot();
  }

  private finishBoot(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.progress.set(100);
    this.extensionIcons.forEach((e) => (e.loaded = true));
    this.isBootComplete.set(true);
    this.bootComplete.emit();
  }

  onContainerClick(event: MouseEvent): void {
    if (event.altKey) {
      this.openEasterEgg();
    }
  }

  openEasterEgg(): void {
    this.soundService.playSuccess();
    this.isEasterEggOpen.set(true);
  }

  closeEasterEgg(): void {
    this.soundService.playClick();
    this.isEasterEggOpen.set(false);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isBootComplete()) return;
    if (event.key === 'Escape') {
      this.skipBoot();
    } else if (event.altKey || event.key === 'Alt' || event.key === 'Option') {
      this.openEasterEgg();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
