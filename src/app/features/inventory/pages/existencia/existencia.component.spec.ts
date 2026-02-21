import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistenciaComponent } from './existencia.component';

describe('ExistenciaComponent', () => {
  let component: ExistenciaComponent;
  let fixture: ComponentFixture<ExistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
