import { MetricUnit, MetricStatus } from './metric.model';
import { ApiMetricKey } from './api-metric.model';
import { SystemMetricKey } from './system-metric.model';
import { DbMetricKey } from './db-metric.model';
import { PerformanceMetricKey } from './performance-metric.model';

type GeneratorFn = (r: number) => number;

type MetricDefinition = {
  key: PerformanceMetricKey;
  unit: MetricUnit;
  title?: string; // human-readable title for UI
  unitHint?: string; // optional alternative unit hint
  clampMin?: number;
  clampMax?: number;
  // Generator produces a raw value from r ∈ [0,1)
  generator?: GeneratorFn;
  // thresholds: warn / critical (upper bounds). If not defined, status will be 'ok'.
  thresholds?: { warn: number; critical: number };
};

// Central registry of all metrics. Add or change metadata here instead of edit switches across files.
export const METRIC_REGISTRY: Record<PerformanceMetricKey, MetricDefinition> = {
  // API
  'api.response_time_p95': {
    key: 'api.response_time_p95',
    title: 'P95 Response Time',
    unit: 'ms',
    unitHint: 'ms',
    clampMin: 50,
    clampMax: 3000,
    generator: (r) => 220 + (r - 0.5) * 80 + r * 250,
    thresholds: { warn: 300, critical: 800 }
  },
  'api.response_time_avg': {
    key: 'api.response_time_avg',
    title: 'Avg Response Time',
    unit: 'ms',
    unitHint: 'ms',
    clampMin: 30,
    clampMax: 1500,
    generator: (r) => 120 + (r - 0.5) * 40 + r * 120,
    thresholds: { warn: 250, critical: 500 }
  },
  'api.request_rate': {
    key: 'api.request_rate',
    title: 'Request Rate',
    unit: 'rps',
    unitHint: 'rps',
    clampMin: 0,
    clampMax: 200,
    generator: (r) => 4 + (r - 0.5) * 2 + r * 8
  },
  'api.error_rate': {
    key: 'api.error_rate',
    title: 'Error Rate',
    unit: '%',
    unitHint: '%',
    clampMin: 0,
    clampMax: 100,
    generator: (r) => 0.15 + Math.max(0, r - 0.5) * 0.4 + r * 1.2,
    thresholds: { warn: 1, critical: 5 }
  },

  // System
  'sys.cpu_usage': {
    key: 'sys.cpu_usage',
    title: 'CPU Usage',
    unit: '%',
    unitHint: '%',
    clampMin: 0,
    clampMax: 100,
    generator: (r) => 25 + (r - 0.5) * 10 + r * 55,
    thresholds: { warn: 75, critical: 90 }
  },
  'sys.memory_usage': {
    key: 'sys.memory_usage',
    title: 'Memory Usage',
    unit: '%',
    unitHint: '%',
    clampMin: 0,
    clampMax: 100,
    generator: (r) => 35 + (r - 0.5) * 10 + r * 45,
    thresholds: { warn: 80, critical: 92 }
  },
  'sys.disk_io': {
    key: 'sys.disk_io',
    title: 'Disk I/O',
    unit: 'mb_s',
    unitHint: 'mb_s',
    clampMin: 0,
    clampMax: 500,
    generator: (r) => 10 + (r - 0.5) * 6 + r * 80
  },
  'sys.network_latency': {
    key: 'sys.network_latency',
    title: 'Network Latency',
    unit: 'ms',
    unitHint: 'ms',
    clampMin: 0,
    clampMax: 5000,
    generator: (r) => 15 + (r - 0.5) * 8 + r * 120,
    thresholds: { warn: 250, critical: 800 }
  },

  // DB
  'db.query_time_avg': {
    key: 'db.query_time_avg',
    title: 'Avg Query Time',
    unit: 'ms',
    unitHint: 'ms',
    clampMin: 0,
    clampMax: 5000,
    generator: (r) => 20 + (r - 0.5) * 10 + r * 150,
    thresholds: { warn: 300, critical: 1200 }
  },
  'db.active_connections': {
    key: 'db.active_connections',
    title: 'Active Connections',
    unit: 'count',
    unitHint: 'count',
    clampMin: 0,
    clampMax: 500,
    generator: (r) => 10 + (r - 0.5) * 5 + r * 70
  },
  'db.slow_queries_count': {
    key: 'db.slow_queries_count',
    title: 'Slow Queries',
    unit: 'count',
    unitHint: 'count',
    clampMin: 0,
    clampMax: 500,
    generator: (r) => Math.max(0, r - 0.5) * 2 + r * 10
  }
};

export function unitForMetric(key: PerformanceMetricKey): MetricUnit {
  return METRIC_REGISTRY[key].unit;
}

export function clampForMetric(key: PerformanceMetricKey, v: number): number {
  const def = METRIC_REGISTRY[key];
  const min = def.clampMin ?? Number.NEGATIVE_INFINITY;
  const max = def.clampMax ?? Number.POSITIVE_INFINITY;
  return Math.max(min, Math.min(max, v));
}

export function statusForMetric(key: PerformanceMetricKey, v: number): MetricStatus {
  const t = METRIC_REGISTRY[key].thresholds;
  if (!t) return 'ok';
  if (v >= t.critical) return 'critical';
  if (v >= t.warn) return 'warn';
  return 'ok';
}

export function generateForMetric(key: PerformanceMetricKey, r: number): number {
  const gen = METRIC_REGISTRY[key].generator;
  if (!gen) return 0;
  return gen(r);
}

export function metricEntriesByPrefix(prefix: string) {
  return Object.values(METRIC_REGISTRY).filter(e => e.key.startsWith(prefix));
}
