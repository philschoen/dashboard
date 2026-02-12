import { Component, computed, effect, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

import { JOBS_DATA_SOURCE, JobsDataSource } from '../../services/jobs-data-source';
import { JobStatus, JobType, QueueId } from '../../models/job.model';

import { JobsToolbar } from '../../components/jobs-toolbar/jobs-toolbar';
import { JobsDefinitionsList } from '../../components/jobs-definitions-list/jobs-definitions-list';
import { JobsRunsPanel } from '../../components/jobs-runs-panel/jobs-runs-panel';
import { JobsDetailsDrawer } from '../../components/jobs-details-drawer/jobs-details-drawer';

type JobRunLogItem = { level: 'Debug' | 'Info' | 'Warn' | 'Error'; message: string };
type JobRunVM = {
  id: string;
  jobKey: string;
  targetId: string;
  requestedAt: string;
  status: string;
  progressPercent?: number;
  attempts?: number;
  details?: any;
  name?: string;
};

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    JobsToolbar,
    JobsDefinitionsList,
    JobsRunsPanel,
    JobsDetailsDrawer,
  ],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.css',
})
export class JobsPage {
 
@ViewChild(JobsDetailsDrawer) drawer?: JobsDetailsDrawer;

  private readonly ds = inject(JOBS_DATA_SOURCE) as JobsDataSource;
  private readonly snack = inject(MatSnackBar);

  // View models
  readonly jobDefinitions = signal<Array<{ id: string; name: string; description?: string; key: string; targetType?: string; isDangerous?: boolean }>>([]);
  readonly jobRuns = signal<JobRunVM[]>([]);
  readonly queues = signal<string[]>([]);
  readonly types = signal<string[]>([]);

  // Filters & paging
  readonly selectedQueue = signal<QueueId | null>(null);
  readonly selectedType = signal<JobType | null>(null);
  readonly selectedStatuses = signal<JobStatus[]>([]);
  readonly searchQuery = signal<string>('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly total = signal(0);

  // Overview counts
  readonly totalJobs = signal(0);
  readonly pendingCount = signal(0);
  readonly runningCount = signal(0);
  readonly succeededCount = signal(0);
  readonly failedCount = signal(0);
  readonly cancelledCount = signal(0);

  // Selection
  readonly selectedJobId = signal<string | null>(null);
  readonly selectedRunId = signal<string | null>(null);

  // Drawer logs
  readonly logs = signal<JobRunLogItem[]>([]);
  readonly isLoadingLogs = signal(false);

  readonly selectedJob = computed(() =>
    this.jobDefinitions().find(j => j.id === this.selectedJobId()) ?? null
  );

  readonly selectedRun = computed(() =>
    this.jobRuns().find(r => r.id === this.selectedRunId()) ?? null
  );

  constructor() {
    this.refresh();

    effect(() => {
      const runId = this.selectedRunId();
      if (!runId) return;
      this.loadLogs(runId);
    });

    effect(() => {
      // track filter changes
      this.selectedQueue(); this.selectedType(); this.selectedStatuses();
      this.searchQuery(); this.pageIndex(); this.pageSize();
      this.loadJobs();
    });
  }

  refresh() {
    this.ds.getQueues().subscribe(q => this.queues.set(q));
    this.ds.getJobDefinitions().subscribe(d => this.jobDefinitions.set(d));
    this.ds.getSummary().subscribe(s => {
      this.totalJobs.set(s.total);
      this.pendingCount.set(s.pending);
      this.runningCount.set(s.running);
      this.succeededCount.set(s.succeeded);
      this.failedCount.set(s.failed);
      this.cancelledCount.set(s.cancelled);
    });
    this.loadJobs();
  }

  private loadJobs() {
    const filter: any = {};
    if (this.selectedQueue()) filter.queue = this.selectedQueue();
    if (this.selectedType()) filter.type = this.selectedType();
    if (this.selectedStatuses()?.length) filter.status = this.selectedStatuses();
    if (this.searchQuery()) filter.query = this.searchQuery();

    this.ds.getJobs({
      filter,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sort: undefined,
    }).subscribe(r => {
      this.jobRuns.set(r.items.map(j => ({
        id: j.id,
        jobKey: j.type,
        targetId: j.queue,
        requestedAt: j.createdAtUtc,
        status: j.status,
        progressPercent: j.status === 'Succeeded' ? 100 : j.status === 'Running' ? 50 : 0,
        attempts: j.attempts,
        details: j.details,
        name: j.name,
      })));

      this.total.set(r.total);
      this.types.set(Array.from(new Set(r.items.map(i => i.type))));
    });
  }

  // Events from child components
  onSelectJob(jobId: string) {
    this.selectedJobId.set(jobId);
  }

  onRunSelectedJob() {
    const job = this.selectedJob();
    if (!job) return;
    this.snack.open('Triggering job (simulated)', 'OK', { duration: 1500 });
    setTimeout(() => this.refresh(), 500);
  }

  onOpenRunDetails(runId: string) {
    this.selectedRunId.set(runId);
    this.drawer?.open();
  }

  onCloseRunDetails() {
  this.selectedRunId.set(null);
  this.logs.set([]);
}

  onResetFilters() {
    this.selectedQueue.set(null);
    this.selectedType.set(null);
    this.selectedStatuses.set([] as JobStatus[]);
    this.searchQuery.set('');
    this.pageIndex.set(0);
    this.loadJobs();
  }

  onFilterByStatus(status: JobStatus | null) {
    this.selectedStatuses.set(status ? [status] : ([] as JobStatus[]));
    this.pageIndex.set(0);
  }

  onPageChange(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  chipClassForStatus(status: string): string {
    switch (status) {
      case 'Pending': return 'chip-queued';
      case 'Running': return 'chip-running';
      case 'Succeeded': return 'chip-succeeded';
      case 'Failed': return 'chip-failed';
      case 'Cancelled': return 'chip-cancelled';
      default: return 'chip-default';
    }
  }

  private loadLogs(runId: string) {
    this.isLoadingLogs.set(true);

    const run = this.jobRuns().find(r => r.id === runId);
    if (!run) {
      this.logs.set([]);
      this.isLoadingLogs.set(false);
      return;
    }

    const details = run.details ?? {};
    const entries: JobRunLogItem[] = [
      { level: 'Info', message: `Job ${run.name ?? run.jobKey} - status: ${run.status}` },
      { level: 'Debug', message: `Attempts: ${run.attempts ?? 0}` },
      { level: 'Debug', message: `Details: ${JSON.stringify(details)}` },
    ];

    setTimeout(() => {
      this.logs.set(entries);
      this.isLoadingLogs.set(false);
    }, 150);
  }
}