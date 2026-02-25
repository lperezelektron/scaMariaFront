import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';
import { Almacen, AlmacenShowResponse, InventarioItem } from './almacenes.models';

export interface AlmacenesQuery {
  activo?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class AlmacenesService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q?: AlmacenesQuery): Observable<Almacen[]> {
    let params = new HttpParams();

    if (q?.activo !== null && q?.activo !== undefined) {
      params = params.set('activo', String(q.activo));
    }

    return this.http.get<Almacen[]>(`${this.base}/api/almacenes`, { params });
  }

  get(id: number): Observable<AlmacenShowResponse | any> {
    return this.http.get(`${this.base}/api/almacenes/${id}`);
  }

  create(payload: Partial<Almacen>): Observable<any> {
    return this.http.post(`${this.base}/api/almacenes`, payload);
  }

  update(id: number, payload: Partial<Almacen>): Observable<any> {
    return this.http.put(`${this.base}/api/almacenes/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/almacenes/${id}`);
  }

  inventario(id: number, soloConStock?: boolean): Observable<InventarioItem[]> {
    let params = new HttpParams();
    if (soloConStock) params = params.set('solo_con_stock', 'true');

    return this.http.get<InventarioItem[]>(
      `${this.base}/api/almacenes/${id}/inventario`,
      { params },
    );
  }
}
