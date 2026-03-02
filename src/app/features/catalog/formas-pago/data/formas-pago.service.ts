import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { FormaPago, FormaPagoStoreResponse, FormaPagoUpdateResponse } from './formas-pago.models';

export interface FormasPagoQuery {
  activo?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class FormasPagoService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<FormaPago[]> {
    return this.http.get<FormaPago[]>(`${this.base}/api/formas-pago`);
  }

  create(payload: Partial<FormaPago>): Observable<FormaPagoStoreResponse> {
    return this.http.post<FormaPagoStoreResponse>(
      `${this.base}/api/formas-pago`,
      payload,
    );
  }

  update(
    id: number,
    payload: Partial<FormaPago>,
  ): Observable<FormaPagoUpdateResponse> {
    return this.http.put<FormaPagoUpdateResponse>(
      `${this.base}/api/formas-pago/${id}`,
      payload,
    );
  }
}
