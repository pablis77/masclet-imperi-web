# Estructura de Archivos - Sección IMPORTACIONES

*Captura directa de la pestaña Sources del navegador*

## Estructura Principal de Importaciones

```plaintext
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
│   ├── @id/
│   │   ├── astroscripts/
│   │   └── _x00_astro:toolbar:internal
│   │       └── _x00_astro:toolbar:internal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── node_modules/
│   │   ├── .vite/deps/
│   │   ├── @astrojs/tailwind/
│   │   ├── astro/
│   │   └── html-escaper/esm/
│   ├── scripts/
│   │   ├── bloquear-acciones-listados.js
│   │   ├── bloquear-actualizar-animal.js
│   │   ├── bloquear-editar-parto.js
│   │   ├── bloquear-eliminar-parto.js
│   │   └── permissions-ui.js
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   ├── ResetDatabaseButton.tsx
│       │   │   └── ResetDatabaseButton.tsx
│       │   ├── imports/
│       │   │   ├── ImportContainer.tsx
│       │   │   ├── ImportContainer.tsx
│       │   │   ├── ImportForm.tsx
│       │   │   ├── ImportForm.tsx
│       │   │   ├── ImportHistory.tsx
│       │   │   └── ImportHistory.tsx
│       │   ├── layout/
│       │   │   ├── Footer.astro
│       │   │   ├── Footer.astro?astro&type=script&index=0&lang.ts
│       │   │   ├── Footer.astro?astro&type=style&index=0&lang.css
│       │   │   ├── MainLayout.astro
│       │   │   ├── MainLayout.astro?astro&type=script&index=0&lang.ts
│       │   │   ├── MainLayout.astro?astro&type=script&index=1&lang.ts
│       │   │   ├── MainLayout.astro?astro&type=style&index=0&lang.css
│       │   │   ├── Navbar.astro
│       │   │   ├── Navbar.astro?astro&type=script&index=0&lang.ts
│       │   │   ├── Navbar.astro?astro&type=script&index=1&lang.ts
│       │   │   ├── Sidebar.astro
│       │   │   ├── Sidebar.astro?astro&type=script&index=0&lang.ts
│       │   │   ├── Sidebar.astro?astro&type=script&index=1&lang.ts
│       │   │   └── Sidebar.astro?astro&type=style&index=0&lang.css
│       │   ├── notifications/
│       │   │   ├── NotificationsMenu.js
│       │   │   └── NotificationsMenu.js
│       │   ├── LanguageSwitcher.astro
│       │   ├── LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
│       │   └── LanguageSwitcher.astro?astro&type=style&index=0&lang.css
│       ├── config/
│       │   ├── apiConfig.centralizado.ts
│       │   ├── apiConfig.centralizado.ts
│       │   ├── api.ts
│       │   └── api.ts
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       │   └── pages/imports/
│       │       ├── index.astro
│       │       ├── index.astro?astro&type=script&index=0&lang.ts
│       │       ├── index.astro?astro&type=script&index=1&lang.ts
│       │       └── index.astro?astro&type=style&index=0&lang.css
│       ├── services/
│       │   ├── adminService.ts
│       │   ├── adminService.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiService.ts
│       │   ├── apiService.ts
│       │   ├── importService.ts
│       │   ├── importService.ts
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       └── imports
│           ├── @react-refresh
│           └── @react-refresh
```

## Archivos Clave

### Componentes Específicos de Importación
- `src/components/imports/ImportContainer.tsx` - Contenedor principal para la sección de importaciones
- `src/components/imports/ImportForm.tsx` - Formulario para cargar y configurar importaciones
- `src/components/imports/ImportHistory.tsx` - Historial de importaciones previas

### Servicios Relacionados
- `src/services/importService.ts` - Servicios específicos para la funcionalidad de importación
- `src/services/adminService.ts` - Servicios administrativos (posiblemente usado para resetear datos)

### Páginas
- `src/pages/imports/index.astro` - Página principal de importaciones

### Componentes Administrativos
- `src/components/admin/ResetDatabaseButton.tsx` - Botón para resetear la base de datos

## Observaciones

- La sección de importaciones está implementada con una combinación de React (componentes `.tsx`) y Astro (estructura de página).
- Incluye un componente administrativo para resetear la base de datos, lo que sugiere que esta sección está diseñada para usuarios con permisos administrativos.
- El componente `ImportHistory.tsx` proporciona seguimiento de las importaciones realizadas anteriormente, permitiendo revisar y posiblemente revertir o repetir importaciones.
- La implementación del contenedor (`ImportContainer.tsx`) sugiere que se utiliza un patrón de diseño donde la lógica principal está encapsulada en este componente.
- El servicio `importService.ts` probablemente contiene la lógica para comunicarse con el backend y gestionar el proceso de importación.
- Esta sección está estrechamente relacionada con la administración del sistema, como lo evidencia la inclusión del botón de reseteo de base de datos.
- No aparecen subsecciones específicas como en otras partes de la aplicación, lo que sugiere que esta funcionalidad está centralizada en una única vista.
