import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../enviroments/environment';
import { Observable } from 'rxjs';

export interface FormaPago {
  id: number;
  descripcion: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FormasPagoService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<FormaPago[]> {
    return this.http.get<FormaPago[]>(`${this.base}/api/forma-pago`);
  }
}