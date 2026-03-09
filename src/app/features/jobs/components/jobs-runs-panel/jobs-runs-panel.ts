import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { JobsOverview } from '../jobs-overview/jobs-overview';
import { JobStatus } from '../../models/job.model';

type JobRunVM = { id: string; jobKey: string; targetId: string; requestedAt: string; status: string };

@Component({
  selector: 'app-jobs-runs-panel',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatPaginatorModule,
    JobsOverview,
  ],
  templateUrl: './jobs-runs-panel.html',
  styleUrl: './jobs-runs-panel.css'
})
export class JobsRunsPanel {
  // overview
  @Input() totalJobs = 0;
  @Input() pending = 0;
  @Input() running = 0;
  @Input() succeeded = 0;
  @Input() failed = 0;
  @Input() cancelled = 0;

  // filters
  @Input() queues: string[] = [];
  @Input() types: string[] = [];
  @Input() selectedQueue: any = null;
  @Input() selectedType: any = null;
  @Input() selectedStatuses: JobStatus[] = [];
  @Input() searchQuery = '';

  // table/paging
  @Input() runs: JobRunVM[] = [];
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 25;

  @Input() chipClassForStatus?: (status: string) => string;
  @Input() selectedRunId: string | null = null;

  @Output() filterByStatus = new EventEmitter<JobStatus | null>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() queueChange = new EventEmitter<any>();
  @Output() typeChange = new EventEmitter<any>();
  @Output() statusesChange = new EventEmitter<JobStatus[]>();
  @Output() searchChange = new EventEmitter<string>();

  @Output() openRun = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  readonly columns = ['status', 'job', 'target', 'requestedAt'];
}