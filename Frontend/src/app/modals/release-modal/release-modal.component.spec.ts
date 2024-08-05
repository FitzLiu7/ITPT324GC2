import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseModalComponent } from './release-modal.component';

describe('ReleaseModalComponent', () => {
  let component: ReleaseModalComponent;
  let fixture: ComponentFixture<ReleaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
