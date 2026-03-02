import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'compras',
        data: { title: 'Compras' },
        loadChildren: () =>
          import('./compras/compras.routes').then((m) => m.routes),
      },
    ],
  },
];
