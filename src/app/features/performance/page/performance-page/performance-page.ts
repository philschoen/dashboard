import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, of, Observable } from 'rxjs';
import { map, startWith, catchError, switchMap } from 'rxjs/operators';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PERFORMANCE_DATA_SOURCE, PerformanceDataSource } from '../../services/performance-data-source';

import { ApiMetricKey } from '../../models/api-metric.model';
import { SystemMetricKey } from '../../models/system-metric.model';
import { DbMetricKey } from '../../models/db-metric.model';

import { METRIC_REGISTRY, metricEntriesByPrefix } from '../../models/performance-metrics-registry';

import { MetricKpiCard } from '../../components/metric-kpi-card/metric-kpi-card';
import { TimeSeriesChart, LoadState } from '../../components/time-series-chart/time-series-chart';
import { TopServicesBarChart } from '../../components/top-services-bar-chart/top-services-bar-chart';
import { MetricSummaryItemBase } from '../../models/metric.model';

type RangeKey = '15m' | '1h' | '24h';
type TabKey = 'api' | 'system' | 'db';

type MetricKey = ApiMetricKey | SystemMetricKey | DbMetricKey;

type TabConfig<K extends MetricKey> = {
  key: TabKey;
  label: string;
  kpis: K[];
  line: { key: K; titleOverride?: string };
  top: { key: K; titleOverride?: string };
};

