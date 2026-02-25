import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado de Clientes' },
    loadComponent: () =>
      import('./pages/clientes-list/clientes-list.component').then(
        (m) => m.ClientesListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nuevo Cliente' },
    loadComponent: () =>
      import('./pages/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar Cliente' },
    loadComponent: () =>
      import('./pages/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent,
      ),
  },
];