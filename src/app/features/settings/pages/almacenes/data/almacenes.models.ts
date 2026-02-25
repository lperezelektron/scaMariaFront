export interface Almacen {
  id: number;
  descripcion: string;
  direccion: string;
  ciudad?: string | null;
  telefono?: string | null;
  activo: boolean;
}

export interface AlmacenShowResponse {
  almacen: Almacen;
  valor_inventario: number;
}

export interface InventarioItem {
  id: number;
  articulo_id: number;
  existencia: number;
  costo: number;
  articulo?: {
    id: number;
    nombre: string;
    nombre_corto?: string;
    unidad?: string;
    categoria?: { id: number; descripcion: string; activo: boolean };
  };
}