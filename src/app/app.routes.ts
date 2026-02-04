import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';
import { LOGS_DATA_SOURCE } from './features/logs/services/logs-data-source';
import { MockLogsDataSource } from './features/logs/services/logs.data-source.mock';

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
        ],
    },
    { path: '**', redirectTo: '' },
];