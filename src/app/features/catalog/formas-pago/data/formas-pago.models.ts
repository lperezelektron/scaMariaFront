export interface FormaPago {
  id: number;
  descripcion: string;
  activo: boolean;
}

export interface FormaPagoStoreResponse {
  message: string;
  forma_pago: FormaPago;
}

export interface FormaPagoUpdateResponse {
  message: string;
  forma_pago: FormaPago;
}