import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../enviroments/environment';
import { PaginatedResponse, VentaListItem, VentaShow, VentasQuery } from './ventas-list.models';

@Injectable({ providedIn: 'root' })
export class VentasListService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: VentasQuery = {}): Observable<PaginatedResponse<VentaListItem> | VentaListItem[]> {
    let params = new HttpParams();

    if (q.fecha)       params = params.set('fecha', q.fecha);
    if (q.almacen_id)  params = params.set('almacen_id', String(q.almacen_id));
    if (q.per_page)    params = params.set('per_page', String(q.per_page));
    if (q.page)        params = params.set('page', String(q.page));

    return this.http.get<PaginatedResponse<VentaListItem> | VentaListItem[]>(
      `${this.base}/api/ventas`,
      { params },
    );
  }

  get(id: number): Observable<VentaShow> {
    return this.http.get<VentaShow>(`${this.base}/api/ventas/${id}`);
  }
}
