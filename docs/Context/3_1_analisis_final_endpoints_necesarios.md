

# Análisis Final de Endpoints Necesarios

## Introducción

Este documento presenta un análisis exhaustivo de los endpoints requeridos para el funcionamiento completo de la aplicación Masclet Imperi. Se detalla el estado actual de cada endpoint, los problemas identificados y las acciones necesarias para completar la implementación.

## Estructura General del Proyecto

El proyecto Masclet Imperi tiene una arquitectura clara dividida en:

1. **Frontend**: 
   - Tecnologías: Astro 4.16, React 19.0, React Bootstrap 2.10 (con planes de migración a Tailwind)
   - Estructura: Componentes por módulo funcional (dashboard, animales, explotaciones, etc.)
   - Servicios API: Implementados con axios y soporte para datos simulados

2. **Backend**: 
   - Tecnologías: FastAPI y Tortoise ORM
   - Base de datos: PostgreSQL
   - Autenticación: JWT

## Endpoints por Módulo

### 1. Autenticación

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/auth/login` | POST | ✅ Funcional | Inicio de sesión | Alta |
| `/api/v1/auth/refresh` | POST | ✅ Funcional | Renovación de token | Alta |
| `/api/v1/auth/users` | GET | ✅ Funcional | Listado de usuarios | Media |
| `/api/v1/auth/register` | POST | ✅ Funcional | Registro de nuevos usuarios | Media |

**Notas**: El sistema de autenticación está funcionando correctamente, aunque podría mejorarse la gestión de tokens en el frontend.

### 2. Dashboard

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/dashboard/stats` | GET | ✅ Funcional | Estadísticas generales | Alta |
| `/api/v1/dashboard/explotacions/{id}` | GET | ✅ Funcional | Estadísticas por explotación | Alta |
| `/api/v1/dashboard/stats?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | GET | ✅ Funcional | Estadísticas generales con rango de fechas | Alta |
| `/api/v1/dashboard/explotacions/{id}?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | GET | ✅ Funcional | Estadísticas por explotación con rango de fechas | Alta |
| `/api/v1/dashboard/resumen` | GET | ✅ Funcional | Resumen general | Media |
| `/api/v1/dashboard/partos` | GET | ✅ Funcional | Estadísticas de partos | Media |
| `/api/v1/dashboard/combined` | GET | ✅ Funcional | Estadísticas combinadas | Media |
| `/api/v1/dashboard/recientes` | GET | ✅ Funcional | Actividad reciente | Media |
| `/api/v1/dashboard/explotacions` | GET | ✅ Funcional | Lista de explotaciones | Media |

**Notas**: 
- ✅ RESUELTO: Todos los endpoints del dashboard están funcionando correctamente.
- ✅ RESUELTO: Se ha implementado correctamente el soporte para filtrado por fechas en los endpoints principales.
- ✅ RESUELTO: Se ha verificado el funcionamiento de todos los endpoints mediante scripts de prueba automatizados.

**Soluciones aplicadas**:
1. Se ha reescrito completamente el script `test_all_dashboard_endpoints.py` para probar sistemáticamente todos los endpoints del dashboard.
2. Se ha corregido la ruta de autenticación para usar `/api/v1/auth/login` en lugar de `/auth/login`.
3. Se ha implementado un mejor manejo de errores y logging detallado para facilitar la depuración.
4. Se ha verificado que todos los endpoints devuelven datos con la estructura esperada.

**Notas técnicas para futuras referencias**:
- Los endpoints con parámetros de fecha aceptan los formatos `YYYY-MM-DD`.
- El endpoint de estadísticas de explotación requiere un ID de explotación válido.
- Los datos de actividad reciente se filtran por defecto para los últimos 7 días.

### 3. Animales

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/animals/` | GET | ✅ Funcional | Listado de animales | Alta |
| `/api/v1/animals/{id}` | GET | ✅ Funcional | Detalle de un animal | Alta |
| `/api/v1/animals/` | POST | ✅ Funcional | Crear nuevo animal | Alta |
| `/api/v1/animals/{id}` | PATCH | ✅ Funcional | Actualizar animal | Alta |
| `/api/v1/animals/{id}` | DELETE | ✅ Funcional | Eliminar animal | Baja |

**Problemas identificados**:
- Los endpoints de animales funcionan correctamente después de ajustar los esquemas para que coincidan con el modelo de datos.
- Se corrigió el tipo de los campos `explotacio` y `alletar` en los esquemas para que coincidan con el modelo.

**Acciones necesarias**:
- Asegurar que el frontend utilice correctamente los valores de enumeración para `genere`, `estado` y `alletar`.

### 4. Partos

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/partos/` | GET | ✅ Funcional | Listar todos los partos | Media |
| `/api/v1/partos/{id}` | GET | ✅ Funcional | Detalle de un parto | Baja |
| `/api/v1/partos/` | POST | ✅ Funcional | Registrar nuevo parto | Alta |
| `/api/v1/partos/{id}` | PUT | ✅ Funcional | Actualizar parto | Baja |
| `/api/v1/animals/{id}/parts` | GET | ✅ Funcional | Listar partos de un animal | Media |
| `/api/v1/animals/{id}/parts` | POST | ✅ Funcional | Registrar nuevo parto para un animal | Alta |
| `/api/v1/animals/{id}/parts/{part_id}` | PUT | ❌ No funcional | Actualizar parto de un animal | Baja |

