import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePage } from './performance-page';

describe('PerformancePage', () => {
  let component: PerformancePage;
  let fixture: ComponentFixture<PerformancePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformancePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
