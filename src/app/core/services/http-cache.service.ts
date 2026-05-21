import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

interface CacheEntry {
  response: HttpResponse<any>;
  expires: number;
}

@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private store = new Map<string, CacheEntry>();

  get(key: string): HttpResponse<any> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.response;
  }

  set(key: string, response: HttpResponse<any>, ttlMs: number): void {
    this.store.set(key, { response, expires: Date.now() + ttlMs });
  }

  /** Elimina todas las entradas cuya clave contenga el patrón dado. */
  invalidate(urlPattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(urlPattern)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }
}
