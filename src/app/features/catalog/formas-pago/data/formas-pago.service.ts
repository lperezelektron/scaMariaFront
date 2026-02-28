import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { FormaPago } from './formas-pago.models';

export interface FormasPagoQuery {
  activo?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class FormasPagoService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: FormasPagoQuery = {}): Observable<FormaPago[]> {
    let params = new HttpParams();

    if (q.activo !== null && q.activo !== undefined) {
      params = params.set('activo', String(q.activo));
    }

    return this.http.get<FormaPago[]>(`${this.base}/api/formas-pago`, { params });
  }
}