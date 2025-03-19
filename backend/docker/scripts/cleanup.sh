#!/bin/bash
# Script para limpieza y mantenimiento del sistema
# Ubicación: backend/docker/scripts/cleanup.sh

set -e

# Configuración
CLEANUP_DIR="/app/cleanup"
LOG_DIR="/logs/cleanup"
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Configuración de retención
declare -A RETENTION=(
    ["logs"]="30"                # Días para retener logs
    ["backups"]="7"              # Días para retener backups
    ["temp"]="1"                 # Días para retener archivos temporales
    ["cache"]="7"                # Días para retener caché
    ["sessions"]="1"             # Días para retener sesiones
    ["uploads"]="30"             # Días para retener uploads
)

# Directorios a limpiar
declare -A CLEANUP_PATHS=(
    ["logs"]="/app/logs"
    ["backups"]="/app/backups"
    ["temp"]="/app/temp"
    ["cache"]="/app/cache"
    ["sessions"]="/app/sessions"
    ["uploads"]="/app/uploads"
)

# Patrones de archivos a preservar
declare -A PRESERVE_PATTERNS=(
    ["logs"]="*.current|system.*"
    ["backups"]="latest.*|current.*"
    ["temp"]=""
    ["cache"]="index.*"
    ["sessions"]="admin.*"
    ["uploads"]="*.required"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/cleanup_${TIMESTAMP}.log"
}

# Limpiar directorio
cleanup_directory() {
    local type="$1"
    local dir="${CLEANUP_PATHS[$type]}"
    local days="${RETENTION[$type]}"
    local preserve="${PRESERVE_PATTERNS[$type]}"
    
    log_message "INFO" "Limpiando directorio $dir (retención: $days días)"
    
    if [ ! -d "$dir" ]; then
        log_message "WARNING" "Directorio no encontrado: $dir"
        return 0
    fi
    
    # Encontrar y eliminar archivos antiguos
    if [ -n "$preserve" ]; then
        find "$dir" -type f -mtime +"$days" ! -regex ".*($preserve).*" -delete
    else
        find "$dir" -type f -mtime +"$days" -delete
    fi
    
    # Eliminar directorios vacíos
    find "$dir" -type d -empty -delete
    
    return 0
}

