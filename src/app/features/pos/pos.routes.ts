import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ventas/nueva',
      },
      {
        path: 'ventas/nueva',
        loadComponent: () =>
          import('./ventas/pages/pos-venta/pos-venta.component').then((m) => m.PosVentaComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
    ],
  },
];