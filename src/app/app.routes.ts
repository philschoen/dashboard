import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';
import { LOGS_DATA_SOURCE } from './features/logs/services/logs-data-source';
import { MockLogsDataSource } from './features/logs/services/logs.data-source.mock';
import { PERFORMANCE_DATA_SOURCE } from './features/performance/services/performance-data-source';
import { MockPerformanceDataSource } from './features/performance/services/performance.data-source.mock';
import { JOBS_DATA_SOURCE } from './features/jobs/services/jobs-data-source';
import { MockJobsDataSource } from './features/jobs/services/jobs.data-source.mock';

export const routes: Routes = [
    {
        path: '',
        component: ShellComponent,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'logs' },
            {
                path: 'logs',
                loadComponent: () =>
                    import('./features/logs/page/logs-page/logs-page').then(m => m.LogsPage),
                providers: [
                    { provide: LOGS_DATA_SOURCE, useClass: MockLogsDataSource }
                ]
            },
            {
                path: 'performance',
                loadComponent: () =>
                    import('./features/performance/page/performance-page/performance-page').then(m => m.PerformancePage),
                providers: [
                    { provide: PERFORMANCE_DATA_SOURCE, useClass: MockPerformanceDataSource }
                ]
            }
            ,
            {
                path: 'jobs',
                loadComponent: () => import('./features/jobs/page/jobs-page/jobs-page').then(m => m.JobsPage),
                providers: [
                    { provide: JOBS_DATA_SOURCE, useClass: MockJobsDataSource }
                ]
            }
        ],
    },
    { path: '**', redirectTo: '' },
];