**Problemas identificados y resueltos**:
- ✅ RESUELTO: Se ha verificado que los endpoints standalone (`/api/v1/partos/`) están implementados correctamente.
- ✅ RESUELTO: Se ha verificado que los endpoints anidados (`/api/v1/animals/{id}/parts`) funcionan correctamente para GET y POST.
- ❌ PENDIENTE: El endpoint anidado PUT `/api/v1/animals/{id}/parts/{part_id}` devuelve un error 405 Method Not Allowed.
- ✅ RESUELTO: La funcionalidad de partos está correctamente integrada con el modelo `Animal`.
- ✅ RESUELTO: El sistema asigna automáticamente números de parto secuenciales para cada animal.

**Soluciones aplicadas**:
1. Se ha creado un script de prueba (`test_partos.py`) que verifica la funcionalidad de todos los endpoints de partos.
2. Se ha documentado que para actualizar partos debe usarse el endpoint standalone PUT `/api/v1/partos/{id}` en lugar del endpoint anidado.
3. Se ha confirmado que la validación de datos funciona correctamente para todos los campos requeridos.

**Notas técnicas para futuras referencias**:
- Un parto siempre debe estar asociado a un animal hembra existente.
- Los campos obligatorios son: `animal_id`, `data`, `genere_fill` y `estat_fill`.
- El campo `numero_part` se asigna automáticamente según el número de partos previos del animal.
- Se ha creado documentación detallada en `docs/Context/partos_endpoints_testing.md`.

### 5. Explotaciones

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/explotacions/` | GET | ✅ Funcional | Listado de explotaciones | Alta |
| `/api/v1/explotacions/{id}` | GET | ✅ Funcional | Detalle de una explotación | Alta |
| `/api/v1/explotacions/` | POST | ✅ Funcional | Crear nueva explotación | Baja |
| `/api/v1/explotacions/{id}` | PUT | ✅ Funcional | Actualizar explotación | Baja |
| `/api/v1/explotacions/{id}` | DELETE | ✅ Funcional | Eliminar explotación | Baja |

**Notas**: Este es el único módulo cuyos endpoints están confirmados como funcionales. Tiene una implementación sencilla y directa.

### 6. Importación

| Endpoint | Método | Estado | Descripción | Prioridad |
|----------|--------|--------|-------------|-----------|
| `/api/v1/imports/` | POST | ✅ Funcional | Importación de datos CSV | Media |

**Problemas identificados y resueltos**:
- ✅ RESUELTO: Se ha verificado que el endpoint está implementado correctamente.
- ✅ RESUELTO: El campo `alletar` ahora soporta tres estados (NO, 1, 2) en lugar de solo valores booleanos.
- ✅ RESUELTO: La validación de datos es correcta según la estructura del CSV.
- ✅ RESUELTO: Se ha confirmado que la ruta correcta del archivo CSV para importación es `c:\Proyectos\claude\masclet-imperi-web\backend\database\matriz_master.csv`.

**Soluciones aplicadas**:
1. Actualización del modelo `Animal` para usar `CharEnumField` en lugar de `BooleanField` para el campo `alletar`.
2. Creación de la enumeración `EstadoAlletar` con tres valores posibles: `NO_ALLETAR`, `UN_TERNERO` y `DOS_TERNEROS`.
3. Modificación del servicio de importación para manejar correctamente los diferentes formatos de entrada.
4. Creación de un script de migración para actualizar la estructura de la base de datos y convertir los datos existentes.
5. Verificación de la importación con el archivo CSV correcto.

**Notas técnicas para futuras referencias**:
- La URL de conexión a la base de datos debe usar el prefijo `postgres://` en lugar de `postgresql://` para Tortoise ORM.
- Los valores del campo `alletar` en el CSV pueden ser variados (0, 1, "NO", "SI", etc.) y el servicio de importación los mapea correctamente a los valores enumerados.
- La distribución actual de valores en la base de datos es: NO: 7, 1: 35, 2: 0.

