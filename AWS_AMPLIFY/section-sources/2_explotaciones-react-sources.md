# Estructura de Archivos - Sección EXPLOTACIONES

*Captura directa de la pestaña Sources del navegador*

## Estructura Completa

```
top/
├── localhost:3000/
│   ├── @fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/a...
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
│       │   ├── explotaciones-react/
│       │   │   ├── ExplotacionesPage.tsx
│       │   │   └── ExplotacionesPage.tsx
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
│       │   └── pages/explotaciones-react/
│       │       └── index.astro?astro&type=style&index=0&lang.css
│       ├── services/
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiService.ts
│       │   ├── apiService.ts
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       └── styles/
│           └── explotaciones-card.css
└── explotaciones-react
    ├── @react-refresh
    └── @react-refresh
```

## Archivos Clave

### Componentes Principales de Explotaciones
- `src/components/explotaciones-react/ExplotacionesPage.tsx` - Componente principal de la página de explotaciones

### Estilos Específicos
- `src/styles/explotaciones-card.css` - Estilos para las tarjetas de explotaciones
- `src/pages/explotaciones-react/index.astro?astro&type=style&index=0&lang.css` - Estilos específicos de la página

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

### Recursos Estáticos
- `images/logo_masclet.png` - Logo de Masclet

## Observaciones
- La sección de explotaciones utiliza un único componente principal React (`ExplotacionesPage.tsx`)
- Tiene estilos CSS específicos para las tarjetas de explotaciones
- Comparte la mayoría de los componentes de layout con otras secciones
- Utiliza los mismos servicios de API y notificaciones que el dashboard
- Comparte los mismos scripts de permisos y bloqueo de acciones
- La ruta principal es `/explotaciones-react` lo que confirma que usa React para la implementación
- El sistema de internacionalización es compartido con el resto de la aplicación
