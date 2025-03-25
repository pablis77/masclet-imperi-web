# Documentación de Tests - Masclet Imperi

## Introducción
Este documento detalla los endpoints disponibles en la API de Masclet Imperi, los tests asociados y los resultados de su validación. El objetivo es garantizar que todos los endpoints funcionen correctamente y estén cubiertos por tests funcionales.

---

## Endpoints por Módulo

### 1. Autenticación

| Endpoint | Método | Descripción | Tests Asociados | Estado |
|----------|--------|-------------|-----------------|--------|
| `/api/v1/auth/login` | POST | Inicio de sesión | `new_tests/auth/test_auth.py` | ✅ Exitoso |
| `/api/v1/auth/signup` | POST | Registro de usuario | `backend/test_auth.py` |
| `/api/v1/auth/me` | GET | Obtener información del usuario actual | `backend/test_auth.py` |
| `/api/v1/auth/refresh` | POST | Renovación de token | `new_tests/auth/test_auth.py` | ✅ Exitoso |
| `/api/v1/auth/users` | GET | Listado de usuarios | `backend/test_auth.py` |
| `/api/v1/auth/users/{user_id}` | DELETE | Eliminar usuario | `backend/test_auth.py` |
| `/api/v1/auth/users/{user_id}/password` | PATCH | Cambiar contraseña de usuario | `backend/test_auth.py` |

#### Detalles de los Tests
- **Login**:
  - **Código de Estado**: 200
  - **Token Generado**: `eyJhbGciOiJIUzI1NiIs...` (truncado por seguridad)
- **Renovación de Token**:
  - **Código de Estado**: 200
  - **Nuevo Token Generado**: `eyJhbGciOiJIUzI1NiIs...` (truncado por seguridad)

### 2. Dashboard