## Progreso Actual y Errores

### Endpoints Funcionales
- ✅ Autenticación: Todos los endpoints funcionan correctamente
- ✅ Explotaciones: Todos los endpoints funcionan correctamente
- ✅ Importación: El endpoint POST `/api/v1/imports/` funciona correctamente
- ✅ Dashboard: Todos los endpoints funcionan correctamente, incluyendo los que tienen parámetros de fechas

### Endpoints con Problemas
- ❌ Partos: El endpoint PUT anidado `/api/v1/animals/{id}/parts/{part_id}` no es funcional

### Errores Específicos
1. **Partos**:
   - El endpoint PUT anidado `/api/v1/animals/{id}/parts/{part_id}` devuelve un error 405 Method Not Allowed

## Plan de Acción Sistemático

Este plan de acción está diseñado para abordar sistemáticamente cada endpoint, verificando su funcionamiento y resolviendo problemas de manera metódica. La priorización se basa en la dependencia funcional de los módulos, no en su importancia visual.

### 1. Metodología de Verificación de Endpoints

Para cada endpoint, seguiremos este proceso sistemático:

1. **Verificación de existencia**:
   - Comprobar que el endpoint está definido en el router correspondiente
   - Verificar que está registrado en la aplicación principal

2. **Análisis de implementación**:
   - Revisar el código del controlador
   - Verificar que los modelos y esquemas están correctamente definidos
   - Comprobar que las consultas a la base de datos son correctas

3. **Prueba directa**:
   - Realizar una petición directa al endpoint usando herramientas como curl o Postman
   - Analizar la respuesta y los posibles errores
   - Verificar los logs del servidor

4. **Integración con frontend**:
   - Comprobar que el servicio correspondiente en el frontend está correctamente implementado
   - Verificar que la respuesta se procesa adecuadamente
   - Probar la funcionalidad completa desde la interfaz de usuario

5. **Documentación de resultados**:
   - Actualizar este documento con los resultados
   - Documentar los problemas encontrados y las soluciones aplicadas

### 2. Priorización de Módulos

La priorización se basa en la dependencia funcional, no en la importancia visual:

1. **Explotaciones** (Base para todo el sistema)
2. **Animales** (Entidad principal del negocio)
3. **Partos** (Dependiente de Animales)
4. **Importación** (Funcionalidad de carga masiva)
5. **Dashboard** (Visualización de datos de los módulos anteriores)

### 3. Plan Detallado por Módulo

#### 3.1 Módulo de Explotaciones

**Objetivo**: Confirmar y optimizar el funcionamiento de los endpoints de explotaciones.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1.1 | Verificar endpoint GET `/api/v1/explotacions/` | ✅ Funcional |
| 1.2 | Verificar endpoint GET `/api/v1/explotacions/{id}` | ✅ Funcional |
| 1.3 | Verificar endpoint POST `/api/v1/explotacions/` | ✅ Funcional |
| 1.4 | Verificar endpoint PUT `/api/v1/explotacions/{id}` | ✅ Funcional |
| 1.5 | Comprobar integración con frontend | Pendiente |
| 1.6 | Documentar resultados y soluciones | Pendiente |

**Tareas específicas**:
- Confirmar que el modelo `Explotacio` tiene todos los campos necesarios
- Verificar que las consultas a la base de datos son eficientes
- Comprobar que la respuesta incluye todos los datos necesarios para el frontend

#### 3.2 Módulo de Animales

**Objetivo**: Verificar y corregir el funcionamiento de los endpoints de animales.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 2.1 | Verificar endpoint GET `/api/v1/animals/` | ✅ Funcional |
| 2.2 | Verificar endpoint GET `/api/v1/animals/{id}` | ✅ Funcional |
| 2.3 | Verificar endpoint POST `/api/v1/animals/` | ✅ Funcional |
| 2.4 | Verificar endpoint PUT `/api/v1/animals/{id}` | ✅ Funcional |
| 2.5 | Verificar endpoint DELETE `/api/v1/animals/{id}` | ✅ Funcional |
| 2.6 | Corregir problemas con columnas `estado_t` y `explotaci` | ✅ Funcional |
| 2.7 | Verificar implementación de `alletar` con 3 estados | ✅ Funcional |
| 2.8 | Comprobar integración con frontend | Pendiente |
| 2.9 | Documentar resultados y soluciones | Pendiente |

