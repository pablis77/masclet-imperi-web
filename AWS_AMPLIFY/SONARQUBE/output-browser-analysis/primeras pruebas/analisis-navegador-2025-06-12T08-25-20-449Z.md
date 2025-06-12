# Informe de Análisis de Estructura del Navegador

Fecha: 12/6/2025, 10:25:20

## Resumen

- **Rutas analizadas**: 19
- **Total de endpoints API detectados**: 35
- **Únicas rutas API detectadas**: 21

## Rutas y Componentes

### Panel de Control - Masclet Imperi

- **Scripts**: 26
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 11 botones, 0 formularios
- **Llamadas API**: 3
- **Componentes sources detectados**: 128
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/dashboard/resumen-card`
- `/api/v1/dashboard/stats`
- `/api/v1/dashboard/partos`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 128 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
components/dashboardv2/DashboardV2.tsx
components/dashboard/components/UIComponents.tsx
components/dashboard/sections/PartosSection.tsx
components/dashboardv2/cards/ResumenOriginalCard.tsx
components/dashboardv2/cards/DiagnosticoDataCard.tsx
components/dashboard/components/ChartComponents.tsx
```

##### Sección: pages

```
pages/index.astro?astro&type=script&index=0&lang.ts
pages/index.astro?astro&type=script&index=1&lang.ts
```

##### Sección: services

```
services/notificationService.ts
services/apiService.ts
```

##### Sección: utils

```
utils/chartConfig.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react-chartjs-2.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chart__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@tremor_react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-3X7I6VHX.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-6TQW37SY.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-SAXXYH2W.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/` 🟢 (activo)
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Dashboard

- **Scripts**: 23
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 11 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 128
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 128 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
components/dashboard/DashboardNew.tsx
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Gestión de Animales

- **Scripts**: 27
- **Estilos**: 0
- **Enlaces**: 75
- **Elementos interactivos**: 22 botones, 0 formularios
- **Llamadas API**: 2
- **Componentes sources detectados**: 143
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/animals`
- `/api/v1/animals/`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 143 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
components/animals/AnimalTable.tsx
components/animals/AnimalFilters.tsx
```

##### Sección: pages

```
pages/animals/index.astro?astro&type=script&index=0&lang.ts
pages/animals/index.astro?astro&type=style&index=0&lang.css
```

##### Sección: services

```
services/notificationService.ts
services/animalService.ts
services/mockData.ts
services/api.ts
services/apiService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/ca.json?import
i18n/locales/es.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals` 🟢 (activo)
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Login - Masclet Imperi | Masclet Imperi

- **Scripts**: 9
- **Estilos**: 0
- **Enlaces**: 0
- **Elementos interactivos**: 1 botones, 1 formularios
- **Llamadas API**: 4
- **Componentes sources detectados**: 27
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/auth/login`
- `/api/v1/dashboard/resumen-card`
- `/api/v1/dashboard/stats`
- `/api/v1/dashboard/partos`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| src/layouts/LoginLayout.astro | BODY | 26:91 |
| src/layouts/LoginLayout.astro | MAIN | 28:26 |
| src/pages/login.astro | DIV | 7:100 |
| src/pages/login.astro | DIV | 8:44 |
| src/pages/login.astro | DIV | 11:47 |
| src/pages/login.astro | IMG | 13:10 |
| src/pages/login.astro | H2 | 15:76 |
| src/pages/login.astro | P | 18:59 |
| src/pages/login.astro | DIV | 22:74 |
| src/pages/login.astro | FORM | 23:48 |
| src/pages/login.astro | DIV | 24:16 |
| src/pages/login.astro | LABEL | 25:83 |
| src/pages/login.astro | DIV | 28:31 |
| src/pages/login.astro | INPUT | 29:16 |
| src/pages/login.astro | DIV | 33:16 |

**Nota**: Se muestran 15 de 27 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/modals/PasswordErrorModal.tsx
```

##### Sección: pages

```
pages/login.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/apiService.ts
```

##### Sección: styles

