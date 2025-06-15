# Estructura de Archivos - Sección LISTADOS

*Captura directa de la pestaña Sources del navegador*

## Sección Principal de Listados

```plaintext
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
│   ├── @id/
│   │   └── _x00_astro:toolbar:internal
│   │       └── _x00_astro:toolbar:internal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── images/
│   │   ├── logo_masclet.jpg
│   │   ├── logo_masclet.png
│   │   ├── toro_sin_borde_2.png
│   │   ├── vaca_azul.png
│   │   └── vaca_blanca.png
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
│       │   └── apiConfig.centralizado.ts
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       │   └── pages/listados/
│       │       ├── index.astro
│       │       └── index.astro?astro&type=script&index=0&lang.ts
│       ├── services/
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiService.ts
│       │   ├── apiService.ts
│       │   ├── listados-service.ts
│       │   ├── listados-service.ts
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       └── listados
```

## Subsección Visualizar Listados

```plaintext
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
│   ├── @id/
│   │   └── _x00_astro:toolbar:internal
│   │       └── _x00_astro:toolbar:internal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── images/
│   │   ├── logo_masclet.jpg
│   │   ├── logo_masclet.png
│   │   ├── toro_sin_borde_2.png
│   │   ├── vaca_azul.png
│   │   └── vaca_blanca.png
│   ├── listados/
│   │   └── 15
│   ├── node_modules/
│   ├── scripts/
│   │   ├── bloquear-acciones-listados.js
│   │   ├── bloquear-actualizar-animal.js
│   │   ├── bloquear-editar-parto.js
│   │   ├── bloquear-eliminar-parto.js
│   │   └── permissions-ui.js
│   └── src/
│       ├── components/
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
│       │   └── apiConfig.centralizado.ts
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       │   └── pages/listados/
│       │       ├── [id].astro
│       │       └── [id].astro?astro&type=script&index=0&lang.ts
│       ├── services/
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiService.ts
│       │   ├── apiService.ts
│       │   ├── listados-service.ts
│       │   ├── listados-service.ts
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
```

## Subsección Editar Listado

```plaintext
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
│   ├── @id/
│   │   └── _x00_astro:toolbar:internal
│   │       └── _x00_astro:toolbar:internal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── images/
│   │   ├── logo_masclet.jpg
│   │   ├── logo_masclet.png
│   │   ├── toro_sin_borde_2.png
│   │   ├── vaca_azul.png
│   │   └── vaca_blanca.png
│   ├── listados/editar/
│   │   └── 15
│   ├── node_modules/
│   ├── scripts/
│   │   ├── bloquear-acciones-listados.js
│   │   ├── bloquear-actualizar-animal.js
│   │   ├── bloquear-editar-parto.js
│   │   ├── bloquear-eliminar-parto.js
│   │   └── permissions-ui.js
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── (estructura similar a otras secciones)
│       │   ├── notifications/
│       │   │   ├── NotificationsMenu.js
│       │   │   └── NotificationsMenu.js
│       │   ├── LanguageSwitcher.astro
│       │   ├── LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
│       │   └── LanguageSwitcher.astro?astro&type=style&index=0&lang.css
│       ├── config/
│       │   ├── apiConfig.centralizado.ts
│       │   └── apiConfig.centralizado.ts
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       │   └── pages/listados/editar/
│       │       ├── [id].astro
│       │       └── [id].astro?astro&type=script&index=0&lang.ts
│       ├── services/
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiService.ts
│       │   ├── apiService.ts
│       │   ├── listados-service.ts
│       │   ├── listados-service.ts
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
```

## Archivos Clave

### Vistas Principales
- `src/pages/listados/index.astro` - Página principal del listado de listados
- `src/pages/listados/[id].astro` - Detalle de un listado específico
- `src/pages/listados/editar/[id].astro` - Página de edición de un listado

### Servicios 
- `src/services/listados-service.ts` - Servicios específicos para manipulación de listados
- `src/services/apiService.ts` - Servicios genéricos de API
- `src/services/apiConfigAdapter.ts` - Adaptador para la configuración centralizada

### Scripts Específicos
- `scripts/bloquear-acciones-listados.js` - Script para manejar el bloqueo de acciones en listados

## Observaciones Principales

### Diferencias entre Sección Principal y Visualizar Listados

La principal diferencia entre la sección principal y la subsección de visualizar listados es:

1. **Ruta**: 
   - Sección principal: `/listados/` (muestra un índice de todos los listados)
   - Visualizar listado: `/listados/15` (muestra un listado específico por ID)

2. **Archivos clave**:
   - Sección principal: Usa `index.astro`
   - Visualizar listado: Usa `[id].astro` (ruta dinámica)

3. **Funcionalidad**:
   - Sección principal: Lista todos los listados disponibles
   - Visualizar listado: Muestra el detalle y contenido de un listado específico

### Sección Editar Listado

La subsección de editar listado tiene las siguientes características distintivas:

1. **Ruta anidada**: `/listados/editar/15` utiliza una estructura más profunda
2. **Componentes específicos**: Tiene componentes de edición que no están presentes en las vistas de solo visualización
3. **Scripts específicos**: Utiliza scripts que manejan la edición y validación de formularios específicos para listados
