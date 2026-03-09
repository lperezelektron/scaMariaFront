export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface VentaListItem {
  id: number;
  fecha: string;
  cliente_id: number;
  almacen_id: number;
  f_pago_id: number;
  subtotal: number;
  impuestos?: number | null;
  total: number;
  credito?: boolean | null;
  estatus?: string | null;

  cliente?: { id: number; nombre: string } | null;
  almacen?: { id: number; descripcion: string } | null;
  forma_pago?: { id: number; descripcion: string } | null;
  user?: { id: number; name: string } | null;
}

export interface VentaDetalle {
  id: number;
  venta_id?: number;
  articulo_id: number;
  cantidad: number;
  precio: number;
  impuestos?: number | null;
  subtotal?: number | null;

  articulo?: { id: number; nombre: string; unidad?: string | null } | null;
}

export interface VentaShow extends VentaListItem {
  dias_credito?: number | null;
  detalles?: VentaDetalle[];
}

export interface VentasQuery {
  fecha?: string | null;
  almacen_id?: number | null;
  per_page?: number | null;
  page?: number | null;
}
