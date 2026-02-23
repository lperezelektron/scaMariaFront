import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: { title: 'Configuración' }, // 👈 padre
    children: [
      {
        path: 'almacenes',
        data: { title: 'Almacenes' },
        loadComponent: () =>
          import('./pages/almacenes/almacenes.component')
            .then(m => m.AlmacenesComponent)
      },
      {
        path: 'perifericos',
        data: { title: 'Periféricos' },
        loadComponent: () =>
          import('./pages/perifericos/perifericos.component')
            .then(m => m.PerifericosComponent)
      },
      {
        path: 'impuestos',
        data: { title: 'Impuestos' },
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