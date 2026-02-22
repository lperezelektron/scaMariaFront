import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { PosLayoutComponent } from './layout/pos-layout/pos-layout.component';
import { AuthGuard } from './core/auth/auth.guard';
import { GuestGuard } from './core/auth/guest.guard';
import { permissionMatch } from './core/auth/permission.match';

export const routes: Routes = [
  // Login (fuera del layout)
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./views/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    data: { title: 'Login' },
  },

  // Logout (ruta para item del menú)
  {
    path: 'logout',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./views/pages/logout/logout.component').then(
        (m) => m.LogoutComponent,
      ),
    data: { title: 'Cerrar sesión' },
  },

  // Admin (CoreUI Default Layout)
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: { title: 'Inicio' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
      },

      // Módulos reales (lazy) - protegidos por permisos
      {
        path: 'catalog',
        canMatch: [permissionMatch('catalogos.ver')],
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.routes),
      },
      {
        path: 'inventory',
        canMatch: [permissionMatch('inventario.ver')],
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.routes),
      },
      {
        path: 'settings',
        // temporal: cuando tengas settings.*, lo ajustamos a esos permisos
        canMatch: [permissionMatch('catalogos.ver')],
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.routes),
      },
    ],
  },

  // POS (layout propio) - protegido por permisos
  {
    path: 'pos',
    component: PosLayoutComponent,
    canActivate: [AuthGuard],
    canMatch: [permissionMatch(['ventas.ver', 'ventas.crear'])],
    loadChildren: () =>
      import('./features/pos/pos.routes').then((m) => m.routes),
    data: { title: 'POS' },
  },

  // Errores
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then(
        (m) => m.Page404Component,
      ),
    data: { title: 'Page 404' },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then(
        (m) => m.Page500Component,
      ),
    data: { title: 'Page 500' },
  },

  // 403 No autorizado
  {
    path: '403',
    loadComponent: () =>
      import('./views/pages/page403/page403.component').then(
        (m) => m.Page403Component,
      ),
    data: { title: 'No autorizado' },
  },

  { path: '**', redirectTo: '404' },
];