**Tareas específicas**:
- Revisar el modelo `Animal` y asegurar que coincide con la estructura del CSV
- Verificar que los esquemas de Pydantic están correctamente definidos
- Comprobar que las consultas a la base de datos manejan correctamente los filtros
- Asegurar que la respuesta incluye la información de partos cuando es necesario

#### 3.3 Módulo de Partos

**Objetivo**: Verificar y corregir el funcionamiento de los endpoints de partos.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 3.1 | Verificar endpoint GET `/api/v1/animals/{id}/parts` | ✅ Funcional |
| 3.2 | Verificar endpoint POST `/api/v1/animals/{id}/parts` | ✅ Funcional |
| 3.3 | Verificar endpoint GET `/api/v1/animals/{id}/parts/{part_id}` | ✅ Funcional |
| 3.4 | Verificar endpoint PUT `/api/v1/animals/{id}/parts/{part_id}` | ❌ No funcional |
| 3.5 | Comprobar integración con frontend | Pendiente |
| 3.6 | Documentar resultados y soluciones | Pendiente |

**Tareas específicas**:
- Revisar el modelo `Part` y asegurar que está correctamente relacionado con `Animal`
- Verificar que los esquemas de Pydantic están correctamente definidos
- Comprobar que la creación de partos actualiza correctamente el estado de amamantamiento del animal

**Nota importante sobre la relación conceptual de partos y animales**:

Los partos en el sistema siempre están asociados a vacas específicas. Aunque existe un endpoint standalone para actualizar partos (`/api/v1/partos/{id}`), esto es simplemente una implementación técnica. Conceptualmente:

1. Los partos siempre se crean asociados a una vaca específica mediante el campo `animal_id`
2. El historial de partos se muestra exclusivamente en la ficha individual de cada vaca
3. Los partos afectan directamente al recuento de terneros en las estadísticas de explotación
4. El recuento de terneros se basa en el estado de amamantamiento de las vacas:
   - Vaca sin amamantar = 0 terneros
   - Vaca amamantando 1 ternero = 1 ternero
   - Vaca amamantando 2 terneros = 2 terneros

Por lo tanto, aunque el endpoint PUT anidado `/api/v1/animals/{id}/parts/{part_id}` no está implementado y se usa el endpoint standalone para actualizar partos, esto no afecta al modelo conceptual del sistema donde los partos siempre pertenecen a animales específicos y no tienen sentido fuera de ese contexto.

#### 3.4 Módulo de Importación

**Objetivo**: Verificar y corregir el funcionamiento del endpoint de importación.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 4.1 | Verificar endpoint POST `/api/v1/imports/` | ✅ Funcional |
| 4.2 | Comprobar validación de datos CSV | ✅ Funcional |
| 4.3 | Verificar manejo de errores | ✅ Funcional |
| 4.4 | Comprobar integración con frontend | Pendiente |
| 4.5 | Documentar resultados y soluciones | Pendiente |

**Tareas específicas**:
- Revisar el proceso de validación de datos
- Verificar que la importación maneja correctamente los errores por fila
- Comprobar que la respuesta incluye estadísticas detalladas del proceso

#### 3.5 Módulo de Dashboard

**Objetivo**: Verificar y corregir el funcionamiento de los endpoints del dashboard.

