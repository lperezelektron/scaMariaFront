import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado' },
    loadComponent: () =>
      import('./pages/compras-list/compras-list.component').then(
        (m) => m.ComprasListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nueva' },
    loadComponent: () =>
      import('./pages/compra-form/compra-form.component').then(
        (m) => m.CompraFormComponent,
      ),
  },
  {
    path: ':id/ver',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Detalle' },
    loadComponent: () =>
      import('./pages/compra-form/compra-form.component').then(
        (m) => m.CompraFormComponent,
      ),
  },
];