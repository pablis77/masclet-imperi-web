#!/bin/bash
# Script para configurar tareas programadas
# Ubicación: backend/docker/scripts/setup_cron.sh

set -e

# Configuración
CRON_DIR="/app/cron"
LOG_DIR="/logs/cron"
CONFIG_DIR="/app/config/cron"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tareas programadas
declare -A CRON_JOBS=(
    ["backup_db"]="0 2 * * * /app/scripts/backup.sh > /logs/cron/backup_\$(date +\%Y\%m\%d).log 2>&1"
    ["cleanup"]="0 3 * * * /app/scripts/cleanup.sh > /logs/cron/cleanup_\$(date +\%Y\%m\%d).log 2>&1"
    ["monitor"]="*/5 * * * * /app/scripts/monitor.sh > /logs/cron/monitor_\$(date +\%Y\%m\%d).log 2>&1"
    ["network"]="*/15 * * * * /app/scripts/network_check.sh > /logs/cron/network_\$(date +\%Y\%m\%d).log 2>&1"
    ["vacuum_db"]="0 1 * * 0 /app/scripts/vacuum_db.sh > /logs/cron/vacuum_\$(date +\%Y\%m\%d).log 2>&1"
)

# Permisos necesarios
declare -A REQUIRED_DIRS=(
    ["/app/scripts"]="755"
    ["/logs/cron"]="775"
    ["/var/spool/cron"]="755"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/cron_setup_${TIMESTAMP}.log"
}

# Verificar requisitos
check_requirements() {
    log_message "INFO" "Verificando requisitos..."
    
    # Verificar cron está instalado
    if ! command -v crontab >/dev/null; then
        log_message "ERROR" "cron no está instalado"
        return 1
    fi
    
    # Verificar directorios necesarios
    for dir in "${!REQUIRED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
        fi
        chmod "${REQUIRED_DIRS[$dir]}" "$dir"
    done
    
    # Verificar scripts existen y son ejecutables
    for job in "${!CRON_JOBS[@]}"; do
        local script_path
        script_path=$(echo "${CRON_JOBS[$job]}" | awk '{print $6}' | cut -d'>' -f1)
        if [ ! -x "$script_path" ]; then
            log_message "ERROR" "Script no encontrado o no ejecutable: $script_path"
            return 1
        fi
    done
    
    return 0
}

# Configurar tareas cron
setup_cron_jobs() {
    log_message "INFO" "Configurando tareas cron..."
    
    # Crear archivo temporal
    local temp_cron
    temp_cron=$(mktemp)
    
    # Configuración del entorno
    cat > "$temp_cron" << 'EOF'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=admin@mascletimperi.com

# Masclet Imperi - Tareas Programadas
EOF
    
    # Añadir cada tarea
    for job in "${!CRON_JOBS[@]}"; do
        echo "# $job" >> "$temp_cron"
        echo "${CRON_JOBS[$job]}" >> "$temp_cron"
        echo "" >> "$temp_cron"
    done
    
    # Instalar nuevo crontab
    crontab "$temp_cron"
    rm "$temp_cron"
    
    # Reiniciar servicio cron
    systemctl restart cron
}

# Configurar rotación de logs
setup_log_rotation() {
    log_message "INFO" "Configurando rotación de logs..."
    
    cat > "/etc/logrotate.d/masclet-cron" << EOF
/logs/cron/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        systemctl restart cron
    endscript
}
EOF
}

# Configurar monitorización
setup_monitoring() {
    log_message "INFO" "Configurando monitorización de cron..."
    
    cat > "/app/scripts/check_cron.sh" << 'EOF'
#!/bin/bash
# Verifica estado de las tareas cron

# Verificar servicio cron
if ! systemctl is-active --quiet cron; then
    echo "ERROR: Servicio cron no está activo"
    exit 1
fi

# Verificar últimas ejecuciones
for log in /logs/cron/*.log; do
    if [ -f "$log" ]; then
        if grep -q "ERROR\|FAIL" "$log"; then
            echo "WARNING: Encontrados errores en $log"
        fi
    fi
done

# Verificar permisos
crontab -l > /dev/null || {
    echo "ERROR: No se puede leer crontab"
    exit 1
}
EOF
    
    chmod +x "/app/scripts/check_cron.sh"
}

# Generar documentación
generate_documentation() {
    local docs_dir="$CONFIG_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/cron_jobs.md" << EOF
# Tareas Programadas

## Configuración General
- Shell: /bin/bash
- Path: /usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
- Email: admin@mascletimperi.com

## Tareas Configuradas
$(for job in "${!CRON_JOBS[@]}"; do
    echo "### $job"
    echo "\`\`\`"
    echo "${CRON_JOBS[$job]}"
    echo "\`\`\`"
    echo
done)

## Rotación de Logs
- Frecuencia: Diaria
- Retención: 7 días
- Compresión: Sí
- Ubicación: /logs/cron/

## Monitorización
- Script: /app/scripts/check_cron.sh
- Verifica:
  * Estado del servicio
  * Errores en logs
  * Permisos de crontab

## Mantenimiento
Para modificar las tareas:
\`\`\`bash
crontab -e                    # Editar crontab
crontab -l                    # Listar tareas
systemctl restart cron        # Reiniciar servicio
\`\`\`
EOF
}

# Verificar tareas
verify_cron_setup() {
    log_message "INFO" "Verificando configuración..."
    local issues=0
    
    # Verificar crontab instalado
    if ! crontab -l >/dev/null 2>&1; then
        log_message "ERROR" "Crontab no instalado correctamente"
        ((issues++))
    fi
    
    # Verificar cada tarea
    for job in "${!CRON_JOBS[@]}"; do
        if ! crontab -l | grep -q "${CRON_JOBS[$job]}"; then
            log_message "ERROR" "Tarea no encontrada: $job"
            ((issues++))
        fi
    done
    
    # Verificar permisos de logs
    if [ ! -w "$LOG_DIR" ]; then
        log_message "ERROR" "No se puede escribir en $LOG_DIR"
        ((issues++))
    fi
    
    return $issues
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración de cron..."
    
    # Crear directorios necesarios
    mkdir -p "$CRON_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Verificar requisitos
    check_requirements || {
        log_message "ERROR" "No se cumplen los requisitos"
        return 1
    }
    
    # Configurar componentes
    setup_cron_jobs
    setup_log_rotation
    setup_monitoring
    
    # Generar documentación
    generate_documentation
    
    # Verificar configuración
    verify_cron_setup
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        log_message "SUCCESS" "Configuración de cron completada"
    else
        log_message "ERROR" "Se encontraron $verify_status problemas"
        return 1
    fi
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