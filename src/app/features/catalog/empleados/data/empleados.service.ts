import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';
import { Empleado, EmpleadoStoreResponse, EmpleadoUpdateResponse } from './empleados.models';

@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.base}/api/empleados`);
  }

  get(id: number): Observable<{ empleado: Empleado }> {
    return this.http.get<{ empleado: Empleado }>(`${this.base}/api/empleados/${id}`);
  }

  create(payload: Partial<Empleado>): Observable<EmpleadoStoreResponse> {
    return this.http.post<EmpleadoStoreResponse>(`${this.base}/api/empleados`, payload);
  }

  update(id: number, payload: Partial<Empleado>): Observable<EmpleadoUpdateResponse> {
    return this.http.put<EmpleadoUpdateResponse>(`${this.base}/api/empleados/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/api/empleados/${id}`);
  }
}
