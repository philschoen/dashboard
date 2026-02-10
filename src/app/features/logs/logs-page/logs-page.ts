import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LOGS_DATA_SOURCE } from '../services/logs-data-source';
import { LogsFilter } from '../models/log-filter.model';
import { LogsFilterBar } from '../components/logs-filter-bar/logs-filter-bar';
import { LogsTable } from '../components/logs-table/logs-table';
import { LogDetailDrawer } from '../components/log-detail-drawer/log-detail-drawer';
import { LogEvent } from '../models/log-event.model';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, LogsFilterBar, LogsTable, LogDetailDrawer, MatSidenavModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPage {
  private readonly ds = inject(LOGS_DATA_SOURCE);
  private readonly snackBar = inject(MatSnackBar);

  // UI state streams
  private readonly filter = signal<LogsFilter>({
    preset: '15m',
    levels: ['Error', 'Critical'],
  });

  private readonly page = signal<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 25,
  });

  private readonly sort = signal<Sort>({ active: 'timestampUtc', direction: 'desc' });

  loading = false;

  // Options for filterbar
  services: string[] = [];
  installationIds: string[] = [];

  // View data
  logs: any[] = [];
  total = 0;

  pageIndex = 0;
  pageSize = 25;

  error: string | null = null;

  constructor() {
    // Facets laden
    this.ds.getFacetOptions().subscribe(({ services, installationIds }) => {
      this.services = services;
      this.installationIds = installationIds;
    });

    // Logs laden, wenn Filter/Paging/Sort sich ändert — use Angular Signals + effect
    effect(() => {
      const filter = this.filter();
      const page = this.page();
      const sort = this.sort();

      this.loading = true;
      this.error = null;

      const sub = this.ds
        .getLogs({
          filter,
          pageIndex: page.pageIndex,
          pageSize: page.pageSize,
          sort,
        })
        .pipe(
          catchError(() => {
            this.loading = false;
            this.error = 'Logs konnten nicht geladen werden.';
            this.snackBar.open('Fehler beim Laden der Logs', 'Retry', { duration: 6000 }).onAction().subscribe(() => this.reload());

            return of({ items: [], total: 0 });
          })
        )
        .subscribe((res) => {
          this.logs = res.items;
          this.total = res.total;
          this.loading = false;
        });

      return () => sub.unsubscribe();
    });
  }

  onFilterChange(filter: LogsFilter): void {
    this.filter.set(filter);
    // bei Filterwechsel auf Seite 1
    this.pageIndex = 0;
    this.page.set({ pageIndex: 0, pageSize: this.pageSize });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.page.set({ pageIndex: e.pageIndex, pageSize: e.pageSize });
  }

  onSortChange(s: Sort): void {
    this.sort.set(s);
  }

  selectedLog: LogEvent | null = null;
  drawerOpened = false;

  onRowClick(row: LogEvent): void {
    if (this.selectedLog?.id === row.id) {
      this.closeDrawer();
      return;
    }

    this.selectedLog = row;
    this.drawerOpened = true;
  }

  closeDrawer(): void {
    this.drawerOpened = false;
    this.selectedLog = null;
  }

  reload(): void {
    // einfacher Reload: gleiche Werte nochmal "nexten"
    this.filter.set(this.filter());
  }
}
