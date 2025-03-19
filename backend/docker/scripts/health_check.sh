#!/bin/bash
# Script para verificación del estado del sistema
# Ubicación: backend/docker/scripts/health_check.sh

set -e

# Configuración
HEALTH_DIR="/app/health"
LOG_DIR="/logs/health"
REPORTS_DIR="/app/reports/health"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Servicios a verificar
declare -A SERVICES=(
    ["api"]="http://localhost:8000/health"
    ["db"]="postgres://postgres:1234@localhost:5432/masclet_imperi"
    ["nginx"]="http://localhost:80/health"
    ["redis"]="redis://localhost:6379"
)

# Thresholds de salud
declare -A HEALTH_THRESHOLDS=(
    ["response_time"]="2000"      # ms tiempo máximo respuesta
    ["success_rate"]="95"         # % mínimo éxito
    ["uptime"]="99.9"            # % disponibilidad requerida
    ["error_rate"]="5"           # % máximo errores
    ["memory_usage"]="85"         # % máximo uso memoria
    ["cpu_usage"]="80"           # % máximo uso CPU
    ["disk_usage"]="90"          # % máximo uso disco
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/health_${TIMESTAMP}.log"
}

# Verificar servicio HTTP
check_http_service() {
    local name="$1"
    local url="$2"
    log_message "INFO" "Verificando servicio HTTP: $name"
    
    local start_time
    local end_time
    local response_time
    local http_code
    
    start_time=$(date +%s%N)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 )) # Convertir a ms
    
    if [ "$http_code" = "200" ]; then
        if [ "$response_time" -lt "${HEALTH_THRESHOLDS[response_time]}" ]; then
            log_message "SUCCESS" "Servicio $name OK (${response_time}ms)"
            return 0
        else
            log_message "WARNING" "Servicio $name lento (${response_time}ms)"
            return 1
        fi
    else
        log_message "ERROR" "Servicio $name no responde (HTTP $http_code)"
        return 2
    fi
}

# Verificar base de datos
check_database() {
    local name="$1"
    local connection="$2"
    log_message "INFO" "Verificando base de datos: $name"
    
    if ! command -v psql &>/dev/null; then
        log_message "ERROR" "psql no está instalado"
        return 1
    fi
    
    if ! psql "$connection" -c "SELECT 1;" &>/dev/null; then
        log_message "ERROR" "Base de datos no responde"
        return 1
    fi
    
    # Verificar estadísticas
    local locks
    local active_connections
    local dead_tuples
    
    locks=$(psql "$connection" -t -c "SELECT count(*) FROM pg_locks;")
    active_connections=$(psql "$connection" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
    dead_tuples=$(psql "$connection" -t -c "SELECT sum(n_dead_tup) FROM pg_stat_user_tables;")
    
    if [ "$locks" -gt 100 ] || [ "$active_connections" -gt 50 ] || [ "$dead_tuples" -gt 10000 ]; then
        log_message "WARNING" "Base de datos requiere mantenimiento"
        return 1
    fi
    
    log_message "SUCCESS" "Base de datos OK"
    return 0
}

# Verificar Redis
check_redis() {
    local name="$1"
    local url="$2"
    log_message "INFO" "Verificando Redis: $name"
    
    if ! command -v redis-cli &>/dev/null; then
        log_message "ERROR" "redis-cli no está instalado"
        return 1
    fi
    
    if ! redis-cli ping &>/dev/null; then
        log_message "ERROR" "Redis no responde"
        return 1
    fi
    
    # Verificar métricas
    local used_memory
    local connected_clients
    
    used_memory=$(redis-cli info memory | grep "used_memory:" | cut -d: -f2)
    connected_clients=$(redis-cli info clients | grep "connected_clients:" | cut -d: -f2)
    
    if [ "$used_memory" -gt 1073741824 ] || [ "$connected_clients" -gt 1000 ]; then
        log_message "WARNING" "Redis requiere atención"
        return 1
    fi
    
    log_message "SUCCESS" "Redis OK"
    return 0
}

# Verificar sistema
check_system() {
    log_message "INFO" "Verificando estado del sistema..."
    
    # CPU
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1)
    if [ "$cpu_usage" -gt "${HEALTH_THRESHOLDS[cpu_usage]}" ]; then
        log_message "WARNING" "Uso de CPU alto: ${cpu_usage}%"
    fi
    
    # Memoria
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt "${HEALTH_THRESHOLDS[memory_usage]}" ]; then
        log_message "WARNING" "Uso de memoria alto: ${mem_usage}%"
    fi
    
    # Disco
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print int($5)}' | tr -d '%')
    if [ "$disk_usage" -gt "${HEALTH_THRESHOLDS[disk_usage]}" ]; then
        log_message "WARNING" "Uso de disco alto: ${disk_usage}%"
    fi
    
    return 0
}

