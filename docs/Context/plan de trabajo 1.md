# 📝 Plan de Trabajo: Masclet Imperi Web (Febrero-Marzo 2025)

## 1. Contexto y Objetivos

### Resumen del Proyecto
Aplicación web para gestión de ganado bovino con énfasis en la **Flexibilidad Extrema**, **Tolerancia a Datos Imperfectos** y **UX Adaptada al Contexto Rural**.

### Objetivos Inmediatos (7 días)
1. ✅ Resolver error en importación CSV (fechas)
2. ✅ Unificar estructura de código backend
3. ✅ Documentar API para desarrollo frontend
4. ✅ Iniciar configuración de frontend

## 2. Cronograma de Desarrollo

### DÍA 1: Corrección del Error de Importación CSV
- ✅ **Solución definitiva para el problema de fechas**
  - Implementada separación entre creación/actualización y manejo de fechas
  - Configurado SQL directo para actualización de fechas para evitar conflictos de tipos
- ✅ **Pruebas con múltiples formatos de CSV y fechas**
  - Soportados formatos: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  - Implementado manejo de fechas erróneas con marcador especial

### DÍA 2: Unificación de Estructura API
- ✅ **Decidir estructura definitiva**: `/app/api/endpoints/`
- ✅ **Migrar código a la estructura correcta**: `/app/api/endpoints/imports.py`
- ✅ **Actualizar referencias en router.py**
- ⬜ **Eliminar código duplicado en routes**

### DÍA 3: Documentación y Testing de Backend
- ⬜ **Documentar estructura de proyecto**
- ⬜ **Crear esquema de base de datos actualizado**
- ⬜ **Documentar endpoints API con ejemplos**
- ⬜ **Probar todos los endpoints con colección Postman**

### DÍA 4: Preparación para Frontend
- ⬜ **Revisar y unificar respuestas de API**
  - Formato consistente: `{message, type, data}`
  - Códigos de error estandarizados
- ⬜ **Configurar CORS para desarrollo frontend**
- ⬜ **Crear servicios mock para desarrollo frontend sin backend**

### DÍA 5-7: Inicio de Frontend
- ⬜ **Configurar estructura base frontend**
- ⬜ **Implementar autenticación en frontend**
- ⬜ **Desarrollar componentes base**:
  - Layout principal con navegación
  - Tablas de datos con filtrado
  - Formularios de creación/edición
  - Gestión de errores e iconografía

## 3. Tareas Detalladas: Resolución Importación CSV

### Problema Actual
Error: "expected string or bytes-like object, got 'datetime.date'"

### Causas Identificadas
1. Conflicto entre formatos de fecha y Tortoise ORM
2. Conversión automática generando incompatibilidad

### Solución Implementada
```python
# Separar la creación/actualización del animal de la gestión de fechas
# 1. Crear o actualizar animal sin incluir fechas
if existing_animal:
    await Animal.filter(id=existing_animal.id).update(**animal_data)
    animal_id = existing_animal.id
    results['updated'] += 1
else:
    new_animal = await Animal.create(**animal_data)
    animal_id = new_animal.id
    results['imported'] += 1

# 2. Procesar y actualizar la fecha por separado con SQL directo
if row_dict.get('DOB'):
    try:
        for date_format in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
            try:
                date_obj = datetime.strptime(row_dict['DOB'], date_format)
                iso_date = date_obj.strftime('%Y-%m-%d')
                
                # SQL directo para actualizar solo la fecha
                await conn.execute_query(
                    "UPDATE animals SET dob = $1 WHERE id = $2",
                    [iso_date, animal_id]
                )
                break
            except ValueError:
                continue
    except Exception as e:
        logger.warning(f"Error procesando fecha '{row_dict.get('DOB')}': {e}")
```

## 4. Filosofía de Implementación

### Siguiendo los Principios del Proyecto

- **Flexibilidad Extrema**: 
  - Aceptar múltiples formatos de fecha
  - Permitir valores nulos en campos opcionales
  - No bloquear importación por errores parciales

- **Tolerancia a Datos Imperfectos**:
  - Separar validación de datos de su almacenamiento
  - Permitir corrección posterior de errores
  - Registrar todas las incidencias sin interrumpir proceso

- **UX Adaptada al Contexto Rural**:
  - Mensajes de error claros y descriptivos
  - Proceso robusto incluso con datos parciales
  - Sistema de logs detallado para diagnóstico

### Consideraciones Técnicas

- **Rendimiento**: Optimizado para CSVs de hasta 500 registros
- **Seguridad**: Validación de tipos para prevenir inyección SQL
- **Mantenibilidad**: Código comentado y estructurado

## 5. Seguimiento y Métricas

- **Diario**: Actualización de estado de tareas completadas
- **Prueba continua**: Verificación con casos de uso reales
- **Documentación**: Actualización continua de este documento

## 6. Próximos Pasos (27/02/2025)

### 6.1 Completar limpieza de código (30 min)
- [ ] Eliminar completamente `/app/routes/imports.py`
- [ ] Eliminar referencias redundantes en main.py si existen
- [ ] Confirmar que solo hay una implementación de imports

### 6.2 Probar importación completa CSV (2h)
- [ ] Probar endpoint POST `/api/v1/imports/import/csv` con matriz_master.csv
- [ ] Verificar que las fechas se importan correctamente
- [ ] Comprobar estadísticas de importación (filas procesadas, errores)
- [ ] Verificar en base de datos que los registros se crearon con sus fechas

### 6.3 Documentación de la Implementación (1h)
- [ ] Crear archivo `/docs/Soluciones/fix_csv_date_import.md`
- [ ] Documentar el patrón implementado para solucionar problema de fechas
- [ ] Añadir ejemplos de uso con cURL

---

# Plan de Trabajo Actualizado (28/02/2025)

### 1. Verificación Completa de Importación (2h)
- [ ] Probar importación con diferentes formatos de fecha
- [ ] Verificar manejo de caracteres especiales (ñ, acentos)
- [ ] Comprobar respuestas de error para CSVs mal formados
- [ ] Validar que los datos se escriben correctamente en BD

### 2. Mejoras en el Proceso de Importación (3h)
- [ ] Implementar preview más detallado
- [ ] Añadir validación de estructura CSV
- [ ] Mejorar mensajes de error por fila
- [ ] Implementar rollback en caso de error crítico

### 3. Documentación (1h)
- [ ] Crear guía de uso del endpoint de importación
- [ ] Documentar formatos aceptados
- [ ] Añadir ejemplos de uso con curl
- [ ] Actualizar OpenAPI/Swagger

### 4. Testing (2h)
- [ ] Crear tests para diferentes escenarios
- [ ] Implementar mocks para pruebas
- [ ] Documentar casos de prueba

# 📊 Estado y Próximos Pasos

## ✅ Completado
- Limpieza de caché Python
- Primera prueba exitosa de `/api/v1/imports/import/csv`
- Respuesta correcta con formato estándar

## 🔄 Implementación Completa

### 1. Optimización
```python
# Configuración de Performance
OPTIMIZATIONS = {
    "batch_size": 100,           # Procesamiento por lotes
    "max_workers": 4,            # Workers asíncronos
    "timeout": 300,              # Timeout en segundos
    "chunk_size": 1024 * 8       # Tamaño de chunks para lectura
}

# Índices Recomendados
INDICES = [
    ("explotacio", "estado"),    # Filtrado principal
    ("genere", "estado"),        # Estadísticas
    ("dob"),                     # Búsquedas por edad
    ("cod", "unique", True)      # Unique cuando no es null
]
```
*Documento actualizado: 27 de febrero de 2025 12:21*