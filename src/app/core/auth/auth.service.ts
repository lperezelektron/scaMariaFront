import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { TokenStorageService } from '../storage/token-storage.service';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private token: TokenStorageService,
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/api/auth/login`, { email, password })
      .pipe(tap((res) => this.token.set(res.token)));
  }

  perfil(): Observable<any> {
    return this.http.get(`${this.base}/api/auth/perfil`);
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.base}/api/auth/logout`, {})
      .pipe(tap(() => this.token.clear()));
  }

  isLoggedIn(): boolean {
    return !!this.token.get();
  }
}
