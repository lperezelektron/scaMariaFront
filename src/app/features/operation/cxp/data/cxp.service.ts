import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../enviroments/environment';
import {
  CtaXPagar,
  CxpQuery,
  CxpResumen,
  PaginatedResponse,
  PagarPayload,
} from './cxp.models';

@Injectable({ providedIn: 'root' })
export class CxpService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: CxpQuery = {}): Observable<PaginatedResponse<CtaXPagar> | CtaXPagar[]> {
    let params = new HttpParams();

    if (q.proveedor_id) params = params.set('proveedor_id', String(q.proveedor_id));
    if (q.todas)        params = params.set('todas', 'true');
    if (q.vencidas)     params = params.set('vencidas', 'true');
    if (q.per_page)     params = params.set('per_page', String(q.per_page));
    if (q.page)         params = params.set('page', String(q.page));

    return this.http.get<PaginatedResponse<CtaXPagar> | CtaXPagar[]>(
      `${this.base}/api/cxp`,
      { params },
    );
  }

  get(id: number): Observable<CtaXPagar> {
    return this.http.get<CtaXPagar>(`${this.base}/api/cxp/${id}`);
  }

  pagar(id: number, payload: PagarPayload): Observable<{ message: string; nuevo_saldo: number; saldada: boolean }> {
    return this.http.post<{ message: string; nuevo_saldo: number; saldada: boolean }>(
      `${this.base}/api/cxp/${id}/pagar`,
      payload,
    );
  }

  resumen(): Observable<CxpResumen> {
    return this.http.get<CxpResumen>(`${this.base}/api/cxp/resumen`);
  }
}
