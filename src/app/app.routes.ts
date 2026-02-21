import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { PosLayoutComponent } from './layout/pos-layout/pos-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Login (fuera del layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./views/pages/login/login.component').then((m) => m.LoginComponent),
    data: { title: 'Login' },
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
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes),
      },

      // Módulos reales (lazy)
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.routes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.routes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.routes),
      },
    ],
  },

  // POS (layout propio)
  {
    path: 'pos',
    component: PosLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/pos/pos.routes').then((m) => m.routes),
    data: { title: 'POS' },
  },

  // Errores
  {
    path: '404',
    loadComponent: () =>
      import('./views/pages/page404/page404.component').then((m) => m.Page404Component),
    data: { title: 'Page 404' },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./views/pages/page500/page500.component').then((m) => m.Page500Component),
    data: { title: 'Page 500' },
  },

  { path: '**', redirectTo: '404' },
];