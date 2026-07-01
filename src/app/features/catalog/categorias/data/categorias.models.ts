export interface Categoria {
  id: number;
  descripcion: string;
  activo: boolean;

  // viene de withCount('articulos')
  articulos_count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}