import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LogsDataSource } from './logs-data-source';
import { LogEvent, LogLevel } from '../models/log-event.model';
import { LogsQuery } from '../models/log-query.model';
import { PagedResult } from '../models/paged.model';

@Injectable()
export class MockLogsDataSource implements LogsDataSource {
  private readonly services = ['ApiGateway', 'AuthService', 'UserService'];
  private readonly installationIds = ['cust-001', 'cust-002', 'cust-003'];
  private readonly allLogs: LogEvent[] = this.generateMockLogs(600);

  getFacetOptions(): Observable<{ services: string[]; installationIds: string[] }> {
    return of({ services: this.services, installationIds: this.installationIds });
  }

  getLogs(query: LogsQuery): Observable<PagedResult<LogEvent>> {
    const { filter, pageIndex, pageSize, sort } = query;

    let filtered = [...this.allLogs];

    // Filter
    if (filter.levels?.length) filtered = filtered.filter(l => filter.levels.includes(l.level));
    if (filter.service) filtered = filtered.filter(l => l.service === filter.service);
    if (filter.installationId) filtered = filtered.filter(l => l.installationId === filter.installationId);
    if (filter.query) {
      const q = filter.query.toLowerCase();
      filtered = filtered.filter(l =>
        l.message.toLowerCase().includes(q) ||
        (l.exception?.message?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filter.fromUtc) {
      const from = Date.parse(filter.fromUtc);
      filtered = filtered.filter(l => Date.parse(l.timestampUtc) >= from);
    }
    if (filter.toUtc) {
      const to = Date.parse(filter.toUtc);
      filtered = filtered.filter(l => Date.parse(l.timestampUtc) <= to);
    }

    // Sort
    const direction = sort?.direction === 'asc' ? 1 : -1;
    const active = sort?.active ?? 'timestampUtc';
    filtered.sort((a, b) => {
      if (active === 'timestampUtc') return (Date.parse(a.timestampUtc) - Date.parse(b.timestampUtc)) * direction;
      if (active === 'level') return a.level.localeCompare(b.level) * direction;
      if (active === 'service') return a.service.localeCompare(b.service) * direction;
      return 0;
    });

    // Paging
    const total = filtered.length;
    const start = pageIndex * pageSize;
    const items = filtered.slice(start, start + pageSize);

    // kleine künstliche Latenz, damit Loading-State sichtbar ist
    return of({ items, total }).pipe(delay(150));
  }

  private generateMockLogs(count: number): LogEvent[] {
    const levels: LogLevel[] = ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Critical'];
    const now = Date.now();
    const logs: LogEvent[] = [];

    for (let i = 0; i < count; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const service = this.services[Math.floor(Math.random() * this.services.length)];
      const installationId = this.installationIds[Math.floor(Math.random() * this.installationIds.length)];
      const minutesAgo = Math.floor(Math.random() * 24 * 60);

      logs.push({
        id: crypto.randomUUID(),
        timestampUtc: new Date(now - minutesAgo * 60_000 - Math.floor(Math.random() * 60_000)).toISOString(),
        level,
        service,
        installationId,
        environment: 'prod',
        message: `${service}: Beispiel-Log (${level}) – Request ${Math.floor(Math.random() * 10_000)}`,
        exception: (level === 'Error' || level === 'Critical')
          ? { message: 'Something went wrong', stack: 'Stacktrace...\nLine 1\nLine 2' }
          : undefined,
        properties: { requestId: Math.floor(Math.random() * 1_000_000) },
      });
    }
    return logs;
  }
}
