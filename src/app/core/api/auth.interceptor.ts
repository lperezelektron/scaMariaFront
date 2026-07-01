import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { TokenStorageService } from '../storage/token-storage.service';
import { UserStorageService } from '../storage/user-storage.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  constructor(
    private token: TokenStorageService,
    private userStorage: UserStorageService,
    private router: Router,
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const t = this.token.get();
    const authReq = t
      ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Solo actuar si hay token (sesión activa) y el servidor responde 401
        if (err.status === 401 && this.token.get()) {
          this.token.clear();
          this.userStorage.clear();
          this.router.navigate(['/login'], { queryParams: { expired: true } });
        }
        return throwError(() => err);
      }),
    );
  }
}