| Paso | Descripción | Estado |
|------|-------------|--------|
| 5.1 | Verificar endpoint GET `/api/v1/dashboard/stats` | ✅ Funcional |
| 5.2 | Verificar endpoint GET `/api/v1/dashboard/explotacions/{id}` | ✅ Funcional |
| 5.3 | Verificar endpoint GET `/api/v1/dashboard/stats?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | ✅ Funcional |
| 5.4 | Verificar endpoint GET `/api/v1/dashboard/explotacions/{id}?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` | ✅ Funcional |
| 5.5 | Verificar endpoint GET `/api/v1/dashboard/resumen` | ✅ Funcional |
| 5.6 | Verificar endpoint GET `/api/v1/dashboard/partos` | ✅ Funcional |
| 5.7 | Verificar endpoint GET `/api/v1/dashboard/combined` | ✅ Funcional |
| 5.8 | Verificar endpoint GET `/api/v1/dashboard/recientes` | ✅ Funcional |
| 5.9 | Verificar endpoint GET `/api/v1/dashboard/explotacions` | ✅ Funcional |
| 5.10 | Comprobar integración con frontend | Pendiente |
| 5.11 | Documentar resultados y soluciones | ✅ Completado |

**Tareas específicas**:
- Revisar el servicio `dashboard_service.py` y simplificar temporalmente la respuesta
- Verificar que las consultas a la base de datos son eficientes
- Comprobar que la respuesta incluye todos los datos necesarios para el frontend

### 4. Herramientas y Técnicas

#### 4.1 Herramientas de Prueba

- **curl**: Para pruebas directas de API desde la línea de comandos
- **Postman**: Para pruebas más complejas con interfaz gráfica
- **Navegador (DevTools)**: Para analizar las peticiones y respuestas desde el frontend
- **Logs del servidor**: Para identificar errores en el backend

#### 4.2 Técnicas de Depuración

- **Logging detallado**: Añadir logs temporales en puntos críticos
- **Simplificación progresiva**: Reducir la complejidad para identificar el origen del problema
- **Pruebas aisladas**: Probar cada componente por separado
- **Comparación con implementaciones funcionales**: Usar como referencia los endpoints que funcionan correctamente

### 5. Seguimiento y Documentación

Después de cada sesión de trabajo, se actualizará este documento con:

- Estado actual de cada endpoint
- Problemas identificados y soluciones aplicadas
- Próximos pasos a seguir

## Plan de Implementación Secuencial

A continuación se presenta el plan de implementación secuencial que lista cada endpoint en orden de prioridad, considerando las dependencias entre ellos y su relación con los componentes del frontend.

### Fase 1: Autenticación y Base del Sistema (Explotaciones)

1. **GET `/api/v1/auth/me`**
   - **Frontend**: Componente `AuthProvider.tsx`
   - **Dependencias**: Ninguna
   - **Justificación**: Verificar que la autenticación funciona correctamente es el primer paso, ya que todas las demás funcionalidades dependen de ello.

2. **GET `/api/v1/explotacions/`**
   - **Frontend**: Componente `ExplotacionsList.tsx`
   - **Dependencias**: Autenticación
   - **Justificación**: Las explotaciones son la entidad base del sistema, y muchos otros endpoints dependen de tener explotaciones válidas.

3. **GET `/api/v1/explotacions/{id}`**
   - **Frontend**: Componente `ExplotacionDetail.tsx`
   - **Dependencias**: Endpoint GET `/api/v1/explotacions/`
   - **Justificación**: Necesario para ver los detalles de una explotación específica.

4. **POST `/api/v1/explotacions/`**
   - **Frontend**: Componente `ExplotacionForm.tsx`
   - **Dependencias**: Endpoint GET `/api/v1/explotacions/`
   - **Justificación**: Permite crear nuevas explotaciones, necesario para pruebas si no hay datos suficientes.

5. **PUT `/api/v1/explotacions/{id}`**
   - **Frontend**: Componente `ExplotacionForm.tsx`
   - **Dependencias**: Endpoint GET `/api/v1/explotacions/{id}`
   - **Justificación**: Permite actualizar explotaciones existentes.

6. **DELETE `/api/v1/explotacions/{id}`**
   - **Frontend**: Componente `ExplotacionDetail.tsx`
   - **Dependencias**: Endpoint GET `/api/v1/explotacions/{id}`
   - **Justificación**: Permite eliminar explotaciones.

### Fase 2: Gestión de Animales

7. **GET `/api/v1/animals/`**
   - **Frontend**: Componente `AnimalsList.tsx`
   - **Dependencias**: Endpoints de explotaciones
   - **Justificación**: Lista de animales, entidad principal del negocio.

8. **GET `/api/v1/animals/{id}`**
   - **Frontend**: Componente `AnimalDetail.tsx`
   - **Dependencias**: Endpoint GET `/api/v1/animals/`
   - **Justificación**: Necesario para ver los detalles de un animal específico.

9. **POST `/api/v1/animals/`**
   - **Frontend**: Componente `AnimalForm.tsx`
   - **Dependencias**: Endpoints GET `/api/v1/explotacions/` y GET `/api/v1/animals/`
   - **Justificación**: Permite crear nuevos animales, necesario para pruebas si no hay datos suficientes.
   - **Nota**: Se mejoró la búsqueda de explotaciones por nombre para facilitar la creación de nuevos animales.

10. **PUT `/api/v1/animals/{id}`**
    - **Frontend**: Componente `AnimalForm.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}`
    - **Justificación**: Permite actualizar animales existentes, incluyendo cambios en el estado y amamantamiento.

11. **DELETE `/api/v1/animals/{id}`**
    - **Frontend**: Componente `AnimalDetail.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}`
    - **Justificación**: Permite eliminar animales.

### Fase 3: Gestión de Partos

12. **GET `/api/v1/animals/{id}/parts`**
    - **Frontend**: Componente `PartsList.tsx` dentro de `AnimalDetail.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}`
    - **Justificación**: Necesario para ver el historial de partos de un animal.

13. **POST `/api/v1/animals/{id}/parts`**
    - **Frontend**: Componente `PartForm.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}/parts`
    - **Justificación**: Permite registrar nuevos partos, afecta al estado de amamantamiento del animal.

14. **GET `/api/v1/animals/{id}/parts/{part_id}`**
    - **Frontend**: Componente `PartDetail.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}/parts`
    - **Justificación**: Necesario para ver los detalles de un parto específico.

15. **PUT `/api/v1/animals/{id}/parts/{part_id}`**
    - **Frontend**: Componente `PartForm.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/animals/{id}/parts/{part_id}`
    - **Justificación**: Permite actualizar información de partos existentes.

### Fase 4: Importación de Datos

16. **POST `/api/v1/imports/`**
    - **Frontend**: Componente `ImportForm.tsx`
    - **Dependencias**: Endpoints de animales y explotaciones
    - **Justificación**: Permite importar datos masivamente, útil para cargar datos de prueba o migrar desde sistemas antiguos.

### Fase 5: Dashboard (Visualización de Datos)

17. **GET `/api/v1/dashboard/stats`**
    - **Frontend**: Componente `Dashboard.tsx`
    - **Dependencias**: Todos los endpoints anteriores funcionando correctamente
    - **Justificación**: Proporciona estadísticas generales del sistema, depende de tener datos válidos en todas las entidades.

18. **GET `/api/v1/dashboard/explotacions/{id}`**
    - **Frontend**: Componente `DashboardExplotacio.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/dashboard/stats` y GET `/api/v1/explotacions/{id}`
    - **Justificación**: Proporciona estadísticas específicas de una explotación.

### Fase 6: Administración de Usuarios (Si es necesario)

19. **GET `/api/v1/auth/users`**
    - **Frontend**: Componente `UsersList.tsx`
    - **Dependencias**: Autenticación
    - **Justificación**: Lista de usuarios del sistema.

20. **POST `/api/v1/auth/register`**
    - **Frontend**: Componente `UserForm.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/auth/users`
    - **Justificación**: Permite crear nuevos usuarios.

21. **PUT `/api/v1/auth/users/{id}`**
    - **Frontend**: Componente `UserForm.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/auth/users`
    - **Justificación**: Permite actualizar usuarios existentes.

22. **DELETE `/api/v1/auth/users/{id}`**
    - **Frontend**: Componente `UserDetail.tsx`
    - **Dependencias**: Endpoint GET `/api/v1/auth/users`
    - **Justificación**: Permite eliminar usuarios.

## Seguimiento de Progreso

Para cada endpoint, se registrará el progreso en la siguiente tabla:

| # | Endpoint | Estado | Problemas Identificados | Solución Aplicada | Fecha |
|---|----------|--------|------------------------|-------------------|-------|
| 1 | GET `/api/v1/auth/me` | ✅ Funcional | Requiere token JWT válido en el encabezado de autorización | Verificado con token obtenido de `/api/v1/auth/login` | 2025-03-20 |
| 2 | POST `/api/v1/imports/` | ✅ Funcional | Campo `alletar` no soportaba 3 estados posibles | Actualizado modelo `Animal` para usar `CharEnumField` con enum `EstadoAlletar` y modificado servicio de importación | 2025-03-20 |
| 3 | GET `/api/v1/animals/` | ✅ Funcional | Tipos de datos incorrectos en el esquema | Corregidos tipos de `explotacio` y `alletar` de `int` a `str` en `AnimalBase` | 2025-03-20 |
| 4 | GET `/api/v1/animals/{id}` | ✅ Funcional | Tipos de datos incorrectos en el esquema | Corregidos tipos de `explotacio` y `alletar` de `int` a `str` en `AnimalBase` | 2025-03-20 |
| 5 | POST `/api/v1/animals/` | ✅ Funcional | 1. Problemas con el formato JSON en PowerShell<br>2. Buscaba explotaciones solo por ID | 1. Creado archivo temporal con el JSON para la solicitud<br>2. Modificado endpoint para buscar explotaciones por ID o nombre | 2025-03-20 |
| 6 | PATCH `/api/v1/animals/{id}` | ✅ Funcional | Ninguno | N/A | 2025-03-20 |
| 7 | DELETE `/api/v1/animals/{id}` | ✅ Funcional | Ninguno | N/A | 2025-03-20 |
| 8 | GET `/api/v1/explotacions/` | ✅ Funcional | Inconsistencia en el nombre del campo (explotaci vs explotacio) | Documentado para futura refactorización | 2025-03-21 |
| 9 | GET `/api/v1/explotacions/{id}` | ✅ Funcional | Inconsistencia en el nombre del campo (explotaci vs explotacio) | Documentado para futura refactorización | 2025-03-21 |
| 10 | POST `/api/v1/explotacions/` | ✅ Funcional | Inconsistencia en el nombre del campo (explotaci vs explotacio) | Documentado para futura refactorización | 2025-03-21 |
| 11 | PUT `/api/v1/explotacions/{id}` | ✅ Funcional | Inconsistencia en el nombre del campo (explotaci vs explotacio) | Documentado para futura refactorización | 2025-03-21 |
| 12 | DELETE `/api/v1/explotacions/{id}` | ✅ Implementado | No estaba implementado inicialmente | Implementado endpoint para eliminar explotaciones | 2025-03-21 |
## Lecciones Aprendidas y Soluciones a Problemas Comunes

Esta sección documenta los problemas encontrados durante el desarrollo y las soluciones implementadas, para facilitar la resolución de problemas similares en el futuro.

### 1. Problemas de Autenticación

| Problema | Solución | Detalles |
|----------|----------|----------|
| Error "Credenciales incorrectos" a pesar de usar credenciales válidas | Corregir la URL de conexión a la base de datos | La aplicación estaba intentando conectarse a `192.168.68.57` en lugar de `localhost` o `host.docker.internal`. Esto se debía a que en `main.py` se estaba sobrescribiendo la configuración de la base de datos. |
| Conflicto entre `postgresql://` y `postgres://` | Asegurar que se use `postgres://` con Tortoise ORM | Tortoise ORM requiere el formato `postgres://` en lugar de `postgresql://`. Se modificó la propiedad `database_url` en `config.py` y se añadió una verificación en `database.py` para asegurar el formato correcto. |
| Problemas con Docker y conexiones locales | Usar `host.docker.internal` en entornos Docker | Para conexiones desde contenedores Docker a la máquina host, se debe usar `host.docker.internal` en lugar de `localhost`. Se implementó una lógica para reemplazar automáticamente según el entorno. |