@Component({
  selector: 'app-performance-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonToggleModule,
    MetricKpiCard,
    TimeSeriesChart,
    TopServicesBarChart
  ],
  templateUrl: './performance-page.html',
  styleUrl: './performance-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformancePage {

  // Demo: fix (kann später Dropdown werden)
  readonly serviceId = 'svc-01';

  // State
  readonly range$ = new BehaviorSubject<RangeKey>('1h');
  readonly tab$ = new BehaviorSubject<TabKey>('api');

  // Tab-Konfiguration (hier erweiterst du später nur Arrays) - abgeleitet aus METRIC_REGISTRY
  readonly tabs: readonly TabConfig<MetricKey>[] = [
    {
      key: 'api',
      label: 'API',
      kpis: metricEntriesByPrefix('api.').map(e => e.key as ApiMetricKey) satisfies ApiMetricKey[],
      line: { key: 'api.response_time_p95' },
      top: { key: 'api.error_rate' }
    },
    {
      key: 'system',
      label: 'System',
      kpis: metricEntriesByPrefix('sys.').map(e => e.key as SystemMetricKey) satisfies SystemMetricKey[],
      line: { key: 'sys.cpu_usage' },
      top: { key: 'sys.network_latency' }
    },
    {
      key: 'db',
      label: 'Database',
      kpis: metricEntriesByPrefix('db.').map(e => e.key as DbMetricKey) satisfies DbMetricKey[],
      line: { key: 'db.query_time_avg' },
      top: { key: 'db.active_connections' }
    }
  ];

  // ViewModel: lädt nur das, was der aktive Tab braucht
  readonly vm$ = combineLatest([this.tab$, this.range$]).pipe(
    switchMap(([tab, range]) => {
      const cfg = this.getRangeConfig(range);
      const tabCfg = this.tabs.find(t => t.key === tab) ?? this.tabs[0];

      // domain-aware Calls (du hast sie im Interface)
      const summary$ = this.getDomainSummary(tab).pipe(
        map(s => this.toSummaryLoadState(s)),
        startWith({ kind: 'loading' as const }),
        catchError(() => of({ kind: 'error' as const }))
      );

      const series$ = this.getDomainSeries(tab, tabCfg.line.key, cfg.fromUtc, cfg.toUtc, cfg.intervalSeconds).pipe(
        map(s => this.toSeriesLoadState(s)),
        startWith({ kind: 'loading' as const }),
        catchError(() => of({ kind: 'error' as const }))
      );

      const top$ = this.getDomainTop(tab, tabCfg.top.key, cfg.windowMinutes).pipe(
        map(t => this.toTopLoadState(t)),
        startWith({ kind: 'loading' as const }),
        catchError(() => of({ kind: 'error' as const }))
      );

      return combineLatest([summary$, series$, top$]).pipe(
        map(([summaryState, lineState, topState]) => ({
          tab,
          tabCfg,
          summaryState,
          lineState: lineState as LoadState<Array<[number, number]>>,
          topState: topState as LoadState<{ categories: string[]; values: number[] }>
        }))
      );
    })
  );

  constructor(@Inject(PERFORMANCE_DATA_SOURCE) private readonly ds: PerformanceDataSource) {}

  // ---- Small mappers to keep vm$ readable and typed
  private toSeriesLoadState(series: import('../../models/metric.model').MetricSeriesBase<MetricKey>) : LoadState<Array<[number, number]>> {
    return { kind: 'ok', data: (series.points || []).map(p => [Date.parse(p.timestampUtc), p.value] as [number, number]) };
  }

  private toTopLoadState(top: import('../../models/metric.model').TopServicesBase<MetricKey>) : LoadState<{ categories: string[]; values: number[] }> {
    return { kind: 'ok', data: { categories: (top.items || []).map(i => i.serviceName), values: (top.items || []).map(i => i.value) } };
  }

  private toSummaryLoadState(summary: import('../../models/metric.model').MetricSummaryBase<MetricKey>): LoadState<import('../../models/metric.model').MetricSummaryBase<MetricKey>> {
    return { kind: 'ok', data: summary };
  }
  // UI events
  setRange(range: RangeKey) {
    this.range$.next(range);
  }

  setTabByIndex(index: number) {
    const tab = this.tabs[index]?.key ?? 'api';
    this.tab$.next(tab);

    queueMicrotask(() => window.dispatchEvent(new Event('resize')));
  }

  // Registry helpers
  metricTitle(key: MetricKey): string {
    return METRIC_REGISTRY[key]?.title ?? key;
  }

  metricUnitLabel(key: MetricKey): string {
    // unitHint falls du sowas nutzt, sonst unit
    return METRIC_REGISTRY[key]?.unitHint ?? METRIC_REGISTRY[key]?.unit ?? '';
  }

  // ------- Domain routing -------
  private getDomainSummary(tab: TabKey): Observable<import('../../models/metric.model').MetricSummaryBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiSummary(this.serviceId);
    if (tab === 'system') return this.ds.getSystemSummary(this.serviceId);
    return this.ds.getDbSummary(this.serviceId);
  }

  private getDomainSeries(tab: TabKey, key: MetricKey, fromUtc: string, toUtc: string, intervalSeconds: number): Observable<import('../../models/metric.model').MetricSeriesBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiSeries(this.serviceId, key as ApiMetricKey, fromUtc, toUtc, intervalSeconds);
    if (tab === 'system') return this.ds.getSystemSeries(this.serviceId, key as SystemMetricKey, fromUtc, toUtc, intervalSeconds);
    return this.ds.getDbSeries(this.serviceId, key as DbMetricKey, fromUtc, toUtc, intervalSeconds);
  }

  private getDomainTop(tab: TabKey, key: MetricKey, windowMinutes: number): Observable<import('../../models/metric.model').TopServicesBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiTopServices(key as ApiMetricKey, windowMinutes);
    if (tab === 'system') return this.ds.getSystemTopServices(key as SystemMetricKey, windowMinutes);
    return this.ds.getDbTopServices(key as DbMetricKey, windowMinutes);
  }

  // Range config
  private getRangeConfig(range: RangeKey) {
    const to = new Date();
    let from = new Date(to);
    let intervalSeconds = 60;
    let windowMinutes = 60;

    if (range === '15m') {
      from = new Date(to.getTime() - 15 * 60_000);
      intervalSeconds = 30;
      windowMinutes = 15;
    } else if (range === '24h') {
      from = new Date(to.getTime() - 24 * 60 * 60_000);
      intervalSeconds = 300;
      windowMinutes = 24 * 60;
    } else {
      from = new Date(to.getTime() - 60 * 60_000);
    }

    return {
      fromUtc: from.toISOString(),
      toUtc: to.toISOString(),
      intervalSeconds,
      windowMinutes
    };
  }

  // Template helper: find summary metric by key
  getMetric(metrics: MetricSummaryItemBase<MetricKey>[] | undefined, key: MetricKey): MetricSummaryItemBase<MetricKey> | undefined {
    return (metrics ?? []).find(m => m.metricKey === key);
  }
}
