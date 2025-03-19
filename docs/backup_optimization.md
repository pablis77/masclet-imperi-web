# Optimización del Sistema de Backup para Masclet Imperi

## 1. Análisis de Tamaño Esperado

### Cálculo Base
- Animales: ~800 registros × ~500 bytes = ~400KB
- Partos: ~400 registros × ~200 bytes = ~80KB
- Histórico: ~1000 registros × ~200 bytes = ~200KB
- Usuarios y logs: ~100KB
- **Total estimado**: < 1MB datos puros

### Factores de Crecimiento
- Incremento mensual: ~20-30 registros
- Crecimiento anual: ~400KB
- Rotación de logs: limpieza mensual

## 2. Estrategia de Backup Optimizada

### Backup Diario (2 AM)
```bash
# Solo datos críticos
pg_dump -U postgres -t animals -t parts masclet_imperi | gzip > /backups/db/daily_$(date +%Y%m%d).sql.gz
```

### Backup Semanal (Domingo 3 AM)
```bash
# Base de datos completa + archivos config
pg_dump -U postgres masclet_imperi | gzip > /backups/db/weekly_$(date +%Y%m%d).sql.gz
tar -czf /backups/config/weekly_$(date +%Y%m%d).tar.gz /app/config
```

### Backup Mensual (día 1, 4 AM)
```bash
# Todo el sistema
pg_dump -U postgres masclet_imperi | gzip > /backups/full/monthly_$(date +%Y%m).sql.gz
tar -czf /backups/full/monthly_$(date +%Y%m).tar.gz /app
```

## 3. Política de Retención

### Rotación
- Diarios: últimos 7 días (~7MB)
- Semanales: últimas 4 semanas (~16MB)
- Mensuales: últimos 3 meses (~15MB)
- **Espacio máximo**: ~40MB

### Limpieza Automática
```bash
# Eliminar backups antiguos
find /backups/db/daily_* -mtime +7 -delete
find /backups/db/weekly_* -mtime +28 -delete
find /backups/full/monthly_* -mtime +90 -delete
```

## 4. Monitorización

### Métricas Críticas
- Tamaño backup < 2MB (diario)
- Tiempo ejecución < 1 minuto
- Espacio libre > 100MB

### Alertas
- Backup fallido
- Tamaño anormal (>2MB)
- Espacio insuficiente (<100MB)

## 5. Recomendaciones

1. **Compresión Agresiva**: gzip -9 para máxima compresión
2. **Purga de Logs**: rotación semanal de logs antiguos
3. **Exclusión de Temporales**: ignorar /tmp, .pyc, __pycache__
4. **Monitorización Liviana**: métricas básicas sin sobrecarga