# Limpiar logs
cleanup_logs() {
    log_message "INFO" "Limpiando logs antiguos..."
    
    # Logs del sistema
    cleanup_directory "logs"
    
    # Logs de aplicación
    for app_log in /app/*/logs; do
        if [ -d "$app_log" ]; then
            find "$app_log" -type f -name "*.log" -mtime +30 -delete
        fi
    done
    
    # Comprimir logs antiguos
    find /app -type f -name "*.log" ! -name "*.gz" -mtime +7 -exec gzip {} \;
    
    return 0
}

# Limpiar caché
cleanup_cache() {
    log_message "INFO" "Limpiando caché..."
    
    # Caché de Python
    find /app -type d -name "__pycache__" -exec rm -rf {} +
    find /app -type f -name "*.pyc" -delete
    
    # Caché de aplicación
    cleanup_directory "cache"
    
    # Caché de sesiones
    cleanup_directory "sessions"
    
    return 0
}

# Limpiar archivos temporales
cleanup_temp() {
    log_message "INFO" "Limpiando archivos temporales..."
    
    # Directorio temp
    cleanup_directory "temp"
    
    # Otros archivos temporales
    find /app -type f -name "*.tmp" -delete
    find /app -type f -name "*.bak" -mtime +7 -delete
    find /app -type f -name ".DS_Store" -delete
    
    return 0
}

# Limpiar backups antiguos
cleanup_backups() {
    log_message "INFO" "Limpiando backups antiguos..."
    
    # Backups de base de datos
    find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete
    
    # Backups de configuración
    find "$BACKUP_DIR" -name "config_*.bak" -mtime +30 -delete
    
    # Mantener último backup del mes
    for file in "$BACKUP_DIR"/backup_*; do
        if [ -f "$file" ]; then
            month=$(date -r "$file" +%Y%m)
            latest=$(find "$BACKUP_DIR" -name "backup_${month}*.sql" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
            if [ "$file" != "$latest" ]; then
                rm -f "$file"
            fi
        fi
    done
    
    return 0
}

# Limpiar uploads
cleanup_uploads() {
    log_message "INFO" "Limpiando directorio de uploads..."
    
    # Eliminar archivos temporales de upload
    find "${CLEANUP_PATHS[uploads]}" -type f -name "*.upload.tmp" -mtime +1 -delete
    
    # Verificar y eliminar archivos huérfanos
    for file in "${CLEANUP_PATHS[uploads]}"/*; do
        if [ -f "$file" ]; then
            # Verificar si el archivo está referenciado en la base de datos
            filename=$(basename "$file")
            if ! psql -t -c "SELECT 1 FROM uploads WHERE filename = '$filename' LIMIT 1;" | grep -q 1; then
                log_message "INFO" "Eliminando archivo huérfano: $filename"
                rm -f "$file"
            fi
        fi
    done
    
    return 0
}

# Optimizar base de datos
optimize_database() {
    log_message "INFO" "Optimizando base de datos..."
    
    # Vacuum analyze
    psql -c "VACUUM ANALYZE;"
    
    # Reindex
    psql -c "REINDEX DATABASE masclet_imperi;"
    
    # Actualizar estadísticas
    psql -c "ANALYZE VERBOSE;"
    
    return 0
}

# Generar reporte de limpieza
generate_cleanup_report() {
    local report_file="$LOG_DIR/cleanup_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Limpieza</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Limpieza del Sistema</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen</h2>
    <table>
        <tr>
            <th>Tipo</th>
            <th>Espacio Liberado</th>
            <th>Archivos Eliminados</th>
            <th>Estado</th>
        </tr>
EOF
    
    # Añadir estadísticas para cada tipo
    for type in "${!CLEANUP_PATHS[@]}"; do
        local dir="${CLEANUP_PATHS[$type]}"
        local before_size=0
        local after_size=0
        local files_deleted=0
        
        if [ -d "$dir" ]; then
            before_size=$(du -s "$dir" | cut -f1)
            files_deleted=$(find "$dir" -type f -mtime +"${RETENTION[$type]}" | wc -l)
            after_size=$(du -s "$dir" | cut -f1)
        fi
        
        local space_freed=$((before_size - after_size))
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$type</td>
            <td>$space_freed KB</td>
            <td>$files_deleted</td>
            <td class="success">Completado</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Log de Operaciones</h2>
    <pre>
$(cat "$LOG_DIR/cleanup_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    
    # Crear directorios necesarios
    mkdir -p "$CLEANUP_DIR" "$LOG_DIR"
    
    case "$action" in
        "all")
            log_message "INFO" "Iniciando limpieza completa..."
            cleanup_logs
            cleanup_cache
            cleanup_temp
            cleanup_backups
            cleanup_uploads
            optimize_database
            generate_cleanup_report
            ;;
        
        "logs")
            cleanup_logs
            ;;
        
        "cache")
            cleanup_cache
            ;;
        
        "temp")
            cleanup_temp
            ;;
        
        "backups")
            cleanup_backups
            ;;
        
        "uploads")
            cleanup_uploads
            ;;
        
        "optimize")
            optimize_database
            ;;
        
        "report")
            generate_cleanup_report
            ;;
        
        *)
            echo "Uso: $0 {all|logs|cache|temp|backups|uploads|optimize|report}"
            exit 1
            ;;
    esac
    
    return 0
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"' ERR

# Verificar usuario root
if [ "$(id -u)" != "0" ]; then
    log_message "ERROR" "Este script debe ejecutarse como root"
    exit 1
fi

# Ejecutar script
main "$@"