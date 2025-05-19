# Documentación API de Masclet Imperi Web

## Introducción

Esta documentación describe todos los endpoints disponibles en la API de Masclet Imperi Web, su funcionamiento, parámetros requeridos y las respuestas esperadas. Está diseñada para servir como guía completa tanto para el desarrollo frontend como para integraciones futuras.

## Convenciones API

- Todos los endpoints usan formato JSON para solicitudes y respuestas
- La autenticación se realiza mediante token JWT en el encabezado `Authorization: Bearer {token}`
- Los códigos de estado HTTP siguen los estándares:
  - 200: Solicitud exitosa
  - 201: Recurso creado exitosamente
  - 400: Error en la solicitud del cliente
  - 401: Error de autenticación
  - 403: Error de permisos
  - 404: Recurso no encontrado
  - 500: Error interno del servidor
- Las respuestas siguen el formato:
  ```json
  {
    "status": "success|error",
    "data": {...} | null,
    "message": "Mensaje informativo (generalmente en errores)"
  }
  ```

## Estructura de Base de Datos

### Modelo: Animal

Tabla: `animals`

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | integer | NO | ID técnico autogenerado |
| nom | varchar(255) | NO | Nombre del animal |
| explotacio | varchar(255) | NO | Identificador de la explotación |
| genere | enum('M','F') | NO | Género del animal (M: toro, F: vaca) |
| estado | enum('OK','DEF') | NO | Estado (OK: activo, DEF: fallecido) |
| alletar | enum('0','1','2') | SI | Estado de amamantamiento (sólo vacas) |
| pare | varchar(100) | SI | Padre del animal |
| mare | varchar(100) | SI | Madre del animal |
| quadra | varchar(100) | SI | Cuadra/ubicación |
| cod | varchar(20) | SI | Código identificativo |
| num_serie | varchar(50) | SI | Número de serie oficial |
| dob | date | SI | Fecha de nacimiento (DD/MM/YYYY) |

### Modelo: Part (Partos)

Tabla: `parts`

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | integer | NO | ID técnico autogenerado |
| animal_id | integer | NO | ID de la vaca (referencia a animals.id) |
| part | date | NO | Fecha del parto (DD/MM/YYYY) |
| GenereT | enum('M','F','esforrada') | NO | Género de la cría |
| EstadoT | enum('OK','DEF') | NO | Estado de la cría |

### Modelo: AnimalHistory (Historial de cambios)

Tabla: `animal_history`

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | integer | NO | ID técnico autogenerado |
| animal_id | integer | NO | ID del animal (referencia a animals.id) |
| usuario | varchar(100) | NO | Usuario que realizó el cambio |
| cambio | text | NO | Descripción del cambio |
| campo | varchar(50) | NO | Campo que se modificó |
| valor_anterior | text | SI | Valor anterior |
| valor_nuevo | text | SI | Valor nuevo |

### Modelo: User (Usuarios)

Tabla: `users`

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | integer | NO | ID técnico autogenerado |
| username | varchar(50) | NO | Nombre de usuario |
| password_hash | varchar(255) | NO | Hash de la contraseña |
| role | enum('ADMIN','EDITOR','USER') | NO | Rol del usuario |

### Modelo: Import (Importaciones)

Tabla: `imports`

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| id | integer | NO | ID técnico autogenerado |
| filename | varchar(255) | NO | Nombre del archivo importado |
| status | enum('PENDING','PROCESSING','COMPLETED','FAILED') | NO | Estado de la importación |
| created_at | timestamp | NO | Fecha de creación |
| updated_at | timestamp | NO | Última actualización |
| processed | integer | SI | Registros procesados |
| errors | integer | SI | Registros con errores |

## Endpoints de Autenticación

### Login

- **URL**: `/api/v1/auth/login`
- **Método**: POST
- **Autenticación**: No requerida
- **Descripción**: Autentica al usuario y devuelve un token JWT
- **Parámetros**:
  - `username` (string, requerido): Nombre de usuario
  - `password` (string, requerido): Contraseña
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "access_token": "JWT_TOKEN",
      "token_type": "bearer",
      "role": "UserRole.ADMIN"
    }
  }
  ```
- **Respuesta de error**:
  ```json
  {
    "status": "error",
    "message": "Credenciales inválidas"
  }
  ```

## Endpoints de Animales

### Lista de Animales

- **URL**: `/api/v1/animals/`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene lista paginada de animales con filtros opcionales
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
    "status": "success",
    "data": {
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
        },
        // Más animales...
      ],
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
  ```

