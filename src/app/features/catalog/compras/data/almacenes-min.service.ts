import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../enviroments/environment';
import { Observable } from 'rxjs';

export interface AlmacenMini {
  id: number;
  descripcion: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlmacenesMinService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<AlmacenMini[]> {
    return this.http.get<AlmacenMini[]>(`${this.base}/api/almacenes`);
  }
}