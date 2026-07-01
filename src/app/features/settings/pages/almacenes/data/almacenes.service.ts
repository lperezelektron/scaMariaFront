import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Almacen, AlmacenShowResponse, InventarioItem } from './almacenes.models';
import { environment } from '../../../../../../enviroments/environment';

export interface AlmacenesQuery {
  activo?: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class AlmacenesService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(q?: AlmacenesQuery): Observable<Almacen[]> {
    let params = new HttpParams();

    if (q?.activo !== null && q?.activo !== undefined) {
      params = params.set('activo', String(q.activo));
    }

    return this.http.get<Almacen[]>(`${this.base}/api/almacenes`, { params });
  }

  get(id: number): Observable<AlmacenShowResponse | any> {
    return this.http.get(`${this.base}/api/almacenes/${id}`);
  }

  create(payload: Partial<Almacen>, imagenFile?: File): Observable<any> {
    if (imagenFile) {
      return this.http.post(`${this.base}/api/almacenes`, this.toFormData(payload, imagenFile));
    }
    return this.http.post(`${this.base}/api/almacenes`, payload);
  }

  update(id: number, payload: Partial<Almacen>, imagenFile?: File): Observable<any> {
    if (imagenFile) {
      // Laravel no acepta multipart en PUT; se usa method spoofing con POST + _method=PUT
      const fd = this.toFormData(payload, imagenFile);
      fd.append('_method', 'PUT');
      return this.http.post(`${this.base}/api/almacenes/${id}`, fd);
    }
    return this.http.put(`${this.base}/api/almacenes/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/almacenes/${id}`);
  }

  inventario(id: number, soloConStock?: boolean): Observable<InventarioItem[]> {
    let params = new HttpParams();
    if (soloConStock) params = params.set('solo_con_stock', 'true');

    return this.http.get<InventarioItem[]>(
      `${this.base}/api/almacenes/${id}/inventario`,
      { params },
    );
  }

  private toFormData(payload: Partial<Almacen>, imagenFile?: File): FormData {
    const fd = new FormData();
    if (payload.descripcion != null) fd.append('descripcion', payload.descripcion);
    if (payload.direccion   != null) fd.append('direccion',   payload.direccion);
    if (payload.ciudad)               fd.append('ciudad',      payload.ciudad);
    if (payload.telefono)             fd.append('telefono',    payload.telefono);
    fd.append('activo', payload.activo ? '1' : '0');
    if (imagenFile)                   fd.append('imagen',      imagenFile);
    return fd;
  }
}
