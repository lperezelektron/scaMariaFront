export interface Cliente {
  id: number;
  nombre: string;
  direccion?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  activo: boolean;
}

export interface VentaMini {
  id: number;
  fecha: string; // date
  total: number | string; // decimal:2
  credito?: boolean;
}

export interface CtaXCobrar {
  id: number;
  venta_id: number;
  cliente_id: number;

  fecha: string;       // date
  vencimiento: string; // date

  importe: number | string;
  saldo: number | string;

  venta?: VentaMini | null;
}

export interface ClienteShowResponse {
  cliente: Cliente;
  total_ventas: number;
  saldo_pendiente: number;
  ultima_venta: any; // si me pasas el shape de Venta lo tipamos
}

export interface ClienteEstadoCuentaResponse {
  cliente: Pick<Cliente, 'id' | 'nombre' | 'telefono'>;
  cuentas: CtaXCobrar[];
  saldo_pendiente: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}