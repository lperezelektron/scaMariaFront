import { Routes } from '@angular/router';
import { permissionMatch } from '../../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado de Almacenes' },
    loadComponent: () =>
      import('./pages/almacenes-list/almacenes-list.component')
        .then((m) => m.AlmacenesListComponent),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nuevo Almacén' },
    loadComponent: () =>
      import('./pages/almacen-form/almacen-form.component')
        .then((m) => m.AlmacenFormComponent),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar Almacén' },
    loadComponent: () =>
      import('./pages/almacen-form/almacen-form.component')
        .then((m) => m.AlmacenFormComponent),
  },
];