export type LogLevel = 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error' | 'Critical';

export interface LogEvent {
  id: string;
  timestampUtc: string; // ISO
  level: LogLevel;
  service: string;
  installationId: string;
  environment: string;
  message: string;
  exception?: { type?: string; message?: string; stack?: string };
  properties?: Record<string, unknown>;
}
