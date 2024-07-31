import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseStockComponent } from './release-stock.component';

describe('ReleaseStockComponent', () => {
  let component: ReleaseStockComponent;
  let fixture: ComponentFixture<ReleaseStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
