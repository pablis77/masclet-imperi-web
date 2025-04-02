# Estructura Revisada de la Base de Datos - Masclet Imperi

Este documento define la estructura revisada de la base de datos del sistema Masclet Imperi, enfocándose en un diseño centrado en el animal como entidad principal. El documento establece claramente qué tablas se mantienen, cuáles se eliminan y cómo deben funcionar los endpoints asociados.

## Principios de Diseño

1. **El animal como entidad principal**: Todo el sistema gira alrededor del animal.
2. **Explotaciones como atributo**: La explotación es simplemente un atributo del animal, no una entidad independiente.
3. **Historial de cambios**: Se mantiene un registro de los cambios realizados en las fichas de animales.
4. **Partos asociados a animales**: Los partos siempre están asociados a un animal específico (hembra).

## Estructura de Tablas Actual

Esta sección refleja la estructura real de la base de datos verificada tras la migración.

### Tablas Principales

#### 1. Tabla `animals`

La tabla principal que contiene todos los datos de los animales.

| Campo      | Tipo      | Nulo | Descripción                                                                                                                                           |
| ---------- | --------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id         | integer   | NO   | Identificador único (PK) (no CSV)                                                                                                                     |
| explotacio | varchar   | NO   | Código de explotación a la que pertenece (CSV)                                                                                                       |
| nom        | varchar   | NO   | Nombre del animal (CSV)                                                                                                                                |
| genere     | varchar   | NO   | Género (M/F) (CSV)                                                                                                                                    |
| estado     | varchar   | NO   | Estado (OK/DEF), valor por defecto 'OK' (CSV)                                                                                                          |
| pare       | varchar   | SÍ  | Padre del animal (CSV)                                                                                                                                 |
| mare       | varchar   | SÍ  | Madre del animal (CSV)                                                                                                                                 |
| quadra     | varchar   | SÍ  | Cuadra (es como el apellido) (CSV)                                                                                                                     |
| cod        | varchar   | SÍ  | Código identificativo (CSV)                                                                                                                           |
| num_serie  | varchar   | SÍ  | Número de serie oficial (CSV)                                                                                                                         |
| dob        | date      | SÍ  | Fecha de nacimiento (CSV)                                                                                                                              |
| part       | varchar   | SÍ  | Campo legado, no utilizado (CSV)                                                                                                                       |
| alletar    | varchar   | SÍ  | Estado de amamantamiento ("0", "1", "2") - Solo para hembras (CSV)  Para animales macho,`alletar` debe ser "0" en el CSV y nunca podrá ser 1 o 2 |
| created_at | timestamp | NO   | Fecha de creación, valor por defecto CURRENT_TIMESTAMP (no CSV)                                                                                       |
| updated_at | timestamp | NO   | Fecha de actualización, valor por defecto CURRENT_TIMESTAMP (no CSV)                                                                                  |

**Índices y Restricciones**:

- Clave primaria: `animals_pkey` - PRIMARY KEY (id)
- Índice único: `animals_cod_key` - UNIQUE (cod)
- Índice secundario: `idx_animals_explotacio` (para búsquedas eficientes por explotación)
- Índice secundario: `idx_animals_nom` (para búsquedas por nombre)

#### 2. Tabla `part`

Registra los partos asociados a animales hembra.

| Campo        | Tipo      | Nulo | Descripción                                                                 |
| ------------ | --------- | ---- | ---------------------------------------------------------------------------- |
| id           | integer   | NO   | Identificador único (PK) (no CSV)                                           |
| part         | date      | NO   | Fecha del parto (CSV)                                                        |
| GenereT      | varchar   | NO   | Género de la cría (M/F/E) (CSV)                                            |
| EstadoT      | varchar   | NO   | Estado de la cría (OK/DEF), valor por defecto 'OK' (CSV)                    |
| numero_part  | integer   | NO   | Número secuencial del parto para ese animal (No CSV)                        |
| observacions | text      | SÍ  | Observaciones adicionales (No CSV)                                           |
| created_at   | timestamp | NO   | Fecha de creación, valor por defecto CURRENT_TIMESTAMP (No CSV)             |
| updated_at   | timestamp | NO   | Fecha de última modificación, valor por defecto CURRENT_TIMESTAMP (No CSV) |
| animal_id    | integer   | NO   | ID del animal (FK a animals.id) (no CSV)                                     |

**Índices y Restricciones**:

- Clave primaria: `part_pkey` - PRIMARY KEY (id)
- Clave foránea: `part_animal_id_fkey` - FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
- Índice secundario: `idx_part_animal_id` (para búsquedas por animal)

#### 3. Tabla `animal_history`

Registra los cambios realizados en las fichas de los animales.

