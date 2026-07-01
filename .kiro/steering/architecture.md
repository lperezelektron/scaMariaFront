# Arquitectura del Proyecto

## Estructura de Carpetas

```
src/app/
├── core/                    # Servicios singleton y utilidades críticas
│   ├── auth/               # AuthService, AuthGuard, GuestGuard, permissionMatch
│   ├── api/                # authInterceptor (Bearer token + manejo 401)
│   ├── storage/            # TokenStorageService, UserStorageService
│   ├── directives/         # Directivas de autorización (hasPermission, hasRole, etc.)
│   └── services/           # NavigationHistoryService (menú dinámico)
├── features/               # Módulos de negocio (lazy-loaded)
│   ├── catalog/            # Artículos, Categorías, Clientes, Proveedores
│   ├── inventory/          # Gestión de existencias
│   ├── operation/          # Compras, Ventas, CxC, CxP
│   ├── settings/           # Almacenes, Impuestos
│   ├── reporte/            # Reportes
│   └── pos/                # Punto de Venta
├── layout/                 # Layouts de la aplicación
│   ├── default-layout/     # Layout principal con menú dinámico
│   └── pos-layout/         # Layout exclusivo para POS
├── views/                  # Páginas genéricas
│   ├── dashboard/          # Página de inicio
│   └── pages/              # Login, Logout, 404, 403, 500
└── icons/                  # Subconjunto de íconos CoreUI
```

## Estructura Interna de cada Feature

Cada feature sigue esta convención de carpetas:

```
features/[modulo]/[recurso]/
├── [recurso].routes.ts         # Rutas del recurso
├── data/
│   ├── [recurso].models.ts     # Interfaces y tipos
│   ├── [recurso].service.ts    # Servicio HTTP principal
│   └── [otro].service.ts       # Servicios auxiliares si aplica
└── pages/
    ├── [recurso]-list/         # Componente de listado
    │   ├── *.component.ts
    │   ├── *.component.html
    │   └── *.component.scss
    └── [recurso]-form/         # Componente de formulario (crear/editar)
        ├── *.component.ts
        ├── *.component.html
        └── *.component.scss
```

## Principios de Arquitectura

- **Standalone Components**: Todos los componentes usan `standalone: true` con imports explícitos. No hay NgModules.
- **Lazy Loading**: Cada feature se carga bajo demanda con `loadChildren`.
- **Separación de responsabilidades**: La carpeta `data/` contiene modelos y servicios; `pages/` contiene solo componentes de presentación.
- **Core singleton**: Los servicios en `core/` usan `providedIn: 'root'` y nunca se duplican.
- **Sin barrel files (index.ts)**: Los imports usan rutas directas a los archivos.

## Flujo de Datos

```
Componente → Service (HttpClient) → Backend API
                ↓
         Observable<T> / signal<T>
                ↓
         Template (async pipe o effect)
```

## Routing Jerárquico

```
/login              → GuestGuard
/logout             → AuthGuard
/ (DefaultLayout)   → AuthGuard
  /dashboard
  /catalog          → permissionMatch('catalogos.ver')
  /inventory        → permissionMatch('inventario.ver')
  /operation
  /settings         → permissionMatch('settings.ver')
  /reporte          → permissionMatch('reportes.ver')
/pos                → permissionMatch(['ventas.ver', 'ventas.crear'])
/404, /403, /500
** → redirect /404
```
