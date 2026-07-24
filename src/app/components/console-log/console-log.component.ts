import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Output,
  EventEmitter,
} from '@angular/core';

export interface LogEntry {
  timestamp: string;
  message: string;
}

@Component({
  selector: 'app-console-log',
  standalone: true,
  imports: [],
  template: `
    <div
      class="flex flex-col h-44 bg-black border-2 border-black mac-inset shadow-inner overflow-hidden"
    >
      <!-- Terminal Header Bar -->
      <div
        class="bg-gray-900 border-b border-gray-700 px-3 py-1 flex justify-between items-center text-[10px] text-green-400 font-mono"
      >
        <span class="flex items-center space-x-1.5">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>PowerPC Assembly Log (Open Firmware v2.4)</span>
        </span>
        <div class="flex space-x-2">
          <button (click)="exportLog('txt')" class="hover:text-white underline cursor-pointer">
            Export TXT
          </button>
          <button (click)="exportLog('json')" class="hover:text-white underline cursor-pointer">
            Export JSON
          </button>
          <button (click)="clearLogs.emit()" class="hover:text-white underline cursor-pointer">
            Clear
          </button>
        </div>
      </div>

      <!-- ARIA Live Region Terminal Output -->
      <div
        #logContainer
        class="p-3 text-green-400 font-mono text-[11px] overflow-y-auto flex-1 space-y-0.5 leading-relaxed"
        aria-live="polite"
        aria-atomic="false"
      >
        @for (log of logs; track log) {
          <div>
            <span class="text-gray-500">[{{ log.timestamp }}]</span> {{ log.message }}
          </div>
        }
      </div>
    </div>
  `,
})
export class ConsoleLogComponent implements AfterViewChecked {
  @Input() logs: LogEntry[] = [];
  @Output() clearLogs = new EventEmitter<void>();

  @ViewChild('logContainer') private logContainer!: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
    } catch {
      // Container element may be unavailable before view initialization
    }
  }

  exportLog(format: 'txt' | 'json'): void {
    if (typeof window === 'undefined') return;
    let content: string;
    let mimeType: string;
    let filename = `powerpc_bithacks_log_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(this.logs, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    } else {
      content = this.logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
      mimeType = 'text/plain';
      filename += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
