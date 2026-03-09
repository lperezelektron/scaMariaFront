import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../enviroments/environment';
import {
  AbonarPayload,
  CtaXCobrar,
  CxcQuery,
  CxcResumen,
  PaginatedResponse,
} from './cxc.models';

@Injectable({ providedIn: 'root' })
export class CxcService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q: CxcQuery = {}): Observable<PaginatedResponse<CtaXCobrar> | CtaXCobrar[]> {
    let params = new HttpParams();

    if (q.cliente_id) params = params.set('cliente_id', String(q.cliente_id));
    if (q.todas)      params = params.set('todas', 'true');
    if (q.vencidas)   params = params.set('vencidas', 'true');
    if (q.per_page)   params = params.set('per_page', String(q.per_page));
    if (q.page)       params = params.set('page', String(q.page));

    return this.http.get<PaginatedResponse<CtaXCobrar> | CtaXCobrar[]>(
      `${this.base}/api/cxc`,
      { params },
    );
  }

  get(id: number): Observable<CtaXCobrar> {
    return this.http.get<CtaXCobrar>(`${this.base}/api/cxc/${id}`);
  }

  abonar(id: number, payload: AbonarPayload): Observable<{ message: string; nuevo_saldo: number; saldada: boolean }> {
    return this.http.post<{ message: string; nuevo_saldo: number; saldada: boolean }>(
      `${this.base}/api/cxc/${id}/abonar`,
      payload,
    );
  }

  resumen(): Observable<CxcResumen> {
    return this.http.get<CxcResumen>(`${this.base}/api/cxc/resumen`);
  }
}
