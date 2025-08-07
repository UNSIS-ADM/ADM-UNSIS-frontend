import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesNuevasCarrerasComponent } from './solicitudes-nuevas-carreras.component';

describe('SolicitudesNuevasCarrerasComponent', () => {
  let component: SolicitudesNuevasCarrerasComponent;
  let fixture: ComponentFixture<SolicitudesNuevasCarrerasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesNuevasCarrerasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesNuevasCarrerasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
