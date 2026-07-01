export interface Empleado {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface EmpleadoStoreResponse {
  message: string;
  empleado: Empleado;
}

export interface EmpleadoUpdateResponse {
  message: string;
  empleado: Empleado;
}
