import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoundEffectsService, SoundTheme } from '../../services/sound-effects.service';

@Component({
  selector: 'app-sound-control-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 select-none"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <div
          #panelContainer
          [style.transform]="windowTransform()"
          class="mac-window bg-white w-full max-w-md shadow-2xl border-2 border-black relative overflow-hidden"
        >
          <!-- CRT Scanline Overlay -->
          <div class="absolute inset-0 crt-scanlines z-50 pointer-events-none"></div>
          <!-- System 7 Control Panel Title Bar (Draggable) -->
          <div
            (mousedown)="startDrag($event)"
            class="mac-title-bar px-3 py-1 flex items-center justify-between cursor-move select-none"
          >
            <div
              class="flex items-center space-x-2 bg-white px-2 py-0.5 border border-black pointer-events-none"
            >
              <span class="text-xs">🔊</span>
              <span [id]="titleId" class="text-xs font-bold tracking-wider font-mono text-black"
                >Sound Control Panel</span
              >
            </div>
            <div
              (click)="closeModal()"
              title="Close Control Panel"
              class="w-4 h-4 bg-white border border-black flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-red-300 text-black z-10"
            >
              ×
            </div>
          </div>
          <!-- Control Panel Workspace -->
          <div class="p-4 pinstripes space-y-4 text-xs font-mono">
            <!-- 1. Volume & Speaker Level Control -->
            <div class="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_#000] space-y-3">
              <div class="flex items-center justify-between border-b border-black pb-1">
                <span class="font-bold text-black uppercase tracking-wider"
                  >Volume & Hardware Level</span
                >
                <span class="bg-black text-white px-1.5 py-0.5 font-mono text-[10px] font-bold">
                  Level {{ soundService.macVolumeLevel() }} / 7
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  (click)="soundService.toggleMute()"
                  [title]="soundService.isMuted() ? 'Unmute Audio' : 'Mute Audio'"
                  class="mac-button px-2.5 py-1 text-sm flex items-center justify-center cursor-pointer"
                >
                  {{ soundService.isMuted() ? '🔇' : '🔊' }}
                </button>
                <div class="flex-1 space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    [ngModel]="soundService.volume()"
                    (ngModelChange)="onVolumeChange($event)"
                    class="w-full accent-black cursor-pointer"
                  />
                  <div class="flex justify-between text-[9px] text-gray-600 font-mono">
                    <span>Mute (0)</span>
                    <span>50%</span>
                    <span>Max (100%)</span>
                  </div>
                </div>
              </div>
              <!-- LED VU Peak Level Meter Visualizer -->
              <div class="bg-black p-1.5 border border-black flex items-center space-x-1">
                <span class="text-[9px] text-green-400 font-mono mr-1">VU METER:</span>
                @for (seg of vuSegments; track seg; let i = $index) {
                  <div
                    [ngClass]="
                      i < activeVuCount()
                        ? i > 7
                          ? 'bg-red-500'
                          : i > 5
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                        : 'bg-gray-800'
                    "
                    class="h-3 flex-1 border border-black transition-colors duration-75"
                  ></div>
                }
              </div>
            </div>
            <!-- 2. System 7 Alert Sound Selection Listbox -->
            <div class="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_#000] space-y-2">
              <div class="font-bold text-black border-b border-black pb-1 uppercase tracking-wider">
                Alert Sound Theme
              </div>
              <div class="mac-inset bg-amber-50/40 p-1 max-h-32 overflow-y-auto space-y-1">
                @for (theme of soundThemes; track theme) {
                  <div
                    (click)="selectTheme(theme.id)"
                    [ngClass]="{
                      'bg-black text-white': soundService.soundTheme() === theme.id,
                      'hover:bg-gray-200 text-black': soundService.soundTheme() !== theme.id,
                    }"
                    class="px-2 py-1 flex items-center justify-between cursor-pointer font-bold text-[11px]"
                  >
                    <span>{{ theme.label }}</span>
                    <span
                      [ngClass]="{
                        'text-gray-400': soundService.soundTheme() === theme.id,
                        'text-gray-600': soundService.soundTheme() !== theme.id,
                      }"
                      class="text-[9px] font-normal font-mono"
                    >
                      {{ theme.type }}
                    </span>
                  </div>
                }
              </div>
            </div>
            <!-- 3. PowerPC Audio Quality & DAC Resampling -->
            <div
              class="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-black">DAC Audio Resampling:</div>
                <div class="text-[9px] text-gray-600">
                  Simulate PowerPC 8-bit 22kHz vs 16-bit 44.1kHz
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  (click)="soundService.setDacResampling('8bit')"
                  [ngClass]="{ 'bg-black text-white': soundService.dacResampling() === '8bit' }"
                  class="mac-button px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                >
                  8-bit
                </button>
                <button
                  (click)="soundService.setDacResampling('16bit')"
                  [ngClass]="{ 'bg-black text-white': soundService.dacResampling() === '16bit' }"
                  class="mac-button px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                >
                  16-bit
                </button>
              </div>
            </div>
            <!-- Footer Buttons -->
            <div class="flex justify-between items-center pt-1">
              <button
                (click)="soundService.resetToDefaults(); soundService.playAlert()"
                class="mac-button px-3 py-1 text-xs cursor-pointer"
              >
                System 7 Defaults
              </button>
              <button
                #closeBtn
                (click)="closeModal()"
                class="mac-button px-5 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SoundControlPanelComponent implements AfterViewInit {
  soundService = inject(SoundEffectsService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  titleId = 'sound-panel-title-' + Math.random().toString(36).substring(2, 9);
  vuSegments = Array(10).fill(0);

  soundThemes: { id: SoundTheme; label: string; type: string }[] = [
    { id: 'indigo', label: 'Indigo (Default)', type: 'Dual Sawtooth' },
    { id: 'simple_beep', label: 'Simple Beep', type: 'Pure Sine 880Hz' },
    { id: 'droplet', label: 'Droplet', type: 'Exp Pitch Sweep' },
    { id: 'quack', label: 'Quack', type: 'Sawtooth Sweep' },
    { id: 'sosumi', label: 'Sosumi', type: 'Square Harmonic' },
    { id: 'wild_eep', label: 'Wild Eep', type: 'FM Modulated' },
  ];

  posX = 0;
  posY = 0;
  private isDragging = false;
  private startMouseX = 0;
  private startMouseY = 0;
  private initialPosX = 0;
  private initialPosY = 0;

  ngAfterViewInit(): void {
    if (this.isOpen && this.closeBtn) {
      this.closeBtn.nativeElement.focus();
    }
  }

  activeVuCount(): number {
    if (this.soundService.isMuted()) return 0;
    return Math.round((this.soundService.volume() / 100) * 10);
  }

  windowTransform(): string {
    return `translate(${this.posX}px, ${this.posY}px)`;
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.initialPosX = this.posX;
    this.initialPosY = this.posY;
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.startMouseX;
      const deltaY = event.clientY - this.startMouseY;
      this.posX = this.initialPosX + deltaX;
      this.posY = this.initialPosY + deltaY;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  onVolumeChange(val: number): void {
    this.soundService.setVolume(val);
    this.soundService.playClick();
  }

  selectTheme(themeId: SoundTheme): void {
    this.soundService.setSoundTheme(themeId);
    this.soundService.playAlert();
  }

  closeModal(): void {
    this.soundService.playClick();
    this.close.emit();
  }
}
