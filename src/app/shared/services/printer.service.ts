import { Injectable, signal } from '@angular/core';

// qz-tray es un módulo CJS sin tipos oficiales
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import qz from 'qz-tray';

@Injectable({ providedIn: 'root' })
export class PrinterService {
  private readonly STORAGE_KEY = 'escpos_printer';

  isConnected = signal(false);
  connecting  = signal(false);

  /** Nombre de impresora guardado en localStorage */
  printerName = signal<string | null>(localStorage.getItem(this.STORAGE_KEY));

  // ── Conexión ────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (qz.websocket.isActive()) {
      this.isConnected.set(true);
      return;
    }

    this.connecting.set(true);
    try {
      // QZ Tray corre en wss://localhost:8182 por defecto.
      // Para desarrollo sin certificado firmado se desactiva la verificación.
      qz.security.setCertificatePromise((_resolve: (v: string) => void, reject: (v: string) => void) => {
        reject('unsigned');
      });

      await qz.websocket.connect();
      this.isConnected.set(true);
    } finally {
      this.connecting.set(false);
    }
  }

  async disconnect(): Promise<void> {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
    }
    this.isConnected.set(false);
  }

  // ── Impresoras ──────────────────────────────────────────────────────────

  /** Lista todas las impresoras disponibles en el equipo. */
  async getPrinters(): Promise<string[]> {
    await this.connect();
    const result = await qz.printers.find();
    // qz.printers.find() devuelve string o string[]
    return Array.isArray(result) ? result : [result];
  }

  /** Guarda la impresora seleccionada en localStorage. */
  setPrinter(name: string): void {
    this.printerName.set(name);
    localStorage.setItem(this.STORAGE_KEY, name);
  }

  clearPrinter(): void {
    this.printerName.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ── Impresión ───────────────────────────────────────────────────────────

  /**
   * Envía los bytes ESC/POS (ArrayBuffer) a la impresora configurada.
   * @throws si QZ Tray no está corriendo o no hay impresora seleccionada.
   */
  async print(data: ArrayBuffer): Promise<void> {
    await this.connect();

    const printer = this.printerName();
    if (!printer) {
      throw new Error('NO_PRINTER');
    }

    const config = qz.configs.create(printer);
    const printData = [{
      type:   'raw',
      format: 'base64',
      data:   this.toBase64(data),
    }];

    await qz.print(config, printData);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
