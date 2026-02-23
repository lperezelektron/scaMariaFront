import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<any> {
    return this.http.get(`${this.base}/api/categorias`);
  }
}