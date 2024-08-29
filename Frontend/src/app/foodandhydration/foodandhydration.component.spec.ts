import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodandhydrationComponent } from './foodandhydration.component';
import { ApiService } from '../api.service';
import { of } from 'rxjs';

describe('FoodandhydrationComponent', () => {
  let component: FoodandhydrationComponent;
  let fixture: ComponentFixture<FoodandhydrationComponent>;
  let apiServiceStub: Partial<ApiService>;

  beforeEach(async () => {
    // Create a stub for the ApiService with mock methods
    apiServiceStub = {
      getList: () => of([]), // Mock getList method returns an empty observable
      getDataUpdates: () => of([]), // Mock getDataUpdates method returns an empty observable
    };

    // Configure the testing module
    await TestBed.configureTestingModule({
      declarations: [FoodandhydrationComponent], // Declare the component to be tested
      providers: [{ provide: ApiService, useValue: apiServiceStub }], // Provide the stubbed ApiService
    }).compileComponents(); // Compile the component's template and CSS

    // Create the component instance
    fixture = TestBed.createComponent(FoodandhydrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger data binding
  });

  // Test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy(); // Check if the component instance exists
  });

  // Test to check if the component contains a table element
  it('should have a table with room data', () => {
    const compiled = fixture.nativeElement as HTMLElement; // Get the rendered component's HTML
    expect(compiled.querySelector('table')).toBeTruthy(); // Check if a table element is present
  });
});
