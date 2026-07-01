import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('cxc.ver')],
    data: { title: 'Cuentas por Cobrar' },
    loadComponent: () =>
      import('./pages/cxc-list/cxc-list.component').then((m) => m.CxcListComponent),
  },
  {
    path: ':id',
    canMatch: [permissionMatch('ventas.ver')],
    data: { title: 'Detalle CxC' },
    loadComponent: () =>
      import('./pages/cxc-show/cxc-show.component').then((m) => m.CxcShowComponent),
  },
];
