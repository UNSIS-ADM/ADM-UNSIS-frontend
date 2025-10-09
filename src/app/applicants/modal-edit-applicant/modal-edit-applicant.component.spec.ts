import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditApplicantComponent } from './modal-edit-applicant.component';

describe('ModalEditApplicantComponent', () => {
  let component: ModalEditApplicantComponent;
  let fixture: ComponentFixture<ModalEditApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditApplicantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEditApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
