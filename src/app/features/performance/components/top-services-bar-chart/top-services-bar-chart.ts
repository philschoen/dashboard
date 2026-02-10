import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexTooltip, ApexXAxis } from 'ng-apexcharts';
import { LoadState } from '../time-series-chart/time-series-chart';

@Component({
  selector: 'app-top-services-bar-chart',
  imports: [CommonModule, MatCardModule, MatProgressBarModule, NgApexchartsModule],
  templateUrl: './top-services-bar-chart.html',
  styleUrl: './top-services-bar-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopServicesBarChart {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) unitLabel!: string; // '%'
  @Input({ required: true }) state!: LoadState<{ categories: string[]; values: number[] }>;

  readonly chart: ApexChart = { type: 'bar', height: 320, toolbar: { show: false } };
  readonly plotOptions: ApexPlotOptions = { bar: { horizontal: true, barHeight: '70%' } };
  readonly dataLabels: ApexDataLabels = { enabled: false };

  get series(): ApexAxisChartSeries {
    if (this.state.kind !== 'ok') return [];
    return [{ name: this.title, data: this.state.data.values }];
  }

  get xaxis(): ApexXAxis {
    return { categories: this.state.kind === 'ok' ? this.state.data.categories : [] };
  }

  get tooltip(): ApexTooltip {
    return { y: { formatter: (v) => `${v.toFixed(2)} ${this.unitLabel}` } };
  }

}
