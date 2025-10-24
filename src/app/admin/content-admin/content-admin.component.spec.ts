import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentAdminComponent } from './content-admin.component';

describe('ContentAdminComponent', () => {
  let component: ContentAdminComponent;
  let fixture: ComponentFixture<ContentAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
