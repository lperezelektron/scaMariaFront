import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: { title: 'Inventario' }, // 👈 padre
    children: [
      {
        path: 'existencia',
        data: { title: 'Existencias' },
        loadComponent: () =>
          import('./pages/existencia/existencia.component')
            .then(m => m.ExistenciaComponent)
      },
      {
        path: 'precios',
        data: { title: 'Precios' },
        loadComponent: () =>
          import('./pages/precios/precios.component')
            .then(m => m.PreciosComponent)
      },
      {
        path: 'ajustes',
        data: { title: 'Ajustes' },
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