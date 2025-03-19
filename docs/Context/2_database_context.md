# Contexto de Base de Datos

## 1. Estado de Migraciones
- ✅ `1_20250218094226_None.py` (Migración inicial)
- ✅ `2_20250218173230_remove_cod_unique.py` (Eliminación restricción unicidad cod)
- ✅ `3_20250219151500_add_postgres_health.py` (Añadido healthcheck PostgreSQL)

## 2. Estado de Importación
- ✅ Importación flexible implementada
- ✅ Manejo de duplicados
- ⚠️ Warnings controlados para:
  * Códigos duplicados
  * Fechas inválidas
  * Campos vacíos

## 3. Estado Actual (Febrero 2025)

### ✅ Componentes Funcionales
- Base de datos PostgreSQL operativa
- Modelos ORM implementados:
  * Animal (con gestión flexible de campos)
  * Part (con integridad referencial)
- Migraciones aplicadas correctamente
- Importación CSV funcionando

### 🚀 Próximos Pasos
1. Implementar tests de integración
2. Optimizar queries principales
3. Configurar monitorización
4. Documentar procedimientos

## 4. Configuración de Base de Datos

### Entornos
- **Local**: PostgreSQL en localhost:5432
- **Docker**: PostgreSQL en contenedor 'db'
- **Variables de entorno**: Definidas en .env

### Conexión y ORM
```python
# Tortoise ORM Configuration
DATABASE_URL=postgres://postgres:1234@localhost:5432/masclet_imperi
TORTOISE_ORM = {
    "connections": {"default": "postgres://postgres:1234@localhost:5432/masclet_imperi"},
    "apps": {
        "models": {
            "models": ["app.models.animal", "app.models.parto", "aerich.models"],
            "default_connection": "default",
        }
    }
}
```

## 5. Modelos Principales

### Animal
- **Tabla**: animals
- **Campos Obligatorios**:
  - explotacio (VARCHAR 255) - Identificador explotación
  - nom (VARCHAR 255) - Nombre del animal
  - genere (ENUM: M/F) - Género
  - estado (ENUM: OK/DEF) - Estado vital
- **Campos Opcionales**: 
  - alletar (BOOLEAN, null=12) - Estado de amamantamiento
  - pare (VARCHAR 100, null=28) - Identificador padre
  - mare (VARCHAR 100, null=28) - Identificador madre
  - quadra (VARCHAR 100, null=36) - Ubicación
  - cod (VARCHAR 20, null=22) - Código interno
  - num_serie (VARCHAR 50, null=27) - Número oficial
  - dob (DATE, null=25) - Fecha nacimiento

### Part (Partos)
- **Tabla**: parts
- **Relación**: ForeignKey a Animal
- **Campos**:
  - id (INTEGER) - Primary Key
  - animal_id (INTEGER) - Foreign Key
  - data (DATE) - Fecha del parto
  - genere_fill (ENUM: M/F) - Género de la cría
  - estat_fill (ENUM: OK/DEF) - Estado de la cría
  - numero_part (INTEGER) - Número secuencial
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## Modelos

### Part (Partos)
- Modelo Tortoise ORM: `Part`
- Schemas Pydantic:
  - `PartoBase`: Schema base
  - `PartoCreate`: Para creación
  - `PartoResponse`: Para respuestas API
- Relaciones:
  - ForeignKey a Animal
  - Constraint único: (animal, data)

### AnimalHistory
- **Tabla**: animal_history
- **Propósito**: Auditoría de cambios
- **Campos**:
  - field_name (VARCHAR) - Campo modificado
  - old_value (TEXT) - Valor anterior
  - new_value (TEXT) - Nuevo valor
  - changed_at (TIMESTAMP) - Fecha/hora del cambio
  - changed_by (VARCHAR) - Usuario que realizó el cambio

## 6. Sistema de Migraciones

### Aerich Configuration
```python
# pyproject.toml
[tool.aerich]
tortoise_orm = "app.db.TORTOISE_ORM"
location = "./migrations"
src_folder = "./."
```

### Comandos Principales
```bash
# Inicialización
aerich init-db
aerich migrate --name initial

# Actualizaciones
aerich migrate --name update_xxx
aerich upgrade
```

## 7. Gestión de Datos

### Backups
- **Automatización**: Diaria 2 AM
- **Rotación**: 3 últimos backups
- **Comando**: 
```bash
pg_dump -U postgres masclet_imperi > backup_$(date +%Y%m%d).sql
```

### Restauración
```bash
psql -U postgres masclet_imperi < backup_20250218.sql
```

## 8. Optimizaciones DB

