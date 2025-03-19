# Resumen del Sistema de Backup

## 1. Dimensionamiento

### Datos Críticos
- Base de datos (~1MB)
  * ~800 animales × 500 bytes ≈ 400KB
  * ~400 partos × 200 bytes ≈ 80KB
  * Índices y metadata ≈ 500KB

### Archivos de Configuración
- Configuraciones (~100KB)
- Logs rotados (~500KB)
- Total: < 2MB por backup completo

## 2. Estrategia de Backup

### Backup Diario (2 AM)
```bash
# Solo tablas principales comprimidas
pg_dump -U postgres -t animals -t parts masclet_imperi | gzip > /backups/db/daily_$(date +%Y%m%d).sql.gz
```

### Backup Semanal (Domingo 3 AM)
```bash
# Base de datos completa
pg_dump -U postgres masclet_imperi | gzip > /backups/db/weekly_$(date +%Y%m%d).sql.gz
```

## 3. Retención y Espacio

### Política de Retención
- Diarios: últimos 7 días
- Semanales: últimas 4 semanas
- **Espacio Total**: < 20MB

### Limpieza Automática
```bash
# Script de limpieza
find /backups/db/daily_* -mtime +7 -delete
find /backups/db/weekly_* -mtime +28 -delete
```

## 4. Monitorización

### Alertas Críticas
- Backup fallido
- Tamaño > 2MB (posible anomalía)
- Espacio libre < 100MB

### Verificaciones
- Integridad del archivo comprimido
- Conteo de registros
- Última fecha de modificación

## 5. Restauración

### Procedimiento
1. Detener servicios
2. Restaurar backup
3. Verificar integridad
4. Reiniciar servicios

### Test Mensual
- Restauración en base de prueba
- Verificación de datos críticos
- Documentación de resultados