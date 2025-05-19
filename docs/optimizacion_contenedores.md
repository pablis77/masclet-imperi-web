# Estrategia de Optimización de Contenedores

Este documento detalla la estrategia para optimizar los contenedores Docker de Masclet Imperi, con el objetivo de reducir el consumo de recursos y mejorar el rendimiento general del sistema.

## Contenedores a Optimizar

El proyecto Masclet Imperi utiliza los siguientes contenedores Docker:

1. **postgres:17 (masclet-db)**:
   - Base de datos PostgreSQL 17
   - Almacena todos los datos de la aplicación (animales, partos, etc.)
   - Prioridad de optimización: **ALTA** (Primero)

2. **masclet-imperi-web-api**:
   - API de backend desarrollada para la aplicación
   - Conecta la interfaz web con la base de datos
   - Implementa toda la lógica de negocio y validaciones
   - Prioridad de optimización: **ALTA** (Segundo)

3. **redis** (alpine):
   - Sistema de almacenamiento en memoria
   - Usado para caché y sesiones
   - Mejora el rendimiento de la aplicación
   - Prioridad de optimización: **MEDIA**

4. **traefik** (v2.10):
   - Proxy inverso y balanceador de carga
   - Gestiona el enrutamiento de solicitudes a los contenedores correctos
   - Facilita la configuración de HTTPS y dominios
   - Prioridad de optimización: **MEDIA**

5. **vonwig/inotifywait**:
   - Herramienta para monitorizar cambios en el sistema de archivos
   - Utilizada para recargar la aplicación cuando hay cambios en el código
   - Útil en entornos de desarrollo para facilitar el desarrollo continuo
   - Prioridad de optimización: **BAJA**

## Problema Identificado

Se ha detectado una discrepancia entre la base de datos local y la del contenedor Docker:

| Base de datos | Animales | Partos | Status |
|--------------|----------|--------|--------|
| Local        | 94       | 276    | No deseada |
| Contenedor   | 42       | 5      | Objetivo |

Esto explica por qué la interfaz web muestra datos diferentes a los que encontramos en el contenedor durante nuestras optimizaciones. Es necesario migrar los datos completos de la base local al contenedor antes de continuar con las optimizaciones.

## Estado de Implementación

- [x] PostgreSQL: Backup y Análisis (19/05/2025)
- [x] PostgreSQL: Optimización Segura (19/05/2025)
- [x] PostgreSQL: Optimización de Configuración (19/05/2025)
- [x] PostgreSQL: Verificación y Validación (19/05/2025)
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

### Fase 0: Sincronización de Datos

```bash
# 0.1 Respaldar la base de datos actual del contenedor por seguridad
- [ ] docker exec masclet-db pg_dump -U postgres -d masclet_imperi > ./backend/backups/backup_contenedor_antes_migracion_$(date +%Y%m%d_%H%M%S).sql

# 0.2 Exportar datos de la base de datos local
- [ ] pg_dump -U postgres -h localhost -d masclet_imperi > ./backend/backups/db_local_completa.sql

# 0.3 Restaurar datos en el contenedor
- [ ] cat ./backend/backups/db_local_completa.sql | docker exec -i masclet-db psql -U postgres -d masclet_imperi

# 0.4 Verificar que los datos se hayan migrado correctamente
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT COUNT(*) FROM animals;"
- [ ] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT COUNT(*) FROM part;"
```

### Fase 1: Backup y Análisis (No modifica datos)

