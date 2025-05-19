#!/bin/bash
# Script para gestión de alertas del sistema
# Ubicación: backend/docker/scripts/alert_manager.sh

set -e

# Configuración
ALERT_DIR="/app/alerts"
LOG_DIR="/logs/alerts"
CONFIG_DIR="/app/config/alerts"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Niveles de alerta
declare -A ALERT_LEVELS=(
    ["critical"]="Requiere atención inmediata"
    ["warning"]="Requiere revisión"
    ["info"]="Informativo"
)

# Umbrales de alerta
declare -A THRESHOLDS=(
    ["cpu_usage"]="85"        # % CPU
    ["memory_usage"]="90"     # % RAM
    ["disk_usage"]="90"       # % Disco
    ["connections"]="1000"    # Conexiones activas
    ["error_rate"]="5"        # % Errores
    ["response_time"]="2000"  # ms
)

# Canales de notificación
declare -A NOTIFY_CHANNELS=(
    ["email"]="admin@mascletimperi.com"
    ["telegram"]="bot_token:chat_id"
    ["slack"]="webhook_url"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/alerts_${TIMESTAMP}.log"
}

# Evaluar métricas del sistema
check_system_metrics() {
    log_message "INFO" "Evaluando métricas del sistema..."
    local alerts=0
    
    # CPU
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    if [ "$cpu_usage" -gt "${THRESHOLDS[cpu_usage]}" ]; then
        trigger_alert "critical" "Alto uso de CPU: $cpu_usage%"
        ((alerts++))
    fi
    
    # Memoria
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt "${THRESHOLDS[memory_usage]}" ]; then
        trigger_alert "critical" "Alto uso de memoria: $mem_usage%"
        ((alerts++))
    fi
    
    # Disco
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$disk_usage" -gt "${THRESHOLDS[disk_usage]}" ]; then
        trigger_alert "warning" "Alto uso de disco: $disk_usage%"
        ((alerts++))
    fi
    
    return $alerts
}

# Evaluar métricas de aplicación
check_app_metrics() {
    log_message "INFO" "Evaluando métricas de aplicación..."
    local alerts=0
    
    # Errores en logs
    local error_count
    error_count=$(grep -c "ERROR" "/logs/app/app.log" --max-count=100)
    local error_rate=$((error_count * 100 / 100))
    if [ "$error_rate" -gt "${THRESHOLDS[error_rate]}" ]; then
        trigger_alert "warning" "Alta tasa de errores: $error_rate%"
        ((alerts++))
    fi
    
    # Tiempo de respuesta API
    local response_time
    response_time=$(curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8000/api/health)
    response_time=$(echo "$response_time * 1000" | bc | cut -d. -f1)
    if [ "$response_time" -gt "${THRESHOLDS[response_time]}" ]; then
        trigger_alert "warning" "Tiempo de respuesta alto: ${response_time}ms"
        ((alerts++))
    fi
    
    # Conexiones activas
    local connections
    connections=$(netstat -an | grep ESTABLISHED | wc -l)
    if [ "$connections" -gt "${THRESHOLDS[connections]}" ]; then
        trigger_alert "warning" "Demasiadas conexiones: $connections"
        ((alerts++))
    fi
    
    return $alerts
}

# Evaluar métricas de base de datos
check_db_metrics() {
    log_message "INFO" "Evaluando métricas de base de datos..."
    local alerts=0
    
    # Conexión
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        trigger_alert "critical" "Base de datos no disponible"
        return 1
    fi
    
    # Conexiones activas
    local active_connections
    active_connections=$(psql -t -c "SELECT count(*) FROM pg_stat_activity" | tr -d ' ')
    if [ "$active_connections" -gt "${THRESHOLDS[connections]}" ]; then
        trigger_alert "warning" "Demasiadas conexiones DB: $active_connections"
        ((alerts++))
    fi
    
    # Espacio en tablas
    local table_size
    table_size=$(psql -t -c "SELECT pg_size_pretty(pg_database_size('masclet_imperi'))")
    if [[ "$table_size" == *"GB"* ]]; then
        trigger_alert "warning" "Base de datos grande: $table_size"
        ((alerts++))
    fi
    
    return $alerts
}

# Disparar alerta
trigger_alert() {
    local level="$1"
    local message="$2"
    local alert_id="${TIMESTAMP}_${level}"
    
    # Registrar alerta
    log_message "$level" "$message"
    
    # Crear archivo de alerta
    cat > "$ALERT_DIR/active/${alert_id}.alert" << EOF
{
    "id": "$alert_id",
    "level": "$level",
    "message": "$message",
    "timestamp": "$(date +'%Y-%m-%d %H:%M:%S')",
    "status": "active"
}
EOF
    
    # Notificar según nivel
    case "$level" in
        "critical")
            notify_all_channels "$level" "$message"
            ;;
        "warning")
            notify_email "$message"
            ;;
        "info")
            # Solo log
            ;;
    esac
}

