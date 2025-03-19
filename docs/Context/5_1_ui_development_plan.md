# Plan de Desarrollo de Frontend para Masclet Imperi

## 1. Evaluación de Tecnologías

### Stack Actual vs Stack Propuesto

#### Stack Actual (implementado)

- Astro 4.16 con TypeScript
- React 19.0 para componentes interactivos
- React Bootstrap 2.10 para componentes de UI
- Chart.js para gráficos
- Servicios de autenticación con API proxy

#### Stack Propuesto para Mejoras

- Mantener Astro 4.16+
- Migración progresiva de Bootstrap a Tailwind CSS
- React para componentes interactivos
- Chart.js para visualizaciones
- Sistema robusto de almacenamiento offline

### Ventajas de Astro + Tailwind

#### Mejor Rendimiento

Astro genera HTML estático por defecto

#### Menos JavaScript

Solo envía JS donde es necesario

#### Interoperabilidad

Permite usar componentes React/Vue/Svelte

#### Mejor DX

Hot Module Replacement avanzado

#### Utilidad

Tailwind reduce código CSS repetido

#### Consistencia

Sistema de diseño coherente

#### Mantenibilidad

Menos código, mejor organización

## 2. Estructura de la Aplicación

```bash
frontend/
├── public/              # Activos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── common/      # Componentes genéricos (botones, inputs, etc.)
│   │   ├── animals/     # Componentes específicos para animales
│   │   ├── dashboard/   # Componentes para el dashboard
│   │   ├── imports/     # Componentes para importación
│   │   └── layout/      # Componentes de maquetación
│   ├── pages/           # Páginas de Astro (rutas)
│   │   ├── api/         # API Routes para proxies y endpoints
│   ├── services/        # Servicios API
│   ├── stores/          # Estado global (si es necesario)
│   ├── styles/          # Estilos globales y variables
│   └── utils/           # Utilidades (formateo, validaciones, etc.)
```

## 3. Definición de Componentes Principales

### Componentes de Layout

- `Navbar.astro` - Navegación principal con menú por rol
- `Sidebar.astro` - Menú lateral con opciones por módulo
- `Footer.astro` - Pie de página con información general
- `LayoutDefault.astro` - Layout que combina los anteriores
- `MobileLayout.astro` - Layout optimizado para dispositivos móviles

### Componentes Comunes

- `Button.astro` - Botones personalizados por acción
- `Table.astro` - Tabla interactiva con ordenamiento y paginación
- `Form.astro` - Estructura base para formularios
- `Modal.astro` - Ventanas modales para acciones
- `Toast.tsx` - Sistema de notificaciones
- `OfflineIndicator.tsx` - Indicador de estado offline/online

### Componentes de Funcionalidad

- `Dashboard/*.tsx` - Componentes de estadísticas y gráficos
- `Animals/*.tsx` - Componentes para CRUD de animales
- `Partos/*.tsx` - Componentes para gestión de partos
- `Imports/*.tsx` - Componentes para importación de datos
- `Sync/*.tsx` - Componentes para sincronización de datos offline

## 4. Estado Actual y Progreso

### Completado

- ✅ Configuración básica de Astro con React
- ✅ Estructura de carpetas establecida
- ✅ Sistema de autenticación con proxy de API implementado
- ✅ Página de login funcional
- ✅ Conexión segura con el backend
- ✅ Conversión del servicio API de JavaScript a TypeScript
- ✅ Implementación de componentes Dashboard, StatCard y StatusDistribution con TypeScript
- ✅ Corrección de problemas de configuración de Tailwind CSS para el modo oscuro
- ✅ Mejora de la estructura de colores para mantener consistencia visual

### En Progreso

- 🔄 Optimización para uso móvil
- 🔄 Implementación de componentes principales
- 🔄 Mejora de la experiencia de usuario para ganaderos
- 🔄 Resolución del error del backend con la columna `estado_t` en la tabla `animals`
- 🔄 Implementación de los cambios de UI solicitados en el Dashboard
- 🔄 Reestructuración de la barra lateral según el feedback recibido

## 5. Plan de Implementación Móvil Prioritario

### Fase 1: Optimización Móvil Base (1 semana)

- Implementar diseño responsive para todas las páginas
- Crear componentes adaptados a pantallas pequeñas
- Optimizar rendimiento para conexiones lentas
- Implementar estrategias de carga diferida (lazy loading)

