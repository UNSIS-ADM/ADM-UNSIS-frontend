import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaDatosResultadosComponent } from './carga-datos-resultados.component';

describe('CargaDatosResultadosComponent', () => {
  let component: CargaDatosResultadosComponent;
  let fixture: ComponentFixture<CargaDatosResultadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaDatosResultadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaDatosResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
