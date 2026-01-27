import { LogsFilter } from './log-filter.model';

export interface LogsQuery {
  filter: LogsFilter;
  pageIndex: number;
  pageSize: number;
  sort?: { active: string; direction: 'asc' | 'desc' | '' };
}