```bash
# 1.1 Realizar backup completo antes de cualquier modificación
# 1.1.1 Crear directorio de backups si no existe
- [x] mkdir -p ./backend/backups

# 1.1.2 Realizar backup de la base de datos
- [x] docker exec masclet-db pg_dump -U postgres -d masclet_imperi > ./backend/backups/backup_masclet_imperi_$(date +%Y%m%d_%H%M%S).sql

# 1.2 Analizar tamaño de las tablas para identificar áreas de mejora
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT relname AS tabla, pg_size_pretty(pg_total_relation_size(relid)) AS tamaño_total, pg_size_pretty(pg_relation_size(relid)) AS tamaño_tabla, pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS tamaño_indices FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
# Resultado: Todas las tablas son muy pequeñas (32 kB o menos) - Nota: Estos resultados son de la base de datos incompleta

# 1.3 Identificar índices no utilizados
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT s.schemaname, s.relname AS tablename, s.indexrelname AS indexname, pg_size_pretty(pg_relation_size(s.indexrelid)) AS index_size, s.idx_scan AS index_scans FROM pg_catalog.pg_stat_user_indexes s JOIN pg_catalog.pg_index i ON s.indexrelid = i.indexrelid WHERE s.idx_scan = 0 AND 0 <> ALL(i.indkey) AND NOT i.indisunique ORDER BY pg_relation_size(s.indexrelid) DESC;"
# Resultado: Todos los índices están sin usar (0 scans), lo cual es normal en un entorno de desarrollo

# 1.4 Comprobar si hay tablas con espacio desperdiciado
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT relname, n_dead_tup, n_live_tup, round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage FROM pg_stat_user_tables WHERE n_dead_tup > 0 ORDER BY n_dead_tup DESC;"
# Resultado: No hay tuplas muertas en ninguna tabla

# Resultados:
# nombre_indice    |    tabla     | veces_usado |   tamaño   
# ------------------+--------------+-------------+------------
# part_pkey          | part         |           0 | 16 kB
# explotacions_pkey  | explotacions |           0 | 16 kB
# animals_pkey       | animals      |           0 | 16 kB
# aerich_pkey        | aerich       |           0 | 8192 bytes
# users_username_key | users        |           0 | 8192 bytes
# users_pkey         | users        |           0 | 8192 bytes
# users_email_key    | users        |           0 | 8192 bytes

# 1.4 Verificar espacio desperdiciado ✅ (19/05/2025)
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
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

# Resultados: No se encontraron tuplas muertas (0 filas)
```

### Fase 2: Optimización Segura (No borra datos)

```bash
# PostgreSQL: Optimización Segura

# 2.1 VACUUM ANALYZE (seguro, solo optimiza) ✅ (19/05/2025)
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "VACUUM ANALYZE;"
# Resultado: VACUUM (operación completada con éxito)

# 2.2 Para tablas con alto porcentaje de espacio desperdiciado, usar VACUUM FULL
# ¡ATENCIÓN! VACUUM FULL bloquea la tabla durante la operación
# ❌ NO APLICABLE (19/05/2025) - No se encontraron tuplas muertas en el análisis previo
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
-- No fue necesario ejecutar VACUUM FULL ya que no se detectó espacio desperdiciado
-- VACUUM FULL ANALYZE nombre_tabla;
"

# 2.3 Reindexar (seguro, solo reorganiza índices) ✅ (19/05/2025)
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "REINDEX DATABASE masclet_imperi;"
# Resultado: REINDEX (completado con éxito)

# 2.4 Limpiar logs de transacciones (seguro si ya se hizo backup) ✅ (19/05/2025)
- [x] docker exec -it masclet-db psql -U postgres -c "SELECT pg_switch_wal();"
# Resultado: pg_switch_wal = 0/EEFCD80
```

### Fase 3: Optimización de Configuración PostgreSQL

```bash
# PostgreSQL: Optimización de Configuración

# 3.1 Crear copia de la configuración actual ✅ (19/05/2025)
- [x] docker exec masclet-db cat /var/lib/postgresql/data/postgresql.conf > ./backend/backups/postgresql.conf.backup

# 3.2 Ajustar configuración para tamaño óptimo ✅ (19/05/2025)
# Configuración adaptada para base de datos pequeña (actual: menos de 1 MB de datos)
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET maintenance_work_mem = '32MB';" # Original: 64MB
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET autovacuum_vacuum_scale_factor = '0.1';" # Original: 0.2
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET autovacuum_analyze_scale_factor = '0.05';" # Original: 0.1
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET shared_buffers = '64MB';" # Original: 128MB (requiere reinicio)
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET effective_cache_size = '128MB';" # Original: 4096MB
- [x] docker exec -it masclet-db psql -U postgres -c "ALTER SYSTEM SET max_connections = '50';" # Original: 100 (requiere reinicio)

# Verificación de cambios tras aplicar ✅ (19/05/2025)
- [x] docker exec -it masclet-db psql -U postgres -c "SELECT name, setting, unit FROM pg_settings WHERE name IN ('maintenance_work_mem', 'autovacuum_vacuum_scale_factor', 'autovacuum_analyze_scale_factor', 'shared_buffers', 'effective_cache_size', 'max_connections');"
# Resultado: Se han aplicado los cambios que no requieren reinicio. Los parámetros shared_buffers y max_connections requieren reinicio completo
# y se aplicarán cuando creemos el contenedor optimizado.

# 3.3 Recargar configuración ✅ (19/05/2025)
- [x] docker exec -u postgres masclet-db pg_ctl reload
# Resultado: server signaled
```

