import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Job, JobDefinition, JobSummary } from '../models/job.model';
import { JobsQuery } from '../models/job-query.model';
import { PagedResult } from '../../logs/models/paged.model';

export interface JobsDataSource {
  getJobs(query: JobsQuery): Observable<PagedResult<Job>>;
  getQueues(): Observable<string[]>;
  getJobDefinitions(): Observable<JobDefinition[]>;
  getSummary(): Observable<JobSummary>;
}

export const JOBS_DATA_SOURCE = new InjectionToken<JobsDataSource>('JOBS_DATA_SOURCE');
