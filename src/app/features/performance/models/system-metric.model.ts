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

export const SYSTEM_METRIC_LABELS: Record<SystemMetricKey, { title: string; unitHint: string }> = {
  'sys.cpu_usage': { title: 'CPU Usage', unitHint: '%' },
  'sys.memory_usage': { title: 'Memory Usage', unitHint: '%' },
  'sys.disk_io': { title: 'Disk I/O', unitHint: 'mb_s' },
  'sys.network_latency': { title: 'Network Latency', unitHint: 'ms' }
};