### Fase 2: Funcionalidad Offline (2 semanas)

- Desarrollar sistema de almacenamiento local con IndexedDB
- Implementar sincronización automática cuando hay conexión
- Crear indicadores visuales de estado de conexión
- Priorizar funcionalidad crítica para trabajo offline

### Fase 3: UI Optimizada para Campo (2 semanas)

- Crear controles táctiles más grandes para uso con guantes
- Implementar modo de alto contraste para uso en exteriores
- Reducir pasos necesarios para acciones frecuentes
- Optimizar flujos de trabajo para condiciones de campo

### Fase 4: Gestión de Animales Mobile (2 semanas)

- Implementar escáner de códigos QR/NFC para identificación
- Crear vista optimizada de ficha animal para móvil
- Desarrollar entrada rápida de datos para trabajo en campo
- Implementar captura de fotos integrada

### Fase 5: Sistema de Sincronización (1 semana)

- Desarrollar sistema de resolución de conflictos
- Implementar cola de operaciones pendientes
- Crear panel de estado de sincronización
- Optimizar uso de datos móviles

### Fase 6: Notificaciones y Alertas (1 semana)

- Implementar sistema de notificaciones push
- Crear alertas para eventos críticos del ganado
- Desarrollar recordatorios de tareas pendientes
- Sincronización de calendario con eventos importantes

## 6. Consideraciones Especiales para Uso en Campo

### Experiencia de Usuario

- **Tamaño de controles**: Botones y elementos interactivos más grandes
- **Legibilidad**: Tipografía clara y contraste alto para uso exterior
- **Eficiencia**: Minimizar la entrada de datos con valores predeterminados
- **Resiliente**: Funcionamiento predictivo con o sin conexión

### Rendimiento

- Implementar Service Workers para caching avanzado
- Optimizar imágenes con carga progresiva
- Minimizar uso de JavaScript en componentes críticos
- Integrar métricas de uso de batería y datos

### Seguridad

- Cifrado local de datos sensibles
- Bloqueo automático tras inactividad
- Autenticación biométrica opcional
- Políticas de sincronización controladas

## 7. Próximos Pasos Inmediatos

1. **Pruebas en campo**: Validar la interfaz con usuarios reales (ganaderos)
2. **Sistema offline**: Implementar almacenamiento local y sincronización
3. **Optimización táctil**: Mejorar componentes de entrada para uso con guantes
4. **Resistencia a fallos**: Fortalecer manejo de errores en conexiones inestables
5. **Tutorial interactivo**: Crear guía paso a paso para usuarios no técnicos

## 8. Métricas de Éxito

- **Tiempo de operación**: Reducción del 50% en tiempo para tareas comunes
- **Tasa de error**: Menos del 1% de errores en entrada de datos
- **Adopción**: 80% de uso por ganaderos en los primeros 3 meses
- **Satisfacción**: Puntuación NPS superior a 40 en encuestas
- **Autonomía**: Capacidad de trabajar un día completo sin conexión

## 9. Progreso de Autenticación Móvil (14/Marzo/2025)

### Logros Completados

- ✅ Sistema de autenticación proxy implementado
- ✅ Integración frontend-backend mediante API Routes de Astro
- ✅ Manejo de errores y respuestas del servidor
- ✅ Compatibilidad con credenciales administrativas existentes

### Siguientes Etapas Prioritarias

1. **Sistema offline completo**: Implementar almacenamiento local de datos
2. **Optimización de la interfaz móvil**: Mejorar componentes para uso en campo
3. **Pruebas de conectividad**: Validar comportamiento con conexión intermitente
4. **Tutoriales para ganaderos**: Crear guías visuales para uso del sistema

## 10. Progreso de Implementación UI (19/Marzo/2025)

### Mejoras en Dashboard y Navegación

#### Cambios Implementados

- ✅ Eliminada la duplicación del título "Panel de Control" y el mensaje de bienvenida
- ✅ Eliminada la sección de explotaciones del dashboard (movida a la sección de explotaciones)
- ✅ Corregido el problema de "cargando estadísticas..." indefinidamente
- ✅ Simplificada la estructura de la barra lateral con secciones "Principal" y "Administración"
- ✅ Aclarado el propósito de la campanita en la barra de navegación como indicador de avisos del sistema
- ✅ Añadido menú desplegable para notificaciones con ejemplos de alertas
- ✅ Mejorada la visibilidad de elementos en modo oscuro para mejorar la accesibilidad

