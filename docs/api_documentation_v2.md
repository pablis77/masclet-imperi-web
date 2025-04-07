# Documentación API de Masclet Imperi Web (v2)

## Introducción

Esta documentación describe todos los endpoints disponibles en la API de Masclet Imperi Web, su funcionamiento, parámetros requeridos y las respuestas esperadas. Está diseñada para servir como guía completa tanto para el desarrollo frontend como para integraciones futuras.

## Tablas de la Base de Datos

La aplicación utiliza las siguientes tablas:

1. `animals`: Almacena información de los animales
2. `part`: Registra los partos de los animales
3. `animal_history`: Guarda el historial de cambios en los animales
4. `users`: Gestiona los usuarios del sistema
5. `imports`: Registra las importaciones de datos
6. `aerich`: Tabla de gestión de migraciones
7. `test_custom_dates`, `test_dates`: Tablas auxiliares para pruebas

## Estructura Detallada de la Base de Datos

### Tabla: animals

| Campo      | Tipo      | Nulo | Valor por defecto         | Descripción                       |
| ---------- | --------- | ---- | ------------------------- | ---------------------------------- |
| id         | integer   | NO   | nextval('animals_id_seq') | ID técnico autogenerado           |
| explotacio | varchar   | NO   |                           | Identificador de la explotación   |
| nom        | varchar   | NO   |                           | Nombre del animal                  |
| genere     | varchar   | NO   |                           | Género del animal (M/F)           |
| estado     | varchar   | NO   | 'OK'                      | Estado (OK/DEF)                    |
| pare       | varchar   | SI   |                           | Padre del animal                   |
| mare       | varchar   | SI   |                           | Madre del animal                   |
| quadra     | varchar   | SI   |                           | Cuadra/ubicación                  |
| cod        | varchar   | SI   |                           | Código identificativo (único)    |
| num_serie  | varchar   | SI   |                           | Número de serie oficial           |
| dob        | date      | SI   |                           | Fecha de nacimiento                |
| created_at | timestamp | NO   | CURRENT_TIMESTAMP         | Fecha de creación                 |
| updated_at | timestamp | NO   | CURRENT_TIMESTAMP         | Fecha de actualización            |
| part       | varchar   | SI   |                           | Campo para fecha de parto (legacy) |
| alletar    | varchar   | SI   | 0                         | Estado de amamantamiento (0,1,2)   |

**Restricciones e Índices:**

- `animals_pkey`: Clave primaria en id
- `animals_cod_key`: Valor único en cod
- `idx_animals_explotacio`, `idx_animals_nom`: Índices de búsqueda

### Tabla: part

| Campo        | Tipo      | Nulo | Valor por defecto      | Descripción                        |
| ------------ | --------- | ---- | ---------------------- | ----------------------------------- |
| id           | integer   | NO   | nextval('part_id_seq') | ID técnico                         |
| part         | date      | NO   |                        | Fecha del parto                     |
| GenereT      | varchar   | NO   |                        | Género de la cría (M/F/esforrada) |
| EstadoT      | varchar   | NO   | 'OK'                   | Estado de la cría (OK/DEF)         |
| numero_part  | integer   | NO   |                        | Número del parto                   |
| observacions | text      | SI   |                        | Observaciones del parto             |
| created_at   | timestamp | NO   | CURRENT_TIMESTAMP      | Fecha de creación                  |
| updated_at   | timestamp | NO   | CURRENT_TIMESTAMP      | Fecha de actualización             |
| animal_id    | integer   | NO   |                        | ID del animal (referencia)          |

**Restricciones e Índices:**

- `part_pkey`: Clave primaria en id
- `part_animal_id_fkey`: Clave foránea a animals.id
- `idx_part_animal_id`: Índice para búsquedas por animal

### Tabla: animal_history

| Campo          | Tipo    | Nulo | Descripción                   |
| -------------- | ------- | ---- | ------------------------------ |
| id             | integer | NO   | ID técnico                    |
| usuario        | varchar | NO   | Usuario que realizó el cambio |
| cambio         | text    | NO   | Descripción del cambio        |
| campo          | varchar | NO   | Campo que se modificó         |
| valor_anterior | text    | SI   | Valor anterior                 |
| valor_nuevo    | text    | SI   | Valor nuevo                    |
| animal_id      | integer | NO   | ID del animal (referencia)     |

**Relación:**

- `animal_id` referencia a `animals.id`

### Tabla: users

