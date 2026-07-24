import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('PowerPC 1996 Bit-Hacks Credit Card Utility');
  });

  it('should mount boot sequence during boot and desktop when boot completes', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-boot-sequence')).toBeTruthy();

    // Finish boot sequence
    app.onBootFinished();
    fixture.detectChanges();

    expect(compiled.querySelector('app-system7-desktop')).toBeTruthy();
  });

  it('should reboot back to boot sequence when reboot() is called', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    // Complete boot
    app.onBootFinished();
    fixture.detectChanges();
    expect(app.isBooting()).toBe(false);

    // Reboot
    app.reboot();
    fixture.detectChanges();
    expect(app.isBooting()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-boot-sequence')).toBeTruthy();
  });
});
