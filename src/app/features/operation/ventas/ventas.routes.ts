import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('ventas.ver')],
    data: { title: 'Ventas' },
    loadComponent: () =>
      import('./pages/ventas-list/ventas-list.component').then(
        (m) => m.VentasListComponent,
      ),
  },
  {
    path: ':id/ver',
    canMatch: [permissionMatch('ventas.ver')],
    data: { title: 'Detalle de Venta' },
    loadComponent: () =>
      import('./pages/ventas-show/ventas-show.component').then(
        (m) => m.VentasShowComponent,
      ),
  },
];