# Notificar por email
notify_email() {
    local message="$1"
    if [ -n "${NOTIFY_CHANNELS[email]}" ]; then
        echo "$message" | mail -s "Alerta Masclet: $message" "${NOTIFY_CHANNELS[email]}"
    fi
}

# Notificar por Telegram
notify_telegram() {
    local message="$1"
    if [ -n "${NOTIFY_CHANNELS[telegram]}" ]; then
        IFS=: read -r bot_token chat_id <<< "${NOTIFY_CHANNELS[telegram]}"
        curl -s "https://api.telegram.org/bot$bot_token/sendMessage" \
            -d "chat_id=$chat_id" \
            -d "text=Alerta Masclet: $message"
    fi
}

# Notificar por Slack
notify_slack() {
    local message="$1"
    if [ -n "${NOTIFY_CHANNELS[slack]}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Alerta Masclet: $message\"}" \
            "${NOTIFY_CHANNELS[slack]}"
    fi
}

# Notificar por todos los canales
notify_all_channels() {
    local level="$1"
    local message="$2"
    
    notify_email "$message"
    notify_telegram "$message"
    notify_slack "$message"
}

# Limpiar alertas antiguas
cleanup_old_alerts() {
    log_message "INFO" "Limpiando alertas antiguas..."
    
    # Mover alertas resueltas a histórico
    find "$ALERT_DIR/active" -name "*.alert" -mtime +7 -exec mv {} "$ALERT_DIR/history/" \;
    
    # Comprimir alertas antiguas
    find "$ALERT_DIR/history" -name "*.alert" -mtime +30 -exec gzip {} \;
    
    # Eliminar muy antiguas
    find "$ALERT_DIR/history" -name "*.alert.gz" -mtime +90 -delete
}

# Generar reporte de alertas
generate_alert_report() {
    local report_file="$LOG_DIR/alert_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Alertas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .critical { color: red; }
        .warning { color: orange; }
        .info { color: blue; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Alertas</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Alertas Activas</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nivel</th>
            <th>Mensaje</th>
            <th>Timestamp</th>
        </tr>
EOF

    # Añadir alertas activas
    for alert in "$ALERT_DIR/active"/*.alert; do
        if [ -f "$alert" ]; then
            local id level message timestamp
            id=$(jq -r '.id' "$alert")
            level=$(jq -r '.level' "$alert")
            message=$(jq -r '.message' "$alert")
            timestamp=$(jq -r '.timestamp' "$alert")
            
            cat >> "$report_file" << EOF
        <tr class="$level">
            <td>$id</td>
            <td>$level</td>
            <td>$message</td>
            <td>$timestamp</td>
        </tr>
EOF
        fi
    done

    cat >> "$report_file" << EOF
    </table>
    
    <h2>Métricas Actuales</h2>
    <table>
        <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Umbral</th>
        </tr>
        <tr>
            <td>CPU</td>
            <td>$cpu_usage%</td>
            <td>${THRESHOLDS[cpu_usage]}%</td>
        </tr>
        <tr>
            <td>Memoria</td>
            <td>$mem_usage%</td>
            <td>${THRESHOLDS[memory_usage]}%</td>
        </tr>
        <tr>
            <td>Disco</td>
            <td>$disk_usage%</td>
            <td>${THRESHOLDS[disk_usage]}%</td>
        </tr>
    </table>
    
    <h2>Log de Alertas</h2>
    <pre>
$(tail -n 50 "$LOG_DIR/alerts_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando gestión de alertas..."
    
    # Crear directorios necesarios
    mkdir -p "$ALERT_DIR/active" "$ALERT_DIR/history" "$LOG_DIR"
    
    # Verificar métricas
    local total_alerts=0
    
    check_system_metrics
    ((total_alerts+=$?))
    
    check_app_metrics
    ((total_alerts+=$?))
    
    check_db_metrics
    ((total_alerts+=$?))
    
    # Limpiar alertas antiguas
    cleanup_old_alerts
    
    # Generar reporte
    generate_alert_report
    
    if [ $total_alerts -gt 0 ]; then
        log_message "WARNING" "Se encontraron $total_alerts alertas"
        return 1
    fi
    
    log_message "SUCCESS" "Verificación de alertas completada"
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