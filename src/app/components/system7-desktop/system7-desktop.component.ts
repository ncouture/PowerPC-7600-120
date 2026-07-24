import { Component, OnInit, Output, EventEmitter, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MacWindowComponent } from '../mac-window/mac-window.component';
import { SoundControlPanelComponent } from '../sound-control-panel/sound-control-panel.component';
import { SoundEffectsService, SoundTheme } from '../../services/sound-effects.service';

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  posX: number;
  posY: number;
}

export type DesktopPattern = 'gray' | 'platinum' | 'teal';

@Component({
  selector: 'app-system7-desktop',
  standalone: true,
  imports: [CommonModule, MacWindowComponent, SoundControlPanelComponent],
  template: `
    <!-- Shutdown Screen -->
    <div *ngIf="isShutDown()" class="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center text-white select-none font-mono space-y-6">
      <div class="mac-window bg-white text-black p-6 border-2 border-black max-w-md w-full shadow-2xl text-center space-y-4">
        <div class="text-3xl">💻</div>
        <h1 class="font-bold text-sm uppercase tracking-wider">It is now safe to turn off your Macintosh.</h1>
        <div class="text-xs text-gray-600">PowerPC 604e System 7.5.5 Session Terminated.</div>
        <button (click)="restartSystem()" class="mac-button px-6 py-2 text-xs font-bold uppercase cursor-pointer">
          Restart Macintosh
        </button>
      </div>
    </div>

    <!-- Main System 7 Desktop Canvas -->
    <div *ngIf="!isShutDown()" 
         (click)="deselectAll()"
         [ngClass]="getPatternClass()"
         class="fixed inset-0 select-none font-mono flex flex-col overflow-hidden">
      
      <!-- Top-Level System 7 Finder Menu Bar -->
      <div class="bg-white border-b-2 border-black px-3 py-0.5 flex justify-between items-center text-xs font-bold text-black z-50">
        
        <!-- Left Menu Items -->
        <div class="flex space-x-4">
          <!-- Apple Menu -->
          <div class="relative">
            <span (click)="toggleMenu('apple', $event)" 
                  [ngClass]="{'bg-black text-white': activeMenu() === 'apple'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center border-r border-gray-300 pr-3">
              <span class="text-sm leading-none"></span>
            </span>
            <div *ngIf="activeMenu() === 'apple'" 
                 class="absolute left-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-60 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="openIcon('bithacks'); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200">
                About PowerPC Bit-Hacks...
              </div>
              <div (click)="openSoundControlPanel(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200 flex justify-between items-center">
                <span>Control Panels -> Sound...</span>
                <span class="text-[10px] text-gray-500 font-normal">(⌘S)</span>
              </div>
              <div (click)="setDesktopPattern('gray'); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">
                Desktop Pattern: Classic Gray
              </div>
              <div (click)="setDesktopPattern('platinum'); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">
                Desktop Pattern: Platinum Grid
              </div>
              <div (click)="setDesktopPattern('teal'); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200">
                Desktop Pattern: Teal Tiles
              </div>
              <div (click)="cleanUpDesktop(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">
                Clean Up Desktop (Align Left)
              </div>
            </div>
          </div>

          <span (click)="closeMenu(); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5">File</span>
          <span (click)="closeMenu(); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5">Edit</span>
          
          <!-- View Menu -->
          <div class="relative">
            <span (click)="toggleMenu('view', $event)" 
                  [ngClass]="{'bg-black text-white': activeMenu() === 'view'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center space-x-1">
              <span>View</span>
              <span class="text-[8px]">▼</span>
            </span>
            <div *ngIf="activeMenu() === 'view'" 
                 class="absolute left-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-52 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="cleanUpDesktop(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200">
                Clean Up Desktop (Align Left)
              </div>
              <div (click)="resetIconPositions(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">
                Reset Left Icon Column
              </div>
            </div>
          </div>

          <span (click)="closeMenu(); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5">Label</span>

          <!-- Operating System Finder Sound Menu -->
          <div class="relative">
            <span (click)="toggleMenu('sound', $event)" 
                  [ngClass]="{'bg-black text-white': activeMenu() === 'sound'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center space-x-1">
              <span>🔊 Sound</span>
              <span class="text-[8px]">▼</span>
            </span>
            <div *ngIf="activeMenu() === 'sound'" 
                 class="absolute left-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-64 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="openSoundControlPanel(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center border-b border-gray-200">
                <span>Sound Control Panel...</span>
                <span class="text-[10px] text-gray-500 font-normal">(⌘+S)</span>
              </div>
              <div (click)="soundService.toggleMute(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center border-b border-gray-200">
                <span>{{ soundService.isMuted() ? 'Unmute Audio' : 'Mute Audio' }}</span>
                <span class="text-[10px] text-gray-500 font-normal">(⌘+M)</span>
              </div>
              <div class="px-3 py-1 text-[10px] text-gray-500 font-bold uppercase bg-gray-100">Quick Volume Level</div>
              <div (click)="setVolume(0); closeMenu(); $event.stopPropagation()" class="px-3 py-1 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-[11px]">
                <span>Level 0 (Mute)</span>
                <span *ngIf="soundService.macVolumeLevel() === 0">✓</span>
              </div>
              <div (click)="setVolume(30); closeMenu(); $event.stopPropagation()" class="px-3 py-1 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-[11px]">
                <span>Level 2 (Quiet - 30%)</span>
                <span *ngIf="soundService.macVolumeLevel() === 2">✓</span>
              </div>
              <div (click)="setVolume(60); closeMenu(); $event.stopPropagation()" class="px-3 py-1 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-[11px]">
                <span>Level 4 (Medium - 60%)</span>
                <span *ngIf="soundService.macVolumeLevel() === 4">✓</span>
              </div>
              <div (click)="setVolume(100); closeMenu(); $event.stopPropagation()" class="px-3 py-1 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-[11px] border-b border-gray-200">
                <span>Level 7 (Max - 100%)</span>
                <span *ngIf="soundService.macVolumeLevel() === 7">✓</span>
              </div>
              <div class="px-3 py-1 text-[10px] text-gray-500 font-bold uppercase bg-gray-100">System Alert Theme</div>
              <div *ngFor="let theme of soundThemes" 
                   (click)="setTheme(theme.id); closeMenu(); $event.stopPropagation()" 
                   class="px-3 py-1 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-[11px]">
                <span>{{ theme.label }}</span>
                <span *ngIf="soundService.soundTheme() === theme.id">✓</span>
              </div>
            </div>
          </div>

          <!-- Special Finder Menu -->
          <div class="relative">
            <span (click)="toggleMenu('special', $event)" 
                  [ngClass]="{'bg-black text-white': activeMenu() === 'special'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center space-x-1">
              <span>Special</span>
              <span class="text-[8px]">▼</span>
            </span>
            <div *ngIf="activeMenu() === 'special'" 
                 class="absolute left-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-56 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="openSoundControlPanel(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200 flex justify-between items-center">
                <span>Control Panels -> Sound...</span>
                <span class="text-[10px] text-gray-500 font-normal">(⌘S)</span>
              </div>
              <div (click)="emptyTrash(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200">
                Empty Trash...
              </div>
              <div (click)="restartSystem(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer border-b border-gray-200">
                Restart
              </div>
              <div (click)="shutdownSystem(); closeMenu(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer">
                Shut Down
              </div>
            </div>
          </div>
        </div>

        <!-- Right Application Switcher -->
        <div class="flex items-center space-x-2">
          <span class="text-[10px] text-gray-600 font-mono">Finder 7.5.5</span>
          <span (click)="isBitHacksOpen.set(true)" class="bg-black text-white px-1.5 py-0.5 text-[10px] font-mono cursor-pointer">🖥️ Finder</span>
        </div>

      </div>

      <!-- Desktop Icon Canvas Workspace -->
      <div class="flex-1 relative p-4 overflow-hidden">
        
        <!-- Desktop Icons (Anchored strictly to the Left Column of the Screen) -->
        <div *ngFor="let icon of desktopIcons" 
             (mousedown)="onMouseDownIcon(icon, $event)"
             (click)="selectIcon(icon.id); $event.stopPropagation()"
             (dblclick)="openIcon(icon.id); $event.stopPropagation()"
             [style.left.px]="icon.posX"
             [style.top.px]="icon.posY"
             class="absolute w-20 flex flex-col items-center cursor-pointer space-y-1 group z-20">
          
          <div [ngClass]="{'bg-black/20 p-1 border border-black': selectedIconId() === icon.id}"
               class="text-3xl filter drop-shadow-md group-hover:scale-105 transition-transform">
            {{ icon.icon }}
          </div>

          <span [ngClass]="{'bg-black text-white': selectedIconId() === icon.id, 'bg-white/80 text-black border border-black': selectedIconId() !== icon.id}"
                class="px-1 text-[10px] font-bold text-center leading-tight shadow-xs">
            {{ icon.name }}
          </span>
        </div>

        <!-- Dragging Ghost Icon Preview -->
        <div *ngIf="draggingIconId()" 
             [style.left.px]="ghostPosX()" 
             [style.top.px]="ghostPosY()"
             class="absolute w-20 flex flex-col items-center border border-dashed border-black bg-white/40 p-1 z-30 pointer-events-none">
          <div class="text-3xl opacity-60">📁</div>
        </div>

        <!-- Main Hosted Application Window (PowerPC Bit-Hacks Utility) -->
        <app-mac-window *ngIf="isBitHacksOpen()" (closeWindow)="isBitHacksOpen.set(false)"></app-mac-window>

        <!-- Macintosh HD Directory Folder Window -->
        <div *ngIf="isMacHdOpen()" 
             class="mac-window bg-white border-2 border-black p-4 w-full max-w-md shadow-2xl absolute top-16 left-28 z-40 space-y-3">
          <div class="mac-title-bar px-2 py-0.5 flex justify-between items-center">
            <span class="text-xs font-bold text-black font-mono">💽 Macintosh HD (64MB Available)</span>
            <button (click)="isMacHdOpen.set(false)" class="w-4 h-4 bg-white border border-black text-[10px] font-bold font-mono hover:bg-red-300">×</button>
          </div>
          
          <div class="grid grid-cols-3 gap-3 p-3 bg-amber-50/40 border border-black text-center text-xs">
            <div (dblclick)="openIcon('bithacks')" class="p-2 border border-black bg-white hover:bg-yellow-100 cursor-pointer space-y-1">
              <div class="text-2xl">💳</div>
              <div class="text-[10px] font-bold">BitHacks Utility</div>
            </div>
            <div class="p-2 border border-black bg-white space-y-1 opacity-70">
              <div class="text-2xl">📁</div>
              <div class="text-[10px]">System Folder</div>
            </div>
            <div class="p-2 border border-black bg-white space-y-1 opacity-70">
              <div class="text-2xl">📁</div>
              <div class="text-[10px]">Applications</div>
            </div>
          </div>
        </div>

        <!-- Trash Folder Window -->
        <div *ngIf="isTrashOpen()" 
             class="mac-window bg-white border-2 border-black p-4 w-full max-w-sm shadow-2xl absolute top-24 left-36 z-40 space-y-3">
          <div class="mac-title-bar px-2 py-0.5 flex justify-between items-center">
            <span class="text-xs font-bold text-black font-mono">🗑️ Trash Can</span>
            <button (click)="isTrashOpen.set(false)" class="w-4 h-4 bg-white border border-black text-[10px] font-bold font-mono hover:bg-red-300">×</button>
          </div>
          
          <div class="p-3 bg-amber-50/40 border border-black text-center text-xs space-y-3">
            <div class="text-gray-500 italic">Trash is currently empty.</div>
            <button (click)="emptyTrash()" class="mac-button px-4 py-1 text-xs font-bold cursor-pointer">
              Empty Trash
            </button>
          </div>
        </div>

      </div>

      <!-- System 7 Sound Control Panel Modal (Triggered via Finder Menu) -->
      <app-sound-control-panel
        [isOpen]="soundPanelOpen()"
        (close)="soundPanelOpen.set(false)">
      </app-sound-control-panel>

    </div>
  `
})
export class System7DesktopComponent implements OnInit {
  @Output() rebootSystemEvent = new EventEmitter<void>();

