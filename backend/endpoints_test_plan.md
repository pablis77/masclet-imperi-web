# Plan de Tests de Endpoints

## Fase 1: Tests Base ✅

### Explotació
1. Create ✅
- Campos requeridos correctos
- Validación de duplicados
- Respuesta esperada

2. Read y List ✅
- Reutilización de explotaciones
- Filtros correctos
- Paginación funcional

### Animal 
1. Create ✅
- Relación con explotación
- Validación de campos
- Manejo de opcionales

2. List y Filtrado ✅
- Filtro por explotación
- Conteos correctos
- Relaciones cargadas

## Fase 2: Tests de Partos 🔄

### Endpoints
- `POST /partos/` - Nuevo parto
- `GET /partos/` - Listar partos
- `GET /partos/{id}` - Detalles
- `PUT /partos/{id}` - Actualizar

### Validaciones
- Solo vacas pueden tener partos
- Fechas en formato correcto
- Incremento automático de número_part

## Fase 3: Tests de Importación 📋

### CSV Import
- Validación de formato
- Mapeo de campos
- Manejo de errores
- Rollback en fallos

### Estado y Seguimiento
- Progreso de importación
- Log de errores
- Estadísticas finales

## Métricas y Logging 📊
```python
- Tiempos de respuesta
- Uso de memoria
- Tasa de error
- Cobertura de código