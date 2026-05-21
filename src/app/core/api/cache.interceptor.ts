import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheService } from '../services/http-cache.service';

const TTL_MAP: Array<{ pattern: RegExp; ttl: number }> = [
  { pattern: /\/api\/ventas\/lotes-disponibles/, ttl: 2 * 60 * 1000 },   // 2 min
  { pattern: /\/api\/articulos\/con-existencia/,  ttl: 3 * 60 * 1000 },   // 3 min
  { pattern: /\/api\/categorias/,                 ttl: 10 * 60 * 1000 },  // 10 min
  { pattern: /\/api\/almacenes/,                  ttl: 10 * 60 * 1000 },  // 10 min
  { pattern: /\/api\/formas-pago/,                ttl: 10 * 60 * 1000 },  // 10 min
  { pattern: /\/api\/empleados/,                  ttl: 10 * 60 * 1000 },  // 10 min
  { pattern: /\/api\/clientes/,                   ttl:  5 * 60 * 1000 },  //  5 min
];

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  constructor(private cache: HttpCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') return next.handle(req);

    const rule = TTL_MAP.find(r => r.pattern.test(req.url));
    if (!rule) return next.handle(req);

    const key = req.urlWithParams;
    const cached = this.cache.get(key);
    if (cached) return of(cached.clone());

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          this.cache.set(key, event, rule.ttl);
        }
      }),
    );
  }
}
