import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ConsoleLogComponent, LogEntry } from './console-log.component';

describe('ConsoleLogComponent', () => {
  let component: ConsoleLogComponent;
  let fixture: ComponentFixture<ConsoleLogComponent>;

  const mockLogs: LogEntry[] = [
    { timestamp: '12:00:00', message: 'PowerPC G3 Firmware initialized.' },
    { timestamp: '12:00:01', message: 'SWAR Bit-Hack kernel ready.' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleLogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render log entries in ARIA live region', () => {
    fixture.componentRef.setInput('logs', mockLogs);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('PowerPC G3 Firmware initialized.');
    expect(text).toContain('SWAR Bit-Hack kernel ready.');
  });

  it('should scroll log container on view checked', () => {
    fixture.componentRef.setInput('logs', mockLogs);
    fixture.detectChanges();
    expect(() => component.ngAfterViewChecked()).not.toThrow();
  });

  it('should emit clearLogs when Clear button is clicked', () => {
    const emitSpy = vi.spyOn(component.clearLogs, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const clearBtn = Array.from(buttons).find((b: any) => b.textContent.includes('Clear')) as HTMLButtonElement;
    clearBtn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should export log entries as TXT and JSON files', () => {
    fixture.componentRef.setInput('logs', mockLogs);
    fixture.detectChanges();

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const dummyLink = document.createElement('a');
    vi.spyOn(dummyLink, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(dummyLink);

    component.exportLog('txt');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(dummyLink.click).toHaveBeenCalled();

    component.exportLog('json');
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
  });
});
