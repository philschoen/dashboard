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
