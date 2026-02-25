import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresListComponent } from './proveedores-list.component';

describe('ProveedoresListComponent', () => {
  let component: ProveedoresListComponent;
  let fixture: ComponentFixture<ProveedoresListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedoresListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
