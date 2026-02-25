import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import {
  Cliente,
  ClienteShowResponse,
  ClienteEstadoCuentaResponse,
  PaginatedResponse,
} from './clientes.models';

export interface ClientesQuery {
  search?: string | null;
  activo?: boolean | null;
  con_saldo?: boolean | null;
  per_page?: number | null;
  page?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: ClientesQuery = {}): Observable<PaginatedResponse<Cliente> | Cliente[]> {
    let params = new HttpParams();

    if (q.search) params = params.set('search', q.search);
    if (q.activo !== null && q.activo !== undefined) params = params.set('activo', String(q.activo));
    if (q.con_saldo) params = params.set('con_saldo', 'true');
    if (q.per_page) params = params.set('per_page', String(q.per_page));
    if (q.page) params = params.set('page', String(q.page));

    return this.http.get<PaginatedResponse<Cliente> | Cliente[]>(
      `${this.base}/api/clientes`,
      { params },
    );
  }

  get(id: number): Observable<ClienteShowResponse> {
    return this.http.get<ClienteShowResponse>(`${this.base}/api/clientes/${id}`);
  }

  create(payload: Partial<Cliente>): Observable<any> {
    return this.http.post(`${this.base}/api/clientes`, payload);
  }

  update(id: number, payload: Partial<Cliente>): Observable<any> {
    return this.http.put(`${this.base}/api/clientes/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/clientes/${id}`);
  }

  estadoCuenta(id: number): Observable<ClienteEstadoCuentaResponse> {
    return this.http.get<ClienteEstadoCuentaResponse>(
      `${this.base}/api/clientes/${id}/estado-cuenta`,
    );
  }
}