# Generar reporte de salud
generate_health_report() {
    local report_file="$REPORTS_DIR/health_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de salud..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Estado del Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .warning { color: orange; }
        .error { color: red; }
        .success { color: green; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .metric { margin: 20px 0; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Estado del Sistema</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen de Servicios</h2>
    <table>
        <tr>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Respuesta</th>
            <th>Detalles</th>
        </tr>
EOF
    
    # Verificar cada servicio
    for service in "${!SERVICES[@]}"; do
        local status="success"
        local status_text="OK"
        local response_time="N/A"
        local details=""
        
        case "$service" in
            "db")
                if check_database "$service" "${SERVICES[$service]}" >/dev/null 2>&1; then
                    status="success"
                    status_text="OK"
                    response_time="<1ms"
                    details="Conexiones activas: $(psql "${SERVICES[$service]}" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")"
                else
                    status="error"
                    status_text="ERROR"
                    details="Base de datos no responde"
                fi
                ;;
            
            "redis")
                if check_redis "$service" "${SERVICES[$service]}" >/dev/null 2>&1; then
                    status="success"
                    status_text="OK"
                    response_time="<1ms"
                    details="Clientes conectados: $(redis-cli info clients | grep "connected_clients:" | cut -d: -f2)"
                else
                    status="error"
                    status_text="ERROR"
                    details="Redis no responde"
                fi
                ;;
            
            *)
                # Servicios HTTP
                local start_time
                local end_time
                start_time=$(date +%s%N)
                if curl -s -f "${SERVICES[$service]}" >/dev/null 2>&1; then
                    end_time=$(date +%s%N)
                    response_time=$(( (end_time - start_time) / 1000000 ))
                    status="success"
                    status_text="OK"
                    details="${response_time}ms"
                else
                    status="error"
                    status_text="ERROR"
                    details="No responde"
                fi
                ;;
        esac
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$service</td>
            <td class="$status">$status_text</td>
            <td>$response_time</td>
            <td>$details</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Métricas del Sistema</h2>
    <div class="metric">
        <h3>CPU</h3>
        <p>Uso: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%</p>
    </div>
    
    <div class="metric">
        <h3>Memoria</h3>
        <p>Total: $(free -h | awk '/Mem:/ {print $2}')</p>
        <p>Usado: $(free -h | awk '/Mem:/ {print $3}')</p>
        <p>Libre: $(free -h | awk '/Mem:/ {print $4}')</p>
    </div>
    
    <div class="metric">
        <h3>Disco</h3>
        <p>Uso: $(df -h / | awk 'NR==2 {print $5}')</p>
        <p>Libre: $(df -h / | awk 'NR==2 {print $4}')</p>
    </div>
    
    <h2>Log de Eventos</h2>
    <pre>
$(tail -n 20 "$LOG_DIR/health_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local service="$2"
    
    # Crear directorios necesarios
    mkdir -p "$HEALTH_DIR" "$LOG_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "check")
            if [ -n "$service" ] && [ "$service" != "all" ]; then
                case "$service" in
                    "db")
                        check_database "$service" "${SERVICES[$service]}"
                        ;;
                    "redis")
                        check_redis "$service" "${SERVICES[$service]}"
                        ;;
                    *)
                        check_http_service "$service" "${SERVICES[$service]}"
                        ;;
                esac
            else
                # Verificar todo
                check_system
                for name in "${!SERVICES[@]}"; do
                    case "$name" in
                        "db")
                            check_database "$name" "${SERVICES[$name]}"
                            ;;
                        "redis")
                            check_redis "$name" "${SERVICES[$name]}"
                            ;;
                        *)
                            check_http_service "$name" "${SERVICES[$name]}"
                            ;;
                    esac
                done
            fi
            ;;
        
        "report")
            generate_health_report
            ;;
        
        *)
            echo "Uso: $0 {check|report} [servicio]"
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