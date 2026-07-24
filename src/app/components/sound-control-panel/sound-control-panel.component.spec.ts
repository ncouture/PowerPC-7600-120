import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SoundControlPanelComponent } from './sound-control-panel.component';
import { SoundEffectsService } from '../../services/sound-effects.service';

describe('SoundControlPanelComponent', () => {
  let component: SoundControlPanelComponent;
  let fixture: ComponentFixture<SoundControlPanelComponent>;
  let mockSoundService: Record<string, unknown>;

  beforeEach(async () => {
    mockSoundService = {
      toggleMute: vi.fn(),
      setVolume: vi.fn(),
      setSoundTheme: vi.fn(),
      setDacResampling: vi.fn(),
      resetToDefaults: vi.fn(),
      playAlert: vi.fn(),
      playClick: vi.fn(),
      volume: vi.fn().mockReturnValue(80),
      isMuted: vi.fn().mockReturnValue(false),
      macVolumeLevel: vi.fn().mockReturnValue(6),
      soundTheme: vi.fn().mockReturnValue('indigo'),
      dacResampling: vi.fn().mockReturnValue('16bit'),
    };

    await TestBed.configureTestingModule({
      imports: [SoundControlPanelComponent],
      providers: [
        { provide: SoundEffectsService, useValue: mockSoundService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render panel when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).toBeNull();
  });

  it('should render control panel when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Sound Control Panel');
  });

  it('should focus close button in ngAfterViewInit when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const buttonSpy = vi.spyOn(component.closeBtn.nativeElement, 'focus');
    component.ngAfterViewInit();
    expect(buttonSpy).toHaveBeenCalled();
  });

  it('should not focus when isOpen is false in ngAfterViewInit', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    component.ngAfterViewInit();
    // No error thrown; closeBtn is undefined
  });

  it('should calculate active VU count accurately based on volume and mute state', () => {
    expect(component.activeVuCount()).toBe(8);

    mockSoundService.isMuted.mockReturnValue(true);
    expect(component.activeVuCount()).toBe(0);

    mockSoundService.isMuted.mockReturnValue(false);
    mockSoundService.volume.mockReturnValue(50);
    expect(component.activeVuCount()).toBe(5);

    mockSoundService.volume.mockReturnValue(0);
    expect(component.activeVuCount()).toBe(0);

    mockSoundService.volume.mockReturnValue(100);
    expect(component.activeVuCount()).toBe(10);
  });

  it('should trigger volume change and playClick sound on volume adjustment', () => {
    component.onVolumeChange(50);
    expect(mockSoundService.setVolume).toHaveBeenCalledWith(50);
    expect(mockSoundService.playClick).toHaveBeenCalled();
  });

  it('should select sound theme and play alert sound', () => {
    component.selectTheme('quack');
    expect(mockSoundService.setSoundTheme).toHaveBeenCalledWith('quack');
    expect(mockSoundService.playAlert).toHaveBeenCalled();
  });

  it('should select all available themes', () => {
    const themes = ['indigo', 'simple_beep', 'droplet', 'quack', 'sosumi', 'wild_eep'] as const;
    themes.forEach(theme => {
      component.selectTheme(theme);
      expect(mockSoundService.setSoundTheme).toHaveBeenCalledWith(theme);
    });
  });

  it('should handle dragging and position transformation', () => {
    const mouseEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    component.startDrag(mouseEvent);

    const moveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 120 });
    component.onMouseMove(moveEvent);
    expect(component.posX).toBe(50);
    expect(component.posY).toBe(20);
    expect(component.windowTransform()).toBe('translate(50px, 20px)');

    component.onMouseUp();

    // Verify no movement after mouseup
    const moveAfter = new MouseEvent('mousemove', { clientX: 200, clientY: 200 });
    component.onMouseMove(moveAfter);
    expect(component.posX).toBe(50);
    expect(component.posY).toBe(20);
  });

  it('should handle Escape key to close modal when open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.close, 'emit');
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(escEvent);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should ignore Escape key when panel is closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.close, 'emit');
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(escEvent);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should ignore non-Escape keys', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.close, 'emit');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    component.handleKeyDown(enterEvent);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit close event and play click sound when closeModal is called', () => {
    const emitSpy = vi.spyOn(component.close, 'emit');
    component.closeModal();
    expect(mockSoundService.playClick).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should have 6 sound themes and 10 VU segments', () => {
    expect(component.soundThemes.length).toBe(6);
    expect(component.vuSegments.length).toBe(10);
  });
});
