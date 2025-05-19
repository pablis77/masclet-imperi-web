#!/bin/bash
# Script para limpiar versiones antiguas y archivos innecesarios
# Ubicación: backend/docker/scripts/cleanup_versions.sh

set -e

# Configuración
LOG_FILE="/logs/cleanup_versions.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Limpiar directorios de caché
cleanup_cache() {
    log_message "🧹 Limpiando cachés..."
    local count=0
    
    # Python cache
    find . -type d -name "__pycache__" -exec rm -rf {} +
    find . -name "*.pyc" -delete
    
    # Node modules no esenciales
    if [ -d "node_modules" ]; then
        npm prune --production
    fi
    
    # Cachés de pip
    if [ -d "~/.cache/pip" ]; then
        rm -rf ~/.cache/pip/*
    fi
    
    log_message "✅ Limpieza de caché completada"
}

# Limpiar versiones antiguas de migraciones
cleanup_migrations() {
    log_message "📊 Limpiando migraciones antiguas..."
    
    local MIGRATIONS_DIR="backend/migrations"
    if [ -d "$MIGRATIONS_DIR" ]; then
        # Mantener solo las últimas 5 migraciones
        cd "$MIGRATIONS_DIR"
        ls -t | grep -v "__init__.py" | tail -n +6 | xargs -I {} rm -f {}
        cd - > /dev/null
        log_message "✅ Migraciones antiguas eliminadas"
    else
        log_message "⚠️ Directorio de migraciones no encontrado"
    fi
}

# Limpiar logs antiguos
cleanup_logs() {
    log_message "📜 Limpiando logs antiguos..."
    
    # Comprimir logs > 7 días
    find /logs -name "*.log" -mtime +7 -exec gzip {} \;
    
    # Eliminar logs comprimidos > 30 días
    find /logs -name "*.log.gz" -mtime +30 -delete
    
    log_message "✅ Logs antiguos procesados"
}

# Limpiar archivos temporales
cleanup_temp() {
    log_message "🗑️ Limpiando archivos temporales..."
    
    # Temporales de sistema
    find /tmp -name "masclet_*" -mtime +1 -delete
    
    # Archivos de backup parciales
    find /backups -name "*.partial" -delete
    find /backups -name "*.tmp" -delete
    
    log_message "✅ Archivos temporales eliminados"
}

# Limpiar versiones antiguas de código
cleanup_code_versions() {
    log_message "📦 Limpiando versiones antiguas de código..."
    
    # Git clean
    if [ -d ".git" ]; then
        git gc --aggressive --prune=now
        git remote prune origin
    fi
    
    # Eliminar archivos de compilación
    find . -name "*.o" -delete
    find . -name "*.so" -delete
    
    log_message "✅ Limpieza de código completada"
}

# Optimizar base de datos
optimize_database() {
    log_message "🔄 Optimizando base de datos..."
    
    if command -v psql &> /dev/null; then
        PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
            -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
            -c "VACUUM FULL ANALYZE;" \
            -c "REINDEX DATABASE ${POSTGRES_DB};"
        
        log_message "✅ Base de datos optimizada"
    else
        log_message "⚠️ Cliente PostgreSQL no encontrado"
    fi
}

# Generar reporte
generate_report() {
    local report_file="/logs/cleanup_report_${TIMESTAMP}.txt"
    
    {
        echo "=== Reporte de Limpieza ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "1. Espacio en Disco"
        df -h /
        echo
        echo "2. Tamaños de Directorios"
        du -sh /app/* 2>/dev/null || true
        echo
        echo "3. Estado de la Base de Datos"
        PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
            -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
            -c "\d+" 2>/dev/null || echo "No se pudo acceder a la BD"
    } > "$report_file"
    
    log_message "📊 Reporte generado: $report_file"
}

# Función principal
main() {
    log_message "🚀 Iniciando limpieza de versiones..."
    
    # Ejecutar tareas de limpieza
    cleanup_cache
    cleanup_migrations
    cleanup_logs
    cleanup_temp
    cleanup_code_versions
    optimize_database
    
    # Generar reporte final
    generate_report
    
    log_message "✅ Proceso de limpieza completado"
}

# Manejo de errores
trap 'log_message "❌ Error en línea $LINENO: $BASH_COMMAND"; exit 1' ERR

# Ejecutar script
main "$@"