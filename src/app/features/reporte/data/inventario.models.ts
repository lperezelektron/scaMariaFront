export interface Almacen {
  id: number;
  nombre: string;
}

export interface ArticuloResumen {
  id: number;
  nombre: string;
  nombre_corto: string;
  unidad: string;
}

export interface InventarioRow {
  id: number;
  almacen_id: number;
  articulo_id: number;
  variedad: string | null;
  existencia: number;
  precio: number;
  precio_min: number;
  costo: number;
  empaque: number;
  almacen?: Almacen;
  articulo?: ArticuloResumen;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
