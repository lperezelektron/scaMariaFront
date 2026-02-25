import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenesListComponent } from './almacenes-list.component';

describe('AlmacenesListComponent', () => {
  let component: AlmacenesListComponent;
  let fixture: ComponentFixture<AlmacenesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlmacenesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmacenesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
