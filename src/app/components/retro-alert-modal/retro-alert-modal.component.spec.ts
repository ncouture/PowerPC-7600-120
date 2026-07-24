import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RetroAlertModalComponent } from './retro-alert-modal.component';

describe('RetroAlertModalComponent', () => {
  let component: RetroAlertModalComponent;
  let fixture: ComponentFixture<RetroAlertModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetroAlertModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RetroAlertModalComponent);
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

  it('should render message when isOpen is true', () => {
    fixture.componentRef.setInput('message', 'Card datastream successfully generated.');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dialogElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogElement).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Card datastream successfully generated.');
  });

  it('should focus OK button in ngAfterViewInit when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const buttonSpy = vi.spyOn(component.okBtn.nativeElement, 'focus');
    component.ngAfterViewInit();
    expect(buttonSpy).toHaveBeenCalled();
  });

  it('should emit close event when OK button is clicked or closeModal is called', () => {
    fixture.componentRef.setInput('message', 'Test message');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.close, 'emit');
    const okBtn = fixture.nativeElement.querySelector('.mac-button');
    okBtn.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);

    component.closeModal();
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });
});
