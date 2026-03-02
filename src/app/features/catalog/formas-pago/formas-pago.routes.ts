import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Formas de pago' },
    loadComponent: () =>
      import('./pages/formas-pago-list/formas-pago-list.component').then((m) => m.FormasPagoListComponent),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nueva forma de pago' },
    loadComponent: () =>
      import('./pages/forma-pago-form/forma-pago-form.component').then((m) => m.FormaPagoFormComponent),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar forma de pago' },
    loadComponent: () =>
      import('./pages/forma-pago-form/forma-pago-form.component').then((m) => m.FormaPagoFormComponent),
  },
];