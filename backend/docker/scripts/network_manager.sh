#!/bin/bash
# Script para gestión de red del sistema
# Ubicación: backend/docker/scripts/network_manager.sh

set -e

# Configuración
NETWORK_DIR="/app/network"
LOG_DIR="/logs/network"
REPORTS_DIR="/app/reports/network"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Servicios a monitorizar
declare -A SERVICES=(
    ["api"]="8000"
    ["db"]="5432"
    ["nginx"]="80"
    ["redis"]="6379"
)

# Thresholds de red
declare -A NETWORK_THRESHOLDS=(
    ["latency"]="200"           # ms máximo latencia
    ["packet_loss"]="1"         # % máximo pérdida paquetes
    ["bandwidth_min"]="10"      # Mbps mínimo ancho de banda
    ["connections"]="1000"      # máximo conexiones simultáneas
    ["requests"]="10000"        # máximo requests/minuto
    ["errors"]="5"             # % máximo errores
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/network_${TIMESTAMP}.log"
}

# Verificar conectividad
check_connectivity() {
    local host="$1"
    local port="$2"
    log_message "INFO" "Verificando conectividad a $host:$port"
    
    # Test TCP
    if ! nc -zv "$host" "$port" &>/dev/null; then
        log_message "ERROR" "No hay conectividad a $host:$port"
        return 1
    fi
    
    # Test latencia
    local latency
    latency=$(ping -c 1 "$host" | grep -oP 'time=\K[0-9.]+')
    if [ -n "$latency" ] && [ "${latency%.*}" -gt "${NETWORK_THRESHOLDS[latency]}" ]; then
        log_message "WARNING" "Latencia alta a $host: ${latency}ms"
        return 1
    fi
    
    log_message "SUCCESS" "Conectividad OK a $host:$port (${latency}ms)"
    return 0
}

# Analizar tráfico de red
analyze_traffic() {
    local interface="$1"
    log_message "INFO" "Analizando tráfico en $interface"
    
    # Capturar tráfico por 60 segundos
    tcpdump -i "$interface" -w "$NETWORK_DIR/capture_${TIMESTAMP}.pcap" -G 60 &>/dev/null &
    local pid=$!
    
    sleep 60
    kill $pid
    
    # Analizar captura
    {
        echo "=== Análisis de Tráfico ==="
        echo "Interfaz: $interface"
        echo "Período: 60 segundos"
        echo
        
        echo "== Top 10 IPs Origen =="
        tcpdump -r "$NETWORK_DIR/capture_${TIMESTAMP}.pcap" -n | awk '{print $3}' | sort | uniq -c | sort -nr | head -10
        
        echo
        echo "== Top 10 Puertos Destino =="
        tcpdump -r "$NETWORK_DIR/capture_${TIMESTAMP}.pcap" -n | awk '{print $5}' | cut -d. -f5 | sort | uniq -c | sort -nr | head -10
    } > "$REPORTS_DIR/traffic_${TIMESTAMP}.txt"
    
    return 0
}

# Verificar servicios
check_services() {
    log_message "INFO" "Verificando servicios de red..."
    
    for service in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service]}"
        
        # Verificar servicio local
        if ! netstat -tuln | grep -q ":$port "; then
            log_message "ERROR" "Servicio $service (puerto $port) no está escuchando"
            continue
        fi
        
        # Verificar conexiones
        local connections
        connections=$(netstat -an | grep ":$port " | wc -l)
        if [ "$connections" -gt "${NETWORK_THRESHOLDS[connections]}" ]; then
            log_message "WARNING" "Demasiadas conexiones en $service: $connections"
        fi
        
        log_message "SUCCESS" "Servicio $service OK (${connections} conexiones)"
    done
    
    return 0
}

# Monitorizar ancho de banda
monitor_bandwidth() {
    local interface="$1"
    local duration="${2:-60}"
    log_message "INFO" "Monitorizando ancho de banda en $interface por ${duration}s"
    
    # Usar iftop para monitorizar
    if command -v iftop &>/dev/null; then
        iftop -i "$interface" -t -s "$duration" -L 100 > "$NETWORK_DIR/bandwidth_${TIMESTAMP}.txt"
    else
        log_message "WARNING" "iftop no está instalado"
        return 1
    fi
    
    return 0
}

# Generar reporte de red
generate_network_report() {
    local report_file="$REPORTS_DIR/network_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de red..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Red</title>
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
    <h1>Estado de la Red</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Servicios</h2>
    <table>
        <tr>
            <th>Servicio</th>
            <th>Puerto</th>
            <th>Estado</th>
            <th>Conexiones</th>
            <th>Latencia</th>
        </tr>
EOF
    
    # Añadir servicios
    for service in "${!SERVICES[@]}"; do
        local port="${SERVICES[$service]}"
        local status="success"
        local status_text="OK"
        local connections=0
        local latency="N/A"
        
        # Verificar estado
        if ! netstat -tuln | grep -q ":$port "; then
            status="error"
            status_text="ERROR"
        else
            connections=$(netstat -an | grep ":$port " | wc -l)
            if [ "$connections" -gt "${NETWORK_THRESHOLDS[connections]}" ]; then
                status="warning"
                status_text="WARNING"
            fi
            
            # Obtener latencia
            if [ "$service" != "db" ] && [ "$service" != "redis" ]; then
                latency=$(ping -c 1 localhost | grep -oP 'time=\K[0-9.]+' || echo "N/A")
            fi
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$service</td>
            <td>$port</td>
            <td class="$status">$status_text</td>
            <td>$connections</td>
            <td>${latency}ms</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Estadísticas de Red</h2>
    <div class="metric">
        <h3>Interfaces</h3>
        <pre>
$(ip -s link show)
        </pre>
    </div>
    
    <div class="metric">
        <h3>Conexiones Establecidas</h3>
        <pre>
$(netstat -ant | awk '/ESTABLISHED/ {print $4,$5}' | head -10)
        </pre>
    </div>
    
    <div class="metric">
        <h3>Top Puertos</h3>
        <pre>
$(netstat -ant | awk '{print $4}' | cut -d: -f2 | sort | uniq -c | sort -nr | head -10)
        </pre>
    </div>
    
    <h2>Análisis de Tráfico</h2>
    <pre>
$(cat "$NETWORK_DIR/bandwidth_${TIMESTAMP}.txt" 2>/dev/null || echo "No hay datos de ancho de banda")
    </pre>
    
    <h2>Log de Red</h2>
    <pre>
$(tail -n 20 "$LOG_DIR/network_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local target="$2"
    
    # Crear directorios necesarios
    mkdir -p "$NETWORK_DIR" "$LOG_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "check")
            if [ -n "$target" ] && [ "$target" != "all" ]; then
                check_connectivity "localhost" "${SERVICES[$target]}"
            else
                check_services
            fi
            ;;
        
        "analyze")
            if [ -n "$target" ]; then
                analyze_traffic "$target"
            else
                analyze_traffic "eth0"
            fi
            ;;
        
        "monitor")
            if [ -n "$target" ]; then
                monitor_bandwidth "$target" "${3:-60}"
            else
                monitor_bandwidth "eth0" "${3:-60}"
            fi
            ;;
        
        "report")
            check_services
            analyze_traffic "eth0"
            monitor_bandwidth "eth0" 30
            generate_network_report
            ;;
        
        *)
            echo "Uso: $0 {check|analyze|monitor|report} [target] [duration]"
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