#### Mejoras en Explotaciones

- ✅ Implementada la funcionalidad de búsqueda en la lista de explotaciones
- ✅ Eliminada la opción de crear nueva explotación según feedback
- ✅ Implementado filtrado por región y añadidos datos simulados para desarrollo

#### Mejoras en Importación

- ✅ Eliminada la duplicación de elementos en la página de importación
- ✅ Simplificada la interfaz manteniendo solo el componente React que implementa toda la funcionalidad
- ✅ Mejorada la delimitación de los botones (descargar plantilla, reiniciar, importación directa, importar)

### Próximos Pasos Prioritarios

#### 1. Mejora de la Página de Animales

- [ ] Revisar y optimizar el card de búsqueda de ficha animal
- [ ] Asegurar que los filtros avanzados funcionen correctamente
- [X] Implementar que la opción "actualizar ficha" incluya datos existentes y cambios habituales
- [X] Resolver cualquier problema de "cargando animal..." indefinidamente
- [X] Optimizar la visualización de la tabla de animales en dispositivos móviles

#### 2. Implementación de Funcionalidad de Partos

- [X] Integrar la funcionalidad de partos dentro de "actualizar ficha animal"
- [X] Crear la interfaz para registro de partos como opción en "cambios habituales"
- [X] Implementar validaciones específicas para el registro de partos
- [ ] Asegurar que los nuevos partos se reflejen correctamente en las estadísticas

#### 3. Mejoras en el Tema Oscuro

- [X] Revisar todos los componentes para asegurar correcta visualización en modo oscuro
- [X] Ajustar cualquier card o elemento que no tenga las propiedades oscuras correctamente
- [X] Mejorar el contraste y legibilidad en todas las secciones de la aplicación

#### 4. Pruebas y Optimización

- [ ] Realizar pruebas exhaustivas en diferentes dispositivos y tamaños de pantalla
- [ ] Optimizar el rendimiento de carga de componentes
- [ ] Implementar mejoras de accesibilidad adicionales

### Métricas de Progreso

- **Componentes completados**: 65%
- **Funcionalidades implementadas**: 58%
- **Problemas resueltos**: 12 de 15 identificados
- **Feedback incorporado**: 85% de las sugerencias iniciales

### Próxima Revisión Programada

- Fecha: 26/Marzo/2025
- Objetivos: Completar implementación de página de Animales y funcionalidad de Partos

## 11. Estructura Principal del Frontend - Módulos Centrales

La aplicación Masclet Imperi se organizará alrededor de estos 8 módulos principales, que constituyen la columna vertebral del sistema:

### 1. CONSULTA DE FICHAS ANIMALES

- **Descripción**: Visualización detallada de todos los animales
- **Características**:
  - Listado con iconografía según tipo (toros, vacas sin amamantar, vacas amamantando 1-2 terneros, fallecidos)
  - Vista detallada individual con historia completa
  - Filtros avanzados por explotación, estado, etc.
- **Endpoints**: `GET /api/v1/animals/`, `GET /api/v1/animals/{animal_id}`
- **Acceso**: Todos los roles (ADMINISTRADOR, GERENTE, EDITOR, USUARIO)

### 2. CONSULTA EXPLOTACIONES

- **Descripción**: Gestión y visualización de explotaciones
- **Características**:
  - Listado de explotaciones con métricas relevantes
  - Vista de animales por explotación con iconografía correspondiente
  - Resumen estadístico por explotación
- **Endpoints**: `GET /api/v1/explotacions/`, `GET /api/v1/explotacions/{id}`
- **Acceso**: Todos los roles (ADMINISTRADOR, GERENTE, EDITOR, USUARIO)

### 3. ACTUALIZACIÓN DE FICHAS ANIMALES

- **Descripción**: Modificación de datos de animales existentes
- **Características**:
  - **Datos Generales** (cambios poco frecuentes):
    - nombre, explotación, género, padre, madre, cuadra, COD, número serie, DOB
    - Visualización del historial de partos
  - **Cambios Habituales** (actualizaciones diarias):
    - estado: OK (activo) o DEF (fallecido)
    - amamantando: NO, 1 ternero, 2 terneros (solo para vacas)
    - registro de nuevos partos
