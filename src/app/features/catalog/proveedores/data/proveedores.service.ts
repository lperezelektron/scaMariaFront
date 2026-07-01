import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import {
  Proveedor,
  ProveedorShowResponse,
  ProveedorEstadoCuentaResponse,
  PaginatedResponse,
} from './proveedores.models';

export interface ProveedoresQuery {
  search?: string | null;
  activo?: boolean | null;
  per_page?: number | null;
  page?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: ProveedoresQuery = {}): Observable<PaginatedResponse<Proveedor> | Proveedor[]> {
    let params = new HttpParams();

    if (q.search) params = params.set('search', q.search);
    if (q.activo !== null && q.activo !== undefined) params = params.set('activo', String(q.activo));
    if (q.per_page) params = params.set('per_page', String(q.per_page));
    if (q.page) params = params.set('page', String(q.page));

    // ⚠️ Ajusta /api según tu environment (igual que artículos)
    return this.http.get<PaginatedResponse<Proveedor> | Proveedor[]>(
      `${this.base}/api/proveedores`,
      { params },
    );
  }

  get(id: number): Observable<ProveedorShowResponse> {
    return this.http.get<ProveedorShowResponse>(`${this.base}/api/proveedores/${id}`);
  }

  create(payload: Partial<Proveedor>): Observable<any> {
    return this.http.post(`${this.base}/api/proveedores`, payload);
  }

  update(id: number, payload: Partial<Proveedor>): Observable<any> {
    return this.http.put(`${this.base}/api/proveedores/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/proveedores/${id}`);
  }

  estadoCuenta(id: number): Observable<ProveedorEstadoCuentaResponse> {
    return this.http.get<ProveedorEstadoCuentaResponse>(`${this.base}/api/proveedores/${id}/estado-cuenta`);
  }
}