  isShutDown = signal<boolean>(false);
  isBitHacksOpen = signal<boolean>(true);
  isMacHdOpen = signal<boolean>(false);
  isTrashOpen = signal<boolean>(false);
  soundPanelOpen = signal<boolean>(false);

  selectedIconId = signal<string | null>(null);
  activeMenu = signal<string | null>(null);
  desktopPattern = signal<DesktopPattern>('gray');

  draggingIconId = signal<string | null>(null);
  ghostPosX = signal<number>(0);
  ghostPosY = signal<number>(0);

  private dragOffsetX = 0;
  private dragOffsetY = 0;

  soundThemes: { id: SoundTheme; label: string }[] = [
    { id: 'indigo', label: 'Indigo' },
    { id: 'simple_beep', label: 'Simple Beep' },
    { id: 'droplet', label: 'Droplet' },
    { id: 'quack', label: 'Quack' },
    { id: 'sosumi', label: 'Sosumi' },
    { id: 'wild_eep', label: 'Wild Eep' }
  ];

  // Desktop Icons strictly anchored to the Left Column of the screen
  desktopIcons: DesktopIcon[] = [
    { id: 'machd', name: 'Macintosh HD', icon: '💽', posX: 20, posY: 20 },
    { id: 'bithacks', name: 'BitHacks Utility', icon: '💳', posX: 20, posY: 110 },
    { id: 'trash', name: 'Trash', icon: '🗑️', posX: 20, posY: 200 }
  ];

