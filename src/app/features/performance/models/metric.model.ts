// metric.model.ts

export type MetricStatus = 'ok' | 'warn' | 'critical';

/**
 * Einheit der Metrik (für Anzeige & Formatierung).
 * Erweiterbar, ohne bestehende Modelle anzufassen.
 */
export type MetricUnit =
  | 'ms'
  | 'rps'
  | '%'
  | 'count'
  | 'mb'
  | 'mb_s';

/**
 * Basis für Metric Keys.
 * Die konkreten Keys werden in den jeweiligen Model-Dateien als Union Types definiert.
 */
export type MetricKey = string;

/**
 * Ein Punkt in einer Zeitreihe (UTC ISO String).
 */
export interface MetricPoint {
  timestampUtc: string;
  value: number;
}

/**
 * Basisinterface für eine Zeitreihe.
 * Wird von API/System/DB Series-Interfaces erweitert und typisiert.
 */
export interface MetricSeriesBase<K extends MetricKey = MetricKey> {
  serviceId: string;
  metricKey: K;
  unit: MetricUnit;
  intervalSeconds: number;
  fromUtc: string;
  toUtc: string;
  points: MetricPoint[];
}

/**
 * Ein einzelner KPI/Status-Eintrag.
 */
export interface MetricSummaryItemBase<K extends MetricKey = MetricKey> {
  metricKey: K;
  unit: MetricUnit;
  value: number;
  status: MetricStatus;
}

/**
 * KPI/Summary Antwort für eine Service-Instanz.
 */
export interface MetricSummaryBase<K extends MetricKey = MetricKey> {
  serviceId: string;
  timestampUtc: string;
  metrics: Array<MetricSummaryItemBase<K>>;
}

/**
 * Item für Top-N Darstellung.
 */
export interface TopServiceItemBase {
  serviceId: string;
  serviceName: string;
  value: number;
  unit: MetricUnit;
}

/**
 * Top-N Ergebnis für eine bestimmte Metrik im Zeitfenster.
 */
export interface TopServicesBase<K extends MetricKey = MetricKey> {
  metricKey: K;
  windowMinutes: number;
  items: TopServiceItemBase[];
}
