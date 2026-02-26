export interface ProveedorMini {
  id: number;
  nombre: string;
  rfc?: string | null;
}

export interface UserMini {
  id: number;
  name?: string;
  nombre?: string;
  email?: string;
}

export interface ArticuloMini {
  id: number;
  nombre?: string;
  descripcion?: string;
}

export interface CompraDetalle {
  id?: number;
  lote?: string; // string generado en backend

  compra_id?: number;

  articulo_id: number;
  articulo?: ArticuloMini | null;

  variedad: string;
  cantidad: number | string;
  empaque?: number | string;

  costo: number | string;
  impuestos?: number | string;

  // solo en request (store)
  precio?: number | string;
  precio_min?: number | string;
}

export interface Compra {
  id: number;
  fecha: string; // date
  referencia: string;

  proveedor_id: number;
  proveedor?: ProveedorMini | null;

  user_id?: number;
  user?: UserMini | null;

  subtotal: number | string;
  impuestos: number | string;
  total: number | string;

  estatus?: string | null;
  detalles?: CompraDetalle[];
  cta_por_pagar?: any;
}

export interface CompraStorePayload {
  fecha: string;
  referencia?: string | null;

  proveedor_id: number;
  almacen_id: number;

  subtotal: number;
  impuestos?: number;
  total: number;

  credito: boolean;
  dias_credito?: number | null;
  f_pago_id?: number | null;

  detalles: Array<{
    articulo_id: number;
    variedad: string;
    cantidad: number;
    empaque?: number;
    costo: number;
    impuestos?: number;
    precio: number;
    precio_min: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}