### Obtener Animal por ID

- **URL**: `/api/v1/animals/{animal_id}`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene detalles de un animal específico
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
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
      "dob": "01/01/2020",
      "parts": [
        // Lista de partos si hubiera
      ]
    }
  }
  ```
- **Respuesta de error**:
  ```json
  {
    "status": "error",
    "message": "Animal no encontrado"
  }
  ```

### Crear Animal

- **URL**: `/api/v1/animals/`
- **Método**: POST
- **Autenticación**: Requerida
- **Descripción**: Crea un nuevo animal
- **Parámetros Body**:
  ```json
  {
    "nom": "Nombre animal",
    "explotacio": "Gurans",
    "genere": "F",
    "estado": "OK",
    "alletar": "0",
    "pare": "Toro padre",
    "mare": "Vaca madre",
    "quadra": "Quadra principal",
    "cod": "ANML001",
    "num_serie": "ES12345678",
    "dob": "01/01/2020"
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      "nom": "Nombre animal",
      // Resto de campos...
    }
  }
  ```

### Actualizar Animal (Completo)

- **URL**: `/api/v1/animals/{animal_id}`
- **Método**: PUT
- **Autenticación**: Requerida
- **Descripción**: Actualiza por completo un animal existente
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Parámetros Body**: Igual que en la creación
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      // Datos actualizados...
    }
  }
  ```

### Actualizar Animal (Parcial)

- **URL**: `/api/v1/animals/{animal_id}`
- **Método**: PATCH
- **Autenticación**: Requerida
- **Descripción**: Actualiza parcialmente un animal existente
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Parámetros Body**: Solo los campos a actualizar
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      // Datos del animal con campos actualizados...
    }
  }
  ```

### Eliminar Animal

- **URL**: `/api/v1/animals/{animal_id}`
- **Método**: DELETE
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Elimina un animal
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "message": "Animal eliminado correctamente"
  }
  ```

### Historial de Animal

- **URL**: `/api/v1/animals/{animal_id}/history`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene el historial de cambios de un animal
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
    },
    // Más registros de historial...
  ]
  ```

## Endpoints de Partos

### Lista de Partos

- **URL**: `/api/v1/partos/`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene lista paginada de partos con filtros opcionales
- **Parámetros Query String**:
  - `page` (int, opcional): Número de página (default: 1)
  - `limit` (int, opcional): Elementos por página (default: 10)
  - `animal_id` (int, opcional): ID del animal
  - `start_date` (string, opcional): Fecha inicial (DD/MM/YYYY)
  - `end_date` (string, opcional): Fecha final (DD/MM/YYYY)
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "items": [
        {
          "id": 1,
          "animal_id": 123,
          "animal_nom": "Vaca1",
          "part": "15/03/2023",
          "GenereT": "M",
          "EstadoT": "OK"
        },
        // Más partos...
      ],
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
  ```

### Partos por Animal

- **URL**: `/api/v1/animals/{animal_id}/partos`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene lista de partos de un animal específico
- **Parámetros URL**:
  - `animal_id` (int, requerido): ID del animal
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "part": "15/03/2023",
        "GenereT": "M",
        "EstadoT": "OK"
      },
      // Más partos...
    ]
  }
  ```

### Crear Parto

- **URL**: `/api/v1/partos/`
- **Método**: POST
- **Autenticación**: Requerida
- **Descripción**: Registra un nuevo parto
- **Parámetros Body**:
  ```json
  {
    "animal_id": 123,
    "part": "15/03/2023",
    "GenereT": "M",
    "EstadoT": "OK"
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 45,
      "animal_id": 123,
      "part": "15/03/2023",
      "GenereT": "M",
      "EstadoT": "OK"
    }
  }
  ```

### Actualizar Parto

- **URL**: `/api/v1/partos/{parto_id}`
- **Método**: PUT
- **Autenticación**: Requerida
- **Descripción**: Actualiza un parto existente
- **Parámetros URL**:
  - `parto_id` (int, requerido): ID del parto
- **Parámetros Body**: Igual que en la creación
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 45,
      // Datos actualizados...
    }
  }
  ```

