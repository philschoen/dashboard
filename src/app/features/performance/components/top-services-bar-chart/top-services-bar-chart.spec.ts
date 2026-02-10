import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopServicesBarChart } from './top-services-bar-chart';

describe('TopServicesBarChart', () => {
  let component: TopServicesBarChart;
  let fixture: ComponentFixture<TopServicesBarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopServicesBarChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopServicesBarChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
