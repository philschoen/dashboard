export enum JobStatus {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export type JobType = 'Import' | 'Export' | 'Report' | 'Notification';
export type QueueId = 'default' | 'high-priority' | 'reports' | 'emails';

export interface Job {
  id: string;
  name: string;
  type: JobType;
  queue: QueueId;
  createdAtUtc: string; // ISO string
  startedAtUtc?: string;
  finishedAtUtc?: string;
  status: JobStatus;
  attempts?: number;
  details?: Record<string, unknown>;
}

export interface JobDefinition {
  id: string;
  name: string;
  key: string;
  description?: string;
  targetType?: string;
  isDangerous?: boolean;
}

export interface JobSummary {
  total: number;
  pending: number;
  running: number;
  succeeded: number;
  failed: number;
  cancelled: number;
}
