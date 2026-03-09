export interface Categoria {
  id: number;
  descripcion: string;
  activo: boolean;
}

export interface Articulo {
  id: number;
  nombre: string;
  nombre_corto: string;
  unidad: string;
  categoria_id: number;
  categoria?: Categoria;
  activo: boolean;
  inventarios_sum_existencia?: number;
  imagen?: string | null;
  imagen_url?: string | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}