| Campo      | Tipo      | Nulo | Descripción                                                          |
| ---------- | --------- | ---- | --------------------------------------------------------------------- |
| id         | integer   | NO   | Identificador único (PK) (No CSV)                                    |
| field_name | varchar   | NO   | Nombre del campo modificado (No CSV)                                  |
| old_value  | varchar   | SÍ  | Valor anterior del campo (No CSV)                                     |
| new_value  | varchar   | SÍ  | Nuevo valor del campo (No CSV)                                        |
| changed_at | timestamp | NO   | Fecha y hora del cambio, valor por defecto CURRENT_TIMESTAMP (No CSV) |
| changed_by | varchar   | SÍ  | Usuario que realizó el cambio (No CSV)                               |
| animal_id  | integer   | NO   | ID del animal (FK a animals.id) (No CSV)                              |

**Índices y Restricciones**:

- Clave primaria: `animal_history_pkey` - PRIMARY KEY (id)
- Clave foránea: `animal_history_animal_id_fkey` - FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
- Índice secundario: `idx_animal_history_animal_id` (para búsquedas por animal)

#### 4. Tabla `users`

Gestión de usuarios del sistema.

| Campo         | Tipo      | Nulo | Descripción                                                                 |
| ------------- | --------- | ---- | ---------------------------------------------------------------------------- |
| id            | integer   | NO   | Identificador único (PK) (No CSV)                                           |
| username      | varchar   | NO   | Nombre de usuario (único) (No CSV)                                          |
| password_hash | varchar   | NO   | Hash de la contraseña (No CSV)                                              |
| email         | varchar   | NO   | Correo electrónico (único) (No CSV)                                        |
| role          | varchar   | NO   | Rol (admin, editor, usuario), valor por defecto 'usuario' (No CSV)           |
| is_active     | boolean   | NO   | Estado activo del usuario, valor por defecto true (No CSV)                   |
| created_at    | timestamp | NO   | Fecha de creación, valor por defecto CURRENT_TIMESTAMP (No CSV)             |
| updated_at    | timestamp | NO   | Fecha de última modificación, valor por defecto CURRENT_TIMESTAMP (No CSV) |

**Índices y Restricciones**:

- Clave primaria: `users_pkey` - PRIMARY KEY (id)
- Índice único: `users_email_key` - UNIQUE (email)
- Índice único: `users_username_key` - UNIQUE (username)

### Tablas Auxiliares y de Prueba

#### 1. Tabla `aerich`

Tabla utilizada por Aerich para gestionar las migraciones de la base de datos.

#### 2. Tabla `test_custom_dates`

Tabla utilizada para pruebas de formatos de fechas personalizados.

| Campo      | Tipo      | Nulo | Descripción                                                         |
| ---------- | --------- | ---- | -------------------------------------------------------------------- |
| id         | integer   | NO   | Identificador único (PK)                                            |
| date       | date      | NO   | Fecha de prueba                                                      |
| created_at | timestamp | NO   | Fecha de creación, valor por defecto CURRENT_TIMESTAMP              |
| updated_at | timestamp | NO   | Fecha de última actualización, valor por defecto CURRENT_TIMESTAMP |

#### 3. Tabla `test_dates`

Tabla utilizada para pruebas básicas de fechas.

| Campo | Tipo    | Nulo | Descripción              |
| ----- | ------- | ---- | ------------------------- |
| id    | integer | NO   | Identificador único (PK) |
| date  | date    | NO   | Fecha de prueba           |

### Tablas Eliminadas

#### 1. Tabla `explotacions`

Esta tabla se ha eliminado porque:

- La explotación es un atributo del animal, no una entidad independiente
- Toda la información necesaria está disponible en el campo `explotacio` de la tabla `animals`
- Las vistas de explotaciones se pueden generar agrupando los datos de animales

#### 2. Tabla `parts`

Esta tabla se ha eliminado porque:

- Es una duplicación innecesaria de la tabla `part`
- Genera confusión y puede llevar a inconsistencias en los datos

## Reglas de Negocio y Validaciones

### Reglas Fundamentales

1. **Usuarios**: Solo puede existir un administrador en el sistema. Roles definidos: administrador, editor, usuario.
2. **Animales**:
   - El estado "DEF" (fallecido) es definitivo y no puede revertirse.
   - Cada animal tiene un código único (`cod`) que no puede repetirse.
3. **Partos**:
   - Los partos son registros históricos y no pueden eliminarse.
   - Los partos siempre están asociados a una vaca específica.
   - Los partos solo aplican a animales hembras (genere: "F").
4. **Amamantamiento**:
   - Las hembras pueden tener tres estados de amamantamiento:
     - "NO": No amamanta
     - "1": Amamanta a un ternero
     - "2": Amamanta a dos terneros
   - El estado de amamantamiento es específico para vacas e influye directamente en el recuento de terneros.
   - El estado de amamantamiento es independiente del registro histórico de partos.

