import { Component, HostListener, OnInit, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsoleLogComponent, LogEntry } from '../console-log/console-log.component';
import { CardGeneratorComponent } from '../card-generator/card-generator.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { RetroAlertModalComponent } from '../retro-alert-modal/retro-alert-modal.component';
import { BenchmarkModalComponent } from '../benchmark-modal/benchmark-modal.component';
import { AboutModalComponent } from '../about-modal/about-modal.component';
import { BlueMeaniesModalComponent } from '../blue-meanies-modal/blue-meanies-modal.component';
import { SoundEffectsService } from '../../services/sound-effects.service';
import { BenchmarkService, BenchmarkResult } from '../../services/benchmark.service';

@Component({
  selector: 'app-mac-window',
  standalone: true,
  imports: [
    CommonModule,
    ConsoleLogComponent,
    CardGeneratorComponent,
    StatusBarComponent,
    RetroAlertModalComponent,
    BenchmarkModalComponent,
    AboutModalComponent,
    BlueMeaniesModalComponent
  ],
  template: `
    <div (click)="closeDropdowns()" class="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      
      <!-- Main Desktop Mac Window Container -->
      <div #windowContainer
           (click)="selectWindow()" 
           [style.transform]="windowTransform()"
           [style.width.px]="windowWidth()"
           [style.height]="isZoomed() ? '90vh' : (windowHeight() ? windowHeight() + 'px' : 'auto')"
           [ngClass]="{'border-black shadow-2xl z-30': isActive(), 'border-gray-500 opacity-95 z-20': !isActive()}"
           class="mac-window relative overflow-hidden my-auto select-none transition-shadow duration-150">
        
        <!-- CRT Scanline Overlay -->
        <div class="absolute inset-0 crt-scanlines z-50 pointer-events-none"></div>

        <!-- Mac OS Window Title Bar (Draggable & Double-Click Zoomable) -->
        <div (mousedown)="startDrag($event)"
             (dblclick)="toggleZoom()"
             [ngClass]="{'mac-title-bar': isActive(), 'bg-gray-300 border-b-2 border-gray-600': !isActive()}"
             class="px-3 py-1 flex items-center justify-between cursor-move select-none">
          <div class="flex items-center space-x-2 bg-white px-2 py-0.5 border border-black pointer-events-none">
            <div class="w-3 h-3 bg-black flex items-center justify-center text-white text-[8px] font-bold font-mono">⌘</div>
            <span class="text-xs font-bold tracking-wider font-mono text-black">PowerPC_BitHacks_CC_Gen_v1.0.4.bin</span>
          </div>
          <div class="flex items-center space-x-1 z-10">
            <div (click)="toggleZoom(); $event.stopPropagation()"
                 title="Zoom / Tile Window" 
                 class="w-4 h-4 bg-white border border-black flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-gray-200 text-black">□</div>
            <div (click)="closeWindowClick(); $event.stopPropagation()" 
                 title="Close Window"
                 class="w-4 h-4 bg-white border border-black flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-red-300 text-black">×</div>
          </div>
        </div>

        <!-- System 7 Interactive Drop-Down Menu Bar -->
        <div class="bg-white border-b border-black px-3 py-0.5 flex space-x-4 text-xs font-bold text-black select-none relative z-40">
          
          <!-- File Menu Item -->
          <span (click)="triggerMenu('File'); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5">File</span>
          
          <!-- Edit Menu Item -->
          <span (click)="triggerMenu('Edit'); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5">Edit</span>
          
          <!-- BitHacks Menu Item -->
          <span (click)="generator.generate(); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5 flex items-center space-x-1">
            <span>BitHacks (Stanford)</span>
            <span class="text-[9px] font-mono text-gray-500 hover:text-white">(⌘G)</span>
          </span>
          
          <!-- PowerPC AltiVec Menu Item -->
          <span (click)="runBenchmark(); $event.stopPropagation()" class="cursor-pointer hover:bg-black hover:text-white px-1 py-0.5 flex items-center space-x-1">
            <span>PowerPC AltiVec</span>
            <span class="text-[9px] font-mono text-gray-500 hover:text-white">(⌘B)</span>
          </span>
          
          <!-- Special Drop-Down Menu Item -->
          <div class="relative">
            <span (click)="toggleDropdown('special', $event)" 
                  [ngClass]="{'bg-black text-white': activeDropdown() === 'special'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center space-x-1">
              <span>Special</span>
              <span class="text-[8px]">▼</span>
            </span>
            <div *ngIf="activeDropdown() === 'special'" 
                 class="absolute left-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-56 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="clearLogs(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center">
                <span>Clear Log Buffer</span>
                <span class="text-[10px] font-mono text-gray-500 hover:text-white font-normal">(⌘+K)</span>
              </div>
            </div>
          </div>
          
          <!-- Help Drop-Down Menu Item -->
          <div class="relative">
            <span (click)="toggleDropdown('help', $event)" 
                  [ngClass]="{'bg-black text-white': activeDropdown() === 'help'}"
                  class="cursor-pointer hover:bg-black hover:text-white px-1.5 py-0.5 flex items-center space-x-1">
              <span>Help</span>
              <span class="text-[8px]">▼</span>
            </span>
            <div *ngIf="activeDropdown() === 'help'" 
                 class="absolute right-0 top-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] w-52 py-1 z-50 text-xs font-bold font-mono">
              <div (click)="openAboutModal(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center border-b border-gray-200">
                <span>About</span>
                <span class="text-[10px] font-mono text-gray-500 hover:text-white font-normal">(⌘+I)</span>
              </div>
              <div (click)="openAboutModal(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center border-b border-gray-200">
                <span>Help</span>
                <span class="text-[10px] font-mono text-gray-500 hover:text-white font-normal">(⌘+H)</span>
              </div>
              <div (click)="openBlueMeaniesModal(); $event.stopPropagation()" class="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer flex justify-between items-center text-blue-800">
                <span>🫐 Blue Meanies</span>
                <span class="text-[10px] font-mono text-gray-500 hover:text-white font-normal">(⌘⌥⇧B)</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Main Application Workspace -->
        <div class="p-6 pinstripes">
          <app-card-generator 
            #generator
            (logEvent)="addLog($event)"
            (alertEvent)="showAlert($event)">
            
            <app-console-log 
              [logs]="logs()" 
              (clearLogs)="clearLogs()">
            </app-console-log>

          </app-card-generator>
        </div>

        <!-- Status Bar Footer -->
        <app-status-bar></app-status-bar>

        <!-- System 7 Bottom-Right Window Resize Handle -->
        <div (mousedown)="startResize($event)"
             title="Resize Window"
             class="absolute bottom-0 right-0 w-4 h-4 bg-gray-200 border-t border-l border-black cursor-se-resize flex items-center justify-center text-[9px] font-bold text-black z-40 hover:bg-black hover:text-white">
          ◢
        </div>

      </div>

      <!-- Modals rendered outside mac-window to prevent transform clipping -->
      
      <!-- Retro Alert Modal -->
      <app-retro-alert-modal
        [isOpen]="modalOpen()"
        [message]="modalMessage()"
        (close)="modalOpen.set(false)">
      </app-retro-alert-modal>

      <!-- PowerPC Benchmark Modal -->
      <app-benchmark-modal
        [isOpen]="benchmarkOpen()"
        [result]="benchmarkResult()"
        (close)="benchmarkOpen.set(false)">
      </app-benchmark-modal>

      <!-- System 7 About & Help Modal -->
      <app-about-modal
        [isOpen]="aboutOpen()"
        (close)="aboutOpen.set(false)">
      </app-about-modal>

      <!-- System 7 Blue Meanies Engineering Credits Modal -->
      <app-blue-meanies-modal
        [isOpen]="blueMeaniesOpen()"
        (close)="blueMeaniesOpen.set(false)">
      </app-blue-meanies-modal>

    </div>
  `
})
export class MacWindowComponent implements OnInit {
  @Output() closeWindow = new EventEmitter<void>();

