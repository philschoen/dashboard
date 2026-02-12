import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { JobStatus } from '../../models/job.model';

@Component({
  selector: 'app-jobs-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule],
  templateUrl: './jobs-overview.html',
  styleUrls: ['./jobs-overview.css'],
})
export class JobsOverview {
  @Input() total = 0;
  @Input() running = 0;
  @Input() queued = 0;
  @Input() succeeded = 0;
  @Input() failed = 0;
  @Input() cancelled = 0;

  readonly JobStatus = JobStatus;

  @Output() filterByStatus = new EventEmitter<JobStatus | null>();

  onFilter(status: JobStatus | null) {
    this.filterByStatus.emit(status);
  }
}
