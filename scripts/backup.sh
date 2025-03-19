#!/bin/bash

# Configuración
BACKUP_DIR="/backups/db"
DB_NAME="masclet_imperi"
DB_USER="postgres"
DATE=$(date +%Y%m%d)
DAY=$(date +%u)  # 1-7 (lunes-domingo)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Función de limpieza
cleanup_old_backups() {
    # Eliminar backups diarios > 7 días
    find $BACKUP_DIR/daily_* -mtime +7 -delete 2>/dev/null

    # Eliminar backups semanales > 28 días
    find $BACKUP_DIR/weekly_* -mtime +28 -delete 2>/dev/null
}

# Función de verificación
verify_backup() {
    local backup_file=$1
    
    # Verificar existencia
    if [ ! -f "$backup_file" ]; then
        echo "ERROR: Backup no creado: $backup_file"
        exit 1
    }

    # Verificar tamaño (mínimo 100 bytes)
    if [ $(stat -f%z "$backup_file") -lt 100 ]; then
        echo "ERROR: Backup sospechosamente pequeño: $backup_file"
        exit 1
    }

    # Verificar integridad del gzip
    gunzip -t "$backup_file" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "ERROR: Backup corrupto: $backup_file"
        exit 1
    }

    echo "✅ Backup verificado: $backup_file"
}

# Backup Diario (solo tablas principales)
daily_backup() {
    echo "📦 Realizando backup diario..."
    pg_dump -U $DB_USER -t animals -t parts $DB_NAME | gzip > "$BACKUP_DIR/daily_$DATE.sql.gz"
    verify_backup "$BACKUP_DIR/daily_$DATE.sql.gz"
}

# Backup Semanal (domingo)
weekly_backup() {
    echo "📦 Realizando backup semanal completo..."
    pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/weekly_$DATE.sql.gz"
    verify_backup "$BACKUP_DIR/weekly_$DATE.sql.gz"
}

# Ejecutar backup según el día
echo "🚀 Iniciando proceso de backup..."
echo "📅 Fecha: $DATE (día $DAY)"

# Siempre hacer backup diario
daily_backup

# Backup semanal en domingo (día 7)
if [ "$DAY" = "7" ]; then
    weekly_backup
fi

# Limpieza de backups antiguos
cleanup_old_backups

echo "✅ Proceso de backup completado"