```
styles/global.css
styles/lemon-squeezy.css
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

### Importación de Datos

- **Scripts**: 29
- **Estilos**: 0
- **Enlaces**: 31
- **Elementos interactivos**: 28 botones, 0 formularios
- **Llamadas API**: 1
- **Componentes sources detectados**: 148
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/imports/`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 148 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
components/admin/ResetDatabaseButton.tsx
components/imports/ImportContainer.tsx
components/imports/ImportForm.tsx
components/imports/ImportHistory.tsx
```

##### Sección: pages

```
pages/imports/index.astro?astro&type=script&index=0&lang.ts
pages/imports/index.astro?astro&type=script&index=1&lang.ts
pages/imports/index.astro?astro&type=style&index=0&lang.css
```

##### Sección: services

```
services/notificationService.ts
services/adminService.ts
services/importService.ts
services/apiService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@react-refresh
config/apiConfig.ts
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports` 🟢 (activo)
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Login - Masclet Imperi | Masclet Imperi

- **Scripts**: 9
- **Estilos**: 0
- **Enlaces**: 0
- **Elementos interactivos**: 1 botones, 1 formularios
- **Llamadas API**: 4
- **Componentes sources detectados**: 27
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/auth/login`
- `/api/v1/dashboard/resumen-card`
- `/api/v1/dashboard/stats`
- `/api/v1/dashboard/partos`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| src/layouts/LoginLayout.astro | BODY | 26:91 |
| src/layouts/LoginLayout.astro | MAIN | 28:26 |
| src/pages/login.astro | DIV | 7:100 |
| src/pages/login.astro | DIV | 8:44 |
| src/pages/login.astro | DIV | 11:47 |
| src/pages/login.astro | IMG | 13:10 |
| src/pages/login.astro | H2 | 15:76 |
| src/pages/login.astro | P | 18:59 |
| src/pages/login.astro | DIV | 22:74 |
| src/pages/login.astro | FORM | 23:48 |
| src/pages/login.astro | DIV | 24:16 |
| src/pages/login.astro | LABEL | 25:83 |
| src/pages/login.astro | DIV | 28:31 |
| src/pages/login.astro | INPUT | 29:16 |
| src/pages/login.astro | DIV | 33:16 |

**Nota**: Se muestran 15 de 27 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/modals/PasswordErrorModal.tsx
```

##### Sección: pages

```
pages/login.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/apiService.ts
```

##### Sección: styles

```
styles/global.css
styles/lemon-squeezy.css
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

### [OBSOLETA] 404: Not Found

⚠️ **Aviso**: Esta ruta está marcada como obsoleta y debería eliminarse.

- **Scripts**: 0
- **Estilos**: 0
- **Enlaces**: 0
- **Elementos interactivos**: 0 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 0
- **Recursos de red cargados**: 0

### Explotaciones (React)

- **Scripts**: 25
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 24 botones, 0 formularios
- **Llamadas API**: 11
- **Componentes sources detectados**: 126
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/animals/`
- `/api/v1/dashboard/explotacions/Gurans`
- `/api/v1/dashboard/explotacions/LA%20CASANOVA`
- `/api/v1/dashboard/explotacions/El%20Grau`
- `/api/v1/dashboard/explotacions/Madrid`
- `/api/v1/dashboard/explotacions/Guadalajara`
- `/api/v1/dashboard/explotacions/Gurans/stats`
- `/api/v1/dashboard/explotacions/LA%20CASANOVA/stats`
- `/api/v1/dashboard/explotacions/El%20Grau/stats`
- `/api/v1/dashboard/explotacions/Madrid/stats`
- `/api/v1/dashboard/explotacions/Guadalajara/stats`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 126 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
components/explotaciones-react/ExplotacionesPage.tsx
```

##### Sección: pages

```
pages/explotaciones-react/index.astro?astro&type=style&index=0&lang.css
```

##### Sección: services

```
services/notificationService.ts
services/apiService.ts
```

##### Sección: styles

```
styles/explotaciones-card.css
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@react-refresh
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react` 🟢 (activo)
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### [OBSOLETA] 404: Not Found

⚠️ **Aviso**: Esta ruta está marcada como obsoleta y debería eliminarse.

- **Scripts**: 0
- **Estilos**: 0
- **Enlaces**: 0
- **Elementos interactivos**: 0 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 0
- **Recursos de red cargados**: 0

### Copias de Seguridad del Sistema - Masclet Imperi

- **Scripts**: 29
- **Estilos**: 1
- **Enlaces**: 36
- **Elementos interactivos**: 27 botones, 0 formularios
- **Llamadas API**: 1
- **Componentes sources detectados**: 206
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/backup/list`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 206 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/backup/index.astro?astro&type=script&index=0&lang.ts
pages/backup/index.astro?astro&type=script&index=1&lang.ts
```

##### Sección: services

