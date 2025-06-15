# Análisis Unificado de Recursos y Fuentes por Sección

**Fecha**: 15/06/2025
**Objetivo**: Determinar todos los archivos necesarios para cada sección para un despliegue correcto en AWS Amplify

## Metodología

Este informe combina dos fuentes de información complementarias:

1. **Análisis de Recursos** - Extraído de la ejecución del script `extraer-recursos.js` que captura todos los recursos cargados dinámicamente por el navegador durante la ejecución de cada sección.
2. **Análisis de Fuentes** - Extraído de la ejecución del script `analisis-fuentes-v2.js` que analiza estáticamente los archivos de código fuente y los clasifica por sección.

La combinación de ambos enfoques nos permite tener una visión completa de:
- Qué archivos son parte de cada sección funcional (análisis estático)
- Qué archivos se cargan realmente en tiempo de ejecución (análisis dinámico)

## Resumen Ejecutivo

| Sección | Archivos JS | Archivos CSS | Otros | Total | Estado |
|---------|-------------|--------------|-------|-------|--------|
| Dashboard | 22 | 5 | 75+ | 100+ | Capturado |
| Explotaciones | 20+ | 4+ | 60+ | 80+ | Capturado |
| Animales | 20+ | 4+ | 60+ | 80+ | Capturado |
| Importaciones | 20+ | 4+ | 60+ | 80+ | Capturado |
| Usuarios | 20+ | 4+ | 60+ | 80+ | Capturado |
| Backup | 20+ | 4+ | 60+ | 80+ | Capturado |
| Listados | 20+ | 4+ | 60+ | 80+ | Capturado |

## Arquitectura de Ficheros Clave

A partir del análisis, los siguientes componentes estructurales son cruciales:

### 1. Configuración del API y adaptadores

```
src/config/apiConfig.centralizado.ts      - Configuración central del API
src/services/apiConfigAdapter.ts          - Adaptador para diferentes entornos
src/services/apiService.ts                - Servicio principal del API
```

### 2. Componentes principales por sección

#### Dashboard
```
src/pages/index.astro                    - Página principal
src/components/dashboard/DashboardV2.tsx - Componente React del dashboard
```

#### Explotaciones
```
src/pages/explotaciones-react/index.astro - Página de explotaciones
src/components/explotaciones-react/ExplotacionesPage.tsx - Componente React
```

#### Animales
```
src/pages/animals/index.astro            - Página principal de animales
src/pages/animals/update/[id].astro      - Página de edición de animal
```

#### Importaciones
```
src/pages/imports/index.astro            - Página de importaciones
src/components/imports/ImportsPage.tsx   - Componente React
```

## Servicios compartidos

Los siguientes servicios son utilizados por múltiples secciones:

```
src/services/notificationService.ts      - Servicio de notificaciones
src/services/authService.ts              - Servicio de autenticación
src/i18n/config.ts                       - Configuración de internacionalización
```

## Archivos específicos con dependencias de entorno

Estos archivos hacen referencia directa a URLs y necesitan ser actualizados para el despliegue:

```
src/pages/animals/update/[id].astro      - Contiene URL hardcodeada
```

## Scripts de UI compartidos

Estos scripts son cargados por múltiples secciones:

```
scripts/bloquear-eliminar-parto.js
scripts/bloquear-editar-parto.js
scripts/bloquear-actualizar-animal.js
scripts/bloquear-acciones-listados.js
scripts/permissions-ui.js
```

## Dependencias de terceros cargadas dinámicamente

Estos archivos son cargados dinámicamente por Vite/Astro y son críticos para el funcionamiento:

```
node_modules/.vite/deps/chunk-*.js
node_modules/.vite/deps/@astrojs_react_client__js.js
node_modules/.vite/deps/react_jsx-dev-runtime.js
```

## Estado de la preparación para AWS Amplify

### Progreso actual

✅ Se ha centralizado la configuración del API
✅ Se ha implementado un adaptador que detecta el entorno
✅ Las URLs hardcodeadas en apiService.ts se han eliminado
✅ Se han identificado todos los recursos cargados por sección

### Pendiente

❌ Reemplazar URLs hardcodeadas en páginas específicas (ej: `/animals/update/[id].astro`)
❌ Configurar variables de entorno para AWS Amplify
❌ Generar archivo `amplify.yml` con comandos de build y deploy
❌ Configurar redirecciones SPA necesarias

## Recomendaciones para el despliegue

1. **Archivos de configuración**: Crear un archivo `amplify.yml` con la configuración de build apropiada
2. **Variables de entorno**: Definir `API_BASE_URL` para el entorno de producción
3. **Redirecciones**: Configurar redirección SPA para rutas dinámicas
4. **CORS**: Verificar que el backend permita peticiones desde el dominio de Amplify

## Siguiente paso

Completar la fusión de informes con una clasificación completa de archivos por sección, incluyendo tanto los detectados en el análisis estático como en el análisis dinámico.
