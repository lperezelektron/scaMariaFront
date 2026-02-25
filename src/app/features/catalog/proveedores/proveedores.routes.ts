import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Listado de Proveedores' },
    loadComponent: () =>
      import('./pages/proveedores-list/proveedores-list.component').then(
        (m) => m.ProveedoresListComponent,
      ),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nuevo Proveedor' },
    loadComponent: () =>
      import('./pages/proveedor-form/proveedor-form.component').then(
        (m) => m.ProveedorFormComponent,
      ),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar Proveedor' },
    loadComponent: () =>
      import('./pages/proveedor-form/proveedor-form.component').then(
        (m) => m.ProveedorFormComponent,
      ),
  },
];