```
services/backupService.js
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/block-delete-button.js
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/styles/block-buttons.css
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
config/apiConfig.ts
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup` 🟢 (activo)
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Editar Perfil | Masclet Imperi | Masclet Imperi

- **Scripts**: 20
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 12 botones, 1 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 129
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| src/layouts/DefaultLayout.astro | BODY | 41:91 |
| components/layout/Navbar.astro | HEADER | 86:63 |
| components/layout/Navbar.astro | DIV | 87:78 |
| components/layout/Navbar.astro | DIV | 89:84 |
| components/layout/Navbar.astro | NAV | 110:56 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | A | 121:10 |
| components/layout/Navbar.astro | DIV | 129:36 |
| components/layout/Navbar.astro | BUTTON | 131:86 |
| components/layout/Navbar.astro | DIV | 136:61 |
| src/components/LanguageSwitcher.astro | DIV | 6:32 |

**Nota**: Se muestran 15 de 129 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/profile/ProfileManagement.tsx
```

##### Sección: layouts

```
layouts/DefaultLayout.astro?astro&type=script&index=0&lang.ts
layouts/DefaultLayout.astro?astro&type=script&index=1&lang.ts
layouts/DefaultLayout.astro?astro&type=style&index=0&lang.css
```

##### Sección: services

```
services/authService.js
services/roleService.ts
```

##### Sección: styles

```
styles/global.css
styles/lemon-squeezy.css
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/jwt-decode.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
scripts/updateUserRole.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
middlewares/AuthMiddleware.tsx
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`

### listings.title

- **Scripts**: 23
- **Estilos**: 0
- **Enlaces**: 34
- **Elementos interactivos**: 12 botones, 0 formularios
- **Llamadas API**: 1
- **Componentes sources detectados**: 159
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/listados`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 159 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/listados/index.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/listados-service.ts
services/apiService.ts
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊 Panel de Control → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥 Importaciones → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Alertas del sistema

- **Scripts**: 23
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 18 botones, 0 formularios
- **Llamadas API**: 4
- **Componentes sources detectados**: 149
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/notifications`
- `/api/v1/notifications`
- `/api/v1/notifications/`
- `/api/v1/notifications/`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 149 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/notifications.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### settings.title

- **Scripts**: 23
- **Estilos**: 0
- **Enlaces**: 30
- **Elementos interactivos**: 14 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 173
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 173 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/settings.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Login - Masclet Imperi | Masclet Imperi

- **Scripts**: 9
- **Estilos**: 0
- **Enlaces**: 0
- **Elementos interactivos**: 1 botones, 1 formularios
- **Llamadas API**: 4
- **Componentes sources detectados**: 27
- **Recursos de red cargados**: 0

#### Endpoints detectados:

- `/api/v1/auth/login`
- `/api/v1/dashboard/resumen-card`
- `/api/v1/dashboard/stats`
- `/api/v1/dashboard/partos`

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| src/layouts/LoginLayout.astro | BODY | 26:91 |
| src/layouts/LoginLayout.astro | MAIN | 28:26 |
| src/pages/login.astro | DIV | 7:100 |
| src/pages/login.astro | DIV | 8:44 |
| src/pages/login.astro | DIV | 11:47 |
| src/pages/login.astro | IMG | 13:10 |
| src/pages/login.astro | H2 | 15:76 |
| src/pages/login.astro | P | 18:59 |
| src/pages/login.astro | DIV | 22:74 |
| src/pages/login.astro | FORM | 23:48 |
| src/pages/login.astro | DIV | 24:16 |
| src/pages/login.astro | LABEL | 25:83 |
| src/pages/login.astro | DIV | 28:31 |
| src/pages/login.astro | INPUT | 29:16 |
| src/pages/login.astro | DIV | 33:16 |

**Nota**: Se muestran 15 de 27 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/modals/PasswordErrorModal.tsx
```

##### Sección: pages

```
pages/login.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/apiService.ts
```

##### Sección: styles

```
styles/global.css
styles/lemon-squeezy.css
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/@astrojs_react_client__js.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/react.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-D2P3IO6H.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-XRPIAATO.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/@id/astro:scripts/before-hydration.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
http://172.20.160.1:3000/@react-refresh
```

### Ficha de Animal

