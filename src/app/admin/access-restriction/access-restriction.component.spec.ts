import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessRestrictionComponent } from './access-restriction.component';

describe('AccessRestrictionComponent', () => {
  let component: AccessRestrictionComponent;
  let fixture: ComponentFixture<AccessRestrictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessRestrictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessRestrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
