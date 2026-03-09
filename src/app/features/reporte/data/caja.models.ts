export interface MovimientoCaja {
  id: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  referencia: string;
  fecha: string;
  user_id: number;
  corte_caja_id: number | null;
  user?: { id: number; name: string };
}

export interface CajaIndexResponse {
  movimientos: MovimientoCaja[];
  saldo_actual: number;
  totales: {
    entradas: number;
    salidas: number;
  };
}

export interface CorteCaja {
  id: number;
  fecha: string;
  importe: number;
  user_id: number;
  user?: { id: number; name: string };
  movimientos?: MovimientoCaja[];
}
