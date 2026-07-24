import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenchmarkResult } from '../../services/benchmark.service';

@Component({
  selector: 'app-benchmark-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
         role="dialog" 
         aria-modal="true"
         [attr.aria-labelledby]="titleId">
      <div #modalContainer class="mac-window bg-white p-5 w-full max-w-lg shadow-2xl space-y-4 border-2 border-black">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b-2 border-black pb-2">
          <div class="flex items-center space-x-2">
            <div class="text-xl">⚡</div>
            <div>
              <h2 [id]="titleId" class="font-bold text-xs uppercase tracking-wider text-black">PowerPC 604e Hardware Benchmark Report</h2>
              <div class="text-[10px] font-mono text-gray-600">AltiVec Vector SIMD & SWAR Optimization Diagnostics</div>
            </div>
          </div>
          <button (click)="closeModal()" class="w-4 h-4 bg-white border border-black flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-gray-200">×</button>
        </div>

        <!-- Metrics Grid -->
        <div *ngIf="result" class="space-y-4 text-xs font-mono">
          
          <!-- CPU Model & Execution Time -->
          <div class="bg-gray-100 p-2 border border-black flex justify-between items-center text-[11px]">
            <span class="font-bold text-black">{{ result.cpuModel }}</span>
            <span class="bg-black text-green-400 px-2 py-0.5 font-mono text-[10px]">{{ result.formattedExecutionTime }}</span>
          </div>

          <!-- MFLOPS & Bandwidth Cards -->
          <div class="grid grid-cols-2 gap-3">
            <div class="mac-inset p-3 bg-amber-50/40 text-center space-y-1">
              <div class="text-[10px] text-gray-600 uppercase font-bold">Vector Floating Ops</div>
              <div class="text-xl font-bold text-black">{{ result.mflops }} <span class="text-xs">MFLOPS</span></div>
              <div class="text-[9px] text-gray-500">Clock Normalized @ 200MHz</div>
            </div>
            <div class="mac-inset p-3 bg-amber-50/40 text-center space-y-1">
              <div class="text-[10px] text-gray-600 uppercase font-bold">L2 Backside Cache Bandwidth</div>
              <div class="text-xl font-bold text-black">{{ result.memoryBandwidthMBps }} <span class="text-xs">MB/s</span></div>
              <div class="text-[9px] text-gray-500">Backside Bus Throughput</div>
            </div>
          </div>

          <!-- SWAR vs Naive Loop Comparison -->
          <div class="space-y-2 bg-white p-3 border border-black">
            <div class="flex justify-between items-center text-[11px] font-bold">
              <span>Stanford SWAR Parallel Reduction</span>
              <span class="text-green-800 bg-green-100 px-1.5 py-0.5 border border-green-600">{{ result.speedupRatio }}x SPEEDUP</span>
            </div>

            <!-- Throughput Bar: SWAR -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px]">
                <span>Stanford SWAR Bit-Hack:</span>
                <span class="font-bold">{{ result.swarOpsPerSec.toLocaleString() }} ops/sec</span>
              </div>
              <div class="w-full bg-gray-200 h-3 border border-black overflow-hidden">
                <div class="bg-black h-full transition-all duration-500" style="width: 100%"></div>
              </div>
            </div>

            <!-- Throughput Bar: Naive Loop -->
            <div class="space-y-1 pt-1">
              <div class="flex justify-between text-[10px] text-gray-600">
                <span>Naive Serial Loop:</span>
                <span>{{ result.naiveOpsPerSec.toLocaleString() }} ops/sec</span>
              </div>
              <div class="w-full bg-gray-200 h-3 border border-black overflow-hidden">
                <div class="bg-gray-500 h-full transition-all duration-500" 
                     [style.width.%]="(result.naiveOpsPerSec / result.swarOpsPerSec) * 100"></div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Action -->
        <div class="flex justify-end pt-2">
          <button #closeBtn 
                  (click)="closeModal()" 
                  class="mac-button px-4 py-1 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-black">
            Done
          </button>
        </div>

      </div>
    </div>
  `
})
export class BenchmarkModalComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() result: BenchmarkResult | null = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  titleId = 'benchmark-modal-title-' + Math.random().toString(36).substring(2, 9);

  ngAfterViewInit(): void {
    if (this.isOpen && this.closeBtn) {
      this.closeBtn.nativeElement.focus();
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