  logs = signal<LogEntry[]>([]);
  modalOpen = signal<boolean>(false);
  modalMessage = signal<string>('');

  benchmarkOpen = signal<boolean>(false);
  benchmarkResult = signal<BenchmarkResult | null>(null);

  aboutOpen = signal<boolean>(false);
  blueMeaniesOpen = signal<boolean>(false);
  activeDropdown = signal<string | null>(null);

  // Desktop Window Manager State
  isActive = signal<boolean>(true);
  isZoomed = signal<boolean>(false);
  
  posX = signal<number>(0);
  posY = signal<number>(0);
  windowWidth = signal<number>(896); // Default 4xl = 896px
  windowHeight = signal<number | null>(null);

  private isDragging = false;
  private isResizing = false;
  private startMouseX = 0;
  private startMouseY = 0;
  private initialPosX = 0;
  private initialPosY = 0;
  private initialWidth = 0;
  private initialHeight = 0;

  @ViewChild('windowContainer') windowContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('generator') generator!: CardGeneratorComponent;

  constructor(
    public soundService: SoundEffectsService,
    private benchmarkService: BenchmarkService
  ) {}

  ngOnInit(): void {
    this.addLog('[System boot] PowerPC G3 Open Firmware v2.4 initialized.');
    this.addLog('[Memory Check] 64MB RAM OK. L2 Cache: 512KB backside.');
    this.addLog('[Bit-Hacks] Loaded Sean Anderson\'s SWAR routines from Stanford repository.');
    this.addLog('[Ready] Awaiting user command to compute valid Luhn permutations...');
    this.soundService.playStartupChime();
  }

