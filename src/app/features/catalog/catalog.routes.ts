import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categorias/categorias.component')
            .then(m => m.CategoriasComponent)
      },
      {
        path: 'articulos',
        loadComponent: () =>
          import('./pages/articulos/articulos.component')
            .then(m => m.ArticulosComponent)
      },
      {
        path: '',
        redirectTo: 'categorias',
        pathMatch: 'full'
      }
    ]
  }
];