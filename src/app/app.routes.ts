import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'logs' },

      // Platzhalter: Logs kommt in Schritt 3 rein
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/logs/logs-page/logs-page').then(
            (m) => m.LogsPage
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];