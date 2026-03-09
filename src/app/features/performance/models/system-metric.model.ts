// system-metric.model.ts

import {
  MetricSeriesBase,
  MetricSummaryBase,
  TopServicesBase
} from './metric.model';

export type SystemMetricKey =
  | 'sys.cpu_usage'
  | 'sys.memory_usage'
  | 'sys.disk_io'
  | 'sys.network_latency';

export type SystemMetricSeries = MetricSeriesBase<SystemMetricKey>;
export type SystemMetricSummary = MetricSummaryBase<SystemMetricKey>;
export type SystemTopServices = TopServicesBase<SystemMetricKey>;