  constructor(public soundService: SoundEffectsService) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const savedPattern = localStorage.getItem('system7_desktop_pattern') as DesktopPattern;
      if (savedPattern) {
        this.desktopPattern.set(savedPattern);
      }

      const savedPositions = localStorage.getItem('system7_desktop_icon_positions');
      if (savedPositions) {
        try {
          const parsed = JSON.parse(savedPositions);
          this.desktopIcons.forEach(icon => {
            if (parsed[icon.id]) {
              icon.posX = parsed[icon.id].posX;
              icon.posY = parsed[icon.id].posY;
            }
          });
        } catch (e) {}
      }
    }
  }

  getPatternClass(): string {
    const pattern = this.desktopPattern();
    if (pattern === 'platinum') return 'bg-gray-300 pinstripes';
    if (pattern === 'teal') return 'bg-teal-800';
    return 'bg-gray-400'; // Classic Gray
  }

  setDesktopPattern(pattern: DesktopPattern): void {
    this.soundService.playClick();
    this.desktopPattern.set(pattern);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('system7_desktop_pattern', pattern);
    }
  }

  selectIcon(id: string): void {
    this.soundService.playClick();
    this.selectedIconId.set(id);
  }

  deselectAll(): void {
    this.selectedIconId.set(null);
    this.closeMenu();
  }

  openIcon(id: string): void {
    this.soundService.playClick();
    if (id === 'bithacks') {
      this.isBitHacksOpen.set(true);
    } else if (id === 'machd') {
      this.isMacHdOpen.set(true);
    } else if (id === 'trash') {
      this.isTrashOpen.set(true);
    }
  }

  emptyTrash(): void {
    this.soundService.playClick();
    alert('System 7 Alert: Trash Can has been emptied.');
  }

  shutdownSystem(): void {
    this.soundService.playAlert();
    this.isShutDown.set(true);
  }

  restartSystem(): void {
    this.soundService.playClick();
    this.isShutDown.set(false);
    this.rebootSystemEvent.emit();
  }

  openSoundControlPanel(): void {
    this.soundService.playClick();
    this.soundPanelOpen.set(true);
  }

  setVolume(vol: number): void {
    this.soundService.setVolume(vol);
    this.soundService.playClick();
  }

  setTheme(themeId: SoundTheme): void {
    this.soundService.setSoundTheme(themeId);
    this.soundService.playAlert();
  }

  toggleMenu(menuName: string, event: Event): void {
    event.stopPropagation();
    this.soundService.playClick();
    if (this.activeMenu() === menuName) {
      this.activeMenu.set(null);
    } else {
      this.activeMenu.set(menuName);
    }
  }

  closeMenu(): void {
    if (this.activeMenu() !== null) {
      this.activeMenu.set(null);
    }
  }

  onMouseDownIcon(icon: DesktopIcon, event: MouseEvent): void {
    this.selectIcon(icon.id);
    this.draggingIconId.set(icon.id);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    this.ghostPosX.set(icon.posX);
    this.ghostPosY.set(icon.posY);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.draggingIconId()) {
      this.ghostPosX.set(event.clientX - this.dragOffsetX);
      this.ghostPosY.set(event.clientY - this.dragOffsetY);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    const activeId = this.draggingIconId();
    if (activeId) {
      const icon = this.desktopIcons.find(i => i.id === activeId);
      if (icon) {
        // Snap to grid
        const snappedX = Math.max(20, Math.round(this.ghostPosX() / 80) * 80 + 20);
        const snappedY = Math.max(20, Math.round(this.ghostPosY() / 90) * 90 + 20);
        icon.posX = snappedX;
        icon.posY = snappedY;

        this.saveIconPositions();
      }
      this.draggingIconId.set(null);
    }
  }

  cleanUpDesktop(): void {
    this.soundService.playClick();
    this.desktopIcons.forEach((icon, index) => {
      icon.posX = 20;
      icon.posY = 20 + index * 90;
    });
    this.saveIconPositions();
  }

  resetIconPositions(): void {
    this.soundService.playClick();
    this.cleanUpDesktop();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('system7_desktop_icon_positions');
    }
  }

  private saveIconPositions(): void {
    if (typeof localStorage !== 'undefined') {
      const posMap: Record<string, { posX: number; posY: number }> = {};
      this.desktopIcons.forEach(i => {
        posMap[i.id] = { posX: i.posX, posY: i.posY };
      });
      localStorage.setItem('system7_desktop_icon_positions', JSON.stringify(posMap));
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.openSoundControlPanel();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'm') {
      event.preventDefault();
      this.soundService.toggleMute();
    }
  }
}
