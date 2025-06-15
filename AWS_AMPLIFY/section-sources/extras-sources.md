# Estructura de Archivos - Secciones Extras

*Captura directa de la pestaña Sources del navegador*

## 1. Sección de Copias de Seguridad

```plaintext
top/
├── localhost:3000/
│   ├── @id/
│   ├── @vite/
│   ├── images/
│   │   └── logo_masclet.png
│   ├── node_modules/
│   ├── scripts/
│   │   ├── block-delete-button.js
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
│       │   ├── apiConfig.ts
│       │   └── apiConfig.ts
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       │   └── pages/backup/
│       │       ├── index.astro
│       │       ├── index.astro?astro&type=script&index=0&lang.ts
│       │       └── index.astro?astro&type=script&index=1&lang.ts
│       ├── services/
│       │   ├── backupService.js
│       │   ├── backupService.js
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       ├── styles/
│       │   ├── block-buttons.css
│       │   └── backup
│       └── backup
```

**Archivos Clave:**
- `src/pages/backup/index.astro` - Página principal de copias de seguridad
- `src/services/backupService.js` - Servicio para gestión de copias de seguridad
- `src/styles/block-buttons.css` - Estilos específicos para botones de bloqueo

## 2. Sección de Notificaciones

```plaintext
top/
├── localhost:3000/
│   ├── @id/
│   ├── @vite/
│   ├── images/
│   ├── node_modules/
│   ├── scripts/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Footer.astro
│       │   │   ├── MainLayout.astro
│       │   │   ├── Navbar.astro
│       │   │   └── Sidebar.astro
│       │   ├── notifications/
│       │   │   ├── NotificationsMenu.js
│       │   │   └── NotificationsMenu.js
│       │   └── LanguageSwitcher.astro
│       ├── i18n/
│       │   ├── locales/
│       │   └── pages/
│       │       └── notifications.astro
│       │           └── notifications.astro?astro&type=script&index=0&lang.ts
│       ├── services/
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       └── notifications
```

**Archivos Clave:**
- `src/pages/notifications.astro` - Página de notificaciones del sistema
- `src/components/notifications/NotificationsMenu.js` - Componente de menú de notificaciones
- `src/services/notificationService.ts` - Servicio para gestión de notificaciones

## 3. Sección de Mi Perfil

```plaintext
top/
├── localhost:3000/
│   ├── @id/
│   │   ├── astroscripts/
│   │   │   ├── before-hydration.js
│   │   │   └── before-hydration.js
│   │   └── _x00_astro:toolbar:internal
│   ├── @vite/
│   ├── images/
│   │   ├── logo_masclet.jpg
│   │   └── logo_masclet.png
│   ├── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── profile/
│       │   │   ├── ProfileManagement.tsx
│       │   │   └── ProfileManagement.tsx
│       │   └── LanguageSwitcher.astro
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       ├── layouts/
│       │   ├── DefaultLayout.astro
│       │   ├── DefaultLayout.astro?astro&type=script&index=0&lang.ts
│       │   ├── DefaultLayout.astro?astro&type=script&index=1&lang.ts
│       │   └── DefaultLayout.astro?astro&type=style&index=0&lang.css
│       ├── middlewares/
│       │   ├── AuthMiddleware.tsx
│       │   └── AuthMiddleware.tsx
│       ├── scripts/
│       │   ├── updateUserRole.js
│       │   └── updateUserRole.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── authService.js
│       │   ├── roleService.ts
│       │   └── roleService.ts
│       ├── styles/
│       │   ├── global.css
│       │   └── lemon-squeezy.css
│       └── profile
│           ├── @react-refresh
│           └── @react-refresh
```

**Archivos Clave:**
- `src/components/profile/ProfileManagement.tsx` - Componente principal de gestión de perfil
- `src/services/authService.js` - Servicio de autenticación
- `src/services/roleService.ts` - Servicio para gestión de roles de usuario
- `src/middlewares/AuthMiddleware.tsx` - Middleware de autenticación
- `src/scripts/updateUserRole.js` - Script para actualización de roles

## 4. Sección de Configuración

```plaintext
top/
├── localhost:3000/
│   ├── @id/
│   ├── @vite/
│   ├── images/
│   ├── node_modules/
│   ├── scripts/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── notifications/
│       │   │   ├── NotificationsMenu.js
│       │   │   └── NotificationsMenu.js
│       │   └── LanguageSwitcher.astro
│       ├── i18n/
│       │   ├── locales/
│       │   │   ├── ca.json?import
│       │   │   ├── es.json?import
│       │   │   ├── config.ts
│       │   │   └── config.ts
│       ├── pages/
│       │   └── settings.astro
│       │       └── settings.astro?astro&type=script&index=0&lang.ts
│       ├── services/
│       │   ├── notificationService.ts
│       │   └── notificationService.ts
│       └── settings
```

**Archivos Clave:**
- `src/pages/settings.astro` - Página principal de configuración
- `src/services/notificationService.ts` - Servicio para notificaciones (usado posiblemente para mostrar resultados de la configuración)

## Observaciones Generales

### Copias de Seguridad
- La sección de copias de seguridad tiene su propio servicio dedicado (`backupService.js`).
- Cuenta con estilos específicos para los botones de bloqueo (`block-buttons.css`).
- Se integra con el sistema de notificaciones para informar sobre el resultado de operaciones.

### Notificaciones
- Implementa un menú específico para notificaciones (`NotificationsMenu.js`).
- Cuenta con un servicio dedicado para gestión de notificaciones.
- Es probable que se utilice por múltiples secciones de la aplicación para mostrar alertas y confirmaciones.

### Mi Perfil
- Utiliza React con TypeScript para la gestión de perfil.
- Implementa un middleware de autenticación.
- Incluye funcionalidades para actualización de roles de usuario.
- Utiliza estilos globales y específicos (global.css y lemon-squeezy.css).

### Configuración
- Es una sección más simple implementada principalmente en Astro.
- Se integra con el sistema de notificaciones.
- Probablemente utiliza i18n para la internacionalización de opciones de configuración.

### Componentes Compartidos
- Todas las secciones utilizan los componentes de layout comunes.
- El `LanguageSwitcher.astro` está presente en todas las secciones.
- El sistema de notificaciones es transversal a todas las secciones.
- Todas las secciones implementan internacionalización mediante el directorio `i18n`.

### Tecnologías
- Se observa una combinación de Astro y React/TypeScript.
- Los servicios que requieren más lógica de negocio parecen estar en TypeScript (`.ts`).
- Los componentes de interfaz de usuario más complejos utilizan React (`.tsx`).
- Los scripts de utilidad están mayoritariamente en JavaScript plano (`.js`).
