#!/bin/bash
# Script para monitorización del sistema
# Ubicación: backend/docker/scripts/monitor.sh

set -e

# Configuración
MONITOR_DIR="/app/monitor"
LOG_DIR="/logs/monitor"
CONFIG_DIR="/app/config/monitor"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Umbrales del sistema
declare -A THRESHOLDS=(
    ["cpu_critical"]="90"        # % CPU crítico
    ["cpu_warning"]="80"         # % CPU warning
    ["mem_critical"]="90"        # % RAM crítico
    ["mem_warning"]="80"         # % RAM warning
    ["disk_critical"]="90"       # % Disco crítico
    ["disk_warning"]="80"        # % Disco warning
    ["load_critical"]="10"       # Load average crítico
    ["load_warning"]="5"         # Load average warning
    ["procs_max"]="1000"        # Máximo procesos
    ["fd_max"]="10000"          # Máximo file descriptors
)

# Métricas a monitorizar
declare -A METRICS=(
    ["system"]="cpu,memory,disk,load"
    ["network"]="connections,bandwidth,latency"
    ["process"]="count,threads,handles"
    ["api"]="response_time,error_rate,requests"
    ["db"]="connections,queries,locks"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/monitor_${TIMESTAMP}.log"
}

# Monitorizar CPU
monitor_cpu() {
    log_message "INFO" "Monitorizando CPU..."
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    
    if [ "$cpu_usage" -gt "${THRESHOLDS[cpu_critical]}" ]; then
        log_message "CRITICAL" "CPU usage critical: $cpu_usage%"
        return 2
    elif [ "$cpu_usage" -gt "${THRESHOLDS[cpu_warning]}" ]; then
        log_message "WARNING" "CPU usage high: $cpu_usage%"
        return 1
    fi
    
    echo "$cpu_usage"
    return 0
}

# Monitorizar memoria
monitor_memory() {
    log_message "INFO" "Monitorizando memoria..."
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ "$mem_usage" -gt "${THRESHOLDS[mem_critical]}" ]; then
        log_message "CRITICAL" "Memory usage critical: $mem_usage%"
        return 2
    elif [ "$mem_usage" -gt "${THRESHOLDS[mem_warning]}" ]; then
        log_message "WARNING" "Memory usage high: $mem_usage%"
        return 1
    fi
    
    echo "$mem_usage"
    return 0
}

# Monitorizar disco
monitor_disk() {
    log_message "INFO" "Monitorizando disco..."
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [ "$disk_usage" -gt "${THRESHOLDS[disk_critical]}" ]; then
        log_message "CRITICAL" "Disk usage critical: $disk_usage%"
        return 2
    elif [ "$disk_usage" -gt "${THRESHOLDS[disk_warning]}" ]; then
        log_message "WARNING" "Disk usage high: $disk_usage%"
        return 1
    fi
    
    echo "$disk_usage"
    return 0
}

