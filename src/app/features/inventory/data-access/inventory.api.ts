import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/environment';

export interface Almacen {
  id: number;
  descripcion: string;
  direccion: string;
  ciudad: string | null;
  telefono: string | null;
  activo: boolean;
}

export interface InventarioItem {
  id: number;
  almacen_id: number;
  articulo_id: number;
  variedad: string | null;
  existencia: number;
  precio: number;
  precio_min: number;
  costo: number;
  empaque: number;
  articulo?: {
    id: number;
    nombre: string;
    nombre_corto: string;
    unidad: string;
    categoria?: { id: number; descripcion: string };
  };
}

@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  almacenes(soloActivos = true): Observable<Almacen[]> {
    const params = new HttpParams().set('activo', soloActivos ? 'true' : '');
    return this.http.get<Almacen[]>(`${this.base}/api/almacenes`, { params });
  }

  inventarioPorAlmacen(almacenId: number, soloConStock: boolean): Observable<InventarioItem[]> {
    const params = new HttpParams().set('solo_con_stock', soloConStock ? 'true' : 'false');
    return this.http.get<InventarioItem[]>(
      `${this.base}/api/almacenes/${almacenId}/inventario`,
      { params },
    );
  }
}
