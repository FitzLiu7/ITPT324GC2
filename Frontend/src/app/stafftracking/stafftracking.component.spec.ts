import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StafftrackingComponent } from './stafftracking.component';

describe('StafftrackingComponent', () => {
  let component: StafftrackingComponent;
  let fixture: ComponentFixture<StafftrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StafftrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StafftrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
