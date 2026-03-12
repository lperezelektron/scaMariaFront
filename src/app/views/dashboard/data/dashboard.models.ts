export interface DashboardData {
  ventas_hoy: number;
  ventas_mes: number;
  compras_mes: number;
  tickets_hoy: number;
  cxc_pendiente: number;
  cxc_vencida: number;
  cxp_pendiente: number;
  cxp_vencida: number;
  saldo_caja: number;
  saldo_caja_hoy: number;
}

export interface VentasPeriodo {
  periodo: string;
  tickets: number;
  subtotal: number;
  impuestos: number;
  total: number;
}

export interface VentasReporte {
  ventas: VentasPeriodo[];
  totales: {
    tickets: number;
    subtotal: number;
    impuestos: number;
    total: number;
  };
}

export interface TopArticulo {
  id: number;
  nombre: string;
  unidad: string;
  variedad: string;
  total_cantidad: number;
  total_empaques: number;
  total_importe: number;
  utilidad: number;
}

export interface InventarioValorizado {
  nombre: string;
  unidad: string;
  categoria: string;
  almacen: string;
  variedad: string;
  existencia: number;
  empaque: number;
  costo: number;
  precio: number;
  valor_costo: number;
  valor_precio: number;
}

export interface InventarioReporte {
  inventario: InventarioValorizado[];
  total_costo: number;
  total_precio: number;
  total_lineas: number;
}

export interface UtilidadReporte {
  fecha_inicio: string;
  fecha_fin: string;
  total_ventas: number;
  total_costo: number;
  utilidad_bruta: number;
  margen_pct: number;
}
