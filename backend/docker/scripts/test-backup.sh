#!/bin/bash

# Configuración
DB_NAME="masclet_imperi"
DB_USER="postgres"
BACKUP_DIR="/backups/db"
DATE=$(date +%Y%m%d)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

echo "🚀 Iniciando backup de prueba..."

# 1. Backup diario (solo tablas principales)
echo "📦 Realizando backup diario comprimido..."
DAILY_BACKUP="$BACKUP_DIR/daily_$DATE.sql.gz"
pg_dump -U $DB_USER -t animals -t parts $DB_NAME | gzip > $DAILY_BACKUP

# Verificar backup
echo "🔍 Verificando backup..."

# Comprobar existencia
if [ ! -f "$DAILY_BACKUP" ]; then
    echo "❌ Error: Backup no creado"
    exit 1
fi

# Verificar tamaño (min 100 bytes)
SIZE=$(stat -f%z "$DAILY_BACKUP")
echo "📊 Tamaño del backup: $SIZE bytes"

if [ $SIZE -lt 100 ]; then
    echo "❌ Error: Backup sospechosamente pequeño"
    exit 1
fi

# Verificar integridad del gzip
gunzip -t "$DAILY_BACKUP" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Archivo corrupto"
    exit 1
fi

echo "✅ Backup creado y verificado correctamente: $DAILY_BACKUP"