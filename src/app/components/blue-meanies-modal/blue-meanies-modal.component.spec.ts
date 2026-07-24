import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlueMeaniesModalComponent } from './blue-meanies-modal.component';

describe('BlueMeaniesModalComponent', () => {
  let component: BlueMeaniesModalComponent;
  let fixture: ComponentFixture<BlueMeaniesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueMeaniesModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BlueMeaniesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the BlueMeaniesModalComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render System 7 Blue Meanies engineering credits text when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Blue Meanies');
    expect(compiled.textContent).toContain('System 7');
  });

  it('should emit close event when close button is clicked', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.closeModal();
    expect(closed).toBe(true);
  });
});
