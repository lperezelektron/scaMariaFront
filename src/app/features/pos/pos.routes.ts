import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/pos-shell/pos-shell.component')
            .then(m => m.PosShellComponent)
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./pages/checkout/checkout.component')
            .then(m => m.CheckoutComponent)
      }
    ]
  }
];