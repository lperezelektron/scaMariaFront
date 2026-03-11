import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/environment';
import {
  DashboardData,
  VentasReporte,
  TopArticulo,
  InventarioReporte,
  UtilidadReporte
} from './dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private base = `${environment.apiBaseUrl}/api/reportes`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.base}/dashboard`);
  }

  getVentas(params: {
    fecha_inicio: string;
    fecha_fin: string;
    agrupar?: 'dia' | 'mes';
    almacen_id?: number;
    cliente_id?: number;
  }): Observable<VentasReporte> {
    let httpParams = new HttpParams()
      .set('fecha_inicio', params.fecha_inicio)
      .set('fecha_fin', params.fecha_fin);

    if (params.agrupar) {
      httpParams = httpParams.set('agrupar', params.agrupar);
    }
    if (params.almacen_id) {
      httpParams = httpParams.set('almacen_id', params.almacen_id.toString());
    }
    if (params.cliente_id) {
      httpParams = httpParams.set('cliente_id', params.cliente_id.toString());
    }

    return this.http.get<VentasReporte>(`${this.base}/ventas`, { params: httpParams });
  }

  getTopArticulos(params: {
    fecha_inicio: string;
    fecha_fin: string;
    limit?: number;
    almacen_id?: number;
  }): Observable<TopArticulo[]> {
    let httpParams = new HttpParams()
      .set('fecha_inicio', params.fecha_inicio)
      .set('fecha_fin', params.fecha_fin);

    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.almacen_id) {
      httpParams = httpParams.set('almacen_id', params.almacen_id.toString());
    }

    return this.http.get<TopArticulo[]>(`${this.base}/top-articulos`, { params: httpParams });
  }

  getInventarioValorizado(params?: {
    almacen_id?: number;
    categoria_id?: number;
  }): Observable<InventarioReporte> {
    let httpParams = new HttpParams();

    if (params?.almacen_id) {
      httpParams = httpParams.set('almacen_id', params.almacen_id.toString());
    }
    if (params?.categoria_id) {
      httpParams = httpParams.set('categoria_id', params.categoria_id.toString());
    }

    return this.http.get<InventarioReporte>(`${this.base}/inventario`, { params: httpParams });
  }

  getUtilidad(params: {
    fecha_inicio: string;
    fecha_fin: string;
    almacen_id?: number;
  }): Observable<UtilidadReporte> {
    let httpParams = new HttpParams()
      .set('fecha_inicio', params.fecha_inicio)
      .set('fecha_fin', params.fecha_fin);

    if (params.almacen_id) {
      httpParams = httpParams.set('almacen_id', params.almacen_id.toString());
    }

    return this.http.get<UtilidadReporte>(`${this.base}/utilidad`, { params: httpParams });
  }
}
