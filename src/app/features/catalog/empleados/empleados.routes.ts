import { Routes } from '@angular/router';
import { permissionMatch } from '../../../core/auth/permission.match';

export const routes: Routes = [
  {
    path: '',
    canMatch: [permissionMatch('catalogos.ver')],
    data: { title: 'Empleados' },
    loadComponent: () =>
      import('./pages/empleados-list/empleados-list.component').then((m) => m.EmpleadosListComponent),
  },
  {
    path: 'nuevo',
    canMatch: [permissionMatch('catalogos.crear')],
    data: { title: 'Nuevo empleado' },
    loadComponent: () =>
      import('./pages/empleado-form/empleado-form.component').then((m) => m.EmpleadoFormComponent),
  },
  {
    path: ':id/editar',
    canMatch: [permissionMatch('catalogos.editar')],
    data: { title: 'Editar empleado' },
    loadComponent: () =>
      import('./pages/empleado-form/empleado-form.component').then((m) => m.EmpleadoFormComponent),
  },
];
