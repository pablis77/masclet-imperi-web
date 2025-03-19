#!/bin/bash
# Script para verificar estado del sistema
# Ubicación: backend/docker/scripts/check_system.sh

set -e

# Configuración
CHECK_DIR="/app/checks"
LOG_DIR="/logs/checks"
CONFIG_DIR="/app/config/checks"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Componentes a verificar
declare -A COMPONENTS=(
    ["os"]="Sistema operativo"
    ["db"]="Base de datos"
    ["api"]="API REST"
    ["redis"]="Cache Redis"
    ["network"]="Conectividad"
    ["storage"]="Almacenamiento"
)

# Umbrales de alerta
declare -A THRESHOLDS=(
    ["cpu_usage"]="80"
    ["memory_usage"]="85"
    ["disk_usage"]="90"
    ["swap_usage"]="50"
    ["load_avg"]="4"
    ["db_connections"]="80"
    ["api_response"]="2000"
    ["cache_hit"]="90"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/check_${TIMESTAMP}.log"
}

# Verificar sistema operativo
check_os() {
    log_message "INFO" "Verificando sistema operativo..."
    local issues=0
    
    # CPU
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    if [ "$cpu_usage" -gt "${THRESHOLDS["cpu_usage"]}" ]; then
        log_message "WARNING" "Uso de CPU alto: $cpu_usage%"
        ((issues++))
    fi
    
    # Memoria
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt "${THRESHOLDS["memory_usage"]}" ]; then
        log_message "WARNING" "Uso de memoria alto: $mem_usage%"
        ((issues++))
    fi
    
    # Swap
    local swap_usage
    swap_usage=$(free | grep Swap | awk '{print int($3/$2 * 100)}')
    if [ "$swap_usage" -gt "${THRESHOLDS["swap_usage"]}" ]; then
        log_message "WARNING" "Uso de swap alto: $swap_usage%"
        ((issues++))
    fi
    
    # Load Average
    local load_avg
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | tr -d ' ')
    if [ "$(echo "$load_avg > ${THRESHOLDS["load_avg"]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "Load average alto: $load_avg"
        ((issues++))
    fi
    
    return $issues
}

# Verificar base de datos
check_database() {
    log_message "INFO" "Verificando base de datos..."
    local issues=0
    
    # Conexión
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        log_message "ERROR" "Base de datos no disponible"
        return 1
    fi
    
    # Conexiones activas
    local active_connections
    active_connections=$(psql -t -c "SELECT count(*) FROM pg_stat_activity" | tr -d ' ')
    local max_connections
    max_connections=$(psql -t -c "SHOW max_connections" | tr -d ' ')
    local connection_percentage=$((active_connections * 100 / max_connections))
    
    if [ "$connection_percentage" -gt "${THRESHOLDS["db_connections"]}" ]; then
        log_message "WARNING" "Alto número de conexiones: $connection_percentage%"
        ((issues++))
    fi
    
    # Cache hit ratio
    local cache_ratio
    cache_ratio=$(psql -t -c "SELECT round(100 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))::numeric, 2) FROM pg_statio_user_tables" | tr -d ' ')
    if [ "$(echo "$cache_ratio < ${THRESHOLDS["cache_hit"]}" | bc)" -eq 1 ]; then
        log_message "WARNING" "Cache hit ratio bajo: $cache_ratio%"
        ((issues++))
    fi
    
    return $issues
}

# Verificar API
check_api() {
    log_message "INFO" "Verificando API..."
    local issues=0
    
    # Health check
    local response_time
    response_time=$(curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8000/api/health)
    response_time=$(echo "$response_time * 1000" | bc | cut -d. -f1)  # Convertir a ms
    
    if [ "$response_time" -gt "${THRESHOLDS["api_response"]}" ]; then
        log_message "WARNING" "Tiempo de respuesta alto: ${response_time}ms"
        ((issues++))
    fi
    
    # Error rate últimos 5 minutos
    local error_count
    error_count=$(grep -c "ERROR" "/logs/api/api.log" --max-count=100)
    if [ "$error_count" -gt 5 ]; then
        log_message "WARNING" "Alta tasa de errores: $error_count en últimos 5 minutos"
        ((issues++))
    fi
    
    return $issues
}

# Verificar Redis
check_redis() {
    log_message "INFO" "Verificando Redis..."
    local issues=0
    
    # Conexión
    if ! redis-cli ping >/dev/null 2>&1; then
        log_message "ERROR" "Redis no disponible"
        return 1
    fi
    
    # Memoria
    local used_memory
    used_memory=$(redis-cli info memory | grep "used_memory_human:" | cut -d: -f2 | tr -d '[M,G]')
    if [ "$(echo "$used_memory > 1024" | bc)" -eq 1 ]; then  # >1GB
        log_message "WARNING" "Alto uso de memoria en Redis: ${used_memory}M"
        ((issues++))
    fi
    
    # Hit ratio
    local hits
    hits=$(redis-cli info stats | grep "keyspace_hits:" | cut -d: -f2)
    local misses
    misses=$(redis-cli info stats | grep "keyspace_misses:" | cut -d: -f2)
    local hit_ratio
    hit_ratio=$(echo "scale=2; $hits/($hits+$misses)*100" | bc)
    
    if [ "$(echo "$hit_ratio < 90" | bc)" -eq 1 ]; then
        log_message "WARNING" "Cache hit ratio bajo en Redis: $hit_ratio%"
        ((issues++))
    fi
    
    return $issues
}

# Verificar red
check_network() {
    log_message "INFO" "Verificando red..."
    local issues=0
    
    # Latencia
    local ping_result
    ping_result=$(ping -c 3 8.8.8.8 | tail -1 | awk -F '/' '{print $5}')
    if [ "$(echo "$ping_result > 100" | bc)" -eq 1 ]; then
        log_message "WARNING" "Alta latencia: ${ping_result}ms"
        ((issues++))
    fi
    
    # Pérdida de paquetes
    local packet_loss
    packet_loss=$(ping -c 100 8.8.8.8 | grep "packet loss" | awk -F',' '{print $3}' | awk '{print $1}' | tr -d '%')
    if [ "$packet_loss" -gt 1 ]; then
        log_message "WARNING" "Pérdida de paquetes: $packet_loss%"
        ((issues++))
    fi
    
    # Conexiones establecidas
    local established_conn
    established_conn=$(netstat -an | grep ESTABLISHED | wc -l)
    if [ "$established_conn" -gt 1000 ]; then
        log_message "WARNING" "Alto número de conexiones: $established_conn"
        ((issues++))
    fi
    
    return $issues
}

# Verificar almacenamiento
check_storage() {
    log_message "INFO" "Verificando almacenamiento..."
    local issues=0
    
    # Espacio en disco
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$disk_usage" -gt "${THRESHOLDS["disk_usage"]}" ]; then
        log_message "WARNING" "Alto uso de disco: $disk_usage%"
        ((issues++))
    fi
    
    # Inodos
    local inode_usage
    inode_usage=$(df -i / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$inode_usage" -gt 80 ]; then
        log_message "WARNING" "Alto uso de inodos: $inode_usage%"
        ((issues++))
    fi
    
    # IO Wait
    local io_wait
    io_wait=$(iostat | awk '/^avg-cpu:/ {getline; print $4}')
    if [ "$(echo "$io_wait > 10" | bc)" -eq 1 ]; then
        log_message "WARNING" "Alto IO wait: $io_wait%"
        ((issues++))
    fi
    
    return $issues
}

# Generar reporte HTML
generate_report() {
    local report_file="$LOG_DIR/report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Estado del Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metrics { margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Reporte de Estado del Sistema</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen</h2>
    <table>
        <tr>
            <th>Componente</th>
            <th>Estado</th>
            <th>Detalles</th>
        </tr>
EOF
    
    # Añadir resultados de cada componente
    for component in "${!COMPONENTS[@]}"; do
        local status_file="$CHECK_DIR/status/${component}.status"
        local status="$([ -f "$status_file" ] && cat "$status_file")"
        local class="success"
        [ "$status" != "OK" ] && class="error"
        
        cat >> "$report_file" << EOF
        <tr>
            <td>${COMPONENTS[$component]}</td>
            <td class="$class">$status</td>
            <td>$(tail -1 "$CHECK_DIR/details/${component}.log" 2>/dev/null || echo "No hay detalles")</td>
        </tr>
EOF
    done
    
    # Añadir métricas actuales
    cat >> "$report_file" << EOF
    </table>
    
    <div class="metrics">
        <h2>Métricas Actuales</h2>
        <table>
            <tr>
                <th>Métrica</th>
                <th>Valor</th>
                <th>Umbral</th>
            </tr>
            <tr>
                <td>CPU</td>
                <td>$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%</td>
                <td>${THRESHOLDS["cpu_usage"]}%</td>
            </tr>
            <tr>
                <td>Memoria</td>
                <td>$(free | grep Mem | awk '{print int($3/$2 * 100)}')%</td>
                <td>${THRESHOLDS["memory_usage"]}%</td>
            </tr>
            <tr>
                <td>Disco</td>
                <td>$(df / | awk 'NR==2 {print $5}')</td>
                <td>${THRESHOLDS["disk_usage"]}%</td>
            </tr>
        </table>
    </div>
    
    <h2>Logs Recientes</h2>
    <pre>
$(tail -n 50 "$LOG_DIR/check_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando verificación del sistema..."
    
    # Crear directorios necesarios
    mkdir -p "$CHECK_DIR/status" "$CHECK_DIR/details" "$LOG_DIR"
    
    # Variables para tracking de problemas
    local total_issues=0
    local failed_components=0
    
    # Verificar cada componente
    for component in "${!COMPONENTS[@]}"; do
        local issues=0
        "check_$component" || issues=$?
        
        if [ $issues -eq 0 ]; then
            echo "OK" > "$CHECK_DIR/status/${component}.status"
        else
            echo "ERROR" > "$CHECK_DIR/status/${component}.status"
            ((failed_components++))
        fi
        
        ((total_issues+=issues))
    done
    
    # Generar reporte
    generate_report
    
    # Enviar alertas si hay problemas
    if [ $total_issues -gt 0 ]; then
        log_message "WARNING" "Se encontraron $total_issues problemas en $failed_components componentes"
        # TODO: Implementar sistema de alertas
        return 1
    fi
    
    log_message "SUCCESS" "Verificación completada exitosamente"
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