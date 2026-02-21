import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { TokenStorageService } from '../storage/token-storage.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  constructor(private token: TokenStorageService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const t = this.token.get();
    if (!t) return next.handle(req);

    return next.handle(
      req.clone({
        setHeaders: { Authorization: `Bearer ${t}` },
      }),
    );
  }
}
