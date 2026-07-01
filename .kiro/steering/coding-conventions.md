# Convenciones de Código

## Nomenclatura de Archivos

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | `[recurso]-[página].component.ts` | `articulos-list.component.ts` |
| Servicio | `[recurso].service.ts` | `articulos.service.ts` |
| Modelos | `[recurso].models.ts` | `articulos.models.ts` |
| Guard | `[nombre].guard.ts` | `auth.guard.ts` |
| Directiva | `[nombre].directive.ts` | `has-permission.directive.ts` |
| Interceptor | `[nombre].interceptor.ts` | `auth.interceptor.ts` |
| Rutas | `[recurso].routes.ts` | `articulos.routes.ts` |

## Componentes

- Siempre `standalone: true` — sin NgModules
- Imports explícitos en cada componente (CommonModule, ReactiveFormsModule, etc.)
- Selector en kebab-case: `selector: 'app-articulos-list'`
- Estilos en archivo `.scss` separado (no inline styles)
- Usar `OnPush` change detection cuando sea posible

```typescript
@Component({
  selector: 'app-[recurso]-[página]',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, /* CoreUI, AgGrid, etc. */],
  templateUrl: './[recurso]-[página].component.html',
  styleUrl: './[recurso]-[página].component.scss',
})
export class [Recurso][Página]Component {
  // ...
}
```

## Servicios

- `providedIn: 'root'` para servicios singleton
- Métodos HTTP devuelven `Observable<T>` tipado
- Usar interfaces `Query` para parámetros de búsqueda/paginación
- Usar `Paginated<T>` para respuestas paginadas

```typescript
@Injectable({ providedIn: 'root' })
export class ArticulosService {
  private http = inject(HttpClient);
  private apiUrl = '/api/articulos';

  getAll(query: ArticulosQuery): Observable<Paginated<Articulo>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<Paginated<Articulo>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Articulo> { ... }
  create(data: FormData): Observable<Articulo> { ... }
  update(id: number, data: FormData): Observable<Articulo> { ... }
  delete(id: number): Observable<void> { ... }
}
```

## Modelos e Interfaces

- Definir en `[recurso].models.ts`
- Interfaces para modelos de dominio (no clases)
- Siempre incluir interfaz `Query` para parámetros de listado

```typescript
export interface Articulo {
  id: number;
  nombre: string;
  nombre_corto?: string;
  // ...
}

export interface ArticulosQuery {
  page?: number;
  per_page?: number;
  search?: string;
  activo?: boolean;
}
```

## Manejo de Estado con Signals

Preferir signals sobre propiedades simples para estado reactivo en componentes:

```typescript
// ✅ Correcto
loading = signal(false);
items = signal<Articulo[]>([]);

// Para derivados
total = computed(() => this.items().length);
```

## Inyección de Dependencias

Usar `inject()` en lugar de constructor injection:

```typescript
// ✅ Correcto
export class MiComponente {
  private service = inject(ArticulosService);
  private router = inject(Router);
}

// ❌ Evitar
constructor(private service: ArticulosService) {}
```

## TypeScript

- Strict mode activo — no usar `any` sin justificación
- Tipos explícitos en retornos de funciones públicas
- Usar `readonly` para propiedades que no cambian
- Preferir `interface` sobre `type` para objetos

## Templates HTML

- Usar `@if` / `@for` / `@switch` (nueva sintaxis de control flow de Angular 17+), no `*ngIf` / `*ngFor`
- `async` pipe para Observables en templates
- Accesibilidad: `aria-label`, roles semánticos en elementos interactivos