## Endpoints de Explotaciones

### Lista de Explotaciones

- **URL**: `/api/v1/explotaciones/`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene lista de explotaciones
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "explotacio": "Gurans",
        "descripcion": "Explotación Gurans"
      },
      // Más explotaciones...
    ]
  }
  ```

## Endpoints de Estadísticas

### Resumen General

- **URL**: `/api/v1/stats/dashboard`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene estadísticas generales para el dashboard
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "total_animales": 150,
      "total_vacas": 100,
      "total_toros": 50,
      "total_terneros": 35,
      "por_explotacion": [
        {"explotacio": "Gurans", "total": 80},
        // Más explotaciones...
      ],
      "por_estado": [
        {"estado": "OK", "total": 145},
        {"estado": "DEF", "total": 5}
      ]
    }
  }
  ```

### Estadísticas de Partos

- **URL**: `/api/v1/stats/partos`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Obtiene estadísticas de partos por período
- **Parámetros Query String**:
  - `start_date` (string, opcional): Fecha inicial (DD/MM/YYYY)
  - `end_date` (string, opcional): Fecha final (DD/MM/YYYY)
  - `group_by` (string, opcional): Agrupación ('month', 'year')
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "total_partos": 80,
      "por_genere": [
        {"genere": "M", "total": 42},
        {"genere": "F", "total": 35},
        {"genere": "esforrada", "total": 3}
      ],
      "por_estado": [
        {"estado": "OK", "total": 75},
        {"estado": "DEF", "total": 5}
      ],
      "tendencia": [
        {"periodo": "01/2023", "total": 5},
        {"periodo": "02/2023", "total": 8},
        // Más períodos...
      ]
    }
  }
  ```

## Endpoints de Importación

### Subir Archivo CSV

- **URL**: `/api/v1/import/upload`
- **Método**: POST
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Sube un archivo CSV para importación
- **Parámetros**: Multipart form data con el archivo
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "import_id": 15,
      "filename": "datos_abril_2023.csv",
      "status": "PENDING"
    }
  }
  ```

### Estado de Importación

- **URL**: `/api/v1/import/{import_id}`
- **Método**: GET
- **Autenticación**: Requerida
- **Descripción**: Verifica el estado de una importación
- **Parámetros URL**:
  - `import_id` (int, requerido): ID de la importación
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 15,
      "filename": "datos_abril_2023.csv",
      "status": "COMPLETED",
      "created_at": "07/04/2025 14:30",
      "updated_at": "07/04/2025 14:35",
      "processed": 50,
      "errors": 2,
      "details": [
        {"line": 3, "error": "Campo explotacio vacío"},
        {"line": 7, "error": "Fecha inválida"}
      ]
    }
  }
  ```

## Endpoints de Usuarios

### Lista de Usuarios

- **URL**: `/api/v1/users/`
- **Método**: GET
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Obtiene lista de usuarios
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 1,
        "username": "admin",
        "role": "ADMIN"
      },
      // Más usuarios...
    ]
  }
  ```

### Crear Usuario

- **URL**: `/api/v1/users/`
- **Método**: POST
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Crea un nuevo usuario
- **Parámetros Body**:
  ```json
  {
    "username": "nuevo_usuario",
    "password": "contraseña_segura",
    "role": "EDITOR"
  }
  ```