| Campo         | Tipo      | Nulo | Valor por defecto       | Descripción                 |
| ------------- | --------- | ---- | ----------------------- | ---------------------------- |
| id            | integer   | NO   | nextval('users_id_seq') | ID técnico                  |
| username      | varchar   | NO   |                         | Nombre de usuario (único)   |
| password_hash | varchar   | NO   |                         | Hash de la contraseña       |
| email         | varchar   | NO   |                         | Correo electrónico (único) |
| role          | varchar   | NO   | 'usuario'               | Rol del usuario              |
| is_active     | boolean   | NO   | true                    | Si el usuario está activo   |
| created_at    | timestamp | NO   | CURRENT_TIMESTAMP       | Fecha de creación           |
| updated_at    | timestamp | NO   | CURRENT_TIMESTAMP       | Fecha de actualización      |

**Restricciones e Índices:**

- `users_pkey`: Clave primaria en id
- `users_email_key`: Valor único en email
- `users_username_key`: Valor único en username

## Endpoints API (Completos)

### Endpoints de Animales

| Método | URL                                 | Función            | Descripción                       |
| ------- | ----------------------------------- | ------------------- | ---------------------------------- |
| POST    | /api/v1/animals/                    | create_animal       | Crear un nuevo animal              |
| GET     | /api/v1/animals/                    | list_animals        | Listar animales (con filtros)      |
| GET     | /api/v1/animals/{animal_id}         | get_animal          | Obtener un animal específico      |
| PATCH   | /api/v1/animals/{animal_id}         | update_animal_patch | Actualizar parcialmente un animal  |
| PUT     | /api/v1/animals/{animal_id}         | update_animal       | Actualizar completamente un animal |
| DELETE  | /api/v1/animals/{animal_id}         | delete_animal       | Eliminar un animal                 |
| GET     | /api/v1/animals/{animal_id}/history | get_animal_history  | Ver historial de cambios           |
| GET     | /api/v1/animals/{animal_id}/parts   | get_animal_parts    | Ver partos de un animal            |

### Endpoints de Autenticación

| Método | URL                                   | Función               | Descripción                            |
| ------- | ------------------------------------- | ---------------------- | --------------------------------------- |
| POST    | /api/v1/auth/login                    | login_for_access_token | Iniciar sesión                         |
| GET     | /api/v1/auth/me                       | get_current_user_info  | Obtener información del usuario actual |
| POST    | /api/v1/auth/refresh                  | refresh_access_token   | Renovar token de acceso                 |
| POST    | /api/v1/auth/signup                   | register_user          | Registrar un nuevo usuario              |
| GET     | /api/v1/auth/users                    | get_users              | Listar usuarios (solo admin)            |
| DELETE  | /api/v1/auth/users/{user_id}          | delete_user            | Eliminar usuario                        |
| PATCH   | /api/v1/auth/users/{user_id}/password | change_user_password   | Cambiar contraseña                     |

### Endpoints de Dashboard

| Método | URL                                                     | Función             | Descripción                      |
| ------- | ------------------------------------------------------- | -------------------- | --------------------------------- |
| GET     | /api/v1/dashboard/combined                              | get_combined_stats   | Estadísticas combinadas          |
| GET     | /api/v1/dashboard/explotacions                          | list_explotacions    | Listar explotaciones              |
| GET     | /api/v1/dashboard/explotacions/{explotacio_value}       | get_explotacio_info  | Información de una explotación  |
| GET     | /api/v1/dashboard/explotacions/{explotacio_value}/stats | get_explotacio_stats | Estadísticas de una explotación |
| GET     | /api/v1/dashboard/partos                                | get_partos_stats     | Estadísticas de partos           |
| GET     | /api/v1/dashboard/recientes                             | get_recent_activity  | Actividad reciente                |
| GET     | /api/v1/dashboard/resumen                               | obtener_resumen      | Resumen general                   |
| GET     | /api/v1/dashboard/resumen/                              | get_resumen_stats    | Estadísticas de resumen          |
| GET     | /api/v1/dashboard/stats                                 | get_stats            | Estadísticas generales           |

### Endpoints de Importación

| Método | URL                                | Función          | Descripción            |
| ------- | ---------------------------------- | ----------------- | ----------------------- |
| GET     | /api/v1/imports/                   | get_imports       | Listar importaciones    |
| POST    | /api/v1/imports/csv                | import_csv        | Importar archivo CSV    |
| GET     | /api/v1/imports/template           | download_template | Descargar plantilla CSV |
| GET     | /api/v1/imports/{import_id}        | get_import_status | Estado de importación  |
| GET     | /api/v1/imports/{import_id}/errors | get_import_errors | Errores de importación |

### Endpoints de Partos

