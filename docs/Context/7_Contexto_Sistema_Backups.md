# Sistema de Backups

## 1. Configuración Principal

### Automatización
- Schedule: Diario 2 AM
- Retención: 3 últimos backups
- Ubicación: `/backups/{tipo}/{fecha}`

### Herramientas
- pg_dump/pg_restore para operaciones
- cron para automatización
- rsync para sincronización remota

## 2. Tipos de Backup

### Diario (2 AM)
```bash
# Solo datos críticos comprimidos
pg_dump -U postgres -t animals -t parts masclet_imperi \
  | gzip > /backups/db/daily_$(date +%Y%m%d).sql.gz
```

### Semanal (Domingo 3 AM)
```bash
# Base de datos completa
pg_dump -U postgres masclet_imperi \
  | gzip > /backups/db/weekly_$(date +%Y%m%d).sql.gz
```

## 3. Scripts y Herramientas

### Validación
```bash
# Verificar backup
gunzip -t backup_20250311.sql.gz

# Contar registros
zcat backup_20250311.sql.gz | grep -c 'INSERT INTO animals'
```

### Rotación
```bash
# Mantener últimos 7 diarios
find /backups/db/daily_* -mtime +7 -delete

# Mantener últimas 4 semanas
find /backups/db/weekly_* -mtime +28 -delete
```

## 4. Procedimientos

### Backup Manual
1. Detener servicios activos
2. Ejecutar backup
3. Verificar integridad
4. Reiniciar servicios

### Restauración
1. Detener servicios
2. Validar backup
3. Restaurar datos
4. Verificar integridad
5. Reiniciar servicios

## 5. Monitorización

### Métricas
```python
BACKUP_METRICS = {
    "performance": {
        "duration_seconds": float,
        "compression_ratio": float,
        "memory_usage_mb": float
    },
    "size": {
        "total_bytes": int,
        "compressed_bytes": int,
        "tables": {
            "animals": int,
            "parts": int
        }
    },
    "records": {
        "total": int,
        "by_table": {
            "animals": int,
            "parts": int
        }
    }
}
```

### Alertas
```python
BACKUP_ALERTS = {
    "critical": {
        "duration": "> 30min",
        "size": "> 1GB",
        "errors": "> 0"
    },
    "warning": {
        "duration": "> 15min",
        "compression": "< 0.5",
        "disk_space": "< 1GB"
    },
    "info": {
        "size_change": "> 10%",
        "record_change": "> 100"
    }
}
```

## 6. Referencias

### Documentación
- [PostgreSQL Backup/Restore](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Manual](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Docker Backup Best Practices](https://docs.docker.com/storage/backup/)

## 7. Tests del Sistema de Backup

### Pruebas Unitarias
```python
@pytest.mark.asyncio
class TestBackupSystem:
    async def test_backup_creation(self):
        # Validar creación correcta
        ...
    
    async def test_backup_compression(self):
        # Verificar ratio de compresión
        ...
        
    async def test_backup_rotation(self):
        # Comprobar política de retención
        ...

    async def test_restore_process(self):
        # Validar restauración completa
        ...
```

## 8. Verificación y Validación

### Pre-backup
- Espacio disponible suficiente
- Permisos de escritura correctos
- Servicios en estado correcto

### Post-backup
- Integridad del archivo
- Conteo de registros correcto
- Compresión efectiva

## 9. Recuperación ante Desastres

### Plan de Recuperación
1. Identificar último backup válido
2. Preparar entorno limpio
3. Restaurar datos por fases
4. Verificar integridad
5. Actualizar documentación

### Simulacros
- Pruebas trimestrales
- Escenarios múltiples
- Documentación de resultados

## 10. Integración con Docker

### Docker Compose
```yaml
backup:
  image: postgres:17
  volumes:
    - ./backup:/backup
  environment:
    PGUSER: postgres
    PGPASSWORD: ${DB_PASSWORD}
  command: |
    pg_dump -h db -U postgres masclet_imperi | gzip > /backup/$(date +%Y%m%d).sql.gz
```

### Volúmenes
```yaml
volumes:
  backup_data:
    driver: local
    driver_opts:
      type: none
      device: /data/backups
      o: bind
```

## 11. Registro de Operaciones

### Formato de Log
```json
{
    "timestamp": "YYYY-MM-DD HH:mm:ss",
    "operation": "backup|restore",
    "status": "success|error",
    "details": {
        "size": 1234567,
        "duration": 120,
        "records": {
            "animals": 800,
            "parts": 400
        }
    }
}
```

## 12. Mantenimiento y Limpieza

### Tareas Programadas
```bash
# Limpieza logs antiguos
find /var/log/backup/* -mtime +90 -delete

# Optimización espacio
vacuumdb -z -v masclet_imperi
```

## 13. Automatización CI/CD

### GitHub Actions
```yaml
backup-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Test Backup System
      run: pytest tests/backup/
    - name: Validate Restore
      run: ./scripts/validate_restore.sh
```

## 14. Reporting y Estadísticas

### Métricas a Reportar
```python
BACKUP_REPORTS = {
    "daily": {
        "success_rate": float,
        "avg_duration": float,
        "total_size": int,
        "record_counts": dict
    },
    "weekly": {
        "compression_trends": list,
        "size_evolution": list,
        "error_frequency": dict
    }
}
