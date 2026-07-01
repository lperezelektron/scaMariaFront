import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrinterService {
  private readonly URL_KEY = 'print_agent_url';

  agentUrl  = signal<string>(localStorage.getItem(this.URL_KEY) ?? 'http://localhost:8183');
  isConnected = signal<boolean>(false);

  setAgentUrl(url: string) {
    const clean = url.trim().replace(/\/$/, '');
    this.agentUrl.set(clean);
    localStorage.setItem(this.URL_KEY, clean);
  }

  async ping(): Promise<boolean> {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(`${this.agentUrl()}/ping`, { signal: ctrl.signal });
      clearTimeout(timer);
      const ok = res.ok && (await res.json()).ok === true;
      this.isConnected.set(ok);
      return ok;
    } catch {
      clearTimeout(timer);
      this.isConnected.set(false);
      return false;
    }
  }

  async print(data: ArrayBuffer): Promise<void> {
    // ArrayBuffer → base64
    const bytes = new Uint8Array(data);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(`${this.agentUrl()}/print`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ data: b64 }),
        signal:  ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
    } catch (e: any) {
      clearTimeout(timer);
      if (e.name === 'AbortError') {
        throw new Error('El agente no respondió. Verifica que esté corriendo.');
      }
      if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        throw new Error('No se pudo conectar al agente de impresión.');
      }
      throw e;
    }
  }
}
