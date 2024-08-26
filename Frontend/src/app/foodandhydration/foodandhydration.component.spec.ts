import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodandhydrationComponent } from './foodandhydration.component';
import { ApiService } from '../api.service';
import { of } from 'rxjs';

describe('FoodandhydrationComponent', () => {
  let component: FoodandhydrationComponent;
  let fixture: ComponentFixture<FoodandhydrationComponent>;
  let apiServiceStub: Partial<ApiService>;

  beforeEach(async () => {
    apiServiceStub = {
      getList: () => of([]),
      getDataUpdates: () => of([]),
    };

    await TestBed.configureTestingModule({
      declarations: [FoodandhydrationComponent],
      providers: [{ provide: ApiService, useValue: apiServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodandhydrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a table with room data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });
});
