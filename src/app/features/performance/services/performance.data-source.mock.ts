import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

import { PerformanceDataSource, PerformanceServiceOption } from './performance-data-source';

import { MetricUnit, MetricPoint, MetricStatus } from '../models/metric.model';
import { PerformanceMetricKey } from '../models/performance-metric.model';
import { unitForMetric, clampForMetric, statusForMetric, generateForMetric } from '../models/performance-metrics-registry';
import { SeriesFor, TopFor } from './performance-data-source';

// Note: PerformanceMetricKey is imported from `performance-metric.model` (central union).

// Die DTO-Typen kommen aus metric.model.ts via den Domain-Dateien.
// Für die Rückgabestruktur verwenden wir die Base-Typen implizit über Interface-Signaturen.
// (Wenn dein Interface explizite Typen erwartet, importiere sie dort entsprechend.)
type SummaryItem = {
  metricKey: PerformanceMetricKey;
  unit: MetricUnit;
  value: number;
  status: MetricStatus;
};

type SummaryDto = {
  serviceId: string;
  timestampUtc: string;
  metrics: SummaryItem[];
};

type SeriesDto = {
  serviceId: string;
  metricKey: PerformanceMetricKey;
  unit: MetricUnit;
  intervalSeconds: number;
  fromUtc: string;
  toUtc: string;
  points: MetricPoint[];
};

type TopItem = {
  serviceId: string;
  serviceName: string;
  value: number;
  unit: MetricUnit;
};

type TopDto = {
  metricKey: PerformanceMetricKey;
  windowMinutes: number;
  items: TopItem[];
};

@Injectable()
export class MockPerformanceDataSource implements PerformanceDataSource {
  private readonly services = [
    { id: 'svc-01', name: 'Customer A – Core API' },
    { id: 'svc-02', name: 'Customer A – Auth API' },
    { id: 'svc-03', name: 'Customer B – Core API' },
    { id: 'svc-04', name: 'Customer C – Billing API' },
    { id: 'svc-05', name: 'Customer D – Reporting API' }
  ];

  // global seed für reproduzierbare Mock-Daten
  private readonly baseSeed = 1337;

  // künstliche Latenz wie bei Logs
  private readonly mockDelayMs = 50;

  // Fehlerquote wie bei Logs (anpassbar)
  private readonly errorProbability = 0.00;

  // --------- Public API ---------


  getServices(): Observable<PerformanceServiceOption[]> {
    return of(this.services.map(s => ({ id: s.id, name: s.name }))).pipe(delay(50));
  }

  getSummary(serviceId: string): Observable<import('../models/metric.model').MetricSummaryBase<PerformanceMetricKey>> {
    if (Math.random() < this.errorProbability) {
      return throwError(() => new Error('Simulated backend error (performance summary)'));
    }

    const nowUtc = new Date().toISOString();

    // Default-Summary für alle drei Bereiche (API + System + DB)
    // Du kannst später pro Tab/Section filtern.
    const metricKeys: PerformanceMetricKey[] = [
      // API
      'api.response_time_p95',
      'api.response_time_avg',
      'api.request_rate',
      'api.error_rate',

      // System
      'sys.cpu_usage',
      'sys.memory_usage',
      'sys.disk_io',
      'sys.network_latency',

      // DB
      'db.query_time_avg',
      'db.active_connections',
      'db.slow_queries_count'
    ];

    // Summary = “letzter Punkt” aus kurzer Serie (letzte 10 Minuten, 60s buckets)
    const fromUtc = new Date(Date.now() - 10 * 60_000).toISOString();
    const toUtc = nowUtc;

    const metrics: SummaryItem[] = metricKeys.map(key => {
      const last = this.buildSeriesPoints(serviceId, key, fromUtc, toUtc, 60).at(-1);
      const value = last ? last.value : 0;
      const unit = unitForMetric(key);

      return {
        metricKey: key,
        unit,
        value,
        status: statusForMetric(key, value)
      };
    });

    return of({
      serviceId,
      timestampUtc: nowUtc,
      metrics
    }).pipe(delay(this.mockDelayMs));
  }

  getSeries<K extends PerformanceMetricKey>(
    serviceId: string,
    metricKey: K,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ): Observable<SeriesFor<K>> {
    if (Math.random() < this.errorProbability) {
      return throwError(() => new Error('Simulated backend error (performance series)'));
    }

    const points = this.buildSeriesPoints(serviceId, metricKey, fromUtc, toUtc, intervalSeconds);

    return of({
      serviceId,
      metricKey,
      unit: unitForMetric(metricKey),
      intervalSeconds,
      fromUtc,
      toUtc,
      points
    } as SeriesFor<K>).pipe(delay(this.mockDelayMs));
  }