### 2. Problemas de Importación de Datos

| Problema | Solución | Detalles |
|----------|----------|----------|
| Errores con campos `genereT` y `estadoT` | Implementar manejo flexible de tipos de datos | Se modificó el servicio de importación para aceptar tanto valores numéricos como cadenas de texto para estos campos, convirtiendo automáticamente según sea necesario. |
| Fallos al importar datos con formatos inconsistentes | Añadir validación y normalización de datos | Se implementó un proceso de limpieza y normalización de datos antes de la importación, incluyendo el manejo de valores nulos, espacios en blanco y formatos de fecha. |
| Errores al procesar archivos CSV grandes | Implementar importación por lotes | Se modificó el proceso de importación para procesar los datos en lotes más pequeños, reduciendo el consumo de memoria y mejorando la estabilidad. |

### 3. Problemas con Endpoints y Rutas

| Problema | Solución | Detalles |
|----------|----------|----------|
| Confusión con la ruta de autenticación | Documentar la ruta completa con prefijo | La ruta correcta para autenticación es `/api/v1/auth/login`, no `/auth/login`, debido al prefijo configurado en `main.py`. |
| Inconsistencia entre frontend y backend | Estandarizar nomenclatura de rutas | Se estableció una convención para nombrar rutas y endpoints, asegurando consistencia entre frontend y backend. |
| Problemas de CORS | Configurar correctamente los headers CORS | Se implementó una configuración CORS permisiva para desarrollo, y una más restrictiva para producción. |
| Inconsistencia en el nombre del campo de explotación | Documentar para futura refactorización | Se identificó que el modelo `Explotacio` usa el campo `explotaci` en lugar de `explotacio`, lo que podría causar confusión. Se recomienda estandarizar la nomenclatura en una futura refactorización. |

