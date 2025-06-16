# Estructura de Archivos - Sección USUARIOS

*Captura directa de la pestaña Sources del navegador*

## Estructura Principal de Usuarios

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
│       │   ├── common/
│       │   │   ├── ConfirmDialog.tsx
│       │   │   ├── ConfirmDialog.tsx
│       │   │   ├── Pagination.tsx
│       │   │   └── Pagination.tsx
│       │   ├── guards/
│       │   │   ├── RoleGuard.tsx
│       │   │   └── RoleGuard.tsx
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
│       │   ├── users/
│       │   │   ├── UserForm.tsx
│       │   │   ├── UserForm.tsx
│       │   │   ├── UserTable.tsx
│       │   │   ├── UserTable.tsx
│       │   │   ├── UsersManagement.tsx
│       │   │   └── UsersManagement.tsx
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
│       │   └── (otras estructuras)
│       ├── services/
│       │   ├── api.ts
│       │   ├── api.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── apiConfigAdapter.ts
│       │   ├── authService.js
│       │   ├── authService.js
│       │   ├── notificationService.ts
│       │   ├── notificationService.ts
│       │   ├── roleService.ts
│       │   ├── roleService.ts
│       │   ├── userServiceProxy.ts
│       │   └── userServiceProxy.ts
│       └── users
│           ├── @react-refresh
│           └── @react-refresh
```

## Archivos Clave

### Componentes de Usuario
- `src/components/users/UserForm.tsx` - Formulario para creación/edición de usuarios
- `src/components/users/UserTable.tsx` - Tabla para mostrar y gestionar usuarios
- `src/components/users/UsersManagement.tsx` - Componente principal de gestión de usuarios

### Servicios y Autenticación
- `src/services/authService.js` - Servicio de autenticación
- `src/services/roleService.ts` - Servicio para gestión de roles
- `src/services/userServiceProxy.ts` - Proxy para servicios de usuario

### Componentes de Seguridad
- `src/components/guards/RoleGuard.tsx` - Componente para control de acceso basado en roles
- `src/components/common/ConfirmDialog.tsx` - Diálogos de confirmación (usado para acciones críticas como eliminar usuarios)

## Observaciones

- La sección de usuarios está implementada en React (componentes `.tsx`) a diferencia de otras áreas que usan Astro.
- Contiene un sistema de roles y permisos integrado a través de `RoleGuard.tsx` y `roleService.ts`.
- Cuenta con componentes especializados para formularios y tablas de usuarios.
- Implementa el patrón proxy para los servicios de usuario, posiblemente para agregar lógica intermedia de autenticación o transformación de datos.
- Utiliza componentes comunes como `ConfirmDialog` y `Pagination` que probablemente se comparten con otras secciones.
- Los servicios de autenticación están implementados en JavaScript (`.js`) mientras que la mayoría del código está en TypeScript (`.ts`/`.tsx`).
