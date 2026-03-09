import { Routes } from '@angular/router';
import { permissionMatch } from '../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'caja',
        canMatch: [permissionMatch('caja.ver')],
        data: { title: 'Caja' },
        loadComponent: () =>
          import('./pages/caja/caja.component').then((m) => m.CajaComponent),
      },
{
        path: '',
        redirectTo: 'caja',
        pathMatch: 'full',
      },
    ],
  },
];
