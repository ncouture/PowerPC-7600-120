import { Component, OnInit, OnDestroy, Output, EventEmitter, signal, inject } from '@angular/core';

import { SoundEffectsService } from '../../services/sound-effects.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [],
  template: `
    <div
      class="bg-gray-200 border-t-2 border-black px-4 py-1 text-[11px] flex justify-between items-center select-none font-mono"
    >
      <span class="flex items-center space-x-2">
        <span>CPU: PowerPC 604e @ 200 MHz</span>
        <span class="text-gray-500">|</span>
        <span class="text-green-800 font-bold">AltiVec Unit: Active</span>
        <span class="text-gray-500">|</span>
        <span
          (click)="openSound.emit()"
          [title]="
            soundService.isMuted()
              ? 'Audio Muted - Click to Open Sound Control Panel'
              : 'Volume Level ' + soundService.macVolumeLevel() + '/7 (Click for Sound Panel)'
          "
          class="cursor-pointer hover:bg-gray-300 px-1.5 py-0.5 border border-transparent hover:border-black flex items-center space-x-1 font-bold"
        >
          <span>{{ soundService.isMuted() ? '🔇' : '🔊' }}</span>
          <span>{{
            soundService.isMuted() ? 'MUTED' : 'Sound (' + soundService.macVolumeLevel() + '/7)'
          }}</span>
        </span>
      </span>
      <span class="font-mono text-gray-800">{{ formattedTime() }}</span>
    </div>
  `,
})
export class StatusBarComponent implements OnInit, OnDestroy {
  soundService = inject(SoundEffectsService);

  formattedTime = signal<string>('');
  private timerId: ReturnType<typeof setInterval> | null = null;

  @Output() openSound = new EventEmitter<void>();

  ngOnInit(): void {
    this.updateClock();
    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => this.updateClock(), 1000);
    }
  }

  private updateClock(): void {
    const now = new Date();
    now.setFullYear(now.getFullYear() - 31);
    this.formattedTime.set(now.toUTCString().replace('GMT', 'EST'));
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
