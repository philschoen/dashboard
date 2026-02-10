import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSeriesChart } from './time-series-chart';

describe('TimeSeriesChart', () => {
  let component: TimeSeriesChart;
  let fixture: ComponentFixture<TimeSeriesChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeriesChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSeriesChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
