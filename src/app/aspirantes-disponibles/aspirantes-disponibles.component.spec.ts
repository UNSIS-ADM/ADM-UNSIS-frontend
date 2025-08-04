import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AspirantesDisponiblesComponent } from './aspirantes-disponibles.component';

describe('AspirantesDisponiblesComponent', () => {
  let component: AspirantesDisponiblesComponent;
  let fixture: ComponentFixture<AspirantesDisponiblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AspirantesDisponiblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AspirantesDisponiblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
