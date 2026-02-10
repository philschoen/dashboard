// db-metric.model.ts

import {
  MetricSeriesBase,
  MetricSummaryBase,
  TopServicesBase
} from './metric.model';

export type DbMetricKey =
  | 'db.query_time_avg'
  | 'db.active_connections'
  | 'db.slow_queries_count';

export type DbMetricSeries = MetricSeriesBase<DbMetricKey>;
export type DbMetricSummary = MetricSummaryBase<DbMetricKey>;
export type DbTopServices = TopServicesBase<DbMetricKey>;

export const DB_METRIC_LABELS: Record<DbMetricKey, { title: string; unitHint: string }> = {
  'db.query_time_avg': { title: 'Avg Query Time', unitHint: 'ms' },
  'db.active_connections': { title: 'Active Connections', unitHint: 'count' },
  'db.slow_queries_count': { title: 'Slow Queries', unitHint: 'count' }
};
