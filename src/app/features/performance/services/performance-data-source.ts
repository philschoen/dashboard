// performance-data-source.ts

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiMetricKey, ApiMetricSeries, ApiMetricSummary, ApiTopServices } from '../models/api-metric.model';
import { SystemMetricKey, SystemMetricSeries, SystemMetricSummary, SystemTopServices } from '../models/system-metric.model';
import { DbMetricKey, DbMetricSeries, DbMetricSummary, DbTopServices } from '../models/db-metric.model';
import { PerformanceMetricKey } from '../models/performance-metric.model';

// Mapped types to return a correctly typed DTO based on the provided key at compile time.
export type SeriesFor<K extends PerformanceMetricKey> =
  K extends ApiMetricKey ? ApiMetricSeries :
  K extends SystemMetricKey ? SystemMetricSeries :
  DbMetricSeries;

export type SummaryFor<K extends PerformanceMetricKey> =
  K extends ApiMetricKey ? ApiMetricSummary :
  K extends SystemMetricKey ? SystemMetricSummary :
  DbMetricSummary;

export type TopFor<K extends PerformanceMetricKey> =
  K extends ApiMetricKey ? ApiTopServices :
  K extends SystemMetricKey ? SystemTopServices :
  DbTopServices;

  export interface PerformanceServiceOption {
  id: string;
  name: string;
}

export interface PerformanceDataSource {

   getServices(): Observable<PerformanceServiceOption[]>;
  /**
   * Liefert KPI-Werte (z. B. für Cards). Kann API/System/DB gemischt enthalten,
   * je nachdem, wie die Page später filtert.
   *
   * Returns a generic MetricSummaryBase for mixed domains. If you need domain-specific
   * typing for summaries, prefer calling domain-aware helpers or use `SummaryFor<K>`.
   */
  getSummary(serviceId: string): Observable<import('../models/metric.model').MetricSummaryBase<PerformanceMetricKey>>;

  // Convenience helpers for domain-specific usage (keeps existing callers typing-safe)
  getApiSummary(serviceId: string): Observable<ApiMetricSummary>;
  getApiSeries<K extends ApiMetricKey>(serviceId: string, metricKey: K, fromUtc: string, toUtc: string, intervalSeconds: number): Observable<ApiMetricSeries>;
  getApiTopServices(metricKey: ApiMetricKey, windowMinutes: number): Observable<ApiTopServices>;

  getSystemSummary(serviceId: string): Observable<SystemMetricSummary>;
  getSystemSeries<K extends SystemMetricKey>(serviceId: string, metricKey: K, fromUtc: string, toUtc: string, intervalSeconds: number): Observable<SystemMetricSeries>;
  getSystemTopServices(metricKey: SystemMetricKey, windowMinutes: number): Observable<SystemTopServices>;

  getDbSummary(serviceId: string): Observable<DbMetricSummary>;
  getDbSeries<K extends DbMetricKey>(serviceId: string, metricKey: K, fromUtc: string, toUtc: string, intervalSeconds: number): Observable<DbMetricSeries>;
  getDbTopServices(metricKey: DbMetricKey, windowMinutes: number): Observable<DbTopServices>;
  /**
   * Zeitreihe für eine Metrik.
   * Rückgabe-Typ ist jetzt abhängig vom übergebenen Key (compile-time).
   */
  getSeries<K extends PerformanceMetricKey>(
    serviceId: string,
    metricKey: K,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ): Observable<SeriesFor<K>>;

  /**
   * Top-N Services für eine Metrik im Zeitfenster.
   * Rückgabe-Typ hängt vom Key-Bereich ab (compile-time).
   */
  getTopServices<K extends PerformanceMetricKey>(
    metricKey: K,
    windowMinutes: number
  ): Observable<TopFor<K>>;
}

export const PERFORMANCE_DATA_SOURCE =
  new InjectionToken<PerformanceDataSource>('PERFORMANCE_DATA_SOURCE');
