import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaDatosComponent } from './carga-datos.component';

describe('CargaDatosComponent', () => {
  let component: CargaDatosComponent;
  let fixture: ComponentFixture<CargaDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaDatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
