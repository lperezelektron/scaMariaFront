import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'categorias',
        data: { title: 'Categorías' },
        loadComponent: () =>
          import('./pages/categorias/categorias.component').then(
            (m) => m.CategoriasComponent,
          ),
      },
      {
        path: 'articulos',
        data: { title: 'Artículos' },
        loadChildren: () =>
          import('./articulos/articulos.routes').then((m) => m.routes),
      },
      {
        path: '',
        redirectTo: 'categorias',
        pathMatch: 'full',
      },
    ],
  },
];