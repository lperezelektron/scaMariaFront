import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../enviroments/environment';
import { LoteDisponible, VentaStorePayload, VentaStoreResponse } from './ventas.models';

/**
 * Convierte las secuencias UTF-8 de 2 bytes para caracteres latinos
 * a su byte equivalente en Code Page 850, que es lo que esperan las
 * impresoras térmicas ESC/POS. Los caracteres fuera de este mapa se
 * copian tal cual (byte a byte).
 */
function utf8ToCp850(input: ArrayBuffer): ArrayBuffer {
  // Mapa: [byte1, byte2] → byte CP850
  // Cubre el bloque Latin-1 Supplement (U+00A0–U+00FF)
  const map2: Record<number, Record<number, number>> = {
    0xC2: {
      0xA1: 0xAD, // ¡
      0xBF: 0xA8, // ¿
      0xAA: 0xA6, // ª
      0xBA: 0xA7, // º
      0xAB: 0xAE, // «
      0xBB: 0xAF, // »
      0xB0: 0xF8, // °
      0xB2: 0xFD, // ²
      0xB3: 0xFC, // ³
    },
    0xC3: {
      0x80: 0x85, // À
      0x81: 0xB5, // Á
      0x82: 0x83, // Â
      0x84: 0x8E, // Ä
      0x85: 0x86, // Å
      0x87: 0x80, // Ç
      0x88: 0x88, // Ê
      0x89: 0x90, // É
      0x8A: 0x8A, // È
      0x8B: 0x89, // Ë
      0x8C: 0x8C, // Î
      0x8D: 0xD6, // Í
      0x8E: 0x8B, // Ï
      0x91: 0xA5, // Ñ
      0x93: 0xE0, // Ó
      0x94: 0x99, // Ö
      0x99: 0x9A, // Ü
      0x9A: 0xE9, // Ú
      0x9C: 0x9B, // ø (mayúscula Ø)
      0xA0: 0xA0, // á
      0xA1: 0x85, // à
      0xA2: 0x83, // â
      0xA4: 0x84, // ä
      0xA5: 0x86, // å
      0xA7: 0x87, // ç
      0xA8: 0x88, // ê
      0xA9: 0x82, // é
      0xAA: 0x8A, // è
      0xAB: 0x8B, // ï
      0xAC: 0x8C, // î
      0xAD: 0xA1, // í
      0xAE: 0x8D, // ì
      0xB1: 0xA4, // ñ
      0xB2: 0xA2, // ó
      0xB3: 0xA2, // ò
      0xB4: 0x93, // ô
      0xB6: 0x94, // ö
      0xB9: 0x97, // ù
      0xBA: 0xA3, // ú
      0xBB: 0x96, // û
      0xBC: 0x81, // ü
    },
  };

  const src = new Uint8Array(input);
  // En el peor caso el resultado tiene la misma longitud (sin expansión)
  const dst = new Uint8Array(src.length);
  let si = 0;
  let di = 0;

  while (si < src.length) {
    const b0 = src[si];
    const b1 = src[si + 1];
    const cp850 = map2[b0]?.[b1];

    if (cp850 !== undefined) {
      dst[di++] = cp850;
      si += 2;
    } else {
      dst[di++] = b0;
      si++;
    }
  }

  return dst.buffer.slice(0, di);
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  lotesDisponibles(q: { almacen_id: number; articulo_id?: number | null; variedad?: string | null }): Observable<LoteDisponible[]> {
    let params = new HttpParams().set('almacen_id', String(q.almacen_id));
    if (q.articulo_id) params = params.set('articulo_id', String(q.articulo_id));
    if (q.variedad) params = params.set('variedad', q.variedad);

    return this.http.get<LoteDisponible[]>(`${this.base}/api/ventas/lotes-disponibles`, { params });
  }

  store(payload: VentaStorePayload): Observable<VentaStoreResponse> {
    return this.http.post<VentaStoreResponse>(`${this.base}/api/ventas`, payload);
  }

  /** Descarga los bytes ESC/POS del ticket de una venta (80mm = cols 48) */
  getTicket(ventaId: number, cols: number = 48): Observable<ArrayBuffer> {
    return this.http.get(`${this.base}/api/ventas/${ventaId}/ticket`, {
      params: { cols: String(cols) },
      responseType: 'arraybuffer',
    }).pipe(map(utf8ToCp850));
  }
}