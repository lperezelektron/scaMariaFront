import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { Categoria, PaginatedResponse } from './categorias.models';

export interface CategoriasQuery {
  search?: string | null;
  activo?: boolean | null;
  per_page?: number | null;
  page?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: CategoriasQuery = {}): Observable<PaginatedResponse<Categoria> | Categoria[]> {
    let params = new HttpParams();

    if (q.search) params = params.set('search', q.search);
    if (q.activo !== null && q.activo !== undefined) params = params.set('activo', String(q.activo));
    if (q.per_page) params = params.set('per_page', String(q.per_page));
    if (q.page) params = params.set('page', String(q.page));
    
    return this.http.get<PaginatedResponse<Categoria> | Categoria[]>(
      `${this.base}/api/categorias`,
      { params },
    );
  }

  get(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/categorias/${id}`);
  }

  create(payload: Partial<Categoria>): Observable<any> {
    return this.http.post(`${this.base}/api/categorias`, payload);
  }

  update(id: number, payload: Partial<Categoria>): Observable<any> {
    return this.http.put(`${this.base}/api/categorias/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/categorias/${id}`);
  }
}