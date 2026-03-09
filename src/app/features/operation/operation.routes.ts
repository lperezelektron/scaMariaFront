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
      {
        path: 'ventas',
        data: { title: 'Ventas' },
        loadChildren: () =>
          import('./ventas/ventas.routes').then((m) => m.routes),
      },
      {
        path: 'cxc',
        data: { title: 'Cuentas por Cobrar' },
        loadChildren: () =>
          import('./cxc/cxc.routes').then((m) => m.routes),
      },
    ],
  },
];
