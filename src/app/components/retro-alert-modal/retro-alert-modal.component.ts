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
  selector: 'app-retro-alert-modal',
  standalone: true,
  imports: [],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <div
          #modalContainer
          class="mac-window bg-white p-4 w-80 shadow-2xl space-y-3 border-2 border-black"
        >
          <div class="flex items-center space-x-2 border-b-2 border-black pb-2">
            <div class="text-lg">💻</div>
            <div [id]="titleId" class="font-bold text-xs uppercase tracking-wide">
              System Notice
            </div>
          </div>
          <div class="text-xs font-mono py-1 text-black">
            {{ message }}
          </div>
          <div class="flex justify-end pt-2">
            <button
              #okBtn
              (click)="closeModal()"
              class="mac-button px-4 py-1 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class RetroAlertModalComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() message = '';
  @Output() close = new EventEmitter<void>();

  @ViewChild('okBtn') okBtn!: ElementRef<HTMLButtonElement>;

  titleId = 'modal-title-' + Math.random().toString(36).substring(2, 9);

  ngAfterViewInit(): void {
    if (this.isOpen && this.okBtn) {
      this.okBtn.nativeElement.focus();
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
