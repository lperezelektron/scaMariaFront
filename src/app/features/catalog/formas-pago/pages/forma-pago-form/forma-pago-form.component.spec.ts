import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormaPagoFormComponent } from './forma-pago-form.component';

describe('FormaPagoFormComponent', () => {
  let component: FormaPagoFormComponent;
  let fixture: ComponentFixture<FormaPagoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormaPagoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormaPagoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
