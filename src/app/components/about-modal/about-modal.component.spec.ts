import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AboutModalComponent } from './about-modal.component';

describe('AboutModalComponent', () => {
  let component: AboutModalComponent;
  let fixture: ComponentFixture<AboutModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutModalComponent);
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

  it('should render dialog when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('About PowerPC Bit-Hacks Utility');
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

  it('should emit close event when OK button is clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.close, 'emit');
    const okBtn = fixture.nativeElement.querySelector('.mac-button');
    okBtn.click();
    expect(emitSpy).toHaveBeenCalled();
  });
});