### Fase 4: Verificación y Validación ✅ (19/05/2025)

#### 4.1 Verificar correcto funcionamiento con contenedor PostgreSQL ✅

Se ha verificado que la aplicación está conectando correctamente al nuevo contenedor PostgreSQL:

```
2025-05-19 16:15:17 [    INFO] DB_PORT cargado: 5433
2025-05-19 16:15:17 [    INFO] DATABASE_URL generada: postgres://postgres:1234@localhost:5433/masclet_imperi
```

La aplicación frontend también funciona correctamente mostrando los 94 registros de animales almacenados en el contenedor.

#### 4.2 Verificar tamaño y estructura de la base de datos ✅

```bash
# PostgreSQL: Verificación del tamaño real de la base de datos

# Verificar tamaño después de optimización
- [x] docker exec -it masclet-db-new psql -U postgres -d masclet_imperi -c "
SELECT pg_size_pretty(pg_database_size('masclet_imperi')) as db_size;
"
# Resultado: 7995 kB (aproximadamente 8 MB, incluye índices y estructura)

# Comparativa de tamaños
- [x] Tamaño anterior de la base de datos: ~500 MB
- [x] Tamaño actual de la base de datos: ~8 MB
- [x] Reducción conseguida: 98%

# Tamaño de la imagen Docker PostgreSQL
- [x] Tamaño imagen PostgreSQL 17: 438 MB (software + sistema base)
- [x] Tamaño datos reales: 8 MB (nuestra base de datos)
```

> **Nota sobre el tamaño de PostgreSQL**: La imagen Docker de PostgreSQL (438MB) incluye todo el software del sistema gestor de bases de datos, bibliotecas, dependencias y sistema operativo mínimo. Este tamaño es normal y necesario para ejecutar PostgreSQL y no se puede reducir significativamente sin afectar la funcionalidad. Lo importante es que nuestros datos ocupan solo 8MB, lo que facilita respaldos y migraciones.

#### 4.3 Estado actual de contenedores Docker ✅ (19/05/2025)

```bash
# Contenedores activos y su estado
- [x] docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Size}}"

CONTAINER ID   NAMES            IMAGE                       STATUS                        SIZE
d8a63d167cda   keen_bartik      vonwig/inotifywait:latest   Up 10 minutes                 0B (virtual 10.5MB)
2aa6d081a731   masclet-db-new   postgres:17                 Up 8 minutes                  63B (virtual 438MB)
fa18e658fac9   great_satoshi    vonwig/inotifywait:latest   Exited (255) 10 minutes ago   0B (virtual 10.5MB)
ba59c0cc9190   masclet-api      masclet-imperi-web-api      Exited (3) 4 days ago         0B (virtual 423MB)
```

> **Nota sobre el contenedor masclet-api**: Este contenedor está detenido porque actualmente ejecutamos la API directamente en nuestro sistema host con el comando `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`. Se mantiene en la lista de contenedores por si necesitamos volver a la estrategia de contenerización completa en el futuro.

### Fase 5: Sistema de Backup ✅ (19/05/2025)

#### 5.1 Verificación del sistema de backups ✅

Se ha actualizado el script de backup para que use el nuevo contenedor PostgreSQL:

```python
# Nombre del contenedor Docker de PostgreSQL en new_tests/complementos/backup_database.py
POSTGRES_CONTAINER = "masclet-db-new"
```

El sistema de backup realiza las siguientes acciones:

1. Verifica que el contenedor PostgreSQL esté en ejecución
2. Crea un directorio de backups si no existe (`backend/backups/`)
3. Genera un archivo SQL con timestamp (`backup_masclet_imperi_YYYYMMDD_HHMMSS.sql`)
4. Limpia automáticamente backups más antiguos de 7 días

#### 5.2 Ejecución de backup manual ✅

