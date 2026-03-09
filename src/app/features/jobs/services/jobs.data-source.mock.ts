import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { JobsDataSource } from './jobs-data-source';
import { Job, JobStatus, JobType, QueueId, JobDefinition, JobSummary } from '../models/job.model';
import { JobsQuery } from '../models/job-query.model';
import { PagedResult } from '../../logs/models/paged.model';

@Injectable()
export class MockJobsDataSource implements JobsDataSource {
  private readonly queues: QueueId[] = ['default', 'high-priority', 'reports', 'emails'];
  private readonly types: JobType[] = ['Import', 'Export', 'Report', 'Notification'];
  private readonly allJobs: Job[] = this.generateMockJobs(200);

  getQueues(): Observable<string[]> {
    return of(this.queues).pipe(delay(30));
  }

  getJobDefinitions(): Observable<JobDefinition[]> {
    const typeToTarget: Record<string, string> = {
      Import: 'File',
      Export: 'File',
      Report: 'Report',
      Notification: 'Email',
    };

    const defs: JobDefinition[] = Array.from(new Set(this.allJobs.map(j => j.type))).map((t) => ({
      id: t,
      name: t + ' Jobs',
      key: t,
      targetType: typeToTarget[t] ?? 'Instance',
      description: `${t} jobs targeting ${typeToTarget[t] ?? 'instances'}`,
    }));

    return of(defs).pipe(delay(30));
  }

  getSummary(): Observable<JobSummary> {
    const initial: JobSummary = { total: 0, pending: 0, running: 0, succeeded: 0, failed: 0, cancelled: 0 };
    const summary = this.allJobs.reduce((acc, j) => {
      acc.total++;
      switch (j.status) {
        case JobStatus.Pending:
          acc.pending++;
          break;
        case JobStatus.Running:
          acc.running++;
          break;
        case JobStatus.Succeeded:
          acc.succeeded++;
          break;
        case JobStatus.Failed:
          acc.failed++;
          break;
        case JobStatus.Cancelled:
          acc.cancelled++;
          break;
      }
      return acc;
    }, initial);

    return of(summary).pipe(delay(30));
  }

  getJobs(query: JobsQuery): Observable<PagedResult<Job>> {
    let filtered = [...this.allJobs];

    const f = query.filter;
    if (f) {
      if (f.queue) filtered = filtered.filter(j => j.queue === f.queue);
      if (f.type) filtered = filtered.filter(j => j.type === f.type);
      if (f.status?.length) filtered = filtered.filter(j => f.status!.includes(j.status));
      if (f.query) {
        const q = f.query.toLowerCase();
        filtered = filtered.filter(j => j.name.toLowerCase().includes(q) || (j.details && JSON.stringify(j.details).toLowerCase().includes(q)));
      }
      if (f.fromUtc) {
        const from = Date.parse(f.fromUtc);
        filtered = filtered.filter(j => Date.parse(j.createdAtUtc) >= from);
      }
      if (f.toUtc) {
        const to = Date.parse(f.toUtc);
        filtered = filtered.filter(j => Date.parse(j.createdAtUtc) <= to);
      }
    }

    // sort
    if (query.sort) {
      const dir = query.sort.direction === 'asc' ? 1 : -1;
      const active = query.sort.active as keyof Job;
      filtered.sort((a, b) => {
        const av = (a as any)[active];
        const bv = (b as any)[active];
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        if (typeof av === 'string') return av.localeCompare(bv) * dir;
        return (av as number) - (bv as number) * dir;
      });
    }

    const total = filtered.length;
    const start = query.pageIndex * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return of({ items, total }).pipe(delay(60));
  }

  private generateMockJobs(count: number): Job[] {
    const now = Date.now();
    const jobs: Job[] = [];

    for (let i = 0; i < count; i++) {
      const queue = this.queues[Math.floor(Math.random() * this.queues.length)];
      const type = this.types[Math.floor(Math.random() * this.types.length)];
      const statusPool: JobStatus[] = [JobStatus.Pending, JobStatus.Running, JobStatus.Succeeded, JobStatus.Failed, JobStatus.Cancelled];
      const status = statusPool[Math.floor(Math.random() * statusPool.length)];

      const createdAgo = Math.floor(Math.random() * 24 * 60); // minutes
      const created = new Date(now - createdAgo * 60_000 - Math.floor(Math.random() * 60_000));

      let started: Date | undefined;
      let finished: Date | undefined;

      if (status !== 'Pending') started = new Date(created.getTime() + Math.floor(Math.random() * 10_000));
      if (status === 'Succeeded' || status === 'Failed' || status === 'Cancelled') finished = new Date((started ?? created).getTime() + Math.floor(Math.random() * 120_000));

      jobs.push({
        id: crypto.randomUUID(),
        name: `${type} Job #${Math.floor(Math.random() * 10_000)}`,
        type,
        queue,
        createdAtUtc: created.toISOString(),
        startedAtUtc: started?.toISOString(),
        finishedAtUtc: finished?.toISOString(),
        status,
        attempts: Math.floor(Math.random() * 5) + 1,
        details: { payloadSize: Math.floor(Math.random() * 1000) },
      });
    }

    return jobs;
  }
}
