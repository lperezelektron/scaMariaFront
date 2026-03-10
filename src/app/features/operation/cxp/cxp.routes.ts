import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('compras.ver')],
    data: { title: 'Cuentas por Pagar' },
    loadComponent: () =>
      import('./pages/cxp-list/cxp-list.component').then((m) => m.CxpListComponent),
  },
  {
    path: ':id',
    canMatch: [permissionMatch('compras.ver')],
    data: { title: 'Detalle CxP' },
    loadComponent: () =>
      import('./pages/cxp-show/cxp-show.component').then((m) => m.CxpShowComponent),
  },
];