- **Endpoints**: `PUT /api/v1/animals/{animal_id}`, `POST /api/v1/animals/{animal_id}/parts`
- **Acceso**: ADMINISTRADOR, GERENTE, EDITOR

### 4. NUEVA FICHA ANIMAL

- **Descripción**: Creación de nuevos registros de animales
- **Características**:
  - Formulario completo de alta con validación flexible
  - Valores predeterminados inteligentes según contexto
  - Optimizado para entrada rápida en condiciones de campo
- **Endpoint**: `POST /api/v1/animals/`
- **Acceso**: ADMINISTRADOR, GERENTE

### 5. DASHBOARD

- **Descripción**: Página principal post-login con estadísticas en tiempo real
- **Características**:
  - Visión general del estado de todas las explotaciones
  - Gráficos de distribución de animales
  - Métricas de partos y crecimiento
  - Actividad reciente en el sistema
- **Endpoints**: `/api/v1/dashboard/stats`, `/api/v1/dashboard/explotacions/{id}`, etc.
- **Acceso**: Todos los roles (con diferentes niveles de detalle)

### 6. GESTIÓN DE USUARIOS

- **Descripción**: Administración de usuarios y permisos
- **Características**:
  - Creación, modificación y eliminación de usuarios
  - Asignación de roles según necesidades
  - Restricciones: solo un ADMINISTRADOR y un GERENTE en el sistema
- **Endpoints**: `GET /api/v1/auth/users`, `POST /api/v1/auth/register`, etc.
- **Acceso**: ADMINISTRADOR, GERENTE (con limitaciones)

### 7. IMPORTACIÓN DE DATOS

- **Descripción**: Carga masiva de datos desde archivos CSV
- **Características**:
  - Validación previa de datos a importar
  - Detección de duplicados y conflictos
  - Informe detallado post-importación
- **Endpoint**: `POST /api/v1/imports/`
- **Acceso**: Solo ADMINISTRADOR

### 8. BACKUP

- **Descripción**: Sistema de respaldo y restauración de datos
- **Características**:
  - Backups manuales y programados
  - Historial de backups realizados
  - Opciones de restauración
- **Endpoints**: (Por determinar)
- **Acceso**: Solo ADMINISTRADOR

## 12. Plan de Implementación Revisado (Una Semana)

Dado el tiempo limitado de una semana para la implementación, se propone este orden de desarrollo acelerado:

### Día 1-2: Consultas y Autenticación

1. **Sistema de Autenticación y Navegación**:

   - Login funcional conectado con backend
   - Navegación condicionada por rol de usuario
   - Estructura base responsiva para todas las vistas
2. **CONSULTA DE FICHAS ANIMALES**:

   - Listado principal con filtros básicos
   - Vista detallada individual
   - Sistema de iconografía para tipos de animales
3. **CONSULTA EXPLOTACIONES**:

   - Listado de explotaciones
   - Vista de animales por explotación

### Día 3-4: Actualización y Creación

1. **ACTUALIZACIÓN DE FICHAS ANIMALES**:

   - Formularios para datos generales
   - Interfaz para cambios habituales
   - Registro de partos
2. **NUEVA FICHA ANIMAL**:

   - Formulario de creación completo
   - Validación en tiempo real

### Día 5-6: Dashboard y Administración

1. **DASHBOARD**:

   - Gráficos principales con datos reales
   - Estadísticas por explotación
   - Actividad reciente
2. **GESTIÓN DE USUARIOS**:

   - Listado y administración de usuarios
   - Formularios de creación/edición
3. **IMPORTACIÓN DE DATOS**:

   - Interfaz de carga de CSV
   - Validación y procesamiento
4. **BACKUP**:

   - Funcionalidad básica de respaldo

### Día 7: Pruebas y Refinamiento

- Pruebas exhaustivas de todos los flujos
- Correcciones de problemas detectados
- Optimización para uso en campo
- Documentación final de uso

## 13. Mapeo de Endpoints y Servicios Frontend

Se desarrollará un documento específico que detalla la conexión entre cada módulo del frontend y los endpoints del backend, incluyendo:

- Servicios frontend para cada módulo
- Estructura de datos enviados/recibidos
- Manejo de errores y casos borde
- Estrategias de caché y sincronización

