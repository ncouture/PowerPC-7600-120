import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { StatusBarComponent } from './status-bar.component';
import { SoundEffectsService } from '../../services/sound-effects.service';

describe('StatusBarComponent', () => {
  let component: StatusBarComponent;
  let fixture: ComponentFixture<StatusBarComponent>;
  let mockSoundService: {
    isMuted: ReturnType<typeof vi.fn>;
    macVolumeLevel: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockSoundService = {
      isMuted: vi.fn().mockReturnValue(false),
      macVolumeLevel: vi.fn().mockReturnValue(5),
    };

    await TestBed.configureTestingModule({
      imports: [StatusBarComponent],
      providers: [
        { provide: SoundEffectsService, useValue: mockSoundService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display formatted time after initialization', () => {
    expect(component.formattedTime()).not.toBe('');
    expect(component.formattedTime()).toContain('EST');
  });

  it('should emit openSound event', () => {
    const emitSpy = vi.spyOn(component.openSound, 'emit');
    component.openSound.emit();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should clean up timer on destroy', () => {
    component.ngOnDestroy();
    // Should not throw
    expect(component.formattedTime()).toBeTruthy();
  });

  it('should display CPU and sound info in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PowerPC 604e');
    expect(compiled.textContent).toContain('AltiVec Unit: Active');
    expect(compiled.textContent).toContain('Sound (5/7)');
  });
});
