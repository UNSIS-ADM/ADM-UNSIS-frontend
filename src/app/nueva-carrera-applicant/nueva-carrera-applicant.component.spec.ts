import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaCarreraApplicantComponent } from './nueva-carrera-applicant.component';

describe('NuevaCarreraApplicantComponent', () => {
  let component: NuevaCarreraApplicantComponent;
  let fixture: ComponentFixture<NuevaCarreraApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaCarreraApplicantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaCarreraApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