| Método | URL                                            | Función           | Descripción                          |
| ------- | ---------------------------------------------- | ------------------ | ------------------------------------- |
| POST    | /api/v1/animals/{animal_id}/partos             | create_parto       | Crear parto para un animal            |
| GET     | /api/v1/animals/{animal_id}/partos             | get_partos         | Obtener partos de un animal           |
| GET     | /api/v1/animals/{animal_id}/partos/list        | list_animal_partos | Listar partos de un animal (paginado) |
| PUT     | /api/v1/animals/{animal_id}/partos/{parto_id}  | update_parto       | Actualizar parto (completo)           |
| PATCH   | /api/v1/animals/{animal_id}/partos/{parto_id}  | patch_parto        | Actualizar parto (parcial)            |
| GET     | /api/v1/animals/{animal_id}/partos/{parto_id}/ | get_parto          | Obtener detalle de un parto           |
| POST    | /api/v1/partos                                 | create_parto       | Crear parto (general)                 |
| GET     | /api/v1/partos                                 | list_partos        | Listar todos los partos               |
| GET     | /api/v1/partos/{parto_id}                      | get_parto          | Obtener detalle de parto              |
| PATCH   | /api/v1/partos/{parto_id}                      | update_parto       | Actualizar parto                      |

### Otros Endpoints

| Método | URL                  | Función              | Descripción            |
| ------- | -------------------- | --------------------- | ----------------------- |
| GET     | /api/v1/users/me     | get_current_user_info | Info usuario actual     |
| GET     | /api/v1/docs         | swagger_ui_html       | Documentación Swagger  |
| GET     | /api/v1/openapi.json | openapi               | Especificación OpenAPI |
| GET     | /api/v1/redoc        | redoc_html            | Documentación ReDoc    |
| GET     | /docs                | redirect_to_docs      | Redirección a docs     |

## Detalles de Endpoints Importantes

### Login

- **URL**: `/api/v1/auth/login`
- **Método**: POST
- **Autenticación**: No requerida
- **Parámetros**:
  - `username` (string, requerido): Nombre de usuario
  - `password` (string, requerido): Contraseña
- **Respuesta exitosa**:
  ```json
  {
    "access_token": "JWT_TOKEN",
    "token_type": "bearer",
    "role": "UserRole.ADMIN"
  }
  ```

### Listar Animales

- **URL**: `/api/v1/animals/`
- **Método**: GET
- **Autenticación**: Requerida
- **Parámetros Query String**:
  - `page` (int, opcional): Número de página (default: 1)
  - `limit` (int, opcional): Elementos por página (default: 10)
  - `search` (string, opcional): Búsqueda por nombre
  - `explotacio` (string, opcional): Filtro por explotación
  - `genere` (string, opcional): Filtro por género (M/F)
  - `estado` (string, opcional): Filtro por estado (OK/DEF)
  - `alletar` (string, opcional): Filtro por estado de amamantamiento (0/1/2)
