import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { vi } from 'vitest';
import { MacWindowComponent } from './mac-window.component';
import { SoundEffectsService } from '../../services/sound-effects.service';
import { BenchmarkService } from '../../services/benchmark.service';

describe('MacWindowComponent', () => {
  let component: MacWindowComponent;
  let fixture: ComponentFixture<MacWindowComponent>;
  let mockSoundService: {
    playStartupChime: ReturnType<typeof vi.fn>;
    playClick: ReturnType<typeof vi.fn>;
    playSuccess: ReturnType<typeof vi.fn>;
    playAlert: ReturnType<typeof vi.fn>;
    isMuted: ReturnType<typeof vi.fn>;
    volume: ReturnType<typeof vi.fn>;
    macVolumeLevel: ReturnType<typeof vi.fn>;
    soundTheme: ReturnType<typeof vi.fn>;
  };
  let mockBenchmarkService: {
    runBenchmarkSuite: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockSoundService = {
      playStartupChime: vi.fn(),
      playClick: vi.fn(),
      playSuccess: vi.fn(),
      playAlert: vi.fn(),
      isMuted: vi.fn().mockReturnValue(false),
      volume: vi.fn().mockReturnValue(80),
      macVolumeLevel: vi.fn().mockReturnValue(6),
      soundTheme: vi.fn().mockReturnValue('indigo'),
    };

    mockBenchmarkService = {
      runBenchmarkSuite: vi.fn().mockReturnValue({
        cpuModel: 'PowerPC 604e @ 200 MHz',
        clockCyclesNormalized: 40000,
        formattedExecutionTime: '10.00 ms',
        swarOpsPerSec: 1000000,
        naiveOpsPerSec: 250000,
        speedupRatio: 4,
        mflops: 400,
        memoryBandwidthMBps: 800,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MacWindowComponent],
      providers: [
        { provide: SoundEffectsService, useValue: mockSoundService },
        { provide: BenchmarkService, useValue: mockBenchmarkService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MacWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize logs and startup chime', () => {
    expect(component).toBeTruthy();
    expect(mockSoundService.playStartupChime).toHaveBeenCalled();
    expect(component.logs().length).toBeGreaterThan(0);
  });

  it('should toggle window zoom', () => {
    expect(component.isZoomed()).toBe(false);
    component.toggleZoom();
    expect(component.isZoomed()).toBe(true);
    expect(component.posX()).toBe(0);
    expect(component.posY()).toBe(0);
    component.toggleZoom();
    expect(component.isZoomed()).toBe(false);
  });

  it('should toggle and close dropdown menus', () => {
    const dummyEvent = new MouseEvent('click');
    vi.spyOn(dummyEvent, 'stopPropagation');

    component.toggleDropdown('special', dummyEvent);
    expect(component.activeDropdown()).toBe('special');

    component.toggleDropdown('special', dummyEvent);
    expect(component.activeDropdown()).toBeNull();

    component.toggleDropdown('help', dummyEvent);
    expect(component.activeDropdown()).toBe('help');

    component.closeDropdowns();
    expect(component.activeDropdown()).toBeNull();
  });

  it('should handle dragging and resizing mouse events', () => {
    const dragEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    component.startDrag(dragEvent);

    const moveEvent = new MouseEvent('mousemove', { clientX: 140, clientY: 130 });
    component.onMouseMove(moveEvent);
    expect(component.posX()).toBe(40);
    expect(component.posY()).toBe(30);

    component.onMouseUp();

    const mockContainer = { offsetWidth: 800, offsetHeight: 600 };
    component.windowContainer = { nativeElement: mockContainer } as unknown as ElementRef<HTMLDivElement>;

    const resizeEvent = new MouseEvent('mousedown', { clientX: 200, clientY: 200 });
    vi.spyOn(resizeEvent, 'stopPropagation');
    vi.spyOn(resizeEvent, 'preventDefault');
    component.startResize(resizeEvent);

    const resizeMove = new MouseEvent('mousemove', { clientX: 300, clientY: 300 });
    component.onMouseMove(resizeMove);
    expect(component.windowWidth()).toBe(900);
    expect(component.windowHeight()).toBe(700);

    component.onMouseUp();
  });

  it('should trigger menu items and open modals', () => {
    component.triggerMenu('File');
    expect(mockSoundService.playClick).toHaveBeenCalled();

    component.openAboutModal();
    expect(component.aboutOpen()).toBe(true);

    component.openBlueMeaniesModal();
    expect(component.blueMeaniesOpen()).toBe(true);

    component.runBenchmark();
    expect(mockBenchmarkService.runBenchmarkSuite).toHaveBeenCalled();
    expect(component.benchmarkOpen()).toBe(true);
  });

  it('should clear logs', () => {
    component.addLog('Test log');
    expect(component.logs().length).toBeGreaterThan(1);
    component.clearLogs();
    expect(component.logs().length).toBe(1);
    expect(component.logs()[0].message).toContain('cleared');
  });

  it('should show alert modal', () => {
    component.showAlert('Alert message');
    expect(mockSoundService.playAlert).toHaveBeenCalled();
    expect(component.modalMessage()).toBe('Alert message');
    expect(component.modalOpen()).toBe(true);
  });

  it('should emit closeWindow when title bar close button is clicked', () => {
    const closeSpy = vi.spyOn(component.closeWindow, 'emit');
    component.closeWindowClick();
    expect(mockSoundService.playClick).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', () => {
    vi.spyOn(component.generator, 'generate');

    const keyG = new KeyboardEvent('keydown', { key: 'g', metaKey: true });
    component.handleKeyboardEvent(keyG);
    expect(component.generator.generate).toHaveBeenCalled();

    const keyB = new KeyboardEvent('keydown', { key: 'b', metaKey: true });
    component.handleKeyboardEvent(keyB);
    expect(mockBenchmarkService.runBenchmarkSuite).toHaveBeenCalled();

    const keyK = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    component.handleKeyboardEvent(keyK);
    expect(component.logs()[0].message).toContain('cleared');

    const keyH = new KeyboardEvent('keydown', { key: 'h', metaKey: true });
    component.handleKeyboardEvent(keyH);
    expect(component.aboutOpen()).toBe(true);

    const keyBlue = new KeyboardEvent('keydown', { key: 'b', metaKey: true, altKey: true, shiftKey: true });
    component.handleKeyboardEvent(keyBlue);
    expect(component.blueMeaniesOpen()).toBe(true);
  });
});
