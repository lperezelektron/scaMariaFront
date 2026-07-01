# Autenticación y Autorización

## Flujo de Autenticación

1. Usuario envía email/password al endpoint `POST /api/auth/login`
2. Backend responde con `{ token: string, user?: LimoneroUser }`
3. Token se guarda en `localStorage` via `TokenStorageService` (key: `limonero_token`)
4. Usuario se guarda en `localStorage` via `UserStorageService` (key: `limonero_user`)
5. El `authInterceptor` agrega `Authorization: Bearer <token>` a cada request HTTP
6. Al recibir un 401, el interceptor limpia el storage y redirige a `/login`
7. Logout llama `DELETE /api/auth/logout`, luego limpia storage y redirige

## Modelo de Usuario

```typescript
export interface LimoneroUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permisos: string[];   // e.g. ['catalogos.ver', 'catalogos.crear']
  almacen_id: number;
}
```

## Guards Disponibles

| Guard | Archivo | Propósito |
|-------|---------|-----------|
| `authGuard` | `core/auth/auth.guard.ts` | Requiere sesión activa; redirige a `/login` |
| `guestGuard` | `core/auth/guest.guard.ts` | Solo para no autenticados; redirige a `/` |
| `permissionMatch` | `core/auth/permission.match.ts` | `CanMatchFn` que verifica permiso(s) específico(s) |

### Uso en rutas

```typescript
// Proteger con autenticación
{ path: 'dashboard', canActivate: [authGuard], ... }

// Proteger con permiso
{ path: 'catalog', canMatch: [permissionMatch('catalogos.ver')], ... }

// Permiso múltiple (OR)
{ path: 'pos', canMatch: [permissionMatch(['ventas.ver', 'ventas.crear'])], ... }
```

## Directivas de Autorización

Usar en templates para mostrar/ocultar elementos según permisos o roles.

| Directiva | Comportamiento |
|-----------|---------------|
| `*hasPermission="'perm'"` | Muestra si tiene el permiso exacto |
| `*hasNotPermission="'perm'"` | Muestra si NO tiene el permiso |
| `*hasAnyPermission="['p1','p2']"` | Muestra si tiene al menos uno |
| `*hasRole="'admin'"` | Muestra si tiene ese rol |
| `*hasNotRole="'admin'"` | Muestra si NO tiene ese rol |

```html
<!-- Botón solo visible si puede crear -->
<button *hasPermission="'catalogos.crear'">Nuevo Artículo</button>

<!-- Alternativa para múltiples permisos -->
<div *hasAnyPermission="['ventas.crear', 'ventas.editar']">
  Acciones de venta
</div>
```

## Verificación Programática

```typescript
// En un componente o servicio
private userStorage = inject(UserStorageService);

canEdit = this.userStorage.hasPermission('catalogos.editar');
canViewOrCreate = this.userStorage.hasAny(['ventas.ver', 'ventas.crear']);
```

## Interceptor HTTP

El `authInterceptor` (funcional, no clase) se encarga de:
- Agregar el header `Authorization: Bearer <token>` a todas las peticiones
- Detectar respuestas 401 y ejecutar logout automático

Se registra en `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

## Nomenclatura de Permisos

Los permisos siguen el patrón `[módulo].[acción]`:

| Módulo | Acciones comunes |
|--------|-----------------|
| `catalogos` | `ver`, `crear`, `editar`, `eliminar` |
| `inventario` | `ver`, `crear`, `editar` |
| `ventas` | `ver`, `crear`, `editar`, `eliminar` |
| `compras` | `ver`, `crear`, `editar`, `eliminar` |
| `reportes` | `ver` |
| `settings` | `ver`, `editar` |