  windowTransform(): string {
    return `translate(${this.posX()}px, ${this.posY()}px)`;
  }

  selectWindow(): void {
    if (!this.isActive()) {
      this.isActive.set(true);
      this.soundService.playClick();
    }
  }

  startDrag(event: MouseEvent): void {
    if (this.isZoomed()) return;
    this.selectWindow();
    this.isDragging = true;
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.initialPosX = this.posX();
    this.initialPosY = this.posY();
    event.preventDefault();
  }

  startResize(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectWindow();
    this.isResizing = true;
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.initialWidth = this.windowContainer.nativeElement.offsetWidth;
    this.initialHeight = this.windowContainer.nativeElement.offsetHeight;
  }

  toggleZoom(): void {
    this.soundService.playClick();
    this.isZoomed.set(!this.isZoomed());
    if (this.isZoomed()) {
      this.posX.set(0);
      this.posY.set(0);
      this.addLog('[Desktop Manager] Window tiled to maximum workspace.');
    } else {
      this.addLog('[Desktop Manager] Window restored to standard frame size.');
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.startMouseX;
      const deltaY = event.clientY - this.startMouseY;
      this.posX.set(this.initialPosX + deltaX);
      this.posY.set(this.initialPosY + deltaY);
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.startMouseX;
      const deltaY = event.clientY - this.startMouseY;
      const newWidth = Math.max(520, Math.min(1200, this.initialWidth + deltaX));
      const newHeight = Math.max(380, Math.min(900, this.initialHeight + deltaY));
      this.windowWidth.set(newWidth);
      this.windowHeight.set(newHeight);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
    }
    if (this.isResizing) {
      this.isResizing = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.altKey && event.shiftKey && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.openBlueMeaniesModal();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'g') {
      event.preventDefault();
      this.generator.generate();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.runBenchmark();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.clearLogs();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'h') {
      event.preventDefault();
      this.openAboutModal();
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this.openAboutModal();
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (typeof document === 'undefined') return;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const container = this.windowContainer.nativeElement;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

    if (focusables.length === 0) return;

    event.preventDefault();
    this.soundService.playClick();

    const activeElement = document.activeElement as HTMLElement;
    let currentIndex = focusables.indexOf(activeElement);

    if (event.shiftKey) {
      currentIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= focusables.length - 1 ? 0 : currentIndex + 1;
    }

    focusables[currentIndex].focus();
  }

  toggleDropdown(menu: string, event: Event): void {
    event.stopPropagation();
    this.soundService.playClick();
    if (this.activeDropdown() === menu) {
      this.activeDropdown.set(null);
    } else {
      this.activeDropdown.set(menu);
    }
  }

  closeDropdowns(): void {
    if (this.activeDropdown() !== null) {
      this.activeDropdown.set(null);
    }
  }

  addLog(message: string): void {
    const timestamp = new Date().toTimeString().split(' ')[0];
    this.logs.update(current => [...current, { timestamp, message }]);

    if (message.toLowerCase().includes('blue meanies') && !this.blueMeaniesOpen()) {
      this.openBlueMeaniesModal();
    }
  }

  clearLogs(): void {
    this.closeDropdowns();
    this.soundService.playClick();
    this.logs.set([]);
    this.addLog('System log buffer cleared.');
  }

  showAlert(msg: string): void {
    this.soundService.playAlert();
    this.modalMessage.set(msg);
    this.modalOpen.set(true);
  }

  openAboutModal(): void {
    this.closeDropdowns();
    this.soundService.playClick();
    this.aboutOpen.set(true);
    this.addLog('[Menu] Help & System Information dialog opened.');
  }

  openBlueMeaniesModal(): void {
    this.closeDropdowns();
    this.soundService.playSuccess();
    this.blueMeaniesOpen.set(true);
    this.addLog('[Easter Egg] System 7 "Blue Meanies" engineering credits unlocked!');
  }

  runBenchmark(): void {
    this.closeDropdowns();
    this.soundService.playClick();
    this.addLog('[Benchmark] Starting PowerPC 604e Hardware Benchmark suite...');
    const result = this.benchmarkService.runBenchmarkSuite(20000);
    this.benchmarkResult.set(result);
    this.benchmarkOpen.set(true);
    this.soundService.playSuccess();
    this.addLog(`[Benchmark Completed] MFLOPS: ${result.mflops} | Bandwidth: ${result.memoryBandwidthMBps} MB/s | Speedup: ${result.speedupRatio}x`);
  }

  closeWindowClick(): void {
    this.soundService.playClick();
    this.closeWindow.emit();
  }

  triggerMenu(menuName: string): void {
    this.closeDropdowns();
    this.soundService.playClick();
    this.addLog(`[Menu] ${menuName} menu selected.`);
  }
}
