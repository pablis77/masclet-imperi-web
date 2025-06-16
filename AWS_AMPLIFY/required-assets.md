# Archivos esenciales para el correcto funcionamiento del index.html

Este documento identifica todos los archivos y recursos críticos que deben ser incluidos en el `index.html` generado por `create-index.cjs` para que la aplicación Masclet Imperi Web funcione correctamente en producción.

## Estructura de archivos críticos por categoría

### Archivos base (siempre requeridos)

| Categoría | Patrón regex | Descripción | Prioridad |
|-----------|-------------|-------------|-----------|
| Vendor Bundle | `vendor\.[A-Za-z0-9-_]+\.js$` | Dependencias agrupadas de terceros (React, etc.) | 1 - CRÍTICO |
| Client Bundle | `client\.[A-Za-z0-9-_]+\.js$` | Código principal de la aplicación | 1 - CRÍTICO |
| Config | `config\.[A-Za-z0-9-_]+\.js$` | Configuración de la aplicación | 1 - CRÍTICO |
| API Config | `apiConfig\.[A-Za-z0-9-_]+\.js$` | Configuración de APIs | 1 - CRÍTICO |
| CSS Principal | `index\.[A-Za-z0-9-_]+\.css$` | Estilos globales | 1 - CRÍTICO |

### Servicios esenciales

| Categoría | Patrón regex | Descripción | Prioridad |
|-----------|-------------|-------------|-----------|
| API Service | `apiService\.[A-Za-z0-9-_]+\.js$` | Servicios de API | 1 - CRÍTICO |
| Auth Service | `authService\.[A-Za-z0-9-_]+\.js$` | Servicios de autenticación | 2 - ALTO |
| Role Service | `roleService\.[A-Za-z0-9-_]+\.js$` | Servicios de gestión de roles | 2 - ALTO |
| Notification Service | `notificationService\.[A-Za-z0-9-_]+\.js$` | Servicios de notificaciones | 3 - MEDIO |

### Componentes específicos por sección

| Sección | Patrón regex | Descripción | Prioridad |
|---------|-------------|-------------|-----------|
| Login | `login\.[A-Za-z0-9-_]+\.js$` | Scripts específicos para login | 2 - ALTO |
| Dashboard | `dashboard\.[A-Za-z0-9-_]+\.js$` | Scripts para el panel principal | 2 - ALTO |
| Animals | `animals?\.[A-Za-z0-9-_]+\.js$` | Scripts para gestión de animales | 2 - ALTO |
| Explotaciones | `explotaciones?\.[A-Za-z0-9-_]+\.js$` | Scripts para gestión de explotaciones | 2 - ALTO |
| Importaciones | `import(aciones)?\.[A-Za-z0-9-_]+\.js$` | Scripts para importación de datos | 3 - MEDIO |
| Listados | `listados?\.[A-Za-z0-9-_]+\.js$` | Scripts para la sección de listados | 3 - MEDIO |

### Estilos específicos por sección

| Sección | Patrón regex | Descripción | Prioridad |
|---------|-------------|-------------|-----------|
| Login | `logout\.[A-Za-z0-9-_]+\.css$` | Estilos para la página de login | 2 - ALTO |
| Dashboard | `dashboard\.[A-Za-z0-9-_]+\.css$` | Estilos para el dashboard | 2 - ALTO |

## Orden de carga

El orden correcto de carga es crucial para la inicialización de la aplicación:

1. CSS globales y específicos
2. Bundle de vendor (librerías third-party)
3. Config & API Config
4. Services (API, Auth, etc.)
5. Bundle cliente principal

## Análisis de los archivos index.html actuales

### Problemas detectados

El análisis del `index.html` generado en la implementación 23 muestra varios problemas:

1. **Falta de inclusión de scripts críticos**: A pesar de detectar correctamente los archivos en el log de build, estos no se están incluyendo en el HTML final.
2. **Orden de carga incorrecto**: Los archivos que sí se incluyen no siguen un orden óptimo de dependencias.
3. **Referencias relativas inconsistentes**: Algunos archivos usan rutas relativas sin `/` inicial.

### Archivos detectados en logs pero ausentes en index.html

Según los logs de build, se encuentran pero no se incluyen:
- `vendor.BAk4NxX6.js`
- `client.DKNAXmG2.js`
- `config.DUTcyYPh.js`
- `apiConfig.BYL0hBvc.js`
- `apiService.DCRZ96ES.js`

## Solución propuesta para create-index.cjs

El script `create-index.cjs` debe ser actualizado para:

1. **Detectar todos los archivos necesarios** usando expresiones regulares robustas
2. **Garantizar el orden correcto** de inclusión basado en dependencias
3. **Usar rutas absolutas** (con `/` inicial) para todas las referencias
4. **Proporcionar detección de errores visible** cuando falte algún archivo crítico
5. **Documentar claramente** tanto en el HTML como en los logs el resultado del proceso

Todas las referencias a librerías o assets deben comenzar con `/` para garantizar que se cargan correctamente desde la raíz del sitio, independientemente de la ruta actual.

## Otros archivos secundarios relevantes

En adición a los archivos principales, estos archivos deben ser considerados:

- Scripts de permisos: `permissions-ui.js`
- Scripts de bloqueo: `bloquear-*`
- Archivos i18n: locale específicos

## Validación post-despliegue

Después de actualizar `create-index.cjs`, debe verificarse:

1. Que todos los scripts críticos se incluyan en el HTML generado
2. Que las rutas sean absolutas (comiencen con `/`)
3. Que la consola del navegador no muestre errores de recursos no encontrados
4. Que la aplicación muestre la pantalla de login inicial
5. Que sea posible navegar tras autenticación
