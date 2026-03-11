# Menú Superior Dinámico - Documentación

## Descripción

El menú superior ahora funciona de manera dinámica, mostrando un historial de las páginas que el usuario ha visitado, similar a las pestañas de un navegador.

## Características

### Rutas Fijas
Las siguientes rutas siempre están visibles en el menú:
- **Dashboard** (`/dashboard`)
- **Punto de Venta** (`/pos`)

### Rutas Dinámicas
- Se agregan automáticamente al menú cuando el usuario navega a ellas
- Máximo 8 rutas en el historial (configurable)
- Se pueden cerrar individualmente con el botón "×"
- El historial se guarda en `localStorage` y persiste entre sesiones
- Las rutas más recientes aparecen primero

### Rutas Excluidas
Las siguientes rutas NO se agregan al historial:
- `/login`
- `/logout`
- `/404`, `/403`, `/500`
- Ruta raíz `/`

## Componentes Modificados

### 1. NavigationHistoryService
**Ubicación:** `src/app/core/services/navigation-history.service.ts`

Servicio que gestiona el historial de navegación:
- Escucha eventos de navegación del Router
- Mantiene un signal reactivo con el historial
- Guarda/carga el historial en localStorage
- Proporciona métodos para agregar/eliminar rutas

**Configuración:**
```typescript
private readonly MAX_HISTORY = 8; // Máximo de rutas en historial
private readonly STORAGE_KEY = 'nav_history'; // Clave en localStorage
```

### 2. DefaultHeaderComponent
**Ubicación:** `src/app/layout/default-layout/default-header/`

Componente del header modificado para:
- Mostrar rutas fijas y dinámicas
- Permitir cerrar pestañas individuales
- Resaltar la ruta activa

## Mapeo de Títulos

El servicio convierte automáticamente las URLs en títulos legibles:

| URL | Título |
|-----|--------|
| `/catalog/articulos` | Artículos |
| `/catalog/categorias` | Categorías |
| `/catalog/clientes` | Clientes |
| `/catalog/proveedores` | Proveedores |
| `/inventory/existencia` | Existencias |
| `/operation/compras` | Compras |
| `/operation/ventas` | Ventas |
| `/reporte/caja` | Reporte de Caja |
| `/settings/almacenes` | Almacenes |

Para agregar nuevos mapeos, edita el objeto `routeTitles` en `NavigationHistoryService`:

```typescript
const routeTitles: { [key: string]: string } = {
  'nueva-ruta': 'Título Personalizado',
  // ...
};
```

## Estilos

Los estilos del menú están en `default-header.component.scss`:
- Botón de cerrar con efecto hover
- Transiciones suaves
- Separador visual entre rutas fijas y dinámicas

## Uso

El sistema funciona automáticamente. No requiere configuración adicional:

1. El usuario navega a cualquier página
2. La ruta se agrega automáticamente al menú superior
3. El usuario puede cerrar pestañas con el botón "×"
4. El historial persiste entre sesiones

## Métodos Públicos del Servicio

```typescript
// Obtener rutas fijas
getFixedRoutes(): NavigationItem[]

// Limpiar todo el historial
clearHistory(): void

// Eliminar una ruta específica
removeFromHistory(url: string): void

// Signal reactivo con el historial
history: Signal<NavigationItem[]>
```

## Personalización

### Cambiar el número máximo de pestañas:
```typescript
// En navigation-history.service.ts
private readonly MAX_HISTORY = 10; // Cambiar de 8 a 10
```

### Agregar más rutas fijas:
```typescript
// En navigation-history.service.ts
private readonly FIXED_ROUTES = [
  { title: 'Dashboard', url: '/dashboard' },
  { title: 'Punto de Venta', url: '/pos' },
  { title: 'Nueva Ruta Fija', url: '/nueva-ruta' }
];
```

### Excluir rutas adicionales:
```typescript
// En navigation-history.service.ts
private readonly EXCLUDED_ROUTES = [
  '/login',
  '/logout',
  '/mi-ruta-excluida'
];
```

## Consideraciones

- El historial se guarda en `localStorage` con la clave `nav_history`
- Si el localStorage está lleno o bloqueado, el historial solo funcionará durante la sesión actual
- Las rutas con query params o fragments se limpian antes de guardar
- El sistema respeta los permisos del usuario (solo muestra rutas accesibles)
