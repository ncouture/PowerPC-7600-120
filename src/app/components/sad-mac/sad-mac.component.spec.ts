import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SadMacComponent } from './sad-mac.component';
import { SoundEffectsService } from '../../services/sound-effects.service';
import { vi } from 'vitest';

describe('SadMacComponent', () => {
  let component: SadMacComponent;
  let fixture: ComponentFixture<SadMacComponent>;
  let soundService: SoundEffectsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SadMacComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SadMacComponent);
    component = fixture.componentInstance;
    soundService = TestBed.inject(SoundEffectsService);
    fixture.detectChanges();
  });

  it('should create the SadMacComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render classic error code 0000000F 00000003', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('0000000F');
    expect(compiled.textContent).toContain('00000003');
  });

  it('should render Wikipedia sad_mac.png image element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toContain('assets/sad_mac.png');
  });

  it('should trigger playSadMacChime on sound service', () => {
    const spy = vi.spyOn(soundService, 'playSadMacChime');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
});