| Endpoint | Método | Descripción | Tests Asociados |
|----------|--------|-------------|-----------------|
| `/api/v1/dashboard/stats` | GET | Estadísticas generales | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/explotacions/{id}` | GET | Estadísticas por explotación | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/resumen` | GET | Resumen general | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/partos` | GET | Estadísticas de partos | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/combined` | GET | Estadísticas combinadas | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/recientes` | GET | Actividad reciente | `test_all_dashboard_endpoints.py` |
| `/api/v1/dashboard/explotacions` | GET | Lista de explotaciones | `test_all_dashboard_endpoints.py` |

### 3. Animales

| Endpoint | Método | Descripción | Tests Asociados |
|----------|--------|-------------|-----------------|
| `/api/v1/animals/` | GET | Listado de animales | `test_animals.py` |
| `/api/v1/animals/{id}` | GET | Detalle de un animal | `test_animals.py` |
| `/api/v1/animals/` | POST | Crear nuevo animal | `test_animals.py` |
| `/api/v1/animals/{id}` | PATCH | Actualizar animal | `test_animals.py` |
| `/api/v1/animals/{id}` | DELETE | Eliminar animal | `test_animals.py` |

### 4. Partos

| Endpoint | Método | Descripción | Tests Asociados |
|----------|--------|-------------|-----------------|
| `/api/v1/partos/` | GET | Listar todos los partos | `test_partos.py` |
| `/api/v1/partos/{id}` | GET | Detalle de un parto | `test_partos.py` |
| `/api/v1/partos/{id}` | PUT | Actualizar parto | `test_partos.py` |
| `/api/v1/animals/{id}/parts` | GET | Listar partos de un animal | `test_partos.py` |
| `/api/v1/animals/{id}/parts` | POST | Registrar nuevo parto para un animal | `test_partos.py` |
| `/api/v1/animals/{id}/parts/{part_id}` | PUT | Actualizar parto de un animal | `test_partos.py` |

### 5. Explotaciones

| Endpoint | Método | Descripción | Tests Asociados |
|----------|--------|-------------|-----------------|
| `/api/v1/explotacions/` | GET | Listado de explotaciones | `test_explotacions.py`, `test_all_dashboard_endpoints.py` |
| `/api/v1/explotacions/{id}` | GET | Detalle de una explotación | `test_explotacions.py`, `test_all_dashboard_endpoints.py` |
| `/api/v1/explotacions/` | POST | Crear nueva explotación | `test_explotacions.py` |
| `/api/v1/explotacions/{id}` | PUT | Actualizar explotación | `test_explotacions.py` |
| `/api/v1/explotacions/{id}` | DELETE | Eliminar explotación | `test_explotacions.py` |

### 6. Importación

| Endpoint | Método | Descripción | Tests Asociados |
|----------|--------|-------------|-----------------|
| `/api/v1/imports/` | GET | Obtener lista de importaciones | `backend/tests/data/test_imports.py` |
| `/api/v1/imports/csv` | POST | Importación de datos CSV | `backend/tests/data/test_imports.py` |
| `/api/v1/imports/{import_id}` | GET | Obtener estado de una importación | `backend/tests/data/test_imports.py` |

---

## Tests Asociados

### Importación

#### Archivo: `tests/data/test_imports.py`

1. **`POST /api/v1/imports/preview`**
   - **Descripción**: Genera una vista previa de un archivo CSV antes de importarlo.
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que la respuesta contiene claves como `headers`, `preview`, `total_rows`, `valid_rows`, y `errors`.
     - Valida que los encabezados del CSV coincidan con los esperados.
   - **Estado**: Pendiente de validación.

2. **`test_available_routes`**
   - **Descripción**: Lista todas las rutas disponibles en la aplicación para depuración.
   - **Funcionalidad Cubierta**:
     - No está directamente asociado a un endpoint específico, pero ayuda a identificar rutas disponibles.
   - **Estado**: Pendiente de validación.

### Animales

#### Archivo: `tests/test_endpoints.py`

1. **`POST /create_animal`**
   - **Descripción**: Crea un animal básico (endpoint no estándar).
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que la respuesta contiene la clave `success`.
   - **Estado**: Pendiente de validación.

#### Archivo: `tests/api/test_animals.py`

1. **`GET /api/v1/animals/`**
   - **Descripción**: Lista todos los animales registrados.
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que la respuesta es una lista.
   - **Estado**: Pendiente de validación.

2. **`POST /api/v1/animals/`**
   - **Descripción**: Crea un nuevo animal con datos válidos.
   - **Funcionalidad Cubierta**:
     - Verifica que el código de estado es `201`.
     - Comprueba que la respuesta contiene un mensaje de éxito y los datos del animal creado.
   - **Estado**: Pendiente de validación.

3. **`GET /api/v1/animals-new`**
   - **Descripción**: Endpoint optimizado para listar animales (experimental).
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que la respuesta es una lista.
   - **Estado**: Pendiente de validación.

#### Archivo: `backend/test_terneros_count.py`

1. **Estadísticas de Animales**
   - **Descripción**: Calcula estadísticas relacionadas con animales, como total de animales, terneros y distribución por amamantamiento.
   - **Funcionalidad Cubierta**:
     - Imprime estadísticas para depuración.
     - No está directamente asociado a un endpoint específico.
   - **Estado**: Pendiente de validación.

### Explotaciones

#### Archivo: `backend/test_all_dashboard_endpoints.py`

1. **`GET /api/v1/dashboard/explotacions`**
   - **Descripción**: Lista todas las explotaciones disponibles.
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que la respuesta contiene una lista de explotaciones.
   - **Estado**: Pendiente de validación.

2. **`GET /api/v1/dashboard/explotacions/{id}`**
   - **Descripción**: Obtiene estadísticas de una explotación específica.
   - **Funcionalidad Cubierta**:
     - Verifica que el endpoint responde con un código de estado `200`.
     - Comprueba que las estadísticas incluyen datos relevantes como animales, partos, etc.
     - Prueba con y sin parámetros de fecha (`start_date`, `end_date`).
   - **Estado**: Pendiente de validación.

3. **Otros Endpoints del Dashboard**
   - **Descripción**: Incluye pruebas para endpoints generales del dashboard, como estadísticas combinadas y actividad reciente.
   - **Funcionalidad Cubierta**:
     - Verifica que los endpoints responden correctamente con datos relevantes.
   - **Estado**: Pendiente de validación.

---

## Resultados de Validación

### Pendiente
- Ejecutar los tests identificados.
- Documentar los resultados y corregir los tests que no funcionen.

---