### 4. Buenas Prácticas Identificadas

1. **Centralizar configuración**: Mantener toda la configuración de conexión a la base de datos en un solo lugar para evitar inconsistencias.
2. **Logging detallado**: Implementar logs detallados para facilitar la depuración de problemas.
3. **Scripts de prueba directa**: Crear scripts independientes para probar funcionalidades críticas directamente, sin pasar por la API.
4. **Manejo flexible de datos**: Implementar validación y normalización de datos para manejar entradas inconsistentes.
5. **Documentación de problemas y soluciones**: Mantener este documento actualizado con los problemas encontrados y sus soluciones.



Análisis Revisado de Problemas - Enfoque en la Conexión Frontend-Backend
Problema Principal: Conexión Frontend-Backend
El problema más preocupante es que el frontend no conecta correctamente con el backend ni con la base de datos. Esto podría deberse a varias causas:

Posibles Causas:
Configuración del Proxy en el Frontend:
El proxy podría no estar correctamente configurado para redirigir las solicitudes al backend
Podría haber discrepancias entre las rutas esperadas por el frontend y las implementadas en el backend
Problemas con las URLs de la API:
Las URLs utilizadas en los servicios del frontend podrían no coincidir con las rutas del backend
Podría faltar el prefijo /api/v1 en algunas solicitudes
Manejo de Tokens de Autenticación:
El token JWT podría no estar siendo incluido correctamente en las solicitudes
Podría haber problemas con el almacenamiento o la renovación del token
Configuración de la Base de Datos:
Podría haber problemas con la conexión a la base de datos desde el backend
La cadena de conexión podría ser incorrecta o inaccesible
Manejo de Errores Inadecuado:
El frontend podría no estar manejando correctamente los errores de las solicitudes
Podría haber problemas con las respuestas de error del backend
Verificaciones Necesarias:
Revisar la Configuración del Proxy:
Verificar el archivo de configuración del proxy en el frontend
Comprobar que las rutas se redirigen correctamente
Examinar los Servicios de API en el Frontend:
Revisar cómo se construyen las URLs de la API
Verificar que se incluye el prefijo /api/v1 en todas las solicitudes
Verificar el Manejo de Autenticación:
Comprobar cómo se almacena y se incluye el token en las solicitudes
Revisar el proceso de renovación del token si existe
Comprobar la Configuración de la Base de Datos:
Verificar la cadena de conexión en el backend
Comprobar que la base de datos está accesible desde el servidor
Analizar los Logs del Backend:
Buscar errores relacionados con las solicitudes del frontend
Identificar patrones en los errores
Plan de Acción Propuesto:
Verificar la Configuración del Proxy y las URLs de la API:
Examinar los archivos de configuración del frontend
Revisar los servicios de API para asegurar que usan las rutas correctas
Analizar los Logs del Backend:
Activar logs detallados si no están activados
Identificar patrones en los errores de conexión
Verificar la Conexión a la Base de Datos:
Comprobar la configuración de la base de datos en el backend
Realizar pruebas directas de conexión
Revisar el Manejo de Errores:
Mejorar el manejo de errores en el frontend para proporcionar información más útil
Asegurar que el backend devuelve respuestas de error adecuadas

