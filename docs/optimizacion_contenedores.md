# Estrategia de Optimización de Contenedores con Cero Riesgo

## Masclet Imperi Web

## Estado de Implementación

- [ ] PostgreSQL: Backup y Análisis
- [ ] PostgreSQL: Optimización Segura
- [ ] PostgreSQL: Optimización de Configuración
- [ ] PostgreSQL: Verificación y Validación
- [ ] API: Backup y Análisis
- [ ] API: Crear Dockerfile Optimizado
- [ ] API: Construir y Probar Nueva Imagen
- [ ] API: Validación Exhaustiva
- [ ] Implementación Final: PostgreSQL
- [ ] Implementación Final: API
- [ ] Validación Final
- [ ] Configuración de Mantenimiento Continuo

## Análisis de la Situación Actual

La aplicación Masclet Imperi utiliza dos contenedores principales que han alcanzado un tamaño considerable:

| Contenedor | Tamaño Actual | Observaciones |
|------------|---------------|---------------|
| masclet-imperi-web-api | 423.15 MB | Contenedor de la API (FastAPI) |
| postgres | 438.35 MB | Base de datos PostgreSQL |

El tamaño de estos contenedores es desproporcionado para la cantidad de datos que manejan actualmente, lo que sugiere oportunidades significativas de optimización sin afectar la funcionalidad.

## Principios de la Estrategia "Cero Riesgo"

1. **Nunca eliminar datos sin backup verificado**
2. **Mantener siempre versiones originales funcionando**
3. **Validar exhaustivamente antes de reemplazar**
4. **Proceder por fases incrementales y reversibles**
5. **Documentar cada cambio y su efecto**

## 1. Optimización del Contenedor PostgreSQL

### Fase 1: Backup y Análisis (No modifica datos)

```bash
# PostgreSQL: Backup y Análisis

# 1.1 Crear backup completo antes de cualquier operación
- [ ] docker exec masclet-db pg_dump -U postgres -d masclet_imperi > ./backend/backups/backup_completo_pre_optimizacion_$(date +%Y%m%d).sql

# 1.2 Análisis de tamaño de tablas e índices
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT
    relname AS tabla,
    pg_size_pretty(pg_total_relation_size(relid)) AS tamaño_total,
    pg_size_pretty(pg_relation_size(relid)) AS tamaño_tabla,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS tamaño_indices
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
"

# 1.3 Análisis de índices poco utilizados
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT
    indexrelname AS nombre_indice,
    relname AS tabla,
    idx_scan AS veces_usado,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS tamaño
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE idx_scan < 50  -- Índices poco usados
ORDER BY pg_relation_size(i.indexrelid) DESC;
"

# 1.4 Verificar espacio desperdiciado
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT
    schemaname, 
    relname,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup*100.0/(n_live_tup+n_dead_tup+1),2) AS pct_dead
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
"
```

### Fase 2: Optimización Segura (No borra datos)

```bash
# PostgreSQL: Optimización Segura

# 2.1 VACUUM ANALYZE (seguro, solo optimiza)
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "VACUUM ANALYZE;"

# 2.2 Para tablas con alto porcentaje de espacio desperdiciado, usar VACUUM FULL
# ¡ATENCIÓN! VACUUM FULL bloquea la tabla durante la operación
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
-- Ejecutar solo para tablas identificadas en el paso 1.4
VACUUM FULL ANALYZE nombre_tabla;
"

# 2.3 Reindexar (seguro, solo reorganiza índices)
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "REINDEX DATABASE masclet_imperi;"

# 2.4 Limpiar logs de transacciones (seguro si ya se hizo backup)
- [ ] docker exec -it masclet-db psql -U postgres -c "SELECT pg_switch_wal();"
```

### Fase 3: Optimización de Configuración PostgreSQL

```bash
# PostgreSQL: Optimización de Configuración

# 3.1 Crear copia de la configuración actual
- [ ] docker exec masclet-db cat /var/lib/postgresql/data/postgresql.conf > ./backend/backups/postgresql.conf.backup

# 3.2 Ajustar configuración para tamaño óptimo
# Estos valores dependerán del análisis inicial, pero estos son seguros para empezar:
- [ ] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET maintenance_work_mem = '128MB';"
- [ ] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET autovacuum_vacuum_scale_factor = '0.1';"
- [ ] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET autovacuum_analyze_scale_factor = '0.05';"

# 3.3 Recargar configuración
- [ ] docker exec masclet-db pg_ctl reload
```

### Fase 4: Verificación y Validación

```bash
# PostgreSQL: Verificación y Validación

# 4.1 Verificar nuevo tamaño después de optimización
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT pg_size_pretty(pg_database_size('masclet_imperi')) as db_size;
"

# 4.2 Verificar que todas las tablas están accesibles
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT count(*) FROM animal;
SELECT count(*) FROM explotacio;
-- Repetir para todas las tablas importantes
"

# 4.3 Comprobar que no hay errores en el log
- [ ] docker logs masclet-db | grep -i error | tail -20
```

## 2. Optimización del Contenedor API

La API de Masclet Imperi tiene un contenedor que puede optimizarse sin modificar su funcionalidad.

### Fase 1: Backup y análisis

```bash
# API: Backup y Análisis

# 1.1 Backup de la imagen actual
- [ ] docker commit masclet-api masclet-api-pre-optimizacion
- [ ] docker save -o ./backend/backups/masclet-api-pre-optimizacion.tar masclet-api-pre-optimizacion

# 1.2 Analizar los capas y tamaño
- [ ] docker history masclet-api

# 1.3 Identificar paquetes Python instalados
- [ ] docker run --rm -it masclet-imperi-web-api:latest pip list
```

