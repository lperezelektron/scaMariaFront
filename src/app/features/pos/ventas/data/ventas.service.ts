import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { LoteDisponible, VentaStorePayload, VentaStoreResponse } from './ventas.models';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  lotesDisponibles(q: { almacen_id: number; articulo_id?: number | null; variedad?: string | null }): Observable<LoteDisponible[]> {
    let params = new HttpParams().set('almacen_id', String(q.almacen_id));
    if (q.articulo_id) params = params.set('articulo_id', String(q.articulo_id));
    if (q.variedad) params = params.set('variedad', q.variedad);

    return this.http.get<LoteDisponible[]>(`${this.base}/api/ventas/lotes-disponibles`, { params });
  }

  store(payload: VentaStorePayload): Observable<VentaStoreResponse> {
    return this.http.post<VentaStoreResponse>(`${this.base}/api/ventas`, payload);
  }
}