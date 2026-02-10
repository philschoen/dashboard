import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricKpiCard } from './metric-kpi-card';

describe('MetricKpiCard', () => {
  let component: MetricKpiCard;
  let fixture: ComponentFixture<MetricKpiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricKpiCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricKpiCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
