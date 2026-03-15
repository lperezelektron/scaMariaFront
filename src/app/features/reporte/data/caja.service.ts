import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CajaIndexResponse, CorteCaja, MovimientoCaja } from './caja.models';
import { environment } from '../../../../enviroments/environment';

export interface CajaQuery {
  fecha?: string;
  tipo?: string;
  almacen_id?: number;
}

export interface MovimientoPayload {
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  referencia: string;
  almacen_id?: number | null;
}

export interface CortesQuery {
  mes?: number;
  anio?: number;
  per_page?: number;
  almacen_id?: number;
}

@Injectable({ providedIn: 'root' })
export class CajaService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  index(q: CajaQuery = {}): Observable<CajaIndexResponse> {
    let params = new HttpParams();
    if (q.fecha)       params = params.set('fecha', q.fecha);
    if (q.tipo)        params = params.set('tipo', q.tipo);
    if (q.almacen_id)  params = params.set('almacen_id', q.almacen_id);
    return this.http.get<CajaIndexResponse>(`${this.base}/api/caja`, { params });
  }

  cortes(q: CortesQuery = {}): Observable<CorteCaja[]> {
    let params = new HttpParams();
    if (q.mes)        params = params.set('mes', q.mes);
    if (q.anio)       params = params.set('anio', q.anio);
    if (q.per_page)   params = params.set('per_page', q.per_page);
    if (q.almacen_id) params = params.set('almacen_id', q.almacen_id);
    return this.http.get<CorteCaja[]>(`${this.base}/api/caja/cortes`, { params });
  }

  showCorte(id: number): Observable<CorteCaja> {
    return this.http.get<CorteCaja>(`${this.base}/api/caja/cortes/${id}`);
  }

  movimiento(payload: MovimientoPayload): Observable<{ message: string; movimiento: MovimientoCaja }> {
    return this.http.post<{ message: string; movimiento: MovimientoCaja }>(
      `${this.base}/api/caja/movimiento`,
      payload,
    );
  }

  corte(almacen_id?: number | null): Observable<{ message: string; corte: CorteCaja; importe: number }> {
    return this.http.post<{ message: string; corte: CorteCaja; importe: number }>(
      `${this.base}/api/caja/corte`,
      almacen_id ? { almacen_id } : {},
    );
  }
}
