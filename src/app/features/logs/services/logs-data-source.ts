import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { LogEvent } from '../models/log-event.model';
import { LogsQuery } from '../models/log-query.model';
import { PagedResult } from '../models/paged.model';

export interface LogsDataSource {
  getLogs(query: LogsQuery): Observable<PagedResult<LogEvent>>;
  getFacetOptions(): Observable<{ services: string[]; installationIds: string[] }>;
}

export const LOGS_DATA_SOURCE = new InjectionToken<LogsDataSource>('LOGS_DATA_SOURCE');
