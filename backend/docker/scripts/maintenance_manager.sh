#!/bin/bash
# Script principal de gestión de mantenimiento
# Ubicación: backend/docker/scripts/maintenance_manager.sh

set -e

# Configuración
MANAGER_DIR="/app/manager"
LOG_DIR="/logs/manager"
CONFIG_DIR="/app/config/manager"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Scripts a gestionar
declare -A SCRIPTS=(
    ["init"]="init_maintenance.sh"
    ["setup"]="setup_permissions.sh"
    ["monitor"]="setup_monitoring.sh"
    ["notify"]="setup_notifications.sh"
    ["recovery"]="setup_recovery.sh"
    ["check"]="check_system.sh"
    ["network"]="network_check.sh"
)

# Orden de ejecución y dependencias
declare -A EXECUTION_ORDER=(
    [1]="init"      # Inicialización
    [2]="setup"     # Configuración de permisos
    [3]="monitor"   # Monitorización
    [4]="notify"    # Notificaciones
    [5]="recovery"  # Recuperación
    [6]="check"     # Verificación del sistema
    [7]="network"   # Verificación de red
)

declare -A DEPENDENCIES=(
    ["monitor"]="init,setup"
    ["notify"]="init,setup"
    ["recovery"]="init,setup,monitor"
    ["check"]="init,monitor"
    ["network"]="init,monitor"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/manager_${TIMESTAMP}.log"
}

# Verificar dependencias
check_dependencies() {
    local script="$1"
    log_message "INFO" "Verificando dependencias para $script..."
    
    # Si no hay dependencias, retornar éxito
    if [ -z "${DEPENDENCIES[$script]}" ]; then
        return 0
    fi
    
    # Verificar cada dependencia
    IFS=',' read -ra DEPS <<< "${DEPENDENCIES[$script]}"
    for dep in "${DEPS[@]}"; do
        if ! check_script_status "$dep"; then
            log_message "ERROR" "Dependencia no satisfecha: $dep para $script"
            return 1
        fi
    done
    
    return 0
}

# Verificar estado de un script
check_script_status() {
    local script="$1"
    local status_file="$MANAGER_DIR/status/${script}.status"
    
    if [ -f "$status_file" ] && [ "$(cat "$status_file")" = "success" ]; then
        return 0
    fi
    return 1
}

# Actualizar estado de script
update_script_status() {
    local script="$1"
    local status="$2"
    local status_dir="$MANAGER_DIR/status"
    
    mkdir -p "$status_dir"
    echo "$status" > "$status_dir/${script}.status"
}

# Ejecutar script individual
execute_script() {
    local key="$1"
    local script="${SCRIPTS[$key]}"
    local script_path="/app/scripts/$script"
    
    log_message "INFO" "Ejecutando $script..."
    
    # Verificar existencia del script
    if [ ! -f "$script_path" ]; then
        log_message "ERROR" "Script no encontrado: $script_path"
        return 1
    fi
    
    # Verificar permisos
    if [ ! -x "$script_path" ]; then
        log_message "ERROR" "Script no ejecutable: $script_path"
        return 1
    }
    
    # Verificar dependencias
    if ! check_dependencies "$key"; then
        log_message "ERROR" "Dependencias no satisfechas para $script"
        return 1
    }
    
    # Ejecutar script con timeout
    if timeout 1800 bash "$script_path"; then
        log_message "SUCCESS" "$script ejecutado correctamente"
        update_script_status "$key" "success"
        return 0
    else
        local exit_code=$?
        log_message "ERROR" "$script falló con código $exit_code"
        update_script_status "$key" "failed"
        return $exit_code
    fi
}

# Limpiar estados antiguos
clean_old_states() {
    log_message "INFO" "Limpiando estados antiguos..."
    
    # Limpiar directorio de estados
    rm -rf "$MANAGER_DIR/status"
    mkdir -p "$MANAGER_DIR/status"
    
    # Limpiar logs antiguos (>30 días)
    find "$LOG_DIR" -type f -name "*.log" -mtime +30 -delete
}

# Generar reporte de ejecución
generate_report() {
    local report_file="$LOG_DIR/report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Mantenimiento</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Mantenimiento</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Estado de Scripts</h2>
    <table>
        <tr>
            <th>Script</th>
            <th>Estado</th>
            <th>Dependencias</th>
        </tr>
EOF

    # Añadir estado de cada script
    for order in "${!EXECUTION_ORDER[@]}"; do
        local key="${EXECUTION_ORDER[$order]}"
        local script="${SCRIPTS[$key]}"
        local deps="${DEPENDENCIES[$key]:-Ninguna}"
        local status_file="$MANAGER_DIR/status/${key}.status"
        local status="$([ -f "$status_file" ] && cat "$status_file" || echo "no ejecutado")"
        local status_class="$([ "$status" = "success" ] && echo "success" || echo "error")"
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$script</td>
            <td class="$status_class">$status</td>
            <td>$deps</td>
        </tr>
EOF
    done

    cat >> "$report_file" << EOF
    </table>
    
    <h2>Logs Recientes</h2>
    <pre>
$(tail -n 50 "$LOG_DIR/manager_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Notificar resultado
notify_result() {
    local total_scripts=${#SCRIPTS[@]}
    local successful=0
    
    # Contar scripts exitosos
    for key in "${!SCRIPTS[@]}"; do
        if check_script_status "$key"; then
            ((successful++))
        fi
    done
    
    # Enviar email con reporte
    if [ "$successful" -lt "$total_scripts" ]; then
        mail -s "Mantenimiento del Sistema: $successful/$total_scripts exitosos" \
             -a "$LOG_DIR/report_${TIMESTAMP}.html" \
             "admin@mascletimperi.com" << EOF
Se ha completado el mantenimiento del sistema con $successful scripts exitosos de $total_scripts.
Por favor, revise el reporte adjunto para más detalles.
EOF
    fi
}

# Función principal
main() {
    log_message "INFO" "Iniciando gestión de mantenimiento..."
    
    # Crear directorios necesarios
    mkdir -p "$MANAGER_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Limpiar estados anteriores
    clean_old_states
    
    # Ejecutar scripts en orden
    local failed=0
    for order in $(seq 1 ${#EXECUTION_ORDER[@]}); do
        local key="${EXECUTION_ORDER[$order]}"
        
        execute_script "$key" || {
            log_message "ERROR" "Fallo en script ${SCRIPTS[$key]}"
            ((failed++))
            
            # Si es un script crítico, abortar
            if [[ "$key" =~ ^(init|setup)$ ]]; then
                log_message "CRITICAL" "Fallo en script crítico, abortando..."
                generate_report
                notify_result
                return 1
            fi
        }
    done
    
    # Generar reporte
    generate_report
    
    # Notificar resultado
    notify_result
    
    # Retornar estado
    return $((failed > 0))
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