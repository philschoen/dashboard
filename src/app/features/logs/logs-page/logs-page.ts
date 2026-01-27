import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogsFilterBar } from '../components/logs-filter-bar/logs-filter-bar';
import { LogsFilter } from '../models/log-filter.model';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [
    CommonModule,
    LogsFilterBar,
  ],
  templateUrl: './logs-page.html',
  styleUrl: './logs-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPage {

  services: string[] = ['ApiGateway', 'AuthService', 'UserService'];
  installationIds: string[] = ['cust-001', 'cust-002', 'cust-003'];

  // optional: Filterzustand in der Page halten
  currentFilter: LogsFilter | null = null;

  onFilterChange(filter: LogsFilter): void {
    this.currentFilter = filter;

    // TODO: hier später Logs neu laden (API/Mock-Service)
    // z.B. this.loadLogs(filter);
    console.log('Filter changed:', filter);
  }

  reload(): void {
    // Wird ausgelöst, wenn in der Filterbar der Refresh-Button geklickt wird
    // TODO: hier später erneut laden
    console.log('Manual reload');
    if (this.currentFilter) {
      // z.B. this.loadLogs(this.currentFilter);
    }
  }
}
