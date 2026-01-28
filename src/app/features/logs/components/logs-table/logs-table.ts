import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { LogEvent, LogLevel } from '../../models/log-event.model';

@Component({
  selector: 'app-logs-table',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './logs-table.html',
  styleUrl: './logs-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsTable {
  @Input({ required: true }) logs: LogEvent[] = [];
  @Input() total = 0;
  @Input() loading = false;

  @Input() pageIndex = 0;
  @Input() pageSize = 25;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() rowClick = new EventEmitter<LogEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  displayedColumns: Array<keyof any> = ['timestampUtc', 'level', 'service', 'message'];

  levelLabel(level: LogLevel): string {
    return level;
  }

  levelStyle(level: LogLevel): { [key: string]: string } {
    const styles: { [key: string]: { backgroundColor: string; color: string; fontWeight?: string } } = {
      trace: { backgroundColor: '#f2f2f2', color: '#555' },
      debug: { backgroundColor: '#e0e0e0', color: '#444' },
      info: { backgroundColor: '#e3f2fd', color: '#1565c0' },
      warn: { backgroundColor: '#fff3e0', color: '#ef6c00' },
      error: { backgroundColor: '#fdecea', color: '#c62828', fontWeight: '600' },
      critical: { backgroundColor: '#b71c1c', color: '#fff', fontWeight: '700' },
    };
    
    const levelKey = level.toLowerCase() as keyof typeof styles;
    return styles[levelKey] || {};
  }
}
