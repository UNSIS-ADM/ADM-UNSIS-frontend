import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudCarreraEstudianteComponent } from './solicitud-carrera-estudiante.component';

describe('SolicitudCarreraEstudianteComponent', () => {
  let component: SolicitudCarreraEstudianteComponent;
  let fixture: ComponentFixture<SolicitudCarreraEstudianteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudCarreraEstudianteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudCarreraEstudianteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
