# Sistema de Backup Masclet Imperi

## 1. Reglas y Políticas

### Retención
- **Diarios**: 7 días
- **Semanales**: 4 semanas
- **Mensuales**: 12 meses
- **Anuales**: 5 años

### Rotación
```bash
# Estructura
/backups/
  ├── daily/       # Últimos 7 días
  ├── weekly/      # Últimas 4 semanas
  ├── monthly/     # Últimos 12 meses
  └── yearly/      # Últimos 5 años
```

### Nomenclatura
```bash
masclet_<tipo>_<timestamp>_<checksum>.tar.gz
# Ejemplo: masclet_daily_20250311_0745_a8f3bc12.tar.gz
```

## 2. Componentes del Sistema

### Scripts Principales
- `backup.sh`: Ejecuta el backup principal
- `test-backup.sh`: Valida la integridad
- `notify.sh`: Sistema de notificaciones
- `cleanup.sh`: Mantenimiento y rotación

### Configuración
```bash
# Variables de Entorno (.env)
BACKUP_ROOT="/backups"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12
RETENTION_YEARLY=5
MIN_BACKUP_SIZE=1048576  # 1MB
```

## 3. Proceso de Backup

### Pre-backup
1. Verificar espacio disponible
2. Comprobar permisos
3. Validar conexión DB

### Backup
1. Crear backup temporal
2. Comprimir y cifrar
3. Generar checksum
4. Mover a ubicación final

### Post-backup
1. Verificar integridad
2. Rotar backups antiguos
3. Enviar notificación
4. Registrar en logs

## 4. Verificaciones

### Integridad
- Checksum SHA256
- Tamaño mínimo
- Estructura del archivo
- Restauración de prueba

### Base de Datos
```sql
-- Verificaciones SQL
SELECT COUNT(*) FROM animals;
SELECT COUNT(*) FROM parts;
SELECT COUNT(*) > 0 FROM users;
```

## 5. Monitorización

### Métricas
```python
BACKUP_METRICS = {
    "tiempo_total": "segundos",
    "tamaño_final": "bytes",
    "ratio_compresion": "porcentaje",
    "espacio_liberado": "bytes"
}
```

### Alertas
```python
ALERTS = {
    "backup_failed": "Error en proceso de backup",
    "space_low": "Espacio insuficiente (<10%)",
    "integrity_failed": "Error en verificación",
    "rotation_failed": "Error en rotación"
}
```

## 6. Mantenimiento

### Limpieza
- Archivos temporales > 24h
- Logs > 30 días
- Backups huérfanos
- Archivos corruptos

### Espacio
- Mínimo requerido: 5GB
- Umbral de alerta: 80%
- Compresión si >90%

## 7. Recuperación

### Procedimiento
1. Identificar backup a restaurar
2. Verificar integridad
3. Restaurar en DB temporal
4. Validar datos
5. Migrar a producción

### Validación Post-Restauración
```python
VALIDATIONS = [
    "Recuento total de registros",
    "Integridad referencial",
    "Últimas modificaciones",
    "Estado de índices",
    "Permisos y roles"
]
```

## 8. Scripts de Mantenimiento

### Limpieza General
```bash
# Eliminar archivos temporales
find /tmp -name "masclet_backup_*" -mtime +1 -delete

# Rotar logs antiguos
find /logs -name "*.log" -mtime +30 -exec gzip {} \;
```

### Optimización
```sql
-- Limpieza DB
VACUUM FULL;
REINDEX DATABASE masclet_imperi;
```

## 9. Casos de Error

### Escenarios y Acciones
1. **Espacio Insuficiente**
   - Limpiar temporales
   - Rotar backups antiguos
   - Comprimir logs

2. **Fallo de Conexión**
   - Reintentos (max 3)
   - Timeout 30s
   - Notificación urgente

3. **Corrupción de Datos**
   - Restaurar backup anterior
   - Verificar integridad DB
   - Generar reporte

## 10. Documentación Operativa

### Comandos Principales
```bash
# Backup manual
./backup.sh -t daily

# Verificación
./test-backup.sh /backups/daily/latest.tar.gz

# Limpieza
./cleanup.sh -a 30
```

### Logs y Monitoreo
```bash
# Ver logs
tail -f /logs/backup.log

# Estado del sistema
./status.sh