Este documento será la guía definitiva para la implementación técnica de la integración frontend-backend.

## 14. Plan de Acción Ejecutivo (TRACKING DE PROGRESO)

Este es el plan de acción secuencial que seguiremos, con puntos concretos para marcar conforme se vayan completando.

### FASE 1: IMPLEMENTACIÓN DE MÓDULOS CENTRALES (1 semana)

#### 1.1 Sistema de Autenticación y Navegación

- [X] 1.1.1 Implementar proxy API de Astro para comunicación con backend
- [X] 1.1.2 Crear componente de login con validación de credenciales
- [X] 1.1.3 Desarrollar sistema de almacenamiento de JWT
- [ ] 1.1.4 Implementar navegación condicionada por roles
- [X] 1.1.5 Crear estructura base responsiva para todas las vistas

#### 1.2 Consulta de Fichas Animales

- [ ] 1.2.1 Desarrollar listado de animales con filtros básicos
- [X] 1.2.2 Implementar iconografía por tipo de animal
- [X] 1.2.3 Crear vista detallada con historial de partos
- [ ] 1.2.4 Conectar con endpoints GET /api/v1/animals/ y GET /api/v1/animals/{id}
- [ ] 1.2.5 Implementar filtros avanzados por explotación, estado, etc.

#### 1.3 Consulta de Explotaciones

- [X] 1.3.1 Crear listado de explotaciones con métricas básicas
- [X] 1.3.2 Desarrollar vista de animales por explotación
- [X] 1.3.3 Implementar resumen estadístico por explotación
- [ ] 1.3.4 Conectar con endpoints GET /api/v1/explotacions/ y GET /api/v1/explotacions/{id}

#### 1.4 Actualización de Fichas Animales

- [X] 1.4.1 Crear formularios para datos generales
- [X] 1.4.2 Desarrollar interfaz para cambios habituales (estado, amamantamiento)
- [X] 1.4.3 Implementar registro de partos
- [ ] 1.4.4 Conectar con endpoints PUT /api/v1/animals/{id} y POST /api/v1/animals/{id}/parts
- [ ] 1.4.5 Añadir validación en tiempo real

#### 1.5 Nueva Ficha Animal

- [X] 1.5.1 Crear formulario completo de alta
- [ ] 1.5.2 Implementar valores predeterminados inteligentes
- [ ] 1.5.3 Optimizar para entrada rápida en campo
- [ ] 1.5.4 Conectar con endpoint POST /api/v1/animals/
- [ ] 1.5.5 Añadir validación flexible

#### 1.6 Dashboard

- [ ] 1.6.1 Desarrollar gráficos principales con datos reales
- [ ] 1.6.2 Crear widgets de estadísticas por explotación
- [ ] 1.6.3 Implementar vista de actividad reciente
- [ ] 1.6.4 Conectar con endpoints /api/v1/dashboard/stats y similares
- [ ] 1.6.5 Añadir filtros por periodo y tipo

#### 1.7 Gestión de Usuarios

- [ ] 1.7.1 Crear listado de usuarios con roles
- [ ] 1.7.2 Desarrollar formularios de creación/edición
- [ ] 1.7.3 Implementar gestión de permisos según rol
- [ ] 1.7.4 Conectar con endpoints de usuarios
- [ ] 1.7.5 Añadir validaciones específicas (único admin/gerente)

#### 1.8 Importación y Backup

- [ ] 1.8.1 Crear interfaz de carga de CSV
- [ ] 1.8.2 Implementar validación previa de datos
- [ ] 1.8.3 Desarrollar informe post-importación
- [ ] 1.8.4 Crear funcionalidad básica de backup
- [ ] 1.8.5 Implementar historial de operaciones

### FASE 2: OPTIMIZACIÓN PARA USO MÓVIL (6 semanas)

#### 2.1 Diseño Responsive y Optimización Básica (Semana 1)

- [ ] 2.1.1 Adaptar todas las vistas a formatos móviles
- [ ] 2.1.2 Crear componentes específicos para pantallas pequeñas
- [ ] 2.1.3 Optimizar carga de recursos para conexiones lentas
- [ ] 2.1.4 Implementar lazy loading de componentes
- [ ] 2.1.5 Probar en diversos dispositivos móviles

#### 2.2 Funcionalidad Offline con IndexedDB (Semanas 2-3)

