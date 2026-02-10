import { ChangeDetectionStrategy, Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ApexGrid } from 'ng-apexcharts';

export type LoadState<T> =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ok'; data: T };

@Component({
  selector: 'app-time-series-chart',
  imports: [CommonModule, MatCardModule, MatProgressBarModule, NgApexchartsModule],
  templateUrl: './time-series-chart.html',
  styleUrl: './time-series-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSeriesChart {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) unitLabel!: string; // z.B. 'ms'
  @Input({ required: true }) state!: LoadState<Array<[number, number]>>; // [timestampMs, value]

  get series(): ApexAxisChartSeries {
    if (this.state.kind !== 'ok') return [];
    return [{ name: this.title, data: this.state.data }];
  }

  readonly chart: ApexChart = {
    type: 'line',
    height: 320,
    zoom: { enabled: true },
    toolbar: { show: true }
  };

  readonly stroke: ApexStroke = { curve: 'smooth', width: 2 };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly xaxis: ApexXAxis = { type: 'datetime' };
  readonly grid: ApexGrid = { strokeDashArray: 3 };
  readonly tooltip: ApexTooltip = { x: { format: 'dd.MM.yyyy HH:mm' } };

  yaxis: ApexYAxis = { labels: { formatter: (v) => `${Math.round(v)} ` } };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unitLabel']) {
      const unit = this.unitLabel;
      this.yaxis = {
        labels: { formatter: (v) => `${Math.round(v)} ${unit}` }
      };
    }
  }

}
