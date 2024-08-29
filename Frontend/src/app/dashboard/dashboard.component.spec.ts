import { ComponentFixture, TestBed } from '@angular/core/testing';

import DashboardComponent from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  // Before each test, set up the testing environment
  beforeEach(async () => {
    // Configure the testing module, similar to setting up the component
    await TestBed.configureTestingModule({
      imports: [DashboardComponent], // Import the component to be tested
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent); // Create an instance of the component
    component = fixture.componentInstance; // Assign the component instance to the variable
    fixture.detectChanges(); // Apply the changes
  });

  // Test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component exists
  });
});
