// api-metric.model.ts

import {
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