- **Respuesta exitosa (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 5,
      "username": "nuevo_usuario",
      "role": "EDITOR"
    }
  }
  ```

### Actualizar Usuario

- **URL**: `/api/v1/users/{user_id}`
- **Método**: PUT
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Actualiza un usuario existente
- **Parámetros URL**:
  - `user_id` (int, requerido): ID del usuario
- **Parámetros Body**:
  ```json
  {
    "role": "USER",
    "password": "nueva_contraseña"  // Opcional
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 5,
      "username": "nuevo_usuario",
      "role": "USER"
    }
  }
  ```

### Eliminar Usuario

- **URL**: `/api/v1/users/{user_id}`
- **Método**: DELETE
- **Autenticación**: Requerida (solo ADMIN)
- **Descripción**: Elimina un usuario
- **Parámetros URL**:
  - `user_id` (int, requerido): ID del usuario
- **Respuesta exitosa**:
  ```json
  {
    "status": "success",
    "message": "Usuario eliminado correctamente"
  }
  ```

## Reglas de Negocio Importantes

### Animales

1. **Identificación de animales**:
   - Cada animal se identifica por su `nom` (nombre)
   - El campo `id` es solo para uso interno del sistema

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

### Usuarios y Roles

1. **Jerarquía de roles**:
   - Solo puede existir un usuario con rol ADMIN en el sistema
   - Roles disponibles:
     - ADMIN: Acceso completo a todas las funcionalidades
     - EDITOR: Puede crear, editar y consultar registros
     - USER: Solo puede consultar registros

## Guía para la Implementación Frontend

### Páginas Principales

1. **Dashboard**:
   - Endpoint: `/api/v1/stats/dashboard`
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
   - Endpoint: `/api/v1/partos/`
   - Tabla de partos con filtros
   - Formulario para registro de nuevos partos

5. **Estadísticas de Partos**:
   - Endpoint: `/api/v1/stats/partos`
   - Gráficos de tendencias temporales
   - Filtros por período

6. **Gestión de Usuarios** (solo ADMIN):
   - Endpoint: `/api/v1/users/`
   - Administración de usuarios y roles

7. **Importación de Datos** (solo ADMIN):
   - Endpoint: `/api/v1/import/upload`
   - Carga de archivos CSV
   - Monitoreo de importaciones

### Consideraciones de Diseño

1. **Responsividad**:
   - La aplicación debe funcionar correctamente en dispositivos móviles y de escritorio
   - Priorizar interfaces sencillas para entornos rurales

2. **Indicadores visuales**:
   - Usar colores para estado (verde: OK, rojo: DEF)
   - Iconos claros para género (toro/vaca)
   - Badges para estado de amamantamiento

3. **Formularios**:
   - Validación en línea según reglas de negocio
   - Campos condicionales (ej: amamantamiento solo para vacas)
   - Confirmación para acciones irreversibles

4. **Optimización**:
   - Implementar carga perezosa para listas grandes
   - Cachear datos de referencia (explotaciones)
   - Optimizar para conexiones lentas o inestables

## Ejemplos de Flujos Comunes

### Registro de Nuevo Animal

1. Usuario accede al formulario "Nuevo Animal"
2. Completa los campos requeridos:
   - `nom`: Identificador único
   - `explotacio`: Selecciona de lista existente
   - `genere`: M o F
   - `estado`: OK (por defecto)
   - Campos opcionales según disponibilidad
3. Si es hembra (`genere=F`), se muestra campo `alletar`
4. Al guardar, se valida que no exista otro animal con el mismo nombre
5. Se crea el registro y redirige a la vista de detalle

### Registro de Parto

1. Usuario accede a detalle de animal (debe ser vaca, `genere=F`)
2. En sección de partos, selecciona "Nuevo Parto"
3. Completa fecha del parto
4. Selecciona género y estado de la cría
5. Se valida que la fecha sea posterior al nacimiento de la vaca
6. Se registra el parto y actualiza la lista

### Actualización de Estado de Amamantamiento

1. Usuario accede a detalle de animal (vaca)
2. Modifica el estado de amamantamiento
3. El sistema registra el cambio en el historial
4. Se actualiza el conteo total de terneros en el dashboard

## Seguridad y Consideraciones

1. **Autenticación**:
   - Tokens JWT con expiración
   - Refresh token para sesiones prolongadas
   - Bloqueo tras intentos fallidos

2. **Autorización**:
   - Control de acceso basado en roles
   - Validación en cada endpoint
   - Logging de acciones sensibles

3. **Validación de Datos**:
   - Sanitización de todas las entradas
   - Validación según reglas de negocio
   - Manejo adecuado de errores
