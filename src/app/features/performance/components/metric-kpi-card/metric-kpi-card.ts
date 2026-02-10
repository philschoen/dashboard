import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type Status = 'ok' | 'warn' | 'critical';

@Component({
  selector: 'app-metric-kpi-card',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './metric-kpi-card.html',
  styleUrl: './metric-kpi-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricKpiCard {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number;
  @Input({ required: true }) unit!: string;
  @Input({ required: true }) status!: Status;

  iconForStatus(status: Status) {
    if (status === 'ok') return 'check_circle';
    if (status === 'warn') return 'warning';
    return 'error';
  }

}
