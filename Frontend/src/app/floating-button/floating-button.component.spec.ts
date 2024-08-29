import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingButtonComponent } from './floating-button.component';

describe('FloatingButtonComponent', () => {
  let component: FloatingButtonComponent;
  let fixture: ComponentFixture<FloatingButtonComponent>;

  // Setup before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingButtonComponent], // Import the component to be tested
    }).compileComponents(); // Compile the component's template and CSS

    fixture = TestBed.createComponent(FloatingButtonComponent); // Create a test instance of the component
    component = fixture.componentInstance; // Assign the component instance to a variable
    fixture.detectChanges(); // Apply initial data binding
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component instance exists
  });
});
