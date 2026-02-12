import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type JobDefVM = {
  id: string;
  name: string;
  description?: string;
  key: string;
  targetType?: string;
  isDangerous?: boolean;
  category?: string;
};

@Component({
  selector: 'app-jobs-definitions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './jobs-definitions-list.html',
  styleUrls: ['./jobs-definitions-list.css'],
})
export class JobsDefinitionsList {
  private readonly jobsSig = signal<JobDefVM[]>([]);

  @Input({ required: true })
  set jobs(value: JobDefVM[]) {
    this.jobsSig.set(value ?? []);
  }
  get jobs(): JobDefVM[] {
    return this.jobsSig();
  }

  @Input() selectedJobId: string | null = null;

  @Output() selectJob = new EventEmitter<string>();
  @Output() runSelectedJob = new EventEmitter<void>();

  readonly query = signal('');

  readonly filteredJobs = computed(() => {
    const jobs = this.jobsSig();
    const q = this.query().trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter(j =>
      (j.name ?? '').toLowerCase().includes(q) ||
      (j.description ?? '').toLowerCase().includes(q) ||
      (j.key ?? '').toLowerCase().includes(q) ||
      (j.targetType ?? '').toLowerCase().includes(q) ||
      (j.category ?? '').toLowerCase().includes(q)
    );
  });

  clearSearch() {
    this.query.set('');
  }

  onTileClick(jobId: string) {
    this.selectJob.emit(jobId);
  }

  onRunClick() {
    this.runSelectedJob.emit();
  }

  isSelected(jobId: string) {
    return jobId === this.selectedJobId;
  }

  trackById = (_: number, j: JobDefVM) => j.id;
}