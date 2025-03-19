#!/bin/bash
# Script para gestión de métricas del sistema
# Ubicación: backend/docker/scripts/metrics_manager.sh

set -e

# Configuración
METRICS_DIR="/app/metrics"
LOG_DIR="/logs/metrics"
REPORTS_DIR="/app/reports/metrics"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tipos de métricas
declare -A METRIC_TYPES=(
    ["system"]="Sistema"
    ["api"]="API"
    ["db"]="Base de datos"
    ["app"]="Aplicación"
    ["user"]="Usuarios"
    ["import"]="Importación"
)

# Thresholds de alertas
declare -A ALERT_THRESHOLDS=(
    ["cpu_usage"]="80"            # % uso CPU
    ["memory_usage"]="85"         # % uso memoria
    ["disk_usage"]="90"           # % uso disco
    ["response_time"]="2000"      # ms tiempo respuesta
    ["error_rate"]="5"           # % tasa de errores
    ["active_users"]="100"        # usuarios concurrentes
    ["db_connections"]="80"       # % conexiones DB
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/metrics_${TIMESTAMP}.log"
}

# Recolectar métricas del sistema
collect_system_metrics() {
    log_message "INFO" "Recolectando métricas del sistema..."
    local output="$METRICS_DIR/system_${TIMESTAMP}.json"
    
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\","
        echo "  \"metrics\": {"
        
        # CPU
        echo "    \"cpu\": {"
        echo "      \"usage\": $(top -bn1 | grep "Cpu(s)" | awk '{print $2}'),"
        echo "      \"load\": $(uptime | awk '{print $(NF-2)}' | tr ',' ' ')"
        echo "    },"
        
        # Memoria
        echo "    \"memory\": {"
        echo "      \"total\": $(free -m | awk '/Mem:/ {print $2}'),"
        echo "      \"used\": $(free -m | awk '/Mem:/ {print $3}'),"
        echo "      \"free\": $(free -m | awk '/Mem:/ {print $4}')"
        echo "    },"
        
        # Disco
        echo "    \"disk\": {"
        echo "      \"total\": $(df -m / | awk 'NR==2 {print $2}'),"
        echo "      \"used\": $(df -m / | awk 'NR==2 {print $3}'),"
        echo "      \"free\": $(df -m / | awk 'NR==2 {print $4}')"
        echo "    }"
        
        echo "  }"
        echo "}"
    } > "$output"
    
    return 0
}

# Recolectar métricas de la API
collect_api_metrics() {
    log_message "INFO" "Recolectando métricas de la API..."
    local output="$METRICS_DIR/api_${TIMESTAMP}.json"
    
    # Obtener métricas de nginx
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\","
        echo "  \"metrics\": {"
        echo "    \"requests\": {"
        echo "      \"total\": $(grep -c "HTTP" /var/log/nginx/access.log),"
        echo "      \"success\": $(grep -c "HTTP/1.1\" 2" /var/log/nginx/access.log),"
        echo "      \"error\": $(grep -c "HTTP/1.1\" [45]" /var/log/nginx/access.log)"
        echo "    },"
        echo "    \"response_time\": {"
        echo "      \"avg\": $(awk '{sum+=$NF; count++} END {print sum/count}' /var/log/nginx/access.log),"
        echo "      \"max\": $(awk '{if($NF>max){max=$NF}}END{print max}' /var/log/nginx/access.log),"
        echo "      \"min\": $(awk '{if(min==""){min=$NF}; if($NF<min) {min=$NF}} END {print min}' /var/log/nginx/access.log)"
        echo "    }"
        echo "  }"
        echo "}"
    } > "$output"
    
    return 0
}