- **Scripts**: 31
- **Estilos**: 0
- **Enlaces**: 36
- **Elementos interactivos**: 18 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 247
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 247 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/animals/[id].astro?astro&type=script&index=0&lang.ts
pages/animals/[id].astro?astro&type=script&index=1&lang.ts
pages/animals/[id].astro?astro&type=script&index=2&lang.ts
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/animal-history.js
http://172.20.160.1:3000/scripts/editar-parto-v4.js
http://172.20.160.1:3000/scripts/permissions-ui.js
https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js
http://172.20.160.1:3000/scripts/block-delete-button.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals` 🟢 (activo)
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Editar 1

- **Scripts**: 30
- **Estilos**: 0
- **Enlaces**: 33
- **Elementos interactivos**: 21 botones, 2 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 222
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 222 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/animals/AnimalForm.astro?astro&type=script&index=0&lang.ts
components/animals/HabitualesForm.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/animals/update/[id].astro?astro&type=script&index=0&lang.ts
pages/animals/update/[id].astro?astro&type=script&index=1&lang.ts
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/block-delete-button.js
http://172.20.160.1:3000/scripts/translation-fixer.js
http://172.20.160.1:3000/scripts/permissions-ui.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals` 🟢 (activo)
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Ficha de Animal

- **Scripts**: 31
- **Estilos**: 0
- **Enlaces**: 36
- **Elementos interactivos**: 27 botones, 0 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 286
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 286 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/animals/[id].astro?astro&type=script&index=0&lang.ts
pages/animals/[id].astro?astro&type=script&index=1&lang.ts
pages/animals/[id].astro?astro&type=script&index=2&lang.ts
```

##### Sección: services

```
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/animal-history.js
http://172.20.160.1:3000/scripts/editar-parto-v4.js
http://172.20.160.1:3000/scripts/permissions-ui.js
https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js
http://172.20.160.1:3000/scripts/block-delete-button.js
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals` 🟢 (activo)
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

### Registrar Nuevo Animal

- **Scripts**: 25
- **Estilos**: 0
- **Enlaces**: 32
- **Elementos interactivos**: 12 botones, 1 formularios
- **Llamadas API**: 0
- **Componentes sources detectados**: 196
- **Recursos de red cargados**: 0

#### Componentes y archivos fuente:

| Archivo fuente | Componente | Ubicación |
|---------------|-----------|-----------|
| components/layout/MainLayout.astro | BODY | 41:91 |
| components/layout/MainLayout.astro | DIV | 42:36 |
| components/layout/MainLayout.astro | DIV | 44:59 |
| components/layout/Sidebar.astro | ASIDE | 115:181 |
| components/layout/Sidebar.astro | DIV | 117:132 |
| components/layout/Sidebar.astro | DIV | 118:65 |
| components/layout/Sidebar.astro | IMG | 119:8 |
| components/layout/Sidebar.astro | BUTTON | 124:149 |
| components/layout/Sidebar.astro | SPAN | 125:28 |
| components/layout/Sidebar.astro | DIV | 129:43 |
| components/layout/Sidebar.astro | P | 130:92 |
| components/layout/Sidebar.astro | NAV | 136:63 |
| components/layout/Sidebar.astro | DIV | 138:25 |
| components/layout/Sidebar.astro | H3 | 140:158 |
| components/layout/Sidebar.astro | DIV | 148:32 |

**Nota**: Se muestran 15 de 196 componentes detectados.

#### Listado completo de archivos por sección

Este listado completo es fundamental para garantizar que se incluyan todos los archivos en el despliegue.

##### Sección: components

```
components/layout/MainLayout.astro?astro&type=script&index=0&lang.ts
components/layout/MainLayout.astro?astro&type=script&index=1&lang.ts
components/layout/Navbar.astro?astro&type=script&index=0&lang.ts
components/layout/Navbar.astro?astro&type=script&index=1&lang.ts
components/LanguageSwitcher.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=0&lang.ts
components/layout/Sidebar.astro?astro&type=script&index=1&lang.ts
components/layout/Footer.astro?astro&type=script&index=0&lang.ts
components/animals/CreateAnimalForm.astro?astro&type=script&index=0&lang.ts
components/ui/MessageContainer.astro?astro&type=script&index=0&lang.ts
components/LanguageSwitcher.astro?astro&type=style&index=0&lang.css
components/layout/Sidebar.astro?astro&type=style&index=0&lang.css
components/layout/Footer.astro?astro&type=style&index=0&lang.css
components/layout/MainLayout.astro?astro&type=style&index=0&lang.css
components/notifications/NotificationsMenu.js
```

##### Sección: pages

```
pages/animals/new.astro?astro&type=script&index=0&lang.ts
```

##### Sección: services

```
services/animalService.ts
services/apiService.ts
services/mockData.ts
services/api.ts
services/notificationService.ts
```

##### Sección: i18n

```
i18n/config.ts
i18n/locales/es.json?import
i18n/locales/ca.json?import
```

##### Sección: node_modules

```
http://172.20.160.1:3000/@fs/C:/Proyectos/claude/masclet-imperi-web/frontend/node_modules/astro/dist/runtime/client/dev-toolbar/entrypoint.js?v=5e89932e
http://172.20.160.1:3000/node_modules/@astrojs/tailwind/base.css
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/helpers.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/node_modules/vite/dist/client/env.mjs
http://172.20.160.1:3000/node_modules/.vite/deps/nanostores.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/chunk-EWTE5DHJ.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/axios.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/astro.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/xray.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/settings.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/toolbar.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/badge.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/button.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icon.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/card.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/select.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/toggle.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/tooltip.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/radio-checkbox.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/ui-library/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/icons.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/utils/highlight.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-item.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-list-window.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/ui/audit-ui.js?v=5e89932e
http://172.20.160.1:3000/node_modules/html-escaper/esm/index.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/a11y.js?v=5e89932e
http://172.20.160.1:3000/node_modules/astro/dist/runtime/client/dev-toolbar/apps/audit/rules/perf.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___axobject-query.js?v=5e89932e
http://172.20.160.1:3000/node_modules/.vite/deps/astro___aria-query.js?v=5e89932e
```

##### Sección: otros

```
http://172.20.160.1:3000/scripts/bloquear-eliminar-parto.js
http://172.20.160.1:3000/scripts/bloquear-editar-parto.js
http://172.20.160.1:3000/scripts/bloquear-actualizar-animal.js
http://172.20.160.1:3000/scripts/bloquear-acciones-listados.js
http://172.20.160.1:3000/@vite/client
http://172.20.160.1:3000/scripts/permissions-ui.js
stores/messageStore.ts
stores/cacheStore.ts
http://172.20.160.1:3000/@id/__x00__astro:toolbar:internal
```

#### Enlaces de navegación detectados:

- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 📋 Listados → `/listados`
- 📥  Importación → `/imports`
- 👥  Usuarios → `/users`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals` 🟢 (activo)
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`
- 📊  Dashboard → `/`
- 🏡  Explotaciones → `/explotaciones-react`
- 🐄  Animales → `/animals`
- 👥  Usuarios → `/users`
- 📥  Importación → `/imports`
- 💾  Copias de seguridad → `/backup`

## Rutas obsoletas detectadas

Las siguientes rutas están marcadas como obsoletas y deberían ser revisadas para su eliminación:

- `/explotacions` - Reemplazar con versión actualizada o eliminar
- `/backups` - Reemplazar con versión actualizada o eliminar

### Recomendaciones para rutas obsoletas

1. Verificar si existen llamadas a estas rutas desde otros componentes
2. Asegurar que todas las funcionalidades han sido migradas a las nuevas rutas
3. Eliminar las rutas obsoletas del código y de la configuración
4. Actualizar documentación y referencias

## Endpoints más utilizados

| Endpoint | Frecuencia |
| -------- | ----------- |
| `/api/v1/dashboard/resumen-card` | 4 |
| `/api/v1/dashboard/stats` | 4 |
| `/api/v1/dashboard/partos` | 4 |
| `/api/v1/auth/login` | 3 |
| `/api/v1/animals/` | 2 |
| `/api/v1/notifications` | 2 |
| `/api/v1/notifications/` | 2 |
| `/api/v1/animals` | 1 |
| `/api/v1/imports/` | 1 |
| `/api/v1/dashboard/explotacions/Gurans` | 1 |
| `/api/v1/dashboard/explotacions/LA%20CASANOVA` | 1 |
| `/api/v1/dashboard/explotacions/El%20Grau` | 1 |
| `/api/v1/dashboard/explotacions/Madrid` | 1 |
| `/api/v1/dashboard/explotacions/Guadalajara` | 1 |
| `/api/v1/dashboard/explotacions/Gurans/stats` | 1 |
| `/api/v1/dashboard/explotacions/LA%20CASANOVA/stats` | 1 |
| `/api/v1/dashboard/explotacions/El%20Grau/stats` | 1 |
| `/api/v1/dashboard/explotacions/Madrid/stats` | 1 |
| `/api/v1/dashboard/explotacions/Guadalajara/stats` | 1 |
| `/api/v1/backup/list` | 1 |
