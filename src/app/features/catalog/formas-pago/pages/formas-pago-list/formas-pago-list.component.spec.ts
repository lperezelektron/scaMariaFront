import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasPagoListComponent } from './formas-pago-list.component';

describe('FormasPagoListComponent', () => {
  let component: FormasPagoListComponent;
  let fixture: ComponentFixture<FormasPagoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasPagoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormasPagoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
