import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface NavigationItem {
  title: string;
  url: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationHistoryService {
  private readonly MAX_HISTORY = 8;
  private readonly STORAGE_KEY = 'nav_history';
  
  // Rutas fijas que siempre se muestran
  private readonly FIXED_ROUTES = [
    { title: 'Dashboard', url: '/dashboard' },
    { title: 'Punto de Venta', url: '/pos' }
  ];

  // Rutas que no se deben agregar al historial
  private readonly EXCLUDED_ROUTES = [
    '/login',
    '/logout',
    '/404',
    '/403',
    '/500',
    '/'
  ];

  // Signal para el historial reactivo
  public history = signal<NavigationItem[]>([]);

  // Última URL procesada para evitar duplicados por doble evento
  private lastProcessedUrl: string = '';

  constructor(private router: Router) {
    this.loadHistory();
    this.initNavigationListener();
  }

  private initNavigationListener(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const cleanUrl = event.urlAfterRedirects.split('?')[0].split('#')[0];
        if (cleanUrl === this.lastProcessedUrl) return;
        this.lastProcessedUrl = cleanUrl;
        this.addToHistory(cleanUrl);
      });
  }

  private addToHistory(url: string): void {
    // url ya viene limpia desde el listener
    const cleanUrl = url;

    // Verificar si es una ruta excluida
    if (this.isExcludedRoute(cleanUrl)) {
      return;
    }

    // Verificar si es una ruta fija
    if (this.isFixedRoute(cleanUrl)) {
      return;
    }

    // Obtener título de la ruta
    const title = this.getRouteTitle(cleanUrl);
    if (!title) return;

    const currentHistory = this.history();
    
    // Verificar si ya existe en el historial
    const existingIndex = currentHistory.findIndex(item => item.url === cleanUrl);
    
    let newHistory: NavigationItem[];
    
    if (existingIndex !== -1) {
      // Si existe, actualizar timestamp y mover al inicio
      const existing = currentHistory[existingIndex];
      newHistory = [
        { ...existing, timestamp: Date.now() },
        ...currentHistory.filter((_, i) => i !== existingIndex)
      ];
    } else {
      // Si no existe, agregar al inicio
      newHistory = [
        { title, url: cleanUrl, timestamp: Date.now() },
        ...currentHistory
      ];
    }

    // Limitar el tamaño del historial
    if (newHistory.length > this.MAX_HISTORY) {
      newHistory = newHistory.slice(0, this.MAX_HISTORY);
    }

    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }

  private isExcludedRoute(url: string): boolean {
    return this.EXCLUDED_ROUTES.some(route => url === route || url.startsWith(route + '/'));
  }

  private isFixedRoute(url: string): boolean {
    return this.FIXED_ROUTES.some(route => url === route.url || url.startsWith(route.url + '/'));
  }

  private getRouteTitle(url: string): string | null {
    // Extraer el título basado en la estructura de la URL
    const segments = url.split('/').filter(s => s);
    
    if (segments.length === 0) return null;

    // Mapeo de rutas a títulos
    const routeTitles: { [key: string]: string } = {
      'catalog': 'Catálogos',
      'articulos': 'Artículos',
      'categorias': 'Categorías',
      'clientes': 'Clientes',
      'proveedores': 'Proveedores',
      'formas-pago': 'Formas de Pago',
      'inventory': 'Inventario',
      'existencia': 'Existencias',
      'ajustes': 'Ajustes de Inventario',
      'precios': 'Precios',
      'operation': 'Operaciones',
      'compras': 'Compras',
      'ventas': 'Ventas',
      'cxc': 'Cuentas por Cobrar',
      'cxp': 'Cuentas por Pagar',
      'reporte': 'Reportes',
      'caja': 'Reporte de Caja',
      'inventario': 'Reporte de Inventario',
      'settings': 'Configuración',
      'almacenes': 'Almacenes',
      'impuestos': 'Impuestos',
      'perifericos': 'Periféricos'
    };

    // Buscar el título más específico (último segmento primero)
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      if (routeTitles[segment]) {
        return routeTitles[segment];
      }
    }

    // Si no se encuentra, capitalizar el último segmento
    const lastSegment = segments[segments.length - 1];
    return this.capitalizeTitle(lastSegment);
  }

  private capitalizeTitle(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private saveHistory(history: NavigationItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving navigation history:', e);
    }
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NavigationItem[];
        // Deduplicar por URL al cargar (por si quedaron duplicados de versiones anteriores)
        const seen = new Set<string>();
        const deduped = parsed.filter(item => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        });
        this.history.set(deduped);
        if (deduped.length !== parsed.length) {
          this.saveHistory(deduped);
        }
      }
    } catch (e) {
      console.error('Error loading navigation history:', e);
      this.history.set([]);
    }
  }

  public getFixedRoutes(): NavigationItem[] {
    return this.FIXED_ROUTES.map(route => ({
      ...route,
      timestamp: 0
    }));
  }

  public clearHistory(): void {
    this.history.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public removeFromHistory(url: string): void {
    const currentHistory = this.history();
    const newHistory = currentHistory.filter(item => item.url !== url);
    this.history.set(newHistory);
    this.saveHistory(newHistory);
  }
}