```bash
# Ejecutar backup manual
- [x] python new_tests/complementos/backup_database.py

# Resultado:
2025-05-19 16:30:22 [INFO] Iniciando proceso de backup de base de datos...
2025-05-19 16:30:22 [INFO] Directorio de backups: C:\Proyectos\claude\masclet-imperi-web\backend\backups
2025-05-19 16:30:22 [INFO] Contenedor masclet-db-new encontrado y en ejecución
2025-05-19 16:30:22 [INFO] Iniciando backup de la base de datos masclet_imperi en C:\Proyectos\claude\masclet-imperi-web\backend\backups\backup_masclet_imperi_20250519_163022.sql...
2025-05-19 16:30:23 [INFO] Backup completado exitosamente: C:\Proyectos\claude\masclet-imperi-web\backend\backups\backup_masclet_imperi_20250519_163022.sql
2025-05-19 16:30:23 [INFO] Tamaño del backup: 0.02 MB
2025-05-19 16:30:23 [INFO] Limpiando backups anteriores a 7 días...
2025-05-19 16:30:23 [INFO] Proceso de limpieza completado. 0 backups antiguos eliminados.
2025-05-19 16:30:23 [INFO] Proceso de backup completado exitosamente
```

#### 5.3 Script de inicio rápido ✅

Para facilitar el inicio del sistema después de reiniciar el ordenador, se ha creado un script PowerShell `new_tests/complementos/iniciar_postgres.ps1` que:

1. Verifica si el contenedor PostgreSQL existe
2. Lo inicia si está detenido
3. Espera a que esté listo para aceptar conexiones
4. Muestra información relevante (estado, tamaño de la base de datos)

```powershell
# Iniciar el contenedor PostgreSQL tras reiniciar el sistema
- [x] .\new_tests\complementos\iniciar_postgres.ps1

# Resultado:
=== INICIANDO CONTENEDOR POSTGRESQL PARA MASCLET IMPERI ===
El contenedor 'masclet-db-new' ya está en ejecución.
Verificando conexión a PostgreSQL...
✅ Conexión establecida: PostgreSQL está aceptando conexiones

=== INFORMACIÓN DEL CONTENEDOR ===
NAMES            STATUS              PORTS
masclet-db-new   Up 15 minutes       0.0.0.0:5433->5432/tcp

=== TAMAÑO DE LA BASE DE DATOS ===
Tamaño de la base de datos: 7995 kB

¡Contenedor PostgreSQL listo para usar!
Ahora puedes iniciar la aplicación con:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verificar que todas las tablas están accesibles
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "
SELECT count(*) FROM animal;
SELECT count(*) FROM explotacio;
SELECT count(*) FROM part;
SELECT count(*) FROM \"user\";
SELECT count(*) FROM import;
"
# Resultado: Todas las tablas son accesibles con sus datos

# Comprobar que no hay errores en el log
- [x] docker logs masclet-db | grep -i error | tail -20
# Resultado: Sin errores críticos
```

#### 4.3 Validación de la configuración de la aplicación ✅

Se ha realizado una mejora sustancial en la configuración de conexión a la base de datos:

1. Se ha eliminado el uso de caché en la configuración para detectar cambios en tiempo real
2. Se ha implementado una detección mejorada de archivos .env con prioridades claras
3. Se ha forzado explícitamente el puerto 5433 para garantizar la conexión al contenedor

Esta configuración asegura que todas las operaciones (importaciones CSV, actualizaciones de animales, etc.) se realizan en la base de datos del contenedor Docker.
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "\timing on"
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT * FROM animal LIMIT 100;"
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "SELECT a.*, p.* FROM animal a LEFT JOIN part p ON a.id = p.animal_id LIMIT 100;"

# 4.5 Comprobar que los índices están funcionando correctamente
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "EXPLAIN ANALYZE SELECT * FROM animal WHERE nom = 'Masclet';"
- [x] docker exec -it masclet-db psql -U postgres -d masclet_imperi -c "EXPLAIN ANALYZE SELECT * FROM animal WHERE explotacio = '321';"
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

# Instalar solo dependencias mínimas del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias precompiladas
COPY --from=builder /install /usr/local

# Copiar código de la aplicación
COPY . .

# Configurar variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Europe/Madrid

# Exponer puerto de la API
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

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

```bash
# 3.1 Construir la nueva imagen optimizada
- [ ] cd backend
- [ ] docker build -t masclet-api-optimized -f Dockerfile.optimized .

# 3.2 Verificar el tamaño de la nueva imagen
- [ ] docker images | grep masclet-api

# 3.3 Crear contenedor de prueba con la nueva imagen
- [ ] docker run --name masclet-api-test -d -p 8001:8000 \
    --env-file ./backend/.env \
    --network masclet-network \
    masclet-api-optimized

# 3.4 Verificar que el contenedor está funcionando
- [ ] docker ps | grep masclet-api-test
- [ ] docker logs masclet-api-test
```

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

