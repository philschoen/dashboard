export type LogLevel = 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error' | 'Critical';

export type TimePreset = '15m' | '1h' | '24h' | 'custom';

export interface LogsFilter {
  preset: TimePreset;
  fromUtc?: string; // ISO string
  toUtc?: string;   // ISO string
  levels: LogLevel[];
  service?: string;
  installationId?: string;
  query?: string;
}