### Convenciones de Nombrado

1. **Explotaciones**:
   - El identificador único debe ser el campo 'explotacio' (string).
   - El campo 'nom' está reservado únicamente para animales.
2. **Animales**:
   - Se usa 'nom' para el nombre del animal.
   - Se usa 'explotacio' como referencia a la explotación.
3. **Fechas**:
   - El formato estándar de fechas en la API es DD/MM/YYYY.

## Endpoints y su Funcionamiento

### 1. Endpoints de Animales (`/api/v1/animals/`)

Estos endpoints mantienen su funcionalidad actual sin cambios:

- `POST /api/v1/animals/`: Crear un nuevo animal
- `GET /api/v1/animals/`: Listar animales (con filtros)
- `GET /api/v1/animals/{animal_id}`: Obtener detalles de un animal
- `PATCH /api/v1/animals/{animal_id}`: Actualizar parcialmente un animal
- `PUT /api/v1/animals/{animal_id}`: Actualizar completamente un animal
- `DELETE /api/v1/animals/{animal_id}`: Eliminar un animal
- `GET /api/v1/animals/{animal_id}/history`: Obtener el historial de cambios de un animal

### 2. Endpoints de Explotaciones (`/api/v1/explotacions/`)

Estos endpoints deben modificarse para trabajar directamente con la tabla `animals` en lugar de `explotacions`:

- `GET /api/v1/explotacions/`: Listar explotaciones únicas (agrupando por el campo `explotacio` de `animals`)
- `GET /api/v1/explotacions/{explotacio}`: Obtener detalles de una explotación (mostrando estadísticas y animales)

Los siguientes endpoints deberían eliminarse o rediseñarse para reflejar que las explotaciones son atributos, no entidades:

- `POST /api/v1/explotacions/`: Modifica la función para agregar el campo `explotacio` a un grupo de animales
- `PUT /api/v1/explotacions/{explotacio}`: Modifica la función para actualizar el campo `explotacio` en animales
- `DELETE /api/v1/explotacions/{explotacio}`: Modifica la función para actualizar o mover animales de una explotación

### 3. Endpoints de Dashboard (`/api/v1/dashboard/`)

Estos endpoints ya funcionan correctamente agrupando datos de animales por explotación:

- `GET /api/v1/dashboard/explotacions`: Listar explotaciones con sus estadísticas básicas
- `GET /api/v1/dashboard/explotacions/{explotacio_id}`: Obtener estadísticas detalladas de una explotación
- `GET /api/v1/dashboard/stats`: Obtener estadísticas generales del sistema
- `GET /api/v1/dashboard/resumen`: Obtener un resumen de todos los datos
- `GET /api/v1/dashboard/combined`: Obtener datos combinados para el dashboard
- `GET /api/v1/dashboard/recientes`: Obtener actividad reciente en el sistema
- `GET /api/v1/dashboard/partos`: Obtener estadísticas de partos

### 4. Endpoints de Partos

Los partos están estrechamente relacionados con los animales (específicamente las vacas):

- Endpoints anidados bajo animales (`/api/v1/animals/{animal_id}/partos/`):

  - `POST`: Crear un nuevo parto para un animal
  - `GET`: Obtener partos de un animal
  - `GET /list`: Listar partos de un animal
  - Operaciones sobre partos específicos (`/{parto_id}`)
- Endpoints independientes (`/api/v1/partos/`):

  - `POST`: Crear un nuevo parto (especificando el animal)
  - `GET`: Listar todos los partos
  - Operaciones sobre partos específicos (`/{parto_id}`)

**Nota**: La API maneja la relación entre los partos y animales utilizando:

- Al recibir datos: Recibe nom -> Busca la vaca por nom -> Obtiene el id de esa vaca -> Guarda el parto usando ese animal_id.
- Al enviar datos: Carga el parto (con animal_id) -> Carga la vaca relacionada usando animal_id -> Devuelve el nom de la vaca.

### 5. Endpoints Actuales de Importación

1. **`GET /api/v1/imports/`**
   * Obtiene la lista paginada de importaciones realizadas (historial)
   * Parámetros: page, size
   * En la implementación actual parece devolver un array vacío (pendiente)
2. **`POST /api/v1/imports/csv`** ⚠️
   * Importa datos desde un archivo CSV
   * Acepta el archivo como File y un campo description opcional
3. **`GET /api/v1/imports/{import_id}`**
   * Obtiene el estado de una importación específica
   * Usa un ID numérico en la ruta

#### IMPORTS nuevos

GET        /api/v1/imports/template                 download_template
GET        /api/v1/imports/{import_id}/errors       get_import_errors