### Fase 2: Crear Dockerfile Optimizado

## API: Crear Dockerfile Optimizado

- [ ] Crear un nuevo archivo `Dockerfile.optimized` en la carpeta backend:

```dockerfile
# Fase de compilación
FROM python:3.10-slim AS builder

WORKDIR /app

# Instalar dependencias de compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo requirements.txt primero para aprovechar caché
COPY requirements.txt .

# Instalar dependencias en una ubicación específica
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Fase de ejecución
FROM python:3.10-slim

WORKDIR /app

# Copiar dependencias precompiladas
COPY --from=builder /install /usr/local

# Copiar código de la aplicación
COPY . .

# Limpiar caché y archivos temporales
RUN find . -name __pycache__ -type d -exec rm -rf {} +
RUN find . -name "*.pyc" -delete

# Configurar entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Exponer puerto y definir comando de arranque
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Fase 3: Construir y Probar Nueva Imagen

```bash
# API: Construir y Probar Nueva Imagen

# 3.1 Construir la nueva imagen usando el Dockerfile optimizado
- [ ] docker build -t masclet-api-optimized -f backend/Dockerfile.optimized ./backend

# 3.2 Ejecutar contenedor con la nueva imagen en puerto diferente para pruebas
- [ ] docker run -d --name masclet-api-test -p 8001:8000 -e DATABASE_URL=postgresql://postgres:postgres@masclet-db:5432/masclet_imperi --network masclet-network masclet-api-optimized

# 3.2 Verificar el tamaño de la nueva imagen
- [ ] docker images masclet-imperi-web-api:optimized

# 3.3 Ejecutar en puerto alternativo para pruebas
- [ ] docker run -d --name api-optimized -p 8001:8000 masclet-imperi-web-api:optimized

# 3.4 Verificar que la API optimizada responde correctamente
- [ ] curl http://localhost:8001/api/v1/health
```

### Fase 4: Validación Exhaustiva

```bash
# API: Validación Exhaustiva

# 4.1 Ejecutar pruebas automatizadas contra la nueva API
- [ ] cd backend && pytest tests/ --url=http://localhost:8001/api/v1

# 4.2 Verificar logs en busca de errores
- [ ] docker logs api-optimized | grep -i error

# 4.3 Comparar rendimiento básico
- [ ] time curl http://localhost:8000/api/v1/animals?limit=100
- [ ] time curl http://localhost:8001/api/v1/animals?limit=100
```


## 3. Implementación Final (Solo si las validaciones son exitosas)

### Implementación PostgreSQL

```bash
# Implementación Final: PostgreSQL

# 1. Crear un segundo backup antes de la implementación final
- [ ] docker exec masclet-db pg_dump -U postgres -d masclet_imperi > ./backend/backups/backup_pre_implementacion_$(date +%Y%m%d).sql

# 2. Reiniciar el contenedor para aplicar todos los cambios de configuración
- [ ] docker restart masclet-db

# 3. Verificar tamaño final y conexión
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT pg_size_pretty(pg_database_size('masclet_imperi')) as db_size;"
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT count(*) FROM animal;"
```

### Implementación API

```bash
# Implementación Final: API

# 1. Detener contenedor de API actual
- [ ] docker stop masclet-api
- [ ] docker rm masclet-api

# 2. Renombrar imagen optimizada a la etiqueta principal
- [ ] docker tag masclet-imperi-web-api:optimized masclet-imperi-web-api:latest

# 3. Iniciar contenedor con la nueva imagen
- [ ] docker run -d --name masclet-api -p 8000:8000 --network masclet-network masclet-imperi-web-api:latest

# 4. Verificar funcionamiento
- [ ] curl http://localhost:8000/api/v1/health
```

### Validación Final

```bash
# Validación Final

# 1. Verificar que la aplicación completa funciona correctamente
- [ ] curl http://localhost:8000/api/v1/animals > despues_optimizacion.json
- [ ] diff ./backend/backups/antes_optimizacion.json despues_optimizacion.json

# 2. Probar operaciones CRUD básicas desde la interfaz web
- [ ] Crear un nuevo animal de prueba
- [ ] Editar un animal existente
- [ ] Verificar listados y filtros
```

## 4. Tareas de Mantenimiento Continuo

```bash
# Mantenimiento Continuo

# 1. Programar VACUUM periódico
- [ ] Añadir al crontab (ejecutar cada domingo a las 2 AM)
- [ ] 0 2 * * 0 docker exec masclet-db psql -U postgres -d masclet_imperi -c "VACUUM ANALYZE;"

# 2. Revisar los logs regularmente
- [ ] Configurar revisión semanal de logs
- [ ] docker logs --tail=100 masclet-db | grep -i warning

# 3. Limpiar los backups antiguos
- [ ] Configurar script automático de limpieza
- [ ] find ./backend/backups -name "*.sql" -type f -mtime +30 -delete

# 4. Reconstruir la imagen API periódicamente
- [ ] Programar reconstrucción mensual de imagen API
- [ ] Implementar pruebas automáticas antes de cada despliegue
```

## Conclusión

Esta estrategia permite optimizar significativamente el tamaño de los contenedores sin poner en riesgo datos ni funcionalidad. El enfoque por fases con puntos de verificación garantiza que en cualquier momento podamos revertir cambios si se detectan problemas.

La reducción estimada después de aplicar estas optimizaciones debería rondar el 30-40% del tamaño actual, mejorando el rendimiento y reduciendo el consumo de recursos del sistema.
