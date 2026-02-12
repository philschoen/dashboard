import { Job, JobStatus, JobType, QueueId } from './job.model';

export interface JobsQuery {
  filter?: {
    queue?: QueueId;
    type?: JobType;
    status?: JobStatus[];
    query?: string;
    fromUtc?: string;
    toUtc?: string;
  };
  pageIndex: number;
  pageSize: number;
  sort?: { active: keyof Job | string; direction: 'asc' | 'desc' };
}
