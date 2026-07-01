# Componentes de UI y Estilos

## Librería Principal: CoreUI 5

Todos los componentes visuales usan CoreUI 5. No introducir otras librerías de UI (Bootstrap directo, Angular Material, PrimeNG, etc.) sin justificación.

### Componentes CoreUI de uso frecuente

```typescript
// Imports comunes en componentes de listado
import {
  CardModule,
  TableModule,
  BadgeModule,
  ButtonModule,
  SpinnerModule,
  ModalModule,
  ToastModule,
} from '@coreui/angular';

// Imports comunes en formularios
import {
  FormModule,
  GridModule,
  InputGroupModule,
} from '@coreui/angular';

// Iconos
import { IconModule } from '@coreui/icons-angular';
```

### Uso de íconos CoreUI

```typescript
// En el componente
import { cilPlus, cilPencil, cilTrash, cilSearch } from '@coreui/icons';

icons = { cilPlus, cilPencil, cilTrash, cilSearch };

// En el template
<c-icon [icon]="icons.cilPlus" size="sm" />
```

Los íconos disponibles están definidos en `src/app/icons/`. No importar íconos que no estén en ese subconjunto sin agregarlos primero.

## Tablas de Datos

### Tablas simples → `c-table` de CoreUI

```html
<c-card>
  <c-card-header>Lista de Artículos</c-card-header>
  <c-card-body>
    <table cTable hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        @for (item of items(); track item.id) {
          <tr>
            <td>{{ item.nombre }}</td>
            <td>{{ item.categoria?.descripcion }}</td>
            <td>
              <button cButton color="warning" size="sm" [routerLink]="[item.id, 'editar']">
                <c-icon [icon]="icons.cilPencil" />
              </button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </c-card-body>
</c-card>
```

### Tablas complejas → ag-Grid

Usar ag-Grid para tablas con muchas filas, columnas configurables o funcionalidades avanzadas (ordenación, filtros, exportación):

```typescript
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
```

## Formularios

Estructura estándar de formulario con CoreUI:

```html
<c-card>
  <c-card-header>{{ isEdit ? 'Editar' : 'Nuevo' }} Artículo</c-card-header>
  <c-card-body>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="mb-3">
        <label cLabel for="nombre">Nombre</label>
        <input cFormControl id="nombre" formControlName="nombre" />
        @if (errors()['nombre']) {
          <c-form-feedback [valid]="false">{{ errors()['nombre'][0] }}</c-form-feedback>
        }
      </div>

      <button cButton color="primary" type="submit" [disabled]="saving()">
        @if (saving()) { <c-spinner size="sm" /> }
        Guardar
      </button>
      <button cButton color="secondary" type="button" (click)="cancel()">
        Cancelar
      </button>
    </form>
  </c-card-body>
</c-card>
```

## Modales de Confirmación

Para confirmar eliminaciones y acciones destructivas:

```html
<c-modal [(visible)]="deleteModalVisible">
  <c-modal-header>
    <h5 cModalTitle>Confirmar eliminación</h5>
  </c-modal-header>
  <c-modal-body>
    ¿Estás seguro de que deseas eliminar este registro?
  </c-modal-body>
  <c-modal-footer>
    <button cButton color="secondary" (click)="deleteModalVisible = false">Cancelar</button>
    <button cButton color="danger" (click)="confirmDelete()">Eliminar</button>
  </c-modal-footer>
</c-modal>
```

## Estados de Carga

```html
<!-- Spinner de carga de página -->
@if (loading()) {
  <div class="text-center py-4">
    <c-spinner />
  </div>
} @else {
  <!-- contenido -->
}

<!-- Botón con estado de guardado -->
<button cButton color="primary" [disabled]="saving()">
  @if (saving()) { <c-spinner size="sm" /> Guardando... }
  @else { Guardar }
</button>
```

## Badges de Estado

```html
<!-- Estado activo/inactivo -->
<c-badge [color]="item.activo ? 'success' : 'secondary'">
  {{ item.activo ? 'Activo' : 'Inactivo' }}
</c-badge>
```

## Estilos SCSS

- Un archivo `.scss` por componente (nunca estilos inline en el template)
- Usar variables CSS de CoreUI para colores y espaciados (`var(--cui-primary)`)
- No sobreescribir estilos globales desde componentes — usar clases locales
- El archivo de estilos global está en `src/styles.scss`

## Gráficas

- Usar **Chart.js** para gráficas simples (líneas, barras, dona)
- Usar **ag-Charts** para dashboards con mayor interactividad
- No mezclar ambas librerías en la misma vista

## Layout y Navegación

- El layout principal es `DefaultLayoutComponent` — no modificar su estructura sin revisar el menú dinámico
- El layout de POS es `PosLayoutComponent` — independiente del layout principal
- La navegación usa `RouterLink` y `Router.navigate()`, nunca `window.location`
- El menú dinámico (pestañas de historial) es gestionado por `NavigationHistoryService`
