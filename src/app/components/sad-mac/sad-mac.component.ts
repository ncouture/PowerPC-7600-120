import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundEffectsService } from '../../services/sound-effects.service';

@Component({
  selector: 'app-sad-mac',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black z-[500] flex flex-col items-center justify-center p-6 select-none font-mono text-white">
      
      <!-- CRT Screen Scanlines Overlay -->
      <div class="absolute inset-0 crt-scanlines opacity-50 pointer-events-none"></div>

      <!-- Main Sad Mac Content Box -->
      <div class="flex flex-col items-center space-y-6 max-w-lg text-center z-10">
        
        <!-- Vintage Sad Mac 1-bit PNG Image -->
        <div class="border-2 border-white p-3 bg-black shadow-[4px_4px_0px_#fff]">
          <img src="assets/sad_mac.png" 
               alt="Vintage Macintosh Sad Mac Error Icon" 
               class="w-24 h-auto object-contain filter invert border border-white p-1">
        </div>

        <!-- System Hardware Exception Code -->
        <div class="space-y-1 bg-white text-black px-4 py-2 border-2 border-black font-bold text-sm tracking-widest font-mono shadow-md">
          <div>0000000F</div>
          <div>00000003</div>
        </div>

        <!-- Error Description -->
        <div class="space-y-2 text-xs font-mono text-gray-300">
          <p class="font-bold text-red-400 uppercase tracking-wider">System Error: Hardware ROM / PowerPC Bus Exception</p>
          <p class="text-gray-400 text-[11px]">The Macintosh System 7 Toolbox encountered an unrecoverable hardware exception during startup routine.</p>
        </div>

        <!-- Navigation Hint -->
        <div class="pt-4 border-t border-gray-800 text-[10px] text-gray-500 font-mono italic">
          Manual URL navigation required to return to /
        </div>

      </div>

    </div>
  `
})
export class SadMacComponent implements OnInit {
  constructor(private soundService: SoundEffectsService) {}

  ngOnInit(): void {
    this.soundService.playSadMacChime();
  }
}
