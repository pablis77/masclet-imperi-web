#!/bin/bash
# Script principal de mantenimiento que integra limpieza y monitorización
# Ubicación: backend/docker/scripts/maintenance.sh

set -e

# Configuración
CONFIG_FILE="/app/config/maintenance.env"
SCRIPTS_DIR="/app/scripts"
LOG_DIR="/logs/maintenance"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Cargar configuración
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: Archivo de configuración no encontrado en $CONFIG_FILE" >&2
    exit 1
fi

# Crear directorios necesarios
mkdir -p "$LOG_DIR"/{daily,weekly,monthly}

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    local log_file="$3"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$log_file"
}

# Ejecutar limpieza de espacio
run_cleanup() {
    log_message "INFO" "Iniciando limpieza de sistema..." "$LOG_DIR/daily/cleanup_${TIMESTAMP}.log"
    
    # Ejecutar scripts de limpieza
    "$SCRIPTS_DIR/cleanup_versions.sh"
    "$SCRIPTS_DIR/clean_old_files.sh"
    
    local result=$?
    if [ $result -eq 0 ]; then
        log_message "SUCCESS" "Limpieza completada exitosamente" "$LOG_DIR/daily/cleanup_${TIMESTAMP}.log"
    else
        log_message "ERROR" "Error en proceso de limpieza" "$LOG_DIR/daily/cleanup_${TIMESTAMP}.log"
    fi
    
    return $result
}

# Verificar espacio
check_space() {
    log_message "INFO" "Verificando espacio..." "$LOG_DIR/daily/space_${TIMESTAMP}.log"
    
    # Ejecutar script de verificación
    "$SCRIPTS_DIR/alert_space.sh"
    
    local result=$?
    if [ $result -ne 0 ]; then
        log_message "WARNING" "Detectados problemas de espacio" "$LOG_DIR/daily/space_${TIMESTAMP}.log"
    fi
    
    return $result
}

# Optimizar base de datos
optimize_database() {
    log_message "INFO" "Optimizando base de datos..." "$LOG_DIR/weekly/db_${TIMESTAMP}.log"
    
    if command -v psql &> /dev/null; then
        PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
            -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" << EOF
VACUUM FULL ANALYZE;
REINDEX DATABASE "${POSTGRES_DB}";
EOF
        
        local result=$?
        if [ $result -eq 0 ]; then
            log_message "SUCCESS" "Base de datos optimizada" "$LOG_DIR/weekly/db_${TIMESTAMP}.log"
        else
            log_message "ERROR" "Error optimizando base de datos" "$LOG_DIR/weekly/db_${TIMESTAMP}.log"
        fi
    else
        log_message "ERROR" "Cliente PostgreSQL no disponible" "$LOG_DIR/weekly/db_${TIMESTAMP}.log"
        return 1
    fi
}

# Rotar logs
rotate_logs() {
    log_message "INFO" "Rotando logs..." "$LOG_DIR/daily/rotation_${TIMESTAMP}.log"
    
    # Ejecutar logrotate
    /usr/sbin/logrotate /etc/logrotate.d/masclet
    
    local result=$?
    if [ $result -eq 0 ]; then
        log_message "SUCCESS" "Logs rotados correctamente" "$LOG_DIR/daily/rotation_${TIMESTAMP}.log"
    else
        log_message "ERROR" "Error en rotación de logs" "$LOG_DIR/daily/rotation_${TIMESTAMP}.log"
    fi
    
    return $result
}

# Generar reporte de mantenimiento
generate_report() {
    local report_file="$LOG_DIR/monthly/maintenance_report_${TIMESTAMP}.txt"
    
    {
        echo "=== Reporte de Mantenimiento ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        echo "1. Estado del Sistema"
        df -h /
        echo
        
        echo "2. Estadísticas de Base de Datos"
        if command -v psql &> /dev/null; then
            PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
                -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
                -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
        fi
        echo
        
        echo "3. Estado de Backups"
        find /backups -type f -name "*.gz" -exec ls -lh {} \; | tail -n 5
        echo
        
        echo "4. Logs más Grandes"
        find /logs -type f -size +10M -exec ls -lh {} \;
    } > "$report_file"
    
    log_message "INFO" "Reporte generado: $report_file" "$LOG_DIR/monthly/report_${TIMESTAMP}.log"
}

# Función principal
main() {
    local mode="$1"
    log_message "INFO" "Iniciando mantenimiento en modo: $mode" "$LOG_DIR/maintenance.log"
    
    case "$mode" in
        daily)
            run_cleanup
            check_space
            rotate_logs
            ;;
        weekly)
            run_cleanup
            check_space
            rotate_logs
            optimize_database
            ;;
        monthly)
            run_cleanup
            check_space
            rotate_logs
            optimize_database
            generate_report
            ;;
        *)
            log_message "ERROR" "Modo no válido: $mode" "$LOG_DIR/maintenance.log"
            exit 1
            ;;
    esac
    
    log_message "SUCCESS" "Mantenimiento $mode completado" "$LOG_DIR/maintenance.log"
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND" "$LOG_DIR/maintenance.log"' ERR

# Verificar argumentos
if [ $# -ne 1 ]; then
    echo "Uso: $0 <daily|weekly|monthly>" >&2
    exit 1
fi

# Ejecutar script
main "$1"