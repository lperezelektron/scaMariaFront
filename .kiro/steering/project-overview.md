# Visión General del Proyecto

## Nombre y Propósito
Aplicación ERP web llamada **Limonero** — sistema de gestión empresarial con módulos de catálogos, inventario, operaciones (compras/ventas), reportes y punto de venta (POS).

## Stack Tecnológico
- **Framework**: Angular 18.2.9 con standalone components
- **Lenguaje**: TypeScript 5.5.4 (strict mode habilitado)
- **UI Library**: CoreUI 5.2.22
- **Data Grid**: ag-Grid 35.1.0
- **Charts**: Chart.js 4.4.6 + ag-Charts 13.1.0
- **Reactive**: RxJS 7.8.1
- **Build**: Angular CLI 18.2.10 con Vite/esbuild
- **Testing**: Karma 6.4.4 + Jasmine 5.4.0
- **Node**: 22.22.0 (ver `.nvmrc`)
- **Locale**: `es-MX`

## Comandos Principales
```bash
npm start       # Servidor de desarrollo (puerto 4200)
npm run build   # Build de producción
npm run watch   # Build en modo watch
npm test        # Ejecutar tests con Karma/Chrome
```

## Configuración Notable
- **Hash routing** habilitado (`withHashLocation`) para compatibilidad con servidores sin soporte SPA
- **View transitions** para animaciones entre rutas
- **In-memory scrolling** — vuelve al top en cada navegación
- **Same URL navigation**: recarga la ruta actual si se navega de nuevo
- **Router initial navigation** bloqueante (espera resolvers)
- **LOCALE_ID**: `es-MX` registrado globalmente

## Módulos de Negocio
| Módulo | Ruta | Permiso requerido |
|--------|------|-------------------|
| Dashboard | `/dashboard` | Autenticado |
| Catálogos | `/catalog` | `catalogos.ver` |
| Inventario | `/inventory` | `inventario.ver` |
| Operaciones | `/operation` | — |
| Configuración | `/settings` | `settings.ver` |
| Reportes | `/reporte` | `reportes.ver` |
| POS | `/pos` | `ventas.ver` o `ventas.crear` |