### Índices
```sql
CREATE INDEX idx_animal_explotacio_nom ON animals(explotacio, nom);
CREATE UNIQUE INDEX idx_animal_cod ON animals(cod) WHERE cod IS NOT NULL;
CREATE INDEX idx_part_animal_data ON parts(animal_id, data);
```

### Constraints
```sql
ALTER TABLE animals ADD CONSTRAINT uq_cod UNIQUE (cod);
ALTER TABLE parts ADD CONSTRAINT uq_animal_data UNIQUE (animal_id, data);
```

### DB Performance
```python
OPTIMIZATIONS = {
    "batch_size": 100,           # Procesamiento por lotes
    "max_workers": 4,            # Workers asíncronos
    "timeout": 300,              # Timeout en segundos
    "chunk_size": 1024 * 8       # Tamaño de chunks para lectura
}
```

### Índices Recomendados
```python
INDICES = [
    ("explotacio", "estado"),    # Filtrado principal
    ("genere", "estado"),        # Estadísticas
    ("dob"),                     # Búsquedas por edad
    ("cod", "unique", True)      # Unique cuando no es null
]
```

## 9. Monitorización

### Queries Críticas
- Listado de explotación con recuentos
- Búsqueda por cod/num_serie
- Historial de partos

### Índices Recomendados
- (explotacio, estado) - Filtrado principal
- (genere, estado) - Estadísticas
- (dob) - Búsquedas por edad

## 10. Configuración Docker
```yaml
db:
    image: postgres:17
    platform: linux/amd64
    container_name: masclet-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_HOST_AUTH_METHOD: md5
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

## 11. Consideraciones Técnicas de Desarrollo

### Gestión de Caché
- **Problema**: Los archivos `.pyc` causan problemas de caché en desarrollo
- **Solución Actual**: Limpieza manual usando PowerShell
```powershell
Get-ChildItem -Path . -Filter "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force
```

## 12. Optimización y Performance DB

### Configuración
```python
DB_OPTIMIZATIONS = {
    "batch_size": 100,           # Procesamiento por lotes
    "max_workers": 4,            # Workers asíncronos
    "timeout": 300,              # Timeout en segundos
    "chunk_size": 1024 * 8       # Tamaño de chunks para lectura
}
```

### Índices y Búsquedas
```python
DB_INDICES = [
    ("explotacio", "estado"),    # Filtrado principal
    ("genere", "estado"),        # Estadísticas
    ("dob"),                     # Búsquedas por edad
    ("cod", "unique", True)      # Unique cuando no es null
]
```

### Monitorización DB
```python
DB_METRICS = {
    "performance": [
        "query_time",
        "connection_pool_usage",
        "active_connections"
    ],
    "storage": [
        "table_size",
        "index_size",
        "dead_tuples"
    ]
}
```

## 2. [`/docs/context/3_api_context.md`](backend/app/api_context.md)

```markdown
### Validaciones y Seguridad API
```python
VALIDATIONS = {
    "required_fields": ["explotacio", "nom", "genere", "estado"],
    "date_formats": ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
    "encoding_options": ["utf-8", "latin-1", "cp1252"],
    "max_file_size": 10 * 1024 * 1024  # 10MB
}

SECURITY = {
    "rate_limit": "100/minute",
    "max_retries": 3,
    "timeout": 30,
    "allowed_extensions": [".csv"]
}

RESPONSE_FORMAT = {
    "success": {
        "message": str,
        "type": "success",
        "data": {
            "processed": int,
            "successful": int,
            "failed": int,
            "warnings": List[str],
            "details": Dict
        }
    },
    "error": {
        "message": str,
        "type": "error",
        "data": {
            "detail": str,
            "code": str,
            "context": Dict
        }
    }
}
```

## 3. [`/docs/context/1_contexto_proyecto_base.md`](backend/app/contexto_proyecto_base.md)

```markdown
### Gestión de Errores y Logging
```python
ERROR_TYPES = {
    "validation": "Errores de validación de datos",
    "format": "Errores de formato CSV",
    "duplicate": "Registros duplicados",
    "date": "Errores en fechas",
    "encoding": "Problemas de codificación"
}

ERROR_LEVELS = {
    "critical": "Detiene importación",
    "warning": "Permite continuar",
    "info": "Solo informativo"
}

LOGGING = {
    "file": "imports.log",
    "level": "DEBUG",
    "rotation": "1 week",
    "alerts": {
        "error_rate": ">10%",
        "process_time": ">5min",
        "memory_usage": ">1GB"
    }
}

METRICS = {
    "performance": [
        "tiempo_proceso",
        "memoria_utilizada",
        "registros_por_segundo"
    ],
    "calidad": [
        "tasa_exito",
        "errores_por_tipo",
        "registros_duplicados"
    ],
    "sistema": [
        "uso_cpu",
        "uso_memoria",
        "tiempo_respuesta_db"
    ]
}