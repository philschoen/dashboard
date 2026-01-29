import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, switchMap, tap } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';


import { LOGS_DATA_SOURCE } from '../services/logs-data-source';
import { LogsFilter } from '../models/log-filter.model';
import { LogsFilterBar } from '../components/logs-filter-bar/logs-filter-bar';
import { LogsTable } from '../components/logs-table/logs-table';
import { LogDetailDrawer } from '../components/log-detail-drawer/log-detail-drawer';
import { LogEvent } from '../models/log-event.model';
import { MatSidenavModule } from "@angular/material/sidenav";

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [CommonModule, LogsFilterBar, LogsTable, LogDetailDrawer, MatSidenavModule],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPage {
  private readonly ds = inject(LOGS_DATA_SOURCE);

  // UI state streams
  private readonly filter$ = new BehaviorSubject<LogsFilter>({
    preset: '15m',
    levels: ['Error', 'Critical'],
  });

  private readonly page$ = new BehaviorSubject<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 25,
  });

  private readonly sort$ = new BehaviorSubject<Sort>({ active: 'timestampUtc', direction: 'desc' });

  loading = false;

  // Options for filterbar
  services: string[] = [];
  installationIds: string[] = [];

  // View data
  logs: any[] = [];
  total = 0;

  pageIndex = 0;
  pageSize = 25;

  constructor() {
    // Facets laden
    this.ds.getFacetOptions().subscribe(({ services, installationIds }) => {
      this.services = services;
      this.installationIds = installationIds;
    });

    // Logs laden, wenn Filter/Paging/Sort sich ändert
    combineLatest([this.filter$, this.page$, this.sort$])
      .pipe(
        tap(() => (this.loading = true)),
        switchMap(([filter, page, sort]) =>
          this.ds.getLogs({
            filter,
            pageIndex: page.pageIndex,
            pageSize: page.pageSize,
            sort,
          })
        ),
        tap(() => (this.loading = false))
      )
      .subscribe((res) => {
        this.logs = res.items;
        this.total = res.total;
      });
  }

  onFilterChange(filter: LogsFilter): void {
    this.filter$.next(filter);
    // bei Filterwechsel auf Seite 1
    this.pageIndex = 0;
    this.page$.next({ pageIndex: 0, pageSize: this.pageSize });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.page$.next({ pageIndex: e.pageIndex, pageSize: e.pageSize });
  }

  onSortChange(s: Sort): void {
    this.sort$.next(s);
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
    this.filter$.next(this.filter$.value);
  }
}