temas pendientes del DASHBOARD

1. Corregir el problema del modo oscuro con las tarjetas
El problema principal es que las tarjetas tienen fondos claros pero no se adaptan bien al modo oscuro. Deberíamos:

Añadir bordes a las tarjetas para que sean visibles en modo oscuro
Asegurar que el texto sea oscuro dentro de las tarjetas claras
Usar clases que respondan al modo oscuro (dark:)
Por ejemplo, para el componente StatCard:

tsx
CopyInsert
const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
  <div className={`stat-card ${color} p-4 rounded-lg shadow-md flex items-center border border-gray-200 dark:border-gray-700 text-gray-800`}>
    <div className="stat-icon mr-4 text-3xl">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
Y para los contenedores de gráficos:

tsx
CopyInsert
<div className="chart-container bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-semibold mb-4 dark:text-white">Estado de Amamantamiento</h2>
  ...
</div>
2. Ajustar las estadísticas de amamantamiento
El problema es que muestra 42 de 43 vacas amamantando, lo cual parece irreal. Deberíamos:

Revisar cómo se calculan estos datos
Asegurarnos de que los datos sean más realistas
Posiblemente añadir una validación para detectar datos anómalos
3. Añadir estadísticas más relevantes relacionadas con explotaciones
Podríamos añadir:

Número de animales por explotación
Comparativa entre explotaciones
Distribución de tipos de animales por explotación
Rendimiento/productividad por explotación
4. Corregir los enlaces a las páginas
Asegurarnos de que los enlaces a las páginas de animales y explotaciones funcionen correctamente:

Verificar que las rutas existen
Añadir parámetros necesarios si hacen falta
Considerar usar componentes Link en lugar de etiquetas
5. Añadir un listado de animales
Añadir una tabla con los animales de la explotación seleccionada:

tsx
CopyInsert
<div className="animal-list bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mt-6 border border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-semibold mb-4 dark:text-white">Listado de Animales</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Género</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {/* Aquí iría el listado de animales */}
      </tbody>
    </table>
  </div>
</div>
Recomendación para implementar estos cambios
Para implementar estos cambios, te recomendaría:

Primero, crear un nuevo servicio para obtener el listado de animales por explotación
Luego, modificar el componente Dashboard2 para incluir las mejoras de diseño y las nuevas estadísticas
Finalmente, añadir la tabla de animales y asegurarse de que los enlaces funcionan correctamente
