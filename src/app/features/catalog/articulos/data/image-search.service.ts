import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../enviroments/environment';

export interface ImageResult {
  url: string;
  title: string;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class ImageSearchService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/buscar-imagenes`;

  constructor(private http: HttpClient) {}

  search(descripcion: string, categoria?: string): Observable<ImageResult[]> {
    const query = categoria
      ? `${categoria} ${descripcion} México producto abarrotes`
      : descripcion;

    return this.http.post<any>(this.endpoint, { query }).pipe(
      map(res => this.parse(res))
    );
  }

  private parse(response: any): ImageResult[] {
    try {
      const text = (response.content as any[])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return [];
      return JSON.parse(match[0])?.images ?? [];
    } catch {
      return [];
    }
  }
}