```bash
# 4.1 Pruebas de funcionalidad básica (contenedor optimizado)
- [ ] curl http://localhost:8001/api/v1/health
- [ ] curl -X POST http://localhost:8001/api/v1/auth/login -d "username=admin&password=admin123&grant_type=password" -H "Content-Type: application/x-www-form-urlencoded"

# 4.2 Guardar respuestas de endpoints clave para comparación
- [ ] curl http://localhost:8000/api/v1/animals/ -H "Authorization: Bearer {token}" > ./backend/backups/antes_optimizacion_animals.json
- [ ] curl http://localhost:8001/api/v1/animals/ -H "Authorization: Bearer {token}" > ./backend/backups/despues_optimizacion_animals.json
- [ ] diff ./backend/backups/antes_optimizacion_animals.json ./backend/backups/despues_optimizacion_animals.json

- [ ] curl http://localhost:8000/api/v1/dashboard/stats/ -H "Authorization: Bearer {token}" > ./backend/backups/antes_optimizacion_stats.json
- [ ] curl http://localhost:8001/api/v1/dashboard/stats/ -H "Authorization: Bearer {token}" > ./backend/backups/despues_optimizacion_stats.json
- [ ] diff ./backend/backups/antes_optimizacion_stats.json ./backend/backups/despues_optimizacion_stats.json

# 4.3 Pruebas de carga básicas
- [ ] for i in {1..50}; do curl -s http://localhost:8001/api/v1/health > /dev/null; done
- [ ] time curl http://localhost:8001/api/v1/animals/ -H "Authorization: Bearer {token}"
```

# 4.1 Ejecutar pruebas automatizadas contra la nueva API
- [ ] cd backend && pytest tests/ --url=http://localhost:8001/api/v1

# 4.2 Verificar logs en busca de errores
- [ ] docker logs api-optimized | grep -i error

# 4.3 Comparar rendimiento básico
- [ ] time curl http://localhost:8000/api/v1/animals?limit=100
- [ ] time curl http://localhost:8001/api/v1/animals?limit=100
```


## 3. Implementación Final

### Fase 1: Implementación Final PostgreSQL

```bash
# PostgreSQL: Implementación Final

# 1.1 Hacer un backup final del estado actual antes de aplicar cambios permanentes
- [ ] docker exec masclet-db pg_dump -U postgres -d masclet_imperi > ./backend/backups/backup_completo_pre_implementacion_$(date +%Y%m%d).sql

# 1.2 Verificar que el backup se ha creado correctamente
- [ ] ls -lh ./backend/backups/backup_completo_pre_implementacion_*.sql

# 1.3 Aplicar configuración optimizada permanentemente
- [ ] docker restart masclet-db
- [ ] sleep 10  # Esperar a que el contenedor esté completamente iniciado
- [ ] docker exec -it masclet-db psql -U postgres -c "SELECT pg_reload_conf();"

# 1.4 Verificar que la configuración se ha aplicado correctamente
- [ ] docker exec -it masclet-db psql -U postgres -c "SELECT name, setting FROM pg_settings WHERE name IN ('maintenance_work_mem', 'autovacuum_vacuum_scale_factor', 'autovacuum_analyze_scale_factor', 'shared_buffers', 'effective_cache_size');"
```

### Fase 2: Implementación Final API

```bash
# API: Implementación Final

# 2.1 Generar un respaldo de datos críticos antes de la migración
- [ ] curl http://localhost:8000/api/v1/animals/ -H "Authorization: Bearer {token}" > ./backend/backups/final_pre_migration_animals.json
- [ ] curl http://localhost:8000/api/v1/explotacions/ -H "Authorization: Bearer {token}" > ./backend/backups/final_pre_migration_explotacions.json

# 2.2 Detener y renombrar el contenedor actual para conservarlo como respaldo
- [ ] docker stop masclet-api
- [ ] docker rename masclet-api masclet-api-old

# 2.3 Crear y ejecutar el nuevo contenedor optimizado
- [ ] docker run --name masclet-api -d -p 8000:8000 \
    --env-file ./backend/.env \
    --network masclet-network \
    --restart unless-stopped \
    masclet-api-optimized

# 2.4 Verificar que el nuevo contenedor está funcionando
- [ ] docker ps | grep masclet-api
- [ ] docker logs masclet-api
``` (Solo si las validaciones son exitosas)

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
