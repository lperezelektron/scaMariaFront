import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },

  {
    title: true,
    name: 'Operación',
  },
  {
    name: 'Punto de Venta',
    url: '/pos',
    iconComponent: { name: 'cil-cart' },
  },
  {
    name: 'Caja',
    url: '/settings/perifericos', // cámbialo luego a /cash si haces módulo caja
    iconComponent: { name: 'cil-dollar' },
  },

  {
    title: true,
    name: 'Catálogos',
  },
  {
    name: 'Catálogo',
    url: '/catalog',
    iconComponent: { name: 'cil-list' },
    children: [
      {
        name: 'Categorías',
        url: '/catalog/categorias',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Artículos',
        url: '/catalog/articulos',
        icon: 'nav-icon-bullet',
      },
    ],
  },

  {
    title: true,
    name: 'Inventario',
  },
  {
    name: 'Inventario',
    url: '/inventory',
    iconComponent: { name: 'cil-storage' },
    children: [
      {
        name: 'Existencias',
        url: '/inventory/existencia',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Precios',
        url: '/inventory/precios',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Ajustes',
        url: '/inventory/ajustes',
        icon: 'nav-icon-bullet',
      },
    ],
  },

  {
    title: true,
    name: 'Configuración',
  },
  {
    name: 'Configuración',
    url: '/settings',
    iconComponent: { name: 'cil-settings' },
    children: [
      {
        name: 'Almacenes',
        url: '/settings/almacenes',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Periféricos',
        url: '/settings/perifericos',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Impuestos',
        url: '/settings/impuestos',
        icon: 'nav-icon-bullet',
      },
    ],
  },

  {
    title: true,
    name: 'Sesión',
  },
  {
    name: 'Cerrar sesión',
    url: '/login', // luego lo haremos botón real que llame logout
    iconComponent: { name: 'cil-account-logout' },
  },
];