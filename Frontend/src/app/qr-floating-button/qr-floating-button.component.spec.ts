import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrFloatingButtonComponent } from './qr-floating-button.component';

describe('QrFloatingButtonComponent', () => {
  let component: QrFloatingButtonComponent;
  let fixture: ComponentFixture<QrFloatingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrFloatingButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrFloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
