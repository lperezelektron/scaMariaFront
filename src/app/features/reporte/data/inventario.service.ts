import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen, InventarioRow, Paginated } from './inventario.models';
import { environment } from '../../../../enviroments/environment';

export interface InventarioQuery {
  page: number;
  per_page: number;
  almacen_id?: number | null;
  articulo_id?: number | null;
  search?: string;
  stock_bajo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: InventarioQuery): Observable<Paginated<InventarioRow>> {
    let params = new HttpParams()
      .set('page', q.page)
      .set('per_page', q.per_page);

    if (q.almacen_id) params = params.set('almacen_id', q.almacen_id);
    if (q.articulo_id) params = params.set('articulo_id', q.articulo_id);
    if (q.search) params = params.set('search', q.search);
    if (q.stock_bajo) params = params.set('stock_bajo', '1');

    return this.http.get<Paginated<InventarioRow>>(`${this.base}/api/inventario`, { params });
  }

  almacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(`${this.base}/api/almacenes`);
  }
}
