#!/bin/bash
# Script para verificar y configurar la red
# Ubicación: backend/docker/scripts/network_check.sh

set -e

# Configuración
NETWORK_DIR="/app/network"
LOG_DIR="/logs/network"
CONFIG_DIR="/app/config/network"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Endpoints críticos
declare -A CRITICAL_ENDPOINTS=(
    ["api"]="http://localhost:8000/api/health"
    ["db"]="localhost:5432"
    ["redis"]="localhost:6379"
    ["dns"]="8.8.8.8"
)

# Umbrales de red
declare -A THRESHOLDS=(
    ["latency"]="200"        # ms máximo
    ["packet_loss"]="1"      # % máximo
    ["bandwidth"]="10"       # Mbps mínimo
    ["conn_limit"]="1000"    # Conexiones máximas
    ["timeout"]="5"          # Segundos
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/network_${TIMESTAMP}.log"
}

# Verificar conectividad básica
check_basic_connectivity() {
    log_message "INFO" "Verificando conectividad básica..."
    local issues=0
    
    # DNS
    if ! ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
        log_message "ERROR" "No hay conectividad con DNS (8.8.8.8)"
        ((issues++))
    fi
    
    # Gateway
    local gateway
    gateway=$(ip route | grep default | awk '{print $3}')
    if ! ping -c 1 -W 2 "$gateway" >/dev/null 2>&1; then
        log_message "ERROR" "No hay conectividad con gateway ($gateway)"
        ((issues++))
    fi
    
    # Resolución DNS
    if ! nslookup google.com >/dev/null 2>&1; then
        log_message "ERROR" "Fallo en resolución DNS"
        ((issues++))
    fi
    
    return $issues
}

# Verificar servicios críticos
check_critical_services() {
    log_message "INFO" "Verificando servicios críticos..."
    local issues=0
    
    for service in "${!CRITICAL_ENDPOINTS[@]}"; do
        local endpoint="${CRITICAL_ENDPOINTS[$service]}"
        
        # API endpoints (HTTP)
        if [[ $endpoint == http* ]]; then
            if ! curl -s --connect-timeout 5 "$endpoint" >/dev/null; then
                log_message "ERROR" "Servicio $service no responde ($endpoint)"
                ((issues++))
            fi
            
        # TCP endpoints
        else
            local host
            local port
            IFS=: read -r host port <<< "$endpoint"
            if ! nc -z -w5 "$host" "$port" 2>/dev/null; then
                log_message "ERROR" "Servicio $service no responde ($endpoint)"
                ((issues++))
            fi
        fi
    done
    
    return $issues
}

# Verificar calidad de red
check_network_quality() {
    log_message "INFO" "Verificando calidad de red..."
    local issues=0
    
    # Latencia
    local latency
    latency=$(ping -c 5 8.8.8.8 | tail -1 | awk -F '/' '{print $5}')
    if [ "$(echo "$latency > ${THRESHOLDS['latency']}" | bc)" -eq 1 ]; then
        log_message "WARNING" "Latencia alta: ${latency}ms"
        ((issues++))
    fi
    
    # Pérdida de paquetes
    local packet_loss
    packet_loss=$(ping -c 100 8.8.8.8 | grep "packet loss" | awk -F',' '{print $3}' | awk '{print $1}' | tr -d '%')
    if [ "$packet_loss" -gt "${THRESHOLDS['packet_loss']}" ]; then
        log_message "WARNING" "Pérdida de paquetes alta: $packet_loss%"
        ((issues++))
    fi
    
    # Ancho de banda (requiere iperf3)
    if command -v iperf3 >/dev/null; then
        local bandwidth
        bandwidth=$(iperf3 -c iperf.he.net -t 5 | grep "sender" | awk '{print $7}')
        if [ "$(echo "$bandwidth < ${THRESHOLDS['bandwidth']}" | bc)" -eq 1 ]; then
            log_message "WARNING" "Ancho de banda bajo: ${bandwidth}Mbps"
            ((issues++))
        fi
    fi
    
    return $issues
}