# Monitorizar carga del sistema
monitor_load() {
    log_message "INFO" "Monitorizando carga del sistema..."
    local load_avg
    load_avg=$(uptime | awk -F'load average: ' '{print $2}' | cut -d, -f1)
    
    if [ "$(echo "$load_avg > ${THRESHOLDS[load_critical]}" | bc)" -eq 1 ]; then
        log_message "CRITICAL" "Load average critical: $load_avg"
        return 2
    elif [ "$(echo "$load_avg > ${THRESHOLDS[load_warning]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "Load average high: $load_avg"
        return 1
    fi
    
    echo "$load_avg"
    return 0
}

# Monitorizar red
monitor_network() {
    log_message "INFO" "Monitorizando red..."
    local issues=0
    
    # Conexiones activas
    local connections
    connections=$(netstat -ant | grep ESTABLISHED | wc -l)
    echo "Active connections: $connections"
    
    # Latencia
    local latency
    latency=$(ping -c 1 8.8.8.8 | grep time= | cut -d= -f4)
    echo "Network latency: $latency"
    
    # Ancho de banda (requiere iperf3)
    if command -v iperf3 >/dev/null; then
        local bandwidth
        bandwidth=$(iperf3 -c iperf.he.net -t 1 -J | grep bits_per_second | head -1 | awk '{print $2}')
        echo "Bandwidth: $bandwidth bits/s"
    fi
    
    return "$issues"
}

# Monitorizar procesos
monitor_processes() {
    log_message "INFO" "Monitorizando procesos..."
    local issues=0
    
    # Total procesos
    local process_count
    process_count=$(ps aux | wc -l)
    if [ "$process_count" -gt "${THRESHOLDS[procs_max]}" ]; then
        log_message "WARNING" "Too many processes: $process_count"
        ((issues++))
    fi
    
    # File descriptors
    local fd_count
    fd_count=$(lsof | wc -l)
    if [ "$fd_count" -gt "${THRESHOLDS[fd_max]}" ]; then
        log_message "WARNING" "Too many file descriptors: $fd_count"
        ((issues++))
    fi
    
    return "$issues"
}

# Monitorizar base de datos
monitor_database() {
    log_message "INFO" "Monitorizando base de datos..."
    local issues=0
    
    # Verificar conexión
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        log_message "CRITICAL" "Database connection failed"
        return 1
    fi
    
    # Conexiones activas
    local db_connections
    db_connections=$(psql -t -c "SELECT count(*) FROM pg_stat_activity")
    echo "DB connections: $db_connections"
    
    # Bloqueos
    local locks
    locks=$(psql -t -c "SELECT count(*) FROM pg_locks l JOIN pg_stat_activity a ON l.pid = a.pid")
    echo "DB locks: $locks"
    
    return "$issues"
}

# Monitorizar API
monitor_api() {
    log_message "INFO" "Monitorizando API..."
    local issues=0
    
    # Tiempo de respuesta
    local response_time
    response_time=$(curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8000/api/health)
    echo "API response time: ${response_time}s"
    
    # Errores recientes
    local error_count
    error_count=$(grep -c "ERROR" "/logs/api/api.log" --max-count=100)
    echo "Recent API errors: $error_count"
    
    return "$issues"
}

# Generar reporte de monitorización
generate_monitor_report() {
    local report_file="$LOG_DIR/monitor_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>System Monitoring Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .critical { color: red; font-weight: bold; }
        .warning { color: orange; }
        .ok { color: green; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>System Monitoring Report</h1>
    <p>Generated: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>System Metrics</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>CPU Usage</td>
            <td>$cpu_usage%</td>
            <td class="$([ "$cpu_usage" -gt "${THRESHOLDS[cpu_critical]}" ] && echo 'critical' || echo 'ok')">
                $([ "$cpu_usage" -gt "${THRESHOLDS[cpu_critical]}" ] && echo 'CRITICAL' || echo 'OK')
            </td>
        </tr>
        <tr>
            <td>Memory Usage</td>
            <td>$mem_usage%</td>
            <td class="$([ "$mem_usage" -gt "${THRESHOLDS[mem_critical]}" ] && echo 'critical' || echo 'ok')">
                $([ "$mem_usage" -gt "${THRESHOLDS[mem_critical]}" ] && echo 'CRITICAL' || echo 'OK')
            </td>
        </tr>
        <tr>
            <td>Disk Usage</td>
            <td>$disk_usage%</td>
            <td class="$([ "$disk_usage" -gt "${THRESHOLDS[disk_critical]}" ] && echo 'critical' || echo 'ok')">
                $([ "$disk_usage" -gt "${THRESHOLDS[disk_critical]}" ] && echo 'CRITICAL' || echo 'OK')
            </td>
        </tr>
        <tr>
            <td>Load Average</td>
            <td>$load_avg</td>
            <td class="$([ "$(echo "$load_avg > ${THRESHOLDS[load_critical]}" | bc)" -eq 1 ] && echo 'critical' || echo 'ok')">
                $([ "$(echo "$load_avg > ${THRESHOLDS[load_critical]}" | bc)" -eq 1 ] && echo 'CRITICAL' || echo 'OK')
            </td>
        </tr>
    </table>
    
    <h2>Network Status</h2>
    <pre>
$(monitor_network)
    </pre>
    
    <h2>Database Status</h2>
    <pre>
$(monitor_database)
    </pre>
    
    <h2>API Status</h2>
    <pre>
$(monitor_api)
    </pre>
    
    <h2>Recent Alerts</h2>
    <pre>
$(tail -n 20 "$LOG_DIR/monitor_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando monitorización del sistema..."
    
    # Crear directorios necesarios
    mkdir -p "$MONITOR_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Ejecutar monitorización
    cpu_usage=$(monitor_cpu)
    mem_usage=$(monitor_memory)
    disk_usage=$(monitor_disk)
    load_avg=$(monitor_load)
    
    monitor_network
    monitor_processes
    monitor_database
    monitor_api
    
    # Generar reporte
    generate_monitor_report
    
    log_message "SUCCESS" "Monitorización completada"
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