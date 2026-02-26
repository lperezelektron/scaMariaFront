import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { Compra, CompraStorePayload, PaginatedResponse } from './compras.models';

export interface ComprasQuery {
  proveedor_id?: number | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  mes?: number | null;
  anio?: number | null;
  per_page?: number | null;
  page?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: ComprasQuery = {}): Observable<PaginatedResponse<Compra> | Compra[]> {
    let params = new HttpParams();

    if (q.proveedor_id) params = params.set('proveedor_id', String(q.proveedor_id));
    if (q.fecha_inicio) params = params.set('fecha_inicio', q.fecha_inicio);
    if (q.fecha_fin) params = params.set('fecha_fin', q.fecha_fin);
    if (q.mes) params = params.set('mes', String(q.mes));
    if (q.anio) params = params.set('anio', String(q.anio));
    if (q.per_page) params = params.set('per_page', String(q.per_page));
    if (q.page) params = params.set('page', String(q.page));

    return this.http.get<PaginatedResponse<Compra> | Compra[]>(
      `${this.base}/api/compras`,
      { params },
    );
  }

  get(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.base}/api/compras/${id}`);
  }

  create(payload: CompraStorePayload): Observable<any> {
    return this.http.post(`${this.base}/api/compras`, payload);
  }

  cancelar(id: number): Observable<any> {
    return this.http.post(`${this.base}/api/compras/${id}/cancelar`, {});
  }
}