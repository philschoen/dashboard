// api-metric.model.ts

import {
  MetricKey,
  MetricSeriesBase,
  MetricSummaryBase,
  TopServicesBase
} from './metric.model';

export type ApiMetricKey =
  | 'api.response_time_avg'
  | 'api.response_time_p95'
  | 'api.request_rate'
  | 'api.error_rate';

export type ApiMetricSeries = MetricSeriesBase<ApiMetricKey>;
export type ApiMetricSummary = MetricSummaryBase<ApiMetricKey>;
export type ApiTopServices = TopServicesBase<ApiMetricKey>;

/**
 * Optional: zentrale Labels für UI (damit du nicht überall switch/case schreibst).
 */
export const API_METRIC_LABELS: Record<ApiMetricKey, { title: string; unitHint: string }> = {
  'api.response_time_avg': { title: 'Avg Response Time', unitHint: 'ms' },
  'api.response_time_p95': { title: 'P95 Response Time', unitHint: 'ms' },
  'api.request_rate': { title: 'Request Rate', unitHint: 'rps' },
  'api.error_rate': { title: 'Error Rate', unitHint: '%' }
};
