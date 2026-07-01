export interface Proveedor {
  id: number;
  nombre: string;
  direccion?: string | null;
  ciudad?: string | null;
  rfc?: string | null;
  telefono?: string | null;
  dias_credito: number;
  activo: boolean;
}

export interface ProveedorShowResponse {
  proveedor: Proveedor;
  total_compras: number;
  saldo_pendiente: number;
}

// ===== Estado de cuenta (CxP) =====

export interface CompraMini {
  id: number;
}

export interface CtaXPagar {
  id: number;
  compra_id: number;
  proveedor_id: number;
  fecha: string;
  vencimiento: string;

  importe: number | string;
  saldo: number | string;

  compra?: CompraMini | null;
}

export interface ProveedorEstadoCuentaResponse {
  proveedor: Pick<Proveedor, 'id' | 'nombre' | 'rfc' | 'dias_credito'>;
  cuentas: CtaXPagar[];
  saldo_pendiente: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}