- **Respuesta exitosa**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "nom": "Vaca1",
        "explotacio": "Gurans",
        "genere": "F",
        "estado": "OK",
        "alletar": "1",
        "pare": "Toro padre",
        "mare": "Vaca madre",
        "quadra": "Quadra principal",
        "cod": "VAC001",
        "num_serie": "ES12345678",
        "dob": "01/01/2020"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
  ```

### Historial de Animal

- **URL**: `/api/v1/animals/{animal_id}/history`
- **Método**: GET
- **Autenticación**: Requerida
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Respuesta exitosa**:
  ```json
  [
    {
      "id": 1,
      "animal_id": 123,
      "fecha": "01/04/2025 15:30",
      "usuario": "admin",
      "cambio": "Actualización de quadra",
      "campo": "quadra",
      "valor_anterior": "Quadra antigua",
      "valor_nuevo": "Quadra nueva"
    }
  ]
  ```

### Crear/Actualizar Parto

- **URL**: `/api/v1/animals/{animal_id}/partos` o `/api/v1/partos`
- **Método**: POST
- **Autenticación**: Requerida
- **Parámetros Body**:
  ```json
  {
    "animal_id": 123,
    "part": "15/03/2023",
    "GenereT": "M",
    "EstadoT": "OK",
    "numero_part": 2,
    "observacions": "Parto sin complicaciones"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "id": 45,
    "animal_id": 123,
    "part": "15/03/2023",
    "GenereT": "M",
    "EstadoT": "OK",
    "numero_part": 2,
    "observacions": "Parto sin complicaciones",
    "created_at": "07/04/2025 15:30",
    "updated_at": "07/04/2025 15:30"
  }
  ```

### Dashboard Resumen

- **URL**: `/api/v1/dashboard/resumen`
- **Método**: GET
- **Autenticación**: Requerida
- **Respuesta exitosa**:
  ```json
  {
    "total_animales": 150,
    "total_vacas": 100,
    "total_toros": 50,
    "total_terneros": 35,
    "por_explotacion": [
      {"explotacio": "Gurans", "total": 80}
    ],
    "por_estado": [
      {"estado": "OK", "total": 145},
      {"estado": "DEF", "total": 5}
    ]
  }
  ```

### Importar CSV

- **URL**: `/api/v1/imports/csv`
- **Método**: POST
- **Autenticación**: Requerida (admin)
- **Parámetros**: Archivo CSV (multipart/form-data)
- **Respuesta exitosa**:
  ```json
  {
    "import_id": 15,
    "filename": "datos_abril_2023.csv",
    "status": "PENDING"
  }
  ```

## Reglas de Negocio Importantes

### Animales

1. **Identificación de animales**:

   - Cada animal se identifica por su `nom` (nombre)
   - El campo `id` es solo para uso interno del sistema
   - El campo `cod` debe ser único cuando está presente
2. **Estados de animales**:

   - `OK`: Animal activo
   - `DEF`: Animal fallecido (definitivo, no se puede revertir)
3. **Género y amamantamiento**:

   - Campo `genere`: 'M' para toro, 'F' para vaca
   - Campo `alletar` (solo para vacas, `genere='F'`):
     - '0': No amamanta
     - '1': Amamanta a un ternero
     - '2': Amamanta a dos terneros
4. **Explotaciones**:

   - Cada animal debe pertenecer a una explotación existente
   - El campo `explotacio` identifica la explotación y es obligatorio

### Partos

1. **Restricciones de partos**:

   - Solo los animales hembra (`genere='F'`) pueden tener partos
   - Los partos son registros históricos y no pueden eliminarse
   - Si se proporciona una fecha de parto, los campos `GenereT` y `EstadoT` son obligatorios
2. **Género de cría**:

   - 'M': Macho
   - 'F': Hembra
   - 'esforrada': Aborto/No viable
3. **Número de parto**:

   - Cada parto tiene un número secuencial para esa vaca
   - El campo `numero_part` debe ser incrementado correctamente

### Usuarios y Roles

1. **Jerarquía de roles**:
   - Solo puede existir un usuario con rol ADMIN en el sistema
   - Roles disponibles: (cuando tengamos todo el frontend implementado se creará un neuvo ROL llamado GERENTE, que tendrá mas autorizacion que editor y menos que administrador)
     - ADMIN: Acceso completo a todas las funcionalidades
     - EDITOR: Puede crear, editar y consultar registros
     - USER: Solo puede consultar registros

## Guía para la Implementación Frontend

### Páginas Principales

1. **Dashboard**:

   - Endpoint: `/api/v1/dashboard/combined` o `/api/v1/dashboard/resumen`
   - Muestra resumen general:
     - Total de animales (vacas/toros)
     - Total de terneros (basado en estado de amamantamiento)
     - Gráficos de distribución por explotación y estado
2. **Listado de Animales**:

   - Endpoint: `/api/v1/animals/`
   - Tabla paginada con filtros
   - Acciones: Ver detalles, Editar, Eliminar (según rol)
3. **Detalle de Animal**:

   - Endpoint: `/api/v1/animals/{id}` y `/api/v1/animals/{id}/partos`
   - Muestra información completa del animal
   - Sección de partos asociados
   - Sección de historial de cambios
4. **Gestión de Partos**:

   - Endpoint: `/api/v1/partos/` o `/api/v1/animals/{id}/partos`
   - Tabla de partos con filtros
   - Formulario para registro de nuevos partos
5. **Estadísticas y Visualizaciones**:

   - Endpoint: `/api/v1/dashboard/partos` y otros endpoints de dashboard
   - Gráficos de tendencias temporales
   - Filtros por período
6. **Gestión de Usuarios** (solo ADMIN):

   - Endpoint: `/api/v1/auth/users`
   - Administración de usuarios y roles
7. **Importación de Datos** (solo ADMIN):

   - Endpoint: `/api/v1/imports/csv`
   - Carga de archivos CSV
   - Monitoreo de importaciones mediante `/api/v1/imports/{id}` y `/api/v1/imports/{id}/errors`

## Consideraciones Técnicas

1. **Autenticación**:

   - Los tokens JWT se obtienen via `/api/v1/auth/login`
   - La renovación de tokens es posible mediante `/api/v1/auth/refresh`
   - El token debe incluirse en todas las solicitudes autenticadas como `Authorization: Bearer {token}`
2. **Formato de Fechas**:

   - Las fechas se envían en formato DD/MM/YYYY en las respuestas API
   - Los timestamps incluyen hora en formato DD/MM/YYYY HH:MM
   - Para enviar fechas a la API, usar el mismo formato DD/MM/YYYY
3. **Gestión de Errores**:

   - Los errores devuelven códigos HTTP apropiados (400, 401, 403, 404, 500)
   - Los mensajes de error incluyen detalles sobre el problema
   - Para importaciones, verificar errores específicos en `/api/v1/imports/{id}/errors`
4. **Rendimiento**:

   - Utilizar paginación (parámetros `page` y `limit`) para listas grandes
   - Implementar caching en el frontend para datos estáticos como explotaciones
   - Para datos frecuentes, considerar polling periódico en lugar de recargas completas
