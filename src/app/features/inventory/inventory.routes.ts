import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'existencia',
        loadComponent: () =>
          import('./pages/existencia/existencia.component')
            .then(m => m.ExistenciaComponent)
      },
      {
        path: 'precios',
        loadComponent: () =>
          import('./pages/precios/precios.component')
            .then(m => m.PreciosComponent)
      },
      {
        path: 'ajustes',
        loadComponent: () =>
          import('./pages/ajustes/ajustes.component')
            .then(m => m.AjustesComponent)
      },
      {
        path: '',
        redirectTo: 'existencia',
        pathMatch: 'full'
      }
    ]
  }
];