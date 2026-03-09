import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

type JobRunLogItem = { level: 'Debug' | 'Info' | 'Warn' | 'Error'; message: string };
type JobRunVM = { jobKey: string; targetId: string; requestedAt: string; status: string; progressPercent?: number };

@Component({
  selector: 'app-jobs-details-drawer',
  standalone: true,
  imports: [CommonModule, DatePipe, MatSidenavModule, MatChipsModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './jobs-details-drawer.html',
  styleUrls: ['./jobs-details-drawer.css'],
})
export class JobsDetailsDrawer {
  @ViewChild(MatDrawer) private matDrawer?: MatDrawer;

  @Input() selectedRun: JobRunVM | null = null;
  @Input() logs: JobRunLogItem[] = [];
  @Input() isLoadingLogs = false;
  @Input() chipClassForStatus?: (status: string) => string;

  @Output() close = new EventEmitter<void>();

  open() {
    this.matDrawer?.open();
  }

  closeDrawer() {
    this.matDrawer?.close();
    this.close.emit();
  }
}