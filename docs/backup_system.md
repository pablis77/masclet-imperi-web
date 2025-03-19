# Sistema de Backup Masclet Imperi

## 1. Configuración Actual

### Automatización
- Schedule: Diario a las 2 AM
- Retención: 3 últimos backups
- Ubicación: `/backups/{tipo}/{fecha}`

### Servicios Incluidos
- Base de datos PostgreSQL
- Archivos de configuración
- Logs del sistema
- Estados del sistema

## 2. Comandos Principales

### Backup Base de Datos
```bash
# Backup completo
pg_dump -U postgres masclet_imperi > backup_$(date +%Y%m%d).sql

# Backup comprimido
pg_dump -U postgres masclet_imperi | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restauración
```bash
# Restaurar backup
psql -U postgres masclet_imperi < backup_20250218.sql

# Restaurar comprimido
gunzip -c backup_20250218.sql.gz | psql -U postgres masclet_imperi
```

## 3. Docker Integration

### Configuración
```yaml
backup:
  build: 
    context: ./backend/docker
    dockerfile: Dockerfile.backup
  volumes:
    - ./data/backups:/backups
    - ./data/db:/var/lib/postgresql/data
  environment:
    - POSTGRES_DB=${POSTGRES_DB}
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### Scripts
- `backend/docker/scripts/backup_manager.sh`
- `backend/docker/scripts/entrypoint.sh`
- `/etc/cron.d/masclet-backup`

## 4. Procedimientos Operativos

### Backup Manual
1. Detener servicios activos
2. Ejecutar script de backup
3. Verificar integridad
4. Reiniciar servicios

### Restauración
1. Detener servicios
2. Validar backup
3. Restaurar datos
4. Verificar integridad
5. Reiniciar servicios

### Monitorización
- Verificar logs diarios
- Validar espacio disponible
- Comprobar integridad
- Rotación de backups

## 5. Mejores Prácticas

### Seguridad
- Encriptación de datos sensibles
- Permisos restrictivos
- Acceso controlado
- Logs de operaciones

### Performance
- Ventanas de backup adecuadas
- Compresión eficiente
- Optimización de recursos
- Monitorización de impacto

### Validación
- Verificación automática
- Test de restauración
- Control de integridad
- Registro de resultados

## 6. Contactos

### Responsables
- DBA: [Nombre]
- SysAdmin: [Nombre]
- DevOps: [Nombre]

### Escalación
1. Operador de backup
2. Administrador de sistemas
3. DBA/Arquitecto

## 7. Pruebas y Verificación

### 7.1 Verificación del Backup Diario
```bash
# 1. Verificar existencia y fecha del backup
ls -l /backups/db/masclet_imperi_$(date +%Y%m%d).sql.gz

# 2. Comprobar integridad del archivo
gunzip -t /backups/db/masclet_imperi_$(date +%Y%m%d).sql.gz

# 3. Verificar tamaño esperado (>1MB)
find /backups/db -type f -name "masclet_imperi_$(date +%Y%m%d).sql.gz" -size +1M
```

### 7.2 Test de Restauración
```bash
# 1. Crear base de datos de prueba
createdb -U postgres masclet_imperi_test

# 2. Restaurar backup en DB de prueba
gunzip -c /backups/db/masclet_imperi_$(date +%Y%m%d).sql.gz | \
psql -U postgres masclet_imperi_test

# 3. Verificar datos críticos
psql -U postgres masclet_imperi_test -c "SELECT COUNT(*) FROM animals;"
psql -U postgres masclet_imperi_test -c "SELECT COUNT(*) FROM parts;"

# 4. Limpiar prueba
dropdb -U postgres masclet_imperi_test
```

### 7.3 Checklist de Verificación
- [ ] Backup creado en ventana programada
- [ ] Tamaño del archivo dentro de rangos normales
- [ ] Verificación de integridad exitosa
- [ ] Restauración en DB de prueba correcta
- [ ] Conteos de registros coinciden
- [ ] Logs sin errores
- [ ] Espacio en disco suficiente
