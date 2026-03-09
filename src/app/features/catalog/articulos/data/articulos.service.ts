import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Articulo, Paginated } from './articulos.models';
import { environment } from '../../../../../enviroments/environment';

export interface ArticulosQuery {
  page: number;
  per_page: number;
  search?: string;
  categoria_id?: number | null;
  activo?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class ArticulosService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: ArticulosQuery): Observable<Paginated<Articulo>> {
    let params = new HttpParams()
      .set('page', q.page)
      .set('per_page', q.per_page);

    if (q.search) params = params.set('search', q.search);
    if (q.categoria_id) params = params.set('categoria_id', q.categoria_id);
    if (q.activo !== null && q.activo !== undefined) params = params.set('activo', String(q.activo));

    return this.http.get<Paginated<Articulo>>(`${this.base}/api/articulos`, { params });
  }

  get(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/articulos/${id}`);
  }

  create(formData: FormData): Observable<any> {
    return this.http.post(`${this.base}/api/articulos`, formData);
  }

  update(id: number, formData: FormData): Observable<any> {
    formData.append('_method', 'PUT');
    return this.http.post(`${this.base}/api/articulos/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/articulos/${id}`);
  }
}