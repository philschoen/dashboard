import { ApiMetricKey } from './api-metric.model';
import { SystemMetricKey } from './system-metric.model';
import { DbMetricKey } from './db-metric.model';

export type PerformanceMetricKey = ApiMetricKey | SystemMetricKey | DbMetricKey;