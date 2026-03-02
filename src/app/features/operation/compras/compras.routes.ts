import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('ventas.ver')],
    data: { title: 'Listado de Compras' },
    loadComponent: () =>
      import('./pages/compras-list/compras-list.component').then(
        (m) => m.ComprasListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('ventas.crear')],
    data: { title: 'Nueva Compra' },
    loadComponent: () =>
      import('./pages/compra-form/compra-form.component').then(
        (m) => m.CompraFormComponent,
      ),
  },
  {
    path: ':id/ver',
    canMatch: [permissionMatch('ventas.ver')],
    data: { title: 'Detalle de Compra' },
    loadComponent: () =>
      import('./pages/compra-form/compra-form.component').then(
        (m) => m.CompraFormComponent,
      ),
  },
];