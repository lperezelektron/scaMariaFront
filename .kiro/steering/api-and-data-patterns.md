# Patrones de API y Datos

## Interfaces Base Reutilizables

```typescript
// Respuesta paginada estándar del backend
export interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Patrón de query para listados
export interface BaseQuery {
  page?: number;
  per_page?: number;
  search?: string;
}
```

## Patrón de Servicio HTTP

Todos los servicios de recursos siguen esta estructura:

```typescript
@Injectable({ providedIn: 'root' })
export class RecursoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/recurso';

  getAll(query: RecursoQuery): Observable<Paginated<Recurso>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<Paginated<Recurso>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Recurso> {
    return this.http.get<Recurso>(`${this.apiUrl}/${id}`);
  }

  create(data: FormData | Partial<Recurso>): Observable<Recurso> {
    return this.http.post<Recurso>(this.apiUrl, data);
  }

  update(id: number, data: FormData | Partial<Recurso>): Observable<Recurso> {
    return this.http.put<Recurso>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## Upload de Archivos / Imágenes

Para recursos con imágenes, usar `FormData` y simular PUT con `_method`:

```typescript
update(id: number, form: FormGroup): Observable<Recurso> {
  const formData = new FormData();
  formData.append('_method', 'PUT');          // Simula PUT en el servidor
  formData.append('nombre', form.value.nombre);
  if (form.value.imagen instanceof File) {
    formData.append('imagen', form.value.imagen);
  }
  return this.http.post<Recurso>(`${this.apiUrl}/${id}`, formData);
}
```

## Patrón de Componente de Listado

```typescript
export class RecursoListComponent {
  private service = inject(RecursoService);

  // Estado con signals
  items = signal<Recurso[]>([]);
  loading = signal(false);
  total = signal(0);
  query = signal<RecursoQuery>({ page: 1, per_page: 20 });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.service.getAll(this.query()).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
```

## Patrón de Formulario (Crear/Editar)

```typescript
export class RecursoFormComponent {
  private service = inject(RecursoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  fb = inject(FormBuilder);
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    // ...
  });

  saving = signal(false);
  errors = signal<Record<string, string[]>>({});  // Errores 422 del backend

  id = this.route.snapshot.params['id'];
  isEdit = !!this.id;

  ngOnInit() {
    if (this.isEdit) this.loadItem();
  }

  loadItem() {
    this.service.getById(this.id).subscribe(item => this.form.patchValue(item));
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const request$ = this.isEdit
      ? this.service.update(this.id, this.form.value)
      : this.service.create(this.form.value);

    request$.subscribe({
      next: () => this.router.navigate(['../'], { relativeTo: this.route }),
      error: (err) => {
        if (err.status === 422) this.errors.set(err.error.errors);
        this.saving.set(false);
      },
    });
  }
}
```

## Manejo de Errores de Validación (422)

El backend devuelve errores en formato Laravel:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nombre": ["El campo nombre es obligatorio."],
    "email": ["El email ya está en uso."]
  }
}
```

En el template, mostrar los errores por campo:
```html
<input formControlName="nombre" />
@if (errors()['nombre']) {
  <div class="invalid-feedback d-block">{{ errors()['nombre'][0] }}</div>
}
```

## Importación Masiva (Excel)

Los listados que soportan importación desde XLSX siguen este patrón:
1. Botón de importar abre un input `type="file"` que acepta `.xlsx`
2. El archivo se envía como `FormData` al endpoint `POST /api/recurso/import`
3. El backend responde con un resumen: `{ imported: number, errors: string[] }`
4. Se muestra feedback al usuario con los resultados

## Paginación con ag-Grid

Para tablas complejas se usa ag-Grid con servidor-side pagination:
- `rowModelType: 'infinite'` o paginación manual
- `GridReadyEvent` para inicializar la fuente de datos
- Los parámetros de paginación se pasan en el `query` del servicio