# Recolectar métricas de la base de datos
collect_db_metrics() {
    log_message "INFO" "Recolectando métricas de la base de datos..."
    local output="$METRICS_DIR/db_${TIMESTAMP}.json"
    
    # Consultas a PostgreSQL
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\","
        echo "  \"metrics\": {"
        
        # Conexiones
        echo "    \"connections\": {"
        echo "      \"active\": $(psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"),"
        echo "      \"idle\": $(psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';"),"
        echo "      \"total\": $(psql -t -c "SELECT count(*) FROM pg_stat_activity;")"
        echo "    },"
        
        # Estadísticas de tablas
        echo "    \"tables\": {"
        echo "      \"rows\": $(psql -t -c "SELECT sum(n_live_tup) FROM pg_stat_user_tables;"),"
        echo "      \"dead_tuples\": $(psql -t -c "SELECT sum(n_dead_tup) FROM pg_stat_user_tables;")"
        echo "    },"
        
        # Caché
        echo "    \"cache\": {"
        echo "      \"hit_ratio\": $(psql -t -c "SELECT round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) FROM pg_statio_user_tables;")"
        echo "    }"
        
        echo "  }"
        echo "}"
    } > "$output"
    
    return 0
}

# Verificar thresholds y generar alertas
check_thresholds() {
    log_message "INFO" "Verificando thresholds..."
    local alerts=()
    
    # Verificar CPU
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    if [ "$cpu_usage" -gt "${ALERT_THRESHOLDS[cpu_usage]}" ]; then
        alerts+=("CPU usage above threshold: ${cpu_usage}%")
    fi
    
    # Verificar memoria
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt "${ALERT_THRESHOLDS[memory_usage]}" ]; then
        alerts+=("Memory usage above threshold: ${mem_usage}%")
    fi
    
    # Verificar disco
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print int($5)}' | tr -d '%')
    if [ "$disk_usage" -gt "${ALERT_THRESHOLDS[disk_usage]}" ]; then
        alerts+=("Disk usage above threshold: ${disk_usage}%")
    fi
    
    # Si hay alertas, enviarlas
    if [ ${#alerts[@]} -gt 0 ]; then
        for alert in "${alerts[@]}"; do
            log_message "WARNING" "$alert"
        done
    fi
    
    return 0
}

# Generar reporte de métricas
generate_metrics_report() {
    local report_file="$REPORTS_DIR/metrics_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de métricas..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Métricas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .warning { color: orange; }
        .error { color: red; }
        .success { color: green; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Reporte de Métricas del Sistema</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen del Sistema</h2>
    <table>
        <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Threshold</th>
            <th>Estado</th>
        </tr>
EOF
    
    # Añadir métricas del sistema
    for metric in "${!ALERT_THRESHOLDS[@]}"; do
        local current_value
        local threshold="${ALERT_THRESHOLDS[$metric]}"
        local status_class="success"
        local status_text="OK"
        
        case "$metric" in
            "cpu_usage")
                current_value=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
                ;;
            "memory_usage")
                current_value=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
                ;;
            "disk_usage")
                current_value=$(df / | awk 'NR==2 {print int($5)}' | tr -d '%')
                ;;
            *)
                current_value="N/A"
                ;;
        esac
        
        if [ "$current_value" != "N/A" ] && [ "$current_value" -gt "$threshold" ]; then
            status_class="error"
            status_text="ALERTA"
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$metric</td>
            <td>$current_value</td>
            <td>$threshold</td>
            <td class="$status_class">$status_text</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Historial de Métricas</h2>
    <div class="chart">
        <!-- Aquí se podría añadir un gráfico con JavaScript -->
    </div>
    
    <h2>Log de Alertas</h2>
    <pre>
$(grep "WARNING\|ERROR" "$LOG_DIR/metrics_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local type="${2:-all}"
    
    # Crear directorios necesarios
    mkdir -p "$METRICS_DIR" "$LOG_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "collect")
            if [ "$type" = "all" ]; then
                collect_system_metrics
                collect_api_metrics
                collect_db_metrics
            else
                "collect_${type}_metrics"
            fi
            ;;
        
        "check")
            check_thresholds
            ;;
        
        "report")
            collect_system_metrics
            collect_api_metrics
            collect_db_metrics
            check_thresholds
            generate_metrics_report
            ;;
        
        *)
            echo "Uso: $0 {collect|check|report} [tipo]"
            return 1
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