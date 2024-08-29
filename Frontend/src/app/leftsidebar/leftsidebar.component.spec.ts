import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftsidebarComponent } from './leftsidebar.component';

describe('LeftsidebarComponent', () => {
  let component: LeftsidebarComponent;
  let fixture: ComponentFixture<LeftsidebarComponent>;

  // Setup the testing environment before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftsidebarComponent], // Import the component being tested
    }).compileComponents(); // Compile the component and its template

    fixture = TestBed.createComponent(LeftsidebarComponent); // Create an instance of the component
    component = fixture.componentInstance; // Access the component instance
    fixture.detectChanges(); // Apply changes and trigger data binding
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component instance is truthy, i.e., it was created successfully
  });
});
