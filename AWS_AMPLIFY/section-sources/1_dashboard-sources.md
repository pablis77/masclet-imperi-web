# Estructura de Archivos - Sección DASHBOARD

*Captura directa de la pestaña Sources del navegador*

## Estructura Completa

```
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
│   │   └── entrypoint.js?v=5e89932e
│   ├── @id/
│   │   └── astro:scripts/
│   │       ├── before-hydration.js
│   │       ├── before-hydration.js
│   │       ├── _x00_astro:toolbar:internal
│   │       └── _x00_astro:toolbar:internal
│   ├── @vite/
│   │   ├── client
│   │   └── client
│   ├── images/
│   │   └── logo_masclet.png
│   ├── node_modules/
│   │   ├── .vite/deps/
│   │   │   ├── @astrojs_react_client__js.js?v=5e89932e
│   │   │   ├── @tremor_react.js?v=5e89932e
│   │   │   ├── astro__aria-query.js?v=5e89932e
│   │   │   ├── astro__axobject-query.js?v=5e89932e
│   │   │   ├── axios.js?v=5e89932e
│   │   │   ├── chart__js.js?v=5e89932e
│   │   │   ├── chunk-3X76VHX.js?v=5e89932e
│   │   │   ├── chunk-6TQW375Y.js?v=5e89932e
│   │   │   ├── chunk-D2P3IO6H.js?v=5e89932e
│   │   │   ├── chunk-EWTE5DHJ.js?v=5e89932e
│   │   │   ├── chunk-SAXYYHZW.js?v=5e89932e
│   │   │   ├── chunk-XRPIAATO.js?v=5e89932e
│   │   │   ├── react-shared-subset.js?v=5e89932e
│   │   │   ├── react.js?v=5e89932e
│   │   │   └── react_jsx-dev-runtime.js?v=5e89932e
│   │   ├── @astrojs/tailwind/
│   │   │   └── base.css
│   │   └── astro/
│   │       ├── dist/runtime/client/dev-toolbar/
│   │       └── node_modules/vite/dist/client/
│   │           └── env.mjs
│   ├── scripts/
│   │   ├── bloquear-acciones-listados.js
│   │   ├── bloquear-actualizar-animal.js
│   │   ├── bloquear-editar-parto.js
│   │   ├── bloquear-eliminar-parto.js
│   │   └── permissions-ui.js
│   └── src/
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── components/
│       │   │   │   ├── ChartComponents.tsx
│       │   │   │   ├── ChartComponents.tsx
│       │   │   │   ├── UIComponents.tsx
│       │   │   │   └── UIComponents.tsx
│       │   │   ├── sections/
│       │   │   │   ├── PartosSection.tsx
│       │   │   │   └── PartosSection.tsx
│       │   │   └── dashboardv2/
│       │   │       ├── DashboardV2.tsx
│       │   │   │ └── DashboardV2.tsx
│       │   │       ├── cards/
│       │   │       │   ├── DiagnosticoDataCard.tsx
                        ├── DiagnosticoDataCard.tsx
                        ├── ResumenOriginalCard.tsx
│       │   │       │   └── ResumenOriginalCard.tsx
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
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   ├── index.astro?astro&type=script&index=0&lang.ts
│       │   │   └── index.astro?astro&type=script&index=1&lang.ts
│       │   └── services/
│       │       ├── apiConfigAdapter.ts
│       │       ├── apiConfigAdapter.ts
│       │       ├── apiService.ts
│       │       ├── apiService.ts
│       │       ├── notificationService.ts
│       │       └── notificationService.ts
│       └── utils/
│           ├── chartConfig.ts
│           └── chartConfig.ts
└── (index)
    ├── @react-refresh
    └── @react-refresh
```

## Archivos Clave

### Componentes Principales de Dashboard
- `src/components/dashboard/components/ChartComponents.tsx` - Componentes de gráficos para el dashboard
- `src/components/dashboard/components/UIComponents.tsx` - Componentes de UI específicos para el dashboard
- `src/components/dashboard/sections/PartosSection.tsx` - Sección de partos del dashboard
- `src/components/dashboard/dashboardv2/cards/DashboardV2.tsx` - Componente principal del dashboard v2

### Layouts y Componentes Compartidos
- `src/components/layout/MainLayout.astro` - Layout principal
- `src/components/layout/Navbar.astro` - Barra de navegación
- `src/components/layout/Sidebar.astro` - Barra lateral 
- `src/components/layout/Footer.astro` - Pie de página
- `src/components/LanguageSwitcher.astro` - Selector de idioma
- `src/components/notifications/NotificationsMenu.js` - Menú de notificaciones

### Scripts de Funcionalidad
- `scripts/bloquear-acciones-listados.js` - Bloqueo de acciones en listados
- `scripts/bloquear-actualizar-animal.js` - Bloqueo de actualización de animal
- `scripts/bloquear-editar-parto.js` - Bloqueo de edición de parto
- `scripts/bloquear-eliminar-parto.js` - Bloqueo de eliminación de parto
- `scripts/permissions-ui.js` - Manejo de permisos en UI

### Configuración y Servicios
- `src/config/apiConfig.centralizado.ts` - Configuración centralizada de API
- `src/services/apiConfigAdapter.ts` - Adaptador de configuración del API
- `src/services/apiService.ts` - Servicios de API
- `src/services/notificationService.ts` - Servicios de notificaciones

### Internacionalización
- `src/i18n/locales/ca.json` - Traducción catalana
- `src/i18n/locales/es.json` - Traducción española
- `src/i18n/config.ts` - Configuración de i18n

### Utilidades
- `src/utils/chartConfig.ts` - Configuración de gráficos

### Recursos Estáticos
- `images/logo_masclet.png` - Logo de Masclet

## Observaciones
- El dashboard utiliza una estructura modular con componentes separados para gráficos, UI y secciones
- DashboardV2 es el componente principal, lo que confirma que la versión 2 es la activa
- Se utilizan scripts independientes para el manejo de permisos y bloqueos de funcionalidades
- La configuración centralizada del API está correctamente implementada
- El sistema está internacionalizado con soporte para español y catalán
