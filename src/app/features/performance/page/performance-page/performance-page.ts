import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { combineLatest, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { PERFORMANCE_DATA_SOURCE } from '../../services/performance-data-source';
import { MetricSeriesBase, MetricSummaryBase, TopServicesBase, MetricSummaryItemBase } from '../../models/metric.model';

import { ApiMetricKey } from '../../models/api-metric.model';
import { SystemMetricKey } from '../../models/system-metric.model';
import { DbMetricKey } from '../../models/db-metric.model';

import { METRIC_REGISTRY, metricEntriesByPrefix } from '../../models/performance-metrics-registry';

import { MetricKpiCard } from '../../components/metric-kpi-card/metric-kpi-card';
import { TimeSeriesChart, LoadState } from '../../components/time-series-chart/time-series-chart';
import { TopServicesBarChart } from '../../components/top-services-bar-chart/top-services-bar-chart';

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

type ServiceOption = { id: string; name: string };

type ViewModelState = {
  tab: TabKey;
  tabCfg: TabConfig<MetricKey>;
  summaryState: LoadState<MetricSummaryItemBase<MetricKey>[]>;
  lineState: LoadState<Array<[number, number]>>;
  topState: LoadState<{ categories: string[]; values: number[] }>;
};

@Component({
  selector: 'app-performance-page',
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MetricKpiCard,
    TimeSeriesChart,
    TopServicesBarChart
  ],
  templateUrl: './performance-page.html',
  styleUrl: './performance-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformancePage {
  private readonly ds = inject(PERFORMANCE_DATA_SOURCE);

  readonly services: readonly ServiceOption[] = [
    { id: 'svc-01', name: 'Customer A – Core API' },
    { id: 'svc-02', name: 'Customer A – Auth API' },
    { id: 'svc-03', name: 'Customer B – Core API' },
    { id: 'svc-04', name: 'Customer C – Billing API' },
    { id: 'svc-05', name: 'Customer D – Reporting API' }
  ];

  readonly serviceId = signal<string>(this.services[0]?.id ?? 'svc-01');
  readonly range = signal<RangeKey>('1h');
  readonly tab = signal<TabKey>('api');

  setService(event: MatSelectChange): void {
    this.serviceId.set(event.value);
  }

  setRange(event: MatButtonToggleChange): void {
    this.range.set(event.value);
  }

  setTabByIndex(index: number): void {
    const tab = this.tabs[index]?.key ?? 'api';
    this.tab.set(tab);
    queueMicrotask(() => window.dispatchEvent(new Event('resize')));
  }

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

  private readonly currentConfig = computed(() => {
    const tab = this.tab();
    const range = this.range();
    const serviceId = this.serviceId();
    const tabCfg = this.tabs.find(t => t.key === tab) ?? this.tabs[0];
    const rangeCfg = this.getRangeConfig(range);

    return { tab, range, serviceId, tabCfg, rangeCfg };
  });

  private readonly metricsData = rxResource({
    params: () => this.currentConfig(),
    stream: ({ params: cfg }): Observable<ViewModelState> => {
      const summary$ = this.getDomainSummary(cfg.tab, cfg.serviceId).pipe(
        map(s => ({ kind: 'ok' as const, data: s.metrics })),
        catchError(() => of({ kind: 'error' as const, data: [] }))
      );

      const series$ = this.getDomainSeries(
        cfg.tab,
        cfg.serviceId,
        cfg.tabCfg.line.key,
        cfg.rangeCfg.fromUtc,
        cfg.rangeCfg.toUtc,
        cfg.rangeCfg.intervalSeconds
      ).pipe(
        map(s => this.toSeriesLoadState(s)),
        catchError(() => of({ kind: 'error' as const, data: [] }))
      );

      const top$ = this.getDomainTop(cfg.tab, cfg.tabCfg.top.key, cfg.rangeCfg.windowMinutes).pipe(
        map(t => this.toTopLoadState(t)),
        catchError(() => of({ kind: 'error' as const }))
      );

      return combineLatest([summary$, series$, top$]).pipe(
        map(([summaryState, lineState, topState]) => ({
          tab: cfg.tab,
          tabCfg: cfg.tabCfg,
          summaryState,
          lineState: lineState as LoadState<Array<[number, number]>>,
          topState: topState as LoadState<{ categories: string[]; values: number[] }>
        }))
      );
    }
  });

  readonly vm = computed((): ViewModelState => {
    const data = this.metricsData.value();
    const cfg = this.currentConfig();

    if (!data) {
      return {
        tab: cfg.tab,
        tabCfg: cfg.tabCfg,
        summaryState: { kind: 'loading' as const },
        lineState: { kind: 'loading' as const },
        topState: { kind: 'loading' as const }
      };
    }

    return data;
  });

  private toSeriesLoadState(series: MetricSeriesBase<MetricKey>): LoadState<Array<[number, number]>> {
    return {
      kind: 'ok',
      data: (series.points || []).map(p => [Date.parse(p.timestampUtc), p.value] as [number, number])
    };
  }

  private toTopLoadState(top: TopServicesBase<MetricKey>): LoadState<{ categories: string[]; values: number[] }> {
    return {
      kind: 'ok',
      data: {
        categories: (top.items || []).map(i => i.serviceName),
        values: (top.items || []).map(i => i.value)
      }
    };
  }

  metricTitle(key: MetricKey): string {
    return METRIC_REGISTRY[key]?.title ?? key;
  }

  metricUnitLabel(key: MetricKey): string {
    return METRIC_REGISTRY[key]?.unitHint ?? METRIC_REGISTRY[key]?.unit ?? '';
  }

  private getDomainSummary(tab: TabKey, serviceId: string): Observable<MetricSummaryBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiSummary(serviceId);
    if (tab === 'system') return this.ds.getSystemSummary(serviceId);
    return this.ds.getDbSummary(serviceId);
  }

  private getDomainSeries(
    tab: TabKey,
    serviceId: string,
    key: MetricKey,
    fromUtc: string,
    toUtc: string,
    intervalSeconds: number
  ): Observable<MetricSeriesBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiSeries(serviceId, key as ApiMetricKey, fromUtc, toUtc, intervalSeconds);
    if (tab === 'system') return this.ds.getSystemSeries(serviceId, key as SystemMetricKey, fromUtc, toUtc, intervalSeconds);
    return this.ds.getDbSeries(serviceId, key as DbMetricKey, fromUtc, toUtc, intervalSeconds);
  }

  private getDomainTop(tab: TabKey, key: MetricKey, windowMinutes: number): Observable<TopServicesBase<MetricKey>> {
    if (tab === 'api') return this.ds.getApiTopServices(key as ApiMetricKey, windowMinutes);
    if (tab === 'system') return this.ds.getSystemTopServices(key as SystemMetricKey, windowMinutes);
    return this.ds.getDbTopServices(key as DbMetricKey, windowMinutes);
  }

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

    return { fromUtc: from.toISOString(), toUtc: to.toISOString(), intervalSeconds, windowMinutes };
  }

  getMetric(metrics: MetricSummaryItemBase<MetricKey>[] | undefined, key: MetricKey): MetricSummaryItemBase<MetricKey> | undefined {
    return (metrics ?? []).find(m => m.metricKey === key);
  }
}
