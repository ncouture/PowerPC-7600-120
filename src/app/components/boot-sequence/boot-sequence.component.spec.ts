import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { BootSequenceComponent } from './boot-sequence.component';
import { SoundEffectsService } from '../../services/sound-effects.service';
import { routes } from '../../app.routes';

describe('BootSequenceComponent', () => {
  let component: BootSequenceComponent;
  let fixture: ComponentFixture<BootSequenceComponent>;
  let mockSoundService: {
    playStartupChime: ReturnType<typeof vi.fn>;
    playClick: ReturnType<typeof vi.fn>;
    playSuccess: ReturnType<typeof vi.fn>;
    playDiskSeek: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockSoundService = {
      playStartupChime: vi.fn(),
      playClick: vi.fn(),
      playSuccess: vi.fn(),
      playDiskSeek: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BootSequenceComponent],
      providers: [
        provideRouter(routes),
        { provide: SoundEffectsService, useValue: mockSoundService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BootSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the boot sequence component', () => {
    expect(component).toBeTruthy();
  });

  describe('7-Second Nonlinear Boot Curve Calculation', () => {
    it('should calculate 0% progress at t = 0s', () => {
      expect(component.calculateProgress(0)).toBe(0);
    });

    it('should calculate exactly 70% progress at t = 2.3s (33% time marker)', () => {
      const progress = component.calculateProgress(2300);
      expect(Math.round(progress)).toBe(70);
    });

    it('should calculate 100% progress at t = 7.0s (7000ms)', () => {
      const progress = component.calculateProgress(7000);
      expect(Math.round(progress)).toBe(100);
    });

    it('should progress smoothly between 70% and 100% in remaining 4.7s', () => {
      const progressMid = component.calculateProgress(4650);
      expect(progressMid).toBeGreaterThan(70);
      expect(progressMid).toBeLessThan(100);
    });

    it('should return 0 for negative elapsed time', () => {
      expect(component.calculateProgress(-100)).toBe(0);
    });

    it('should cap at 100 for elapsed time beyond 7000ms', () => {
      expect(component.calculateProgress(10000)).toBe(100);
    });
  });

  describe('Boot Sequence Lifecycle & Extension Loading', () => {
    it('should initialize with boot incomplete and 8 extension icons', () => {
      expect(component.extensionIcons.length).toBe(8);
    });

    it('should allow skipping boot sequence via skipBoot()', () => {
      let bootFinished = false;
      component.bootComplete.subscribe(() => {
        bootFinished = true;
      });

      component.skipBoot();
      expect(component.isBootComplete()).toBe(true);
      expect(bootFinished).toBe(true);
      expect(component.progress()).toBe(100);
      expect(component.extensionIcons.every(e => e.loaded)).toBe(true);
    });

    it('should count loaded extensions correctly', () => {
      expect(component.loadedExtensionCount()).toBeGreaterThanOrEqual(0);
      component.extensionIcons.forEach(e => e.loaded = true);
      expect(component.loadedExtensionCount()).toBe(8);
    });

    it('should clean up timer on destroy', () => {
      component.ngOnDestroy();
      // Should not throw
    });
  });

  describe('Apple IIci Dev Team Easter Egg Trigger', () => {
    it('should toggle Easter Egg modal state via openEasterEgg() and closeEasterEgg()', () => {
      expect(component.isEasterEggOpen()).toBe(false);
      component.openEasterEgg();
      expect(component.isEasterEggOpen()).toBe(true);
      expect(mockSoundService.playSuccess).toHaveBeenCalled();
      component.closeEasterEgg();
      expect(component.isEasterEggOpen()).toBe(false);
      expect(mockSoundService.playClick).toHaveBeenCalled();
    });

    it('should open easter egg on Alt+Click via onContainerClick', () => {
      const altClick = new MouseEvent('click', { altKey: true });
      component.onContainerClick(altClick);
      expect(component.isEasterEggOpen()).toBe(true);
    });

    it('should not open easter egg on normal click via onContainerClick', () => {
      const normalClick = new MouseEvent('click');
      component.onContainerClick(normalClick);
      expect(component.isEasterEggOpen()).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should skip boot on Escape key press', () => {
      const escapeSpy = vi.spyOn(component, 'skipBoot');
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      component.handleKeyDown(escEvent);
      expect(escapeSpy).toHaveBeenCalled();
    });

    it('should open easter egg on Alt key press', () => {
      const altEvent = new KeyboardEvent('keydown', { key: 'Alt', altKey: true });
      component.handleKeyDown(altEvent);
      expect(component.isEasterEggOpen()).toBe(true);
    });

    it('should ignore keyboard events after boot is complete', () => {
      component.skipBoot(); // Complete boot
      const openSpy = vi.spyOn(component, 'openEasterEgg');
      const altEvent = new KeyboardEvent('keydown', { key: 'Alt', altKey: true });
      component.handleKeyDown(altEvent);
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('Sad Mac Trigger', () => {
    it('should return false for shouldTriggerSadMac in normal conditions', () => {
      // Mock Math.random to return a value above 0.001
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(component.shouldTriggerSadMac()).toBe(false);
    });

    it('should return true for shouldTriggerSadMac when sadmac query param is set', () => {
      const originalSearch = window.location.search;
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?sadmac=1' },
        writable: true,
        configurable: true,
      });
      expect(component.shouldTriggerSadMac()).toBe(true);

      // Restore
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: originalSearch },
        writable: true,
        configurable: true,
      });
    });

    it('should return false when sadmac param is 0 or false', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?sadmac=0' },
        writable: true,
        configurable: true,
      });
      expect(component.shouldTriggerSadMac()).toBe(false);

      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?sadmac=false' },
        writable: true,
        configurable: true,
      });
      expect(component.shouldTriggerSadMac()).toBe(false);
    });

    it('should trigger sad mac when Math.random returns below 0.001', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.0001);
      expect(component.shouldTriggerSadMac()).toBe(true);
    });
  });
});
