#!/bin/bash

# Configuración
BACKUP_DIR="/backups/db"
DB_NAME="masclet_imperi"
DB_USER="postgres"
DB_TEST="masclet_imperi_test"

# Función de verificación de backup
verify_backup() {
    local file=$1
    
    # Comprobar existencia
    if [ ! -f "$file" ]; then
        echo "❌ Error: Backup no encontrado: $file"
        exit 1
    }

    # Verificar formato (gzip)
    if [[ "$file" == *.gz ]]; then
        gunzip -t "$file" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "❌ Error: Archivo corrupto: $file"
            exit 1
        fi
    fi
}

# Función de restauración
restore_backup() {
    local file=$1
    local db=$2
    
    echo "🔄 Restaurando backup en $db..."

    if [[ "$file" == *.gz ]]; then
        gunzip -c "$file" | psql -U $DB_USER $db
    else
        psql -U $DB_USER $db < "$file"
    fi

    if [ $? -ne 0 ]; then
        echo "❌ Error durante la restauración"
        exit 1
    fi
}

# Función de prueba
test_restore() {
    local file=$1
    
    echo "🧪 Realizando prueba de restauración..."

    # Crear base de prueba
    dropdb -U $DB_USER --if-exists $DB_TEST
    createdb -U $DB_USER $DB_TEST

    # Restaurar en base de prueba
    restore_backup "$file" $DB_TEST

    # Verificar datos críticos
    echo "✅ Verificando datos..."
    psql -U $DB_USER $DB_TEST -c "SELECT COUNT(*) FROM animals;"
    psql -U $DB_USER $DB_TEST -c "SELECT COUNT(*) FROM parts;"

    # Limpiar
    dropdb -U $DB_USER $DB_TEST
}

# Validar argumentos
if [ -z "$1" ]; then
    echo "❌ Error: Debes especificar el archivo de backup"
    echo "Uso: $0 <archivo_backup> [--test]"
    exit 1
fi

BACKUP_FILE=$1
TEST_MODE=$2

# Verificar backup
verify_backup "$BACKUP_FILE"

# Ejecutar según modo
if [ "$TEST_MODE" = "--test" ]; then
    test_restore "$BACKUP_FILE"
    echo "✅ Prueba completada exitosamente"
else
    restore_backup "$BACKUP_FILE" $DB_NAME
    echo "✅ Restauración completada exitosamente"
fi