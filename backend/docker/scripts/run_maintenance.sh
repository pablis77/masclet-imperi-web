#!/bin/bash
# Script principal para ejecutar tareas de mantenimiento
# Ubicación: backend/docker/scripts/run_maintenance.sh

set -e

# Configuración
SCRIPTS_DIR="/app/scripts"
LOG_DIR="/logs/maintenance"
CONFIG_DIR="/app/config"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/run_${TIMESTAMP}.log"
}

# Ejecutar script con manejo de errores
run_script() {
    local script="$1"
    local description="$2"
    local log_file="$LOG_DIR/${script%.*}_${TIMESTAMP}.log"
    
    log_message "INFO" "Iniciando $description..."
    if [ -x "$SCRIPTS_DIR/$script" ]; then
        if "$SCRIPTS_DIR/$script" &> "$log_file"; then
            log_message "SUCCESS" "$description completado"
            return 0
        else
            log_message "ERROR" "Error en $description"
            cat "$log_file" >> "$LOG_DIR/run_${TIMESTAMP}.log"
            return 1
        fi
    else
        log_message "ERROR" "Script $script no encontrado o no ejecutable"
        return 1
    fi
}

# Verificar permisos antes de iniciar
verify_permissions() {
    log_message "INFO" "Verificando permisos..."
    
    # Verificar permisos de scripts
    run_script "check_permissions.sh" "verificación de permisos"
    if [ $? -ne 0 ]; then
        log_message "ERROR" "Permisos incorrectos detectados"
        return 1
    fi
    
    return 0
}

# Ejecutar mantenimiento
run_maintenance() {
    local mode="$1"
    log_message "INFO" "Iniciando mantenimiento en modo $mode"
    
    case "$mode" in
        daily)
            run_script "alert_space.sh" "verificación de espacio"
            run_script "maintenance.sh daily" "mantenimiento diario"
            ;;
        weekly)
            run_script "alert_space.sh" "verificación de espacio"
            run_script "maintenance.sh weekly" "mantenimiento semanal"
            run_script "cleanup_versions.sh" "limpieza de versiones"
            ;;
        monthly)
            run_script "alert_space.sh" "verificación de espacio"
            run_script "maintenance.sh monthly" "mantenimiento mensual"
            run_script "cleanup_versions.sh" "limpieza de versiones"
            run_script "optimize_db.sh" "optimización de base de datos"
            ;;
        space)
            run_script "alert_space.sh" "verificación de espacio"
            ;;
        cleanup)
            run_script "cleanup_versions.sh" "limpieza de versiones"
            ;;
        permissions)
            run_script "check_permissions.sh" "verificación de permisos"
            run_script "setup_permissions.sh" "configuración de permisos"
            ;;
        *)
            log_message "ERROR" "Modo de mantenimiento no válido: $mode"
            echo "Uso: $0 <daily|weekly|monthly|space|cleanup|permissions>"
            return 1
            ;;
    esac
    
    return $?
}

# Verificar estado del sistema
check_system_status() {
    log_message "INFO" "Verificando estado del sistema..."
    
    # Verificar espacio disponible
    local disk_usage
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_message "ERROR" "Espacio en disco crítico: ${disk_usage}%"
        return 1
    fi
    
    # Verificar carga del sistema
    local load_avg
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1)
    if [ "$(echo "$load_avg > 5" | bc)" -eq 1 ]; then
        log_message "WARNING" "Carga del sistema alta: $load_avg"
    fi
    
    return 0
}

# Generar reporte
generate_report() {
    local report_file="$LOG_DIR/report_${TIMESTAMP}.txt"
    log_message "INFO" "Generando reporte en $report_file"
    
    {
        echo "=== Reporte de Mantenimiento ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "Estado del Sistema:"
        df -h
        echo
        echo "Logs Generados:"
        find "$LOG_DIR" -type f -name "*_${TIMESTAMP}*" -exec ls -lh {} \;
        echo
        echo "Errores Encontrados:"
        grep -h ERROR "$LOG_DIR"/*_"${TIMESTAMP}"*.log || echo "Ninguno"
    } > "$report_file"
    
    log_message "INFO" "Reporte generado"
}

# Función principal
main() {
    local mode="$1"
    
    # Crear directorio de logs si no existe
    mkdir -p "$LOG_DIR"
    
    # Verificar permisos primero
    verify_permissions
    if [ $? -ne 0 ]; then
        log_message "ERROR" "Verificación de permisos fallida"
        exit 1
    fi
    
    # Verificar estado del sistema
    check_system_status
    if [ $? -ne 0 ]; then
        log_message "ERROR" "Sistema en estado crítico"
        exit 1
    fi
    
    # Ejecutar mantenimiento
    run_maintenance "$mode"
    local maintenance_result=$?
    
    # Generar reporte
    generate_report
    
    # Enviar notificación de finalización
    if [ $maintenance_result -eq 0 ]; then
        log_message "SUCCESS" "Mantenimiento completado exitosamente"
    else
        log_message "ERROR" "Mantenimiento completado con errores"
    fi
    
    return $maintenance_result
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"' ERR

# Verificar argumentos
if [ $# -ne 1 ]; then
    echo "Uso: $0 <daily|weekly|monthly|space|cleanup|permissions>"
    exit 1
fi

# Ejecutar script
main "$1"