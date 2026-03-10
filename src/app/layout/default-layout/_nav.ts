import { INavData } from '@coreui/angular';

export interface INavDataPerm extends INavData {
  permissions?: string[];
  children?: INavDataPerm[];
}

export const navItems: INavDataPerm[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },

  { title: true, name: 'Operación' },

  {
    name: 'Punto de Venta',
    url: '/pos',
    iconComponent: { name: 'cil-cart' },
    permissions: ['ventas.ver', 'ventas.crear'],
  },
  {
    name: 'Caja',
    url: '/reporte/caja',
    iconComponent: { name: 'cil-dollar' },
    permissions: ['caja.ver', 'caja.movimiento', 'caja.corte'],
  },
  {
    name: 'Ventas',
    url: '/operation/ventas',
    icon: 'nav-icon-bullet',
    permissions: ['ventas.ver'],
  },
  {
    name: 'CxC',
    url: '/operation/cxc',
    icon: 'nav-icon-bullet',
    permissions: ['ventas.ver'],
  },
  {
    name: 'CxP',
    url: '/operation/cxp',
    icon: 'nav-icon-bullet',
    permissions: ['compras.ver'],
  },
  {
    name: 'Compras',
    url: '/operation/compras',
    icon: 'nav-icon-bullet',
    permissions: ['ventas.ver'],
  },

  { title: true, name: 'Catálogos' },
  {
    name: 'Catálogo',
    url: '/catalog',
    iconComponent: { name: 'cil-list' },
    permissions: ['catalogos.ver'],
    children: [
      {
        name: 'Categorías',
        url: '/catalog/categorias',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Artículos',
        url: '/catalog/articulos',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Clientes',
        url: '/catalog/clientes',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Proveedores',
        url: '/catalog/proveedores',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Formas de pago',
        url: '/catalog/formas-pago',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
    ],
  },

  { title: true, name: 'Inventario' },
  {
    name: 'Inventario',
    url: '/inventory',
    iconComponent: { name: 'cil-storage' },
    permissions: ['inventario.ver'],
    children: [
      {
        name: 'Existencias',
        url: '/inventory/existencia',
        icon: 'nav-icon-bullet',
        permissions: ['inventario.ver'],
      },
      {
        name: 'Precios',
        url: '/inventory/precios',
        icon: 'nav-icon-bullet',
        permissions: ['inventario.ver'],
      },
      {
        name: 'Ajustes',
        url: '/inventory/ajustes',
        icon: 'nav-icon-bullet',
        permissions: ['inventario.ajustar'],
      },
    ],
  },

  { title: true, name: 'Configuración' },
  {
    name: 'Configuración',
    url: '/settings',
    iconComponent: { name: 'cil-settings' },
    permissions: ['catalogos.ver'], // temporal hasta tener settings.*
    children: [
      {
        name: 'Almacenes',
        url: '/settings/almacenes',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Periféricos',
        url: '/settings/perifericos',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
      {
        name: 'Impuestos',
        url: '/settings/impuestos',
        icon: 'nav-icon-bullet',
        permissions: ['catalogos.ver'],
      },
    ],
  },

  { title: true, name: 'Sesión' },
  {
    name: 'Cerrar sesión',
    url: '/logout',
    iconComponent: { name: 'cil-account-logout' },
  },
];
