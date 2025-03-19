# API Context

## 1. General API Configuration

### Dashboard Endpoints
```python
GET /api/dashboard/stats
- Estadísticas completas
  - Total animales por explotación
  - Distribución por género (M/F)
  - Estado de crianza (alletar)
  - Actividad reciente (7 días)
  - KPIs principales:
    - % activos/inactivos
    - % amamantando
    - Ratio toros/vacas

GET /api/dashboard/resumen
GET /api/dashboard/recientes
```

### Animals Endpoints
```python
# Consultas
GET /api/animals
- Filtros: explotacio, genere, estado, alletar
- Ordenamiento: nom, created_at
- Paginación: limit, offset

GET /api/animals/{id}
- Detalles completos del animal
- Historial de partos
- Datos de padre/madre

GET /api/animals/search
- Búsqueda por: nom, cod, num_serie
- Búsqueda parcial permitida

# Operaciones
POST /api/animals
- Validación de campos obligatorios
- Generación de códigos únicos
- Registro en historial

PUT /api/animals/{id}
- Actualización parcial permitida
- Validación de estados
- Registro de cambios

DELETE /api/animals/{id}
- Soft delete (cambio estado a DEF)
```

### Partos Endpoints
```python
GET /api/partos
- Filtros por fecha, genere_fill
- Solo para animales con genere="F"
- Registro histórico permanente (no permite eliminación)

POST /api/partos
- Validación de madre (genere="F")
- Incremento automático numero_part
- Registro histórico permanente
- No modifica automáticamente el estado alletar (control manual)

PUT /api/partos/{id}
- Actualización de datos permitida
- Mantiene integridad del historial
- No afecta al estado de amamantamiento
```

### Imports Endpoints
```python
POST /api/imports/csv
- Validación formato CSV
- Mapeo de columnas
- Proceso asíncrono
- Log de errores

GET /api/imports/status
- Estado del proceso
- Estadísticas de importación
- Errores encontrados
```

## 2. Respuestas Estándar

### Success Response
```json
{
    "status": "success",
    "data": {...},
    "metadata": {
        "timestamp": "DD/MM/YYYY HH:mm:ss",
        "version": "1.0"
    }
}
```

### Error Response
```json
{
    "status": "error",
    "detail": "Mensaje de error",
    "code": "ERROR_CODE",
    "timestamp": "DD/MM/YYYY HH:mm:ss"
}
```

## 3. Validaciones y Reglas de Negocio

### Validaciones Generales
- Fechas: Formato DD/MM/YYYY
- Enums controlados por backend
- Campos requeridos según modelo
- Longitudes máximas definidas

### Reglas Específicas
- Solo vacas (F) pueden tener partos
- Los partos son registros históricos permanentes (no eliminables)
- Estado DEF es definitivo
- Estado de amamantamiento (alletar):
  * Solo aplica a vacas
  * Tres estados posibles (0: no amamanta, 1: un ternero, 2: dos terneros)
  * Control manual independiente de los partos
  * Afecta al recuento de terneros en la explotación
- Códigos deben ser únicos
- Num_serie formato ES + números

### Validaciones de Importación
- Estructura CSV específica
- Mapeo de campos requerido
- Validación antes de importar
- Rollback en caso de error

## 4. Seguridad y Rendimiento

### Autenticación
- JWT con refresh tokens
- Roles: admin, editor, user
- Permisos por explotació

### Optimizaciones
- Caché en endpoints pesados
- Paginación obligatoria > 100
- Índices en búsquedas frecuentes

### Monitorización
- Logging de operaciones críticas
- Métricas de rendimiento
- Alertas de errores

## 5. Ejemplos de Uso Común

### Crear Nuevo Animal
```python
POST /api/animals
{
    "nom": "TEST-01",
    "explotacio": "Gurans",
    "genere": "M",
    "cod": "7892",
    "num_serie": "ES07090513",
    "dob": "31/01/2020"
}
```

### Registrar Parto
```python
POST /api/partos
{
    "madre_id": 123,
    "data": "15/02/2025",
    "genere_fill": "M",
    "estat_fill": "OK"
}
```

## 6. Validaciones y Seguridad API

### Validaciones
```python
VALIDATIONS = {
    "required_fields": ["explotacio", "nom", "genere", "estado"],
    "date_formats": ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
    "encoding_options": ["utf-8", "latin-1", "cp1252"],
    "max_file_size": 10 * 1024 * 1024  # 10MB
}
```

### Seguridad
```python
SECURITY = {
    "rate_limit": "100/minute",
    "max_retries": 3,
    "timeout": 30,
    "allowed_extensions": [".csv"]
}
```

### Formato de Respuestas
```python
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

## 7. Monitorización API
```python
API_METRICS = {
    "endpoints": {
        "latency": "ms por endpoint",
        "requests": "peticiones/minuto",
        "errors": "tasa de error %"
    },
    "resources": {
        "memory": "uso de memoria",
        "cpu": "uso de CPU",
        "connections": "conexiones activas"
    }
}
```