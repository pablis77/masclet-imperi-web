# LISTADO DE REQUISITOS PARA LOGIN y DASHBOARD EN PRODUCCIÓN

## 1. SCRIPTS CRÍTICOS Y ORDEN CORRECTO DE CARGA

### CORE (debe cargarse primero)

- [X] `apiConfig.BYL0hBvc.js` - Configuración de API
- [X] `apiService.DCRZ96ES.js` - Servicios de API
- [X] `config.DUTcyYPh.js` - Config i18n y sistema
- [X] `vendor.BAbXoV5j.js` - Dependencias externas
- [X] `authService.OoCTCrU.js` - Autenticación

### COMPONENTES ESTRUCTURALES (carcasa - críticos)

- [X] `MainLayout.js` - ahora si se cargan
- [X] `Navbar.js` - ahora si se cargan
- [X] `Sidebar.js` - ahora si se cargan
- [X] `Footer.js` - ahora si se cargan

### DASHBOARD (deben cargarse ANTES que cualquier otra sección)

- [X] `Dashboard2.CHYKY2KF.js` - Se carga pero hay duplicados
- [X] `DashboardNew.CHYKY2KF.js` - Se carga pero hay duplicados
- [X] `DashboardV2.D3-bt97t.js` - Se carga pero hay duplicados
- [X] `NotificationsMenu._4m-Nx7C.js` - Se carga pero hay duplicados

### SERVICIOS GLOBALES

- [X] `notificationService.DETo-XEc.js` - Error: `TypeError: t is not a function`

## 2. ARCHIVOS CSS CRÍTICOS

- [ ] CSS críticos no detectados - "⚠️ ADVERTENCIA: No se detectaron CSS críticos en el HTML generado"
- [X] Estilos base y layout - Parece que no se aplican correctamente -ya si se aplican
- [ ] Estilos de componentes - No parecen incrustarse en el HTML

## 3. ERRORES DETECTADOS EN CONSOLA

1. [ ] `hoisted.a0A2-I9N.js`: `Cannot set properties of null (setting 'textContent')`
    - Intenta manipular un DOM que aún no existe
2. [X] `notificationService.DETo-XEc.js`: `TypeError: t is not a function`
    - Posiblemente un problema con la inyección de dependencias
3. [ ] `LanguageSwitcher.astro_astro_type_script_index_0_lang.BhT4Hx0d.js`: `No se encontró el selector de idioma`
    - Componente no se encuentra en el DOM
4. [ ] `hoisted.a0A2-I9N.js`: `No se encontró la pestaña de historial`
    - Componente intentando acceder a otro que no existe

## 4. SOLUCIONES PRIORITARIAS

### 4.1 Corregir función `detectSectionFromFilename`:

- [X] Implementar patrones más estrictos basados en prefijos en lugar de substrings
- [X] Priorizar sección actual en `organizeSectionAssets`

### 4.2 Corregir errores de acceso al DOM:

- [ ] Añadir verificación de existencia antes de manipular DOM en `hoisted.a0A2-I9N.js`
- [ ] Implementar espera al evento DOMContentLoaded antes de manipular DOM
- [ ] Asegurar que la ejecución respete el ciclo de vida del DOM

### 4.3 Corregir notificationService:

- [ ] Inspeccionar implementación del servicio notificationService.js
- [ ] Corregir error `t is not a function` (posible error de minificación)
- [ ] Arreglar dependencia circular si existe

### 4.4 Integrar CSS críticos:

- [X] Identificar estilos CSS críticos para layout inicial
- [X] Asegurar que los estilos críticos se incluyan directamente en el HTML
- [X] Reemplazar parche de emergencia por solución robusta de incrustación

## 5. PROPUESTA DE SIMPLIFICACIÓN RADICAL

### 5.1. Abandonar detección dinámica por listas explícitas

- [ ] Eliminar completamente `detectSectionFromFilename`
- [ ] Crear archivo `section-manifest.json` con mapeo explícito:
  ```json
  {
    "apiConfig.js": "core",
    "Dashboard2.js": "dashboard",
    "explotacion-list.js": "explotaciones"
    // etc...
  }
  ```
- [ ] Refactorizar función de detección para usar este mapeo directo
- [ ] Implementar búsqueda exacta por nombre base (sin hash)

### 5.2. Sistema de carga en fases controladas

#### Fase 1: Core y Estructurales

- [ ] Identificar explícitamente scripts core y estructurales:
  - [ ] Listar todos los scripts core (config, api, auth, etc)
  - [ ] Listar componentes estructurales (layout, navbar, etc)
- [ ] Crear función `loadCoreScripts()` que carga solo estos scripts críticos
- [ ] Garantizar bloqueo hasta que estos scripts estén cargados

#### Fase 2: Scripts específicos de sección actual

- [ ] Crear función `loadSectionScripts(section)` para cargar scripts de sección
- [ ] Implementar detección clara de sección actual (por ruta)
- [ ] Priorizar scripts críticos de la sección actual

#### Fase 3: Scripts diferibles

- [ ] Implementar carga diferida para scripts no críticos
- [ ] Usar `requestIdleCallback` o similar para cargar en background
- [ ] Establecer prioridad clara para scripts diferibles

### 5.3. Incrustación directa de CSS crítico

- [ ] Identificar estilos críticos de layout y UI:
  - [ ] Reset CSS y estilos base
  - [ ] Grid/Layout principal
  - [ ] Estilos de navegación y componentes críticos
- [ ] Extraer manualmente estos estilos críticos a `critical.css`
- [ ] Incrustar `critical.css` directamente en `<head>` del HTML
- [ ] Implementar carga diferida del resto de CSS
