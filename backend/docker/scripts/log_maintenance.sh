#!/bin/bash
# Script para mantenimiento de logs
# Ubicación: backend/docker/scripts/log_maintenance.sh

set -e

# Configuración
LOG_BASE="/logs"
BACKUP_DIR="/backups/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MAX_LOG_SIZE=100M           # Tamaño máximo por archivo de log
MAX_LOG_AGE=30             # Días máximos de retención
MIN_FREE_SPACE=20          # Porcentaje mínimo de espacio libre

# Estructura de directorios de logs
declare -A LOG_DIRS=(
    ["app"]="7:3"          # 7 días, rotación cada 3 días
    ["audit"]="30:7"       # 30 días, rotación semanal
    ["security"]="90:7"    # 90 días, rotación semanal
    ["performance"]="15:1"  # 15 días, rotación diaria
    ["backup"]="30:7"      # 30 días, rotación semanal
    ["maintenance"]="15:3"  # 15 días, rotación cada 3 días
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "${LOG_BASE}/maintenance/log_maintenance.log"
}

# Verificar espacio en disco
check_disk_space() {
    local disk_usage
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt $((100 - MIN_FREE_SPACE)) ]; then
        log_message "WARNING" "Espacio en disco crítico: ${disk_usage}%"
        return 1
    fi
    return 0
}

# Rotar logs
rotate_logs() {
    local dir="$1"
    local retention="$2"
    local interval="$3"
    
    log_message "INFO" "Rotando logs en $dir (retención: $retention días, intervalo: $interval días)"
    
    # Crear directorio si no existe
    mkdir -p "${LOG_BASE}/${dir}"
    
    # Comprimir logs antiguos
    find "${LOG_BASE}/${dir}" -type f -name "*.log" -mtime "+${interval}" ! -name "*.gz" -exec gzip {} \;
    
    # Eliminar logs más antiguos que el período de retención
    find "${LOG_BASE}/${dir}" -type f -name "*.gz" -mtime "+${retention}" -delete
    
    # Verificar tamaño de logs actuales
    find "${LOG_BASE}/${dir}" -type f -name "*.log" -size "+${MAX_LOG_SIZE}" | while read -r log; do
        local base_name
        base_name=$(basename "$log")
        mv "$log" "${log}.${TIMESTAMP}"
        touch "$log"
        gzip "${log}.${TIMESTAMP}"
        log_message "INFO" "Log rotado por tamaño: $base_name"
    done
}

# Backup de logs importantes
backup_logs() {
    log_message "INFO" "Iniciando backup de logs"
    
    # Crear directorio de backup con fecha
    local backup_path="${BACKUP_DIR}/${TIMESTAMP}"
    mkdir -p "$backup_path"
    
    # Comprimir logs de auditoría y seguridad
    tar czf "${backup_path}/audit_logs.tar.gz" -C "${LOG_BASE}" audit
    tar czf "${backup_path}/security_logs.tar.gz" -C "${LOG_BASE}" security
    
    # Mantener solo los últimos 5 backups
    local -r keep_backups=5
    ls -1dt "${BACKUP_DIR}"/* | tail -n "+$((keep_backups + 1))" | xargs -r rm -rf
    
    log_message "INFO" "Backup de logs completado"
}

# Limpiar logs temporales
clean_temp_logs() {
    log_message "INFO" "Limpiando logs temporales"
    
    # Limpiar archivos temporales
    find "${LOG_BASE}" -type f -name "*.tmp" -delete
    find "${LOG_BASE}" -type f -name "*.temp" -delete
    find "${LOG_BASE}" -type f -name "*.bak" -mtime +7 -delete
    
    # Limpiar logs vacíos
    find "${LOG_BASE}" -type f -empty -delete
    
    log_message "INFO" "Limpieza de logs temporales completada"
}

# Verificar integridad de logs
check_log_integrity() {
    log_message "INFO" "Verificando integridad de logs"
    local issues=0
    
    # Verificar permisos
    find "${LOG_BASE}" -type f -not -perm 640 | while read -r file; do
        log_message "WARNING" "Permisos incorrectos en: $file"
        chmod 640 "$file"
        ((issues++))
    done
    
    # Verificar propietario
    find "${LOG_BASE}" -not -user masclet -not -group masclet | while read -r file; do
        log_message "WARNING" "Propietario incorrecto en: $file"
        chown masclet:masclet "$file"
        ((issues++))
    done
    
    # Verificar archivos corruptos
    find "${LOG_BASE}" -type f -name "*.gz" -exec gzip -t {} \; || {
        log_message "ERROR" "Archivo comprimido corrupto: $file"
        ((issues++))
    }
    
    log_message "INFO" "Verificación de integridad completada. Problemas encontrados: $issues"
    return $issues
}

# Generar reporte
generate_report() {
    local report_file="${LOG_BASE}/maintenance/report_${TIMESTAMP}.txt"
    
    {
        echo "=== Reporte de Mantenimiento de Logs ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "Estado del Sistema:"
        df -h "$LOG_BASE"
        echo
        echo "Estadísticas de Logs:"
        for dir in "${!LOG_DIRS[@]}"; do
            echo "- $dir:"
            du -sh "${LOG_BASE}/${dir}" 2>/dev/null || echo "  No existe"
        done
        echo
        echo "Últimos Backups:"
        ls -lh "${BACKUP_DIR}" | tail -n 5
        echo
        echo "Problemas Detectados:"
        grep -h "WARNING\|ERROR" "${LOG_BASE}/maintenance/log_maintenance.log" || echo "Ninguno"
    } > "$report_file"
    
    log_message "INFO" "Reporte generado: $report_file"
}

# Función principal
main() {
    log_message "INFO" "Iniciando mantenimiento de logs"
    
    # Verificar espacio en disco
    if ! check_disk_space; then
        log_message "ERROR" "No hay suficiente espacio en disco"
        exit 1
    fi
    
    # Procesar cada directorio de logs
    for dir in "${!LOG_DIRS[@]}"; do
        IFS=':' read -r retention interval <<< "${LOG_DIRS[$dir]}"
        rotate_logs "$dir" "$retention" "$interval"
    done
    
    # Realizar backup
    backup_logs
    
    # Limpiar temporales
    clean_temp_logs
    
    # Verificar integridad
    check_log_integrity
    
    # Generar reporte
    generate_report
    
    log_message "SUCCESS" "Mantenimiento de logs completado"
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