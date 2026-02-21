import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'almacenes',
        loadComponent: () =>
          import('./pages/almacenes/almacenes.component')
            .then(m => m.AlmacenesComponent)
      },
      {
        path: 'perifericos',
        loadComponent: () =>
          import('./pages/perifericos/perifericos.component')
            .then(m => m.PerifericosComponent)
      },
      {
        path: 'impuestos',
        loadComponent: () =>
          import('./pages/impuestos/impuestos.component')
            .then(m => m.ImpuestosComponent)
      },
      {
        path: '',
        redirectTo: 'almacenes',
        pathMatch: 'full'
      }
    ]
  }
];