  getTopServices<K extends PerformanceMetricKey>(
    metricKey: K,
    windowMinutes: number
  ): Observable<TopFor<K>> {
    if (Math.random() < this.errorProbability) {
      return throwError(() => new Error('Simulated backend error (performance top services)'));
    }

    const to = new Date();
    const from = new Date(to.getTime() - windowMinutes * 60_000);
    const fromUtc = from.toISOString();
    const toUtc = to.toISOString();

    // Top-Wert wird aus der Serie abgeleitet (Ø über das Fenster),
    // damit es konsistent und “realistisch” ist.
    const items: TopItem[] = this.services.map(s => {
      const pts = this.buildSeriesPoints(s.id, metricKey, fromUtc, toUtc, 60);

      const avg = pts.reduce((acc, p) => acc + p.value, 0) / Math.max(1, pts.length);
      const value = clampForMetric(metricKey, avg);

      return {
        serviceId: s.id,
        serviceName: s.name,
        value: Number(value.toFixed(2)),
        unit: unitForMetric(metricKey)
      };
    })
      .sort((a, b) => b.value - a.value);

    return of({
      metricKey,
      windowMinutes,
      items
    } as TopFor<K>).pipe(delay(this.mockDelayMs));
  }

  // Convenience helpers (domain-specific) ---------------------------------

  getApiSummary(serviceId: string) {
    return this.getSummary(serviceId) as Observable<import('../models/api-metric.model').ApiMetricSummary>;
  }

  getApiSeries<K extends import('../models/api-metric.model').ApiMetricKey>(
    serviceId: string,
    metricKey: K,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ) {
    return this.getSeries(serviceId, metricKey as PerformanceMetricKey, fromUtc, toUtc, intervalSeconds) as Observable<import('../models/api-metric.model').ApiMetricSeries>;
  }

  getApiTopServices(metricKey: import('../models/api-metric.model').ApiMetricKey, windowMinutes: number) {
    return this.getTopServices(metricKey as PerformanceMetricKey, windowMinutes) as Observable<import('../models/api-metric.model').ApiTopServices>;
  }

  getSystemSummary(serviceId: string) {
    return this.getSummary(serviceId) as Observable<import('../models/system-metric.model').SystemMetricSummary>;
  }

  getSystemSeries<K extends import('../models/system-metric.model').SystemMetricKey>(
    serviceId: string,
    metricKey: K,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ) {
    return this.getSeries(serviceId, metricKey as PerformanceMetricKey, fromUtc, toUtc, intervalSeconds) as Observable<import('../models/system-metric.model').SystemMetricSeries>;
  }

  getSystemTopServices(metricKey: import('../models/system-metric.model').SystemMetricKey, windowMinutes: number) {
    return this.getTopServices(metricKey as PerformanceMetricKey, windowMinutes) as Observable<import('../models/system-metric.model').SystemTopServices>;
  }

  getDbSummary(serviceId: string) {
    return this.getSummary(serviceId) as Observable<import('../models/db-metric.model').DbMetricSummary>;
  }

  getDbSeries<K extends import('../models/db-metric.model').DbMetricKey>(
    serviceId: string,
    metricKey: K,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ) {
    return this.getSeries(serviceId, metricKey as PerformanceMetricKey, fromUtc, toUtc, intervalSeconds) as Observable<import('../models/db-metric.model').DbMetricSeries>;
  }

  getDbTopServices(metricKey: import('../models/db-metric.model').DbMetricKey, windowMinutes: number) {
    return this.getTopServices(metricKey as PerformanceMetricKey, windowMinutes) as Observable<import('../models/db-metric.model').DbTopServices>;
  }

  // --------- Internals ---------

  private buildSeriesPoints(
    serviceId: string,
    metricKey: PerformanceMetricKey,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ): MetricPoint[] {
    const from = Date.parse(fromUtc);
    const to = Date.parse(toUtc);

    const points: MetricPoint[] = [];

    // deterministisch: Seed abhängig von Service + Metric + Zeitbucket
    const serviceSeed = this.hashString(serviceId);
    const metricSeed = this.hashString(metricKey);

    for (let t = from; t <= to; t += intervalSeconds * 1000) {
      const bucketSeed = this.baseSeed ^ serviceSeed ^ metricSeed ^ (t / (intervalSeconds * 1000)) | 0;
      const r = this.seededRandom(bucketSeed);

      const raw = generateForMetric(metricKey, r);
      const value = clampForMetric(metricKey, raw);

      points.push({
        timestampUtc: new Date(t).toISOString(),
        value: Number(value.toFixed(2))
      });
    }

    return points;
  }



  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  // deterministischer PRNG aus Seed (Mulberry32-ähnlich)
  private seededRandom(seed: number): number {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private hashString(s: string): number {
    // einfacher 32-bit hash (FNV-1a ähnlich)
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h | 0;
  }
}
