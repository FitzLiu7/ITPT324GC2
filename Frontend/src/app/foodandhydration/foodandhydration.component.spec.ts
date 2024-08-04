import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodandhydrationComponent } from './foodandhydration.component';

describe('FoodandhydrationComponent', () => {
  let component: FoodandhydrationComponent;
  let fixture: ComponentFixture<FoodandhydrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodandhydrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodandhydrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
