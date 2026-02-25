import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado de Categorias' },
    loadComponent: () =>
      import('./pages/categorias-list/categorias-list.component').then(
        (m) => m.CategoriasListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nueva Categoria' },
    loadComponent: () =>
      import('./pages/categorias-form/categorias-form.component').then(
        (m) => m.CategoriasFormComponent,
      ),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar Categoria' },
    loadComponent: () =>
      import('./pages/categorias-form/categorias-form.component').then(
        (m) => m.CategoriasFormComponent,
      ),
  },
];