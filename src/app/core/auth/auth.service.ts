import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';
import { TokenStorageService } from '../storage/token-storage.service';
import { Observable, tap } from 'rxjs';
import { UserStorageService } from '../storage/user-storage.service';

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
    private userStorage: UserStorageService,
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.base}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.token.set(res.token);
          if (res.user) this.userStorage.set(res.user);
        }),
      );
  }

  perfil(): Observable<any> {
    return this.http.get(`${this.base}/api/auth/perfil`).pipe(
      tap((res: any) => {
        // Si tu /perfil devuelve user/permisos, se refresca aquí
        if (res?.user) this.userStorage.set(res.user);
        // si devuelve el user directo:
        else if (res?.id && res?.permisos) this.userStorage.set(res);
      }),
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.base}/api/auth/logout`, {}).pipe(
      tap(() => {
        this.token.clear();
        this.userStorage.clear();
      }),
    );
  }

  isLoggedIn(): boolean {
    return !!this.token.get();
  }
}