# Verificar seguridad de red
check_network_security() {
    log_message "INFO" "Verificando seguridad de red..."
    local issues=0
    
    # Puertos abiertos
    local open_ports
    open_ports=$(netstat -tuln | grep LISTEN | wc -l)
    if [ "$open_ports" -gt 20 ]; then
        log_message "WARNING" "Demasiados puertos abiertos: $open_ports"
        ((issues++))
    fi
    
    # Conexiones establecidas
    local established_conn
    established_conn=$(netstat -ant | grep ESTABLISHED | wc -l)
    if [ "$established_conn" -gt "${THRESHOLDS['conn_limit']}" ]; then
        log_message "WARNING" "Demasiadas conexiones establecidas: $established_conn"
        ((issues++))
    fi
    
    # Firewall activo
    if ! command -v iptables >/dev/null || [ "$(iptables -L | wc -l)" -lt 10 ]; then
        log_message "WARNING" "Firewall no configurado o reglas insuficientes"
        ((issues++))
    fi
    
    return $issues
}

# Ajustar configuración de red
tune_network() {
    log_message "INFO" "Ajustando configuración de red..."
    
    # Parámetros del kernel
    cat > /etc/sysctl.d/99-network-tune.conf << EOF
# Optimizaciones generales
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# Optimizaciones TCP
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_timestamps = 1

# Timeouts y keepalive
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 10
net.ipv4.tcp_keepalive_probes = 6

# Buffers de red
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
EOF

    # Aplicar cambios
    sysctl -p /etc/sysctl.d/99-network-tune.conf
    
    # Ajustar interfaces
    for interface in $(ip -o link show | awk -F': ' '{print $2}'); do
        [ "$interface" = "lo" ] && continue
        
        # MTU óptimo
        ip link set dev "$interface" mtu 1500
        
        # Activar offloading si está soportado
        ethtool -K "$interface" tx on rx on sg on tso on gso on gro on >/dev/null 2>&1 || true
    done
}

# Generar reporte de red
generate_network_report() {
    local report_file="$LOG_DIR/network_report_${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Red</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Red</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Conectividad</h2>
    <table>
        <tr>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Latencia</th>
        </tr>
EOF

    # Añadir estado de endpoints
    for service in "${!CRITICAL_ENDPOINTS[@]}"; do
        local endpoint="${CRITICAL_ENDPOINTS[$service]}"
        local status="OK"
        local latency="N/A"
        
        if [[ $endpoint == http* ]]; then
            if ! curl -s --connect-timeout 5 "$endpoint" >/dev/null; then
                status="ERROR"
            else
                latency=$(curl -s -w "%{time_total}\n" -o /dev/null "$endpoint")
            fi
        else
            local host
            local port
            IFS=: read -r host port <<< "$endpoint"
            if ! nc -z -w5 "$host" "$port" 2>/dev/null; then
                status="ERROR"
            fi
        fi
        
        local class="success"
        [ "$status" != "OK" ] && class="error"
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$service</td>
            <td class="$class">$status</td>
            <td>$latency</td>
        </tr>
EOF
    done

    # Añadir métricas de red
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Métricas de Red</h2>
    <table>
        <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Umbral</th>
        </tr>
        <tr>
            <td>Latencia</td>
            <td>$(ping -c 1 8.8.8.8 | tail -1 | awk -F '/' '{print $5}')ms</td>
            <td>${THRESHOLDS['latency']}ms</td>
        </tr>
        <tr>
            <td>Pérdida de Paquetes</td>
            <td>$packet_loss%</td>
            <td>${THRESHOLDS['packet_loss']}%</td>
        </tr>
        <tr>
            <td>Conexiones Establecidas</td>
            <td>$established_conn</td>
            <td>${THRESHOLDS['conn_limit']}</td>
        </tr>
    </table>
    
    <h2>Configuración de Red</h2>
    <pre>
$(ip addr show)

Tabla de Rutas:
$(ip route)

Estadísticas de Red:
$(netstat -s | head -n 20)
    </pre>
</body>
</html>
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando verificación de red..."
    
    # Crear directorios necesarios
    mkdir -p "$NETWORK_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Verificaciones
    check_basic_connectivity || {
        log_message "ERROR" "Falló verificación de conectividad básica"
        return 1
    }
    
    check_critical_services || {
        log_message "WARNING" "Algunos servicios críticos no responden"
    }
    
    check_network_quality || {
        log_message "WARNING" "Problemas de calidad en la red"
    }
    
    check_network_security || {
        log_message "WARNING" "Problemas de seguridad en la red"
    }
    
    # Optimizaciones
    tune_network || {
        log_message "WARNING" "No se pudieron aplicar todas las optimizaciones"
    }
    
    # Generar reporte
    generate_network_report
    
    log_message "SUCCESS" "Verificación de red completada"
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