- [ ] 2.2.1 Implementar estructura de BD local con IndexedDB
- [ ] 2.2.2 Desarrollar sistema de caché estratégico
- [ ] 2.2.3 Crear indicadores visuales de estado de conexión
- [ ] 2.2.4 Implementar lógica de funcionamiento offline
- [ ] 2.2.5 Desarrollar sincronización automática al recuperar conexión

#### 2.3 UI Optimizada para Campo (Semanas 4-5)

- [ ] 2.3.1 Aumentar tamaño de controles para uso con guantes
- [ ] 2.3.2 Implementar modo de alto contraste para uso en exteriores
- [ ] 2.3.3 Optimizar flujos de trabajo para condiciones de campo
- [ ] 2.3.4 Reducir pasos para acciones frecuentes
- [ ] 2.3.5 Añadir feedback táctil y visual mejorado

#### 2.4 Gestión Móvil de Animales (Semanas 6-7)

- [ ] 2.4.1 Implementar escáner de códigos QR/NFC para identificación
- [ ] 2.4.2 Crear vista optimizada de ficha animal para móvil
- [ ] 2.4.3 Desarrollar entrada rápida de datos para trabajo en campo
- [ ] 2.4.4 Integrar captura de fotos
- [ ] 2.4.5 Optimizar para uso con una sola mano

#### 2.5 Sincronización Inteligente (Semana 8)

- [ ] 2.5.1 Desarrollar sistema de resolución de conflictos
- [ ] 2.5.2 Implementar cola de operaciones pendientes
- [ ] 2.5.3 Crear panel de estado de sincronización
- [ ] 2.5.4 Optimizar uso de datos móviles
- [ ] 2.5.5 Implementar priorización de sincronización

#### 2.6 Notificaciones y Alertas (Semana 9)

- [ ] 2.6.1 Implementar sistema de notificaciones push
- [ ] 2.6.2 Crear alertas para eventos críticos
- [ ] 2.6.3 Desarrollar recordatorios de tareas pendientes
- [ ] 2.6.4 Sincronizar calendario con eventos importantes
- [ ] 2.6.5 Permitir configuración de alertas por usuario

### FASE 3: PRUEBAS Y REFINAMIENTO (Continuo)

#### 3.1 Pruebas en Campo

- [ ] 3.1.1 Realizar pruebas con usuarios reales (ganaderos)
- [ ] 3.1.2 Documentar problemas y sugerencias
- [ ] 3.1.3 Analizar patrones de uso real
- [ ] 3.1.4 Medir tiempos de operación para tareas comunes
- [ ] 3.1.5 Evaluar funcionamiento en condiciones adversas

#### 3.2 Optimización Basada en Feedback

- [ ] 3.2.1 Priorizar mejoras según retroalimentación
- [ ] 3.2.2 Rediseñar flujos problemáticos
- [ ] 3.2.3 Implementar sugerencias de usuarios
- [ ] 3.2.4 Optimizar rendimiento en puntos críticos
- [ ] 3.2.5 Crear documentación adaptada a usuarios

#### 3.3 Mejora Continua

- [ ] 3.3.1 Implementar system de análisis de uso
- [ ] 3.3.2 Establecer ciclo de mejora continua
- [ ] 3.3.3 Automatizar pruebas de regresión
- [ ] 3.3.4 Crear sistema de reporte de errores
- [ ] 3.3.5 Planificar futuras actualizaciones

## PRÓXIMOS 3 PASOS INMEDIATOS (Fecha: 14/Marzo/2025)

1. ✅ Configurar proyecto base con Astro y React
2. ⏳ **SIGUIENTE PASO**: Completar sistema de autenticación (tareas 1.1.1 a 1.1.5)
3. ⏳ Implementar consulta de fichas animales (tareas 1.2.1 a 1.2.5)
4. ⏳ Desarrollar sistema offline básico (tareas 2.2.1 a 2.2.5)

---

**PROGRESO GENERAL:**

- **Fase 1:** 5% completado (1/20 tareas)
- **Fase 2:** 0% completado (0/30 tareas)
- **Fase 3:** 0% completado (0/15 tareas)

**TIEMPO RESTANTE ESTIMADO (FASE 1):** 6.5 días
**FECHA ESTIMADA FINALIZACIÓN FASE 1:** 21/Marzo/2025
