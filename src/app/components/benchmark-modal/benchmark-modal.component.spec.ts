import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BenchmarkModalComponent } from './benchmark-modal.component';
import { BenchmarkResult } from '../../services/benchmark.service';

describe('BenchmarkModalComponent', () => {
  let component: BenchmarkModalComponent;
  let fixture: ComponentFixture<BenchmarkModalComponent>;

  const mockResult: BenchmarkResult = {
    cpuModel: 'PowerPC 604e @ 200 MHz',
    clockCyclesNormalized: 40000,
    formattedExecutionTime: '12.50 ms',
    swarOpsPerSec: 10000000,
    naiveOpsPerSec: 2500000,
    speedupRatio: 4.0,
    mflops: 450,
    memoryBandwidthMBps: 800,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenchmarkModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BenchmarkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render dialog when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).toBeNull();
  });

  it('should render benchmark report details when isOpen is true and result is provided', () => {
    fixture.componentRef.setInput('result', mockResult);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('PowerPC 604e @ 200 MHz');
    expect(fixture.nativeElement.textContent).toContain('12.50 ms');
    expect(fixture.nativeElement.textContent).toContain('450 MFLOPS');
    expect(fixture.nativeElement.textContent).toContain('800 MB/s');
    expect(fixture.nativeElement.textContent).toContain('4x SPEEDUP');
  });

  it('should focus close button in ngAfterViewInit when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const buttonSpy = vi.spyOn(component.closeBtn.nativeElement, 'focus');
    component.ngAfterViewInit();
    expect(buttonSpy).toHaveBeenCalled();
  });

  it('should emit close event when closeModal is called', () => {
    const emitSpy = vi.spyOn(component.close, 'emit');
    component.closeModal();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit close event when close button (x) or Done button is clicked', () => {
    fixture.componentRef.setInput('result', mockResult);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.close, 'emit');

    const doneBtn = fixture.nativeElement.querySelector('.mac-button');
    doneBtn.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);

    const xBtn = fixture.nativeElement.querySelector('button');
    xBtn.click();
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });
});
