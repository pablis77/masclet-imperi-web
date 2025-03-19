#!/bin/bash
# Script para monitorear y alertar sobre uso de espacio
# Ubicación: backend/docker/scripts/alert_space.sh

set -e

# Configuración
LOG_FILE="/logs/space_alerts.log"
TIMESTAMP=$(date +"%Y-%m%d_%H%M%S")
ALERT_DIR="/alerts"
CONFIG_FILE="/app/.env"

# Umbrales de alerta (en porcentaje)
CRITICAL_THRESHOLD=90
WARNING_THRESHOLD=80
INFO_THRESHOLD=70

# Cargar configuración
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: Archivo de configuración no encontrado" >&2
    exit 1
fi

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_FILE"
}

# Función para enviar notificaciones
notify() {
    local subject="$1"
    local level="$2"
    local message="$3"
    
    # Enviar a sistema de notificaciones
    /usr/local/bin/notify.sh "$subject" "$level" "$message"
    
    # Guardar alerta
    local alert_file="${ALERT_DIR}/space_alert_${TIMESTAMP}.json"
    cat > "$alert_file" << EOF
{
    "timestamp": "$(date +'%Y-%m-%d %H:%M:%S')",
    "level": "$level",
    "subject": "$subject",
    "message": "$message"
}
EOF
}

# Verificar espacio en directorios críticos
check_directory_space() {
    local dir="$1"
    local threshold="$2"
    local usage
    
    usage=$(df -h "$dir" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -ge "$CRITICAL_THRESHOLD" ]; then
        notify "Espacio Crítico" "error" "Directorio $dir al ${usage}% de uso"
        log_message "ERROR" "Espacio crítico en $dir: ${usage}%"
        return 2
    elif [ "$usage" -ge "$WARNING_THRESHOLD" ]; then
        notify "Espacio Alto" "warning" "Directorio $dir al ${usage}% de uso"
        log_message "WARNING" "Espacio alto en $dir: ${usage}%"
        return 1
    elif [ "$usage" -ge "$INFO_THRESHOLD" ]; then
        log_message "INFO" "Uso de espacio normal en $dir: ${usage}%"
        return 0
    fi
}

# Verificar tamaño de archivos específicos
check_file_sizes() {
    log_message "INFO" "Verificando tamaños de archivos..."
    
    # Logs grandes
    find /logs -type f -size +100M | while read -r file; do
        notify "Log Grande" "warning" "Archivo $file supera 100MB"
        log_message "WARNING" "Log grande detectado: $file"
    done
    
    # Backups antiguos
    find /backups -type f -mtime +30 -size +1G | while read -r file; do
        notify "Backup Grande" "warning" "Backup antiguo $file supera 1GB"
        log_message "WARNING" "Backup grande y antiguo: $file"
    done
}

# Verificar crecimiento anormal
check_growth_rate() {
    log_message "INFO" "Verificando tasa de crecimiento..."
    
    local current_size
    local last_size_file="/tmp/last_size"
    current_size=$(df -B1 / | awk 'NR==2 {print $3}')
    
    if [ -f "$last_size_file" ]; then
        local last_size
        last_size=$(cat "$last_size_file")
        local growth_mb
        growth_mb=$(( (current_size - last_size) / 1024 / 1024 ))
        
        if [ "$growth_mb" -gt 1000 ]; then  # Más de 1GB
            notify "Crecimiento Rápido" "warning" "Incremento de ${growth_mb}MB en el último día"
            log_message "WARNING" "Crecimiento rápido detectado: ${growth_mb}MB"
        fi
    fi
    
    echo "$current_size" > "$last_size_file"
}

# Analizar espacios específicos
analyze_specific_spaces() {
    log_message "INFO" "Analizando espacios específicos..."
    
    # Base de datos
    local db_size
    if command -v psql &> /dev/null; then
        db_size=$(PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
            -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
            -t -c "SELECT pg_size_pretty(pg_database_size('${POSTGRES_DB}'));")
        log_message "INFO" "Tamaño de base de datos: $db_size"
    fi
    
    # Directorio de uploads
    if [ -d "/app/uploads" ]; then
        local upload_size
        upload_size=$(du -sh /app/uploads 2>/dev/null | cut -f1)
        log_message "INFO" "Tamaño de uploads: $upload_size"
    fi
}

# Generar reporte de espacio
generate_space_report() {
    local report_file="${ALERT_DIR}/space_report_${TIMESTAMP}.txt"
    
    {
        echo "=== Reporte de Espacio ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "1. Uso General"
        df -h /
        echo
        echo "2. Directorios Principales"
        du -sh /* 2>/dev/null | sort -hr
        echo
        echo "3. Archivos Más Grandes"
        find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null | sort -k5hr | head -n 10
    } > "$report_file"
    
    log_message "INFO" "Reporte generado: $report_file"
}

# Función principal
main() {
    mkdir -p "$ALERT_DIR"
    log_message "INFO" "Iniciando verificación de espacio..."
    
    # Verificar directorios críticos
    check_directory_space "/" "$WARNING_THRESHOLD"
    check_directory_space "/app" "$WARNING_THRESHOLD"
    check_directory_space "/logs" "$WARNING_THRESHOLD"
    check_directory_space "/backups" "$WARNING_THRESHOLD"
    
    # Verificaciones adicionales
    check_file_sizes
    check_growth_rate
    analyze_specific_spaces
    
    # Generar reporte
    generate_space_report
    
    log_message "INFO" "Verificación de espacio completada"
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"; exit 1' ERR

# Ejecutar script
main "$@"