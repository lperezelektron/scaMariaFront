import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado' },
    loadComponent: () =>
      import('./pages/articulos-list/articulos-list.component').then(
        (m) => m.ArticulosListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nuevo' },
    loadComponent: () =>
      import('./pages/articulo-form/articulo-form.component').then(
        (m) => m.ArticuloFormComponent,
      ),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar' },
    loadComponent: () =>
      import('./pages/articulo-form/articulo-form.component').then(
        (m) => m.ArticuloFormComponent,
      ),
  },
];