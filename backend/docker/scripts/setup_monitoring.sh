#!/bin/bash
# Script para configurar monitorización del sistema
# Ubicación: backend/docker/scripts/setup_monitoring.sh

set -e

# Configuración
MONITORING_DIR="/app/monitoring"
LOG_DIR="/logs/monitoring"
CONFIG_DIR="/app/config/monitoring"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Métricas a monitorizar
declare -A METRICS=(
    ["system"]="Estado del sistema"
    ["database"]="Estado de base de datos"
    ["application"]="Estado de aplicación"
    ["network"]="Estado de red"
    ["security"]="Estado de seguridad"
)

# Umbrales de monitorización
declare -A THRESHOLDS=(
    # Sistema
    ["cpu_usage"]="80"        # Porcentaje máximo
    ["memory_usage"]="85"     # Porcentaje máximo
    ["disk_usage"]="90"       # Porcentaje máximo
    ["load_average"]="5"      # Carga máxima
    
    # Base de datos
    ["db_connections"]="80"   # Porcentaje máximo
    ["query_time"]="2000"     # ms máximo
    ["deadlocks"]="5"         # Por hora máximo
    ["cache_hit_ratio"]="90"  # Porcentaje mínimo
    
    # Aplicación
    ["response_time"]="500"   # ms máximo
    ["error_rate"]="5"        # Porcentaje máximo
    ["request_queue"]="100"   # Máximo en cola
    ["active_users"]="1000"   # Máximo simultáneo
    
    # Red
    ["latency"]="200"        # ms máximo
    ["packet_loss"]="1"      # Porcentaje máximo
    ["bandwidth_usage"]="80"  # Porcentaje máximo
    ["connection_errors"]="50" # Por hora máximo
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/setup_${TIMESTAMP}.log"
}

# Configurar recolección de métricas
setup_metrics_collection() {
    log_message "INFO" "Configurando recolección de métricas..."
    
    cat > "$CONFIG_DIR/metrics_collection.yml" << EOF
metrics:
    # Métricas del Sistema
    system:
        cpu:
            interval: 1m
            command: "top -bn1 | grep 'Cpu(s)' | awk '{print \$2}'"
            alert_threshold: ${THRESHOLDS["cpu_usage"]}
        memory:
            interval: 1m
            command: "free -m | awk '/Mem:/ {printf \"%.2f\", \$3*100/\$2}'"
            alert_threshold: ${THRESHOLDS["memory_usage"]}
        disk:
            interval: 5m
            command: "df -h / | awk 'NR==2 {print \$5}' | tr -d '%'"
            alert_threshold: ${THRESHOLDS["disk_usage"]}
    
    # Métricas de Base de Datos
    database:
        connections:
            interval: 1m
            query: "SELECT count(*) FROM pg_stat_activity"
            alert_threshold: ${THRESHOLDS["db_connections"]}
        query_time:
            interval: 5m
            query: "SELECT max(extract(epoch from now() - query_start) * 1000) FROM pg_stat_activity"
            alert_threshold: ${THRESHOLDS["query_time"]}
        cache_ratio:
            interval: 5m
            query: "SELECT sum(heap_blks_hit)*100/sum(heap_blks_hit + heap_blks_read) FROM pg_statio_user_tables"
            alert_threshold: ${THRESHOLDS["cache_hit_ratio"]}
    
    # Métricas de Aplicación
    application:
        response_time:
            interval: 1m
            endpoint: "/api/health"
            alert_threshold: ${THRESHOLDS["response_time"]}
        error_rate:
            interval: 5m
            log_pattern: "ERROR|CRITICAL"
            alert_threshold: ${THRESHOLDS["error_rate"]}
        active_users:
            interval: 1m
            query: "SELECT count(DISTINCT user_id) FROM user_sessions WHERE last_activity > now() - interval '5 minutes'"
            alert_threshold: ${THRESHOLDS["active_users"]}
    
    # Métricas de Red
    network:
        latency:
            interval: 1m
            command: "ping -c 3 8.8.8.8 | tail -1 | awk -F '/' '{print \$5}'"
            alert_threshold: ${THRESHOLDS["latency"]}
        packet_loss:
            interval: 5m
            command: "ping -c 100 8.8.8.8 | grep 'packet loss' | awk '{print \$6}' | tr -d '%'"
            alert_threshold: ${THRESHOLDS["packet_loss"]}
EOF
}

# Configurar almacenamiento de métricas
setup_metrics_storage() {
    log_message "INFO" "Configurando almacenamiento de métricas..."
    
    cat > "$CONFIG_DIR/metrics_storage.yml" << EOF
storage:
    # Configuración de retención
    retention:
        raw_metrics: 7d
        hourly_aggregates: 30d
        daily_aggregates: 365d
    
    # Configuración de agregación
    aggregation:
        intervals:
            - 1m   # Datos en crudo
            - 1h   # Agregados por hora
            - 1d   # Agregados por día
        functions:
            - avg
            - min
            - max
            - count
    
    # Configuración de compresión
    compression:
        enabled: true
        algorithm: gzip
        level: 6
        min_size: 1024
    
    # Rotación de logs
    rotation:
        max_size: "100M"
        max_files: 10
        compress: true
EOF
}

# Configurar visualización de métricas
setup_metrics_visualization() {
    log_message "INFO" "Configurando visualización de métricas..."
    
    cat > "$CONFIG_DIR/metrics_visualization.yml" << EOF
dashboards:
    # Dashboard Principal
    main:
        title: "Panel de Control"
        refresh: 1m
        panels:
            - title: "Estado del Sistema"
              type: "gauge"
              metrics: ["cpu_usage", "memory_usage", "disk_usage"]
              thresholds:
                - color: "green"
                  value: 0
                - color: "yellow"
                  value: 70
                - color: "red"
                  value: 90
            
            - title: "Rendimiento DB"
              type: "graph"
              metrics: ["query_time", "connections", "cache_ratio"]
              span: 6
            
            - title: "Rendimiento API"
              type: "graph"
              metrics: ["response_time", "error_rate"]
              span: 6
    
    # Dashboard de Red
    network:
        title: "Estado de Red"
        refresh: 5m
        panels:
            - title: "Latencia"
              type: "graph"
              metrics: ["latency"]
              unit: "ms"
            
            - title: "Pérdida de Paquetes"
              type: "stat"
              metrics: ["packet_loss"]
              unit: "%"

EOF
}

# Configurar alertas
setup_alerts() {
    log_message "INFO" "Configurando sistema de alertas..."
    
    cat > "$CONFIG_DIR/alerts.yml" << EOF
alerts:
    # Alertas Críticas
    critical:
        conditions:
            - metric: "cpu_usage"
              operator: ">"
              threshold: ${THRESHOLDS["cpu_usage"]}
              duration: "5m"
            
            - metric: "memory_usage"
              operator: ">"
              threshold: ${THRESHOLDS["memory_usage"]}
              duration: "5m"
            
            - metric: "disk_usage"
              operator: ">"
              threshold: ${THRESHOLDS["disk_usage"]}
              duration: "5m"
        
        notifications:
            - type: "email"
              to: "admin@mascletimperi.com"
              subject: "🚨 Alerta Crítica: {{ .metric }}"
            
            - type: "telegram"
              chat_id: "-100xxxxxxxxxxxx"
              message: "⚠️ {{ .metric }}: {{ .value }}{{ .unit }}"
    
    # Alertas de Advertencia
    warning:
        conditions:
            - metric: "query_time"
              operator: ">"
              threshold: ${THRESHOLDS["query_time"]}
              duration: "10m"
            
            - metric: "error_rate"
              operator: ">"
              threshold: ${THRESHOLDS["error_rate"]}
              duration: "15m"
        
        notifications:
            - type: "email"
              to: "tech@mascletimperi.com"
              subject: "⚠️ Advertencia: {{ .metric }}"
EOF
}

# Configurar exportadores de métricas
setup_exporters() {
    log_message "INFO" "Configurando exportadores de métricas..."
    
    # Exportador Node
    cat > "$CONFIG_DIR/node_exporter.yml" << EOF
node_exporter:
    enabled: true
    port: 9100
    collectors:
        - cpu
        - diskstats
        - filesystem
        - loadavg
        - meminfo
        - netdev
        - netstat
        - stat
        - time
        - vmstat
    disabled_collectors:
        - infiniband
        - wifi
EOF

    # Exportador PostgreSQL
    cat > "$CONFIG_DIR/postgres_exporter.yml" << EOF
postgres_exporter:
    enabled: true
    port: 9187
    data_source_name: "postgresql://postgres:1234@localhost:5432/masclet_imperi?sslmode=disable"
    queries:
        pg_replication:
            query: "SELECT * FROM pg_stat_replication"
        pg_stat_activity:
            query: "SELECT * FROM pg_stat_activity"
EOF
}

# Verificar configuración
verify_configuration() {
    log_message "INFO" "Verificando configuración..."
    local issues=0
    
    # Verificar archivos de configuración
    local config_files=(
        "metrics_collection.yml"
        "metrics_storage.yml"
        "metrics_visualization.yml"
        "alerts.yml"
        "node_exporter.yml"
        "postgres_exporter.yml"
    )
    
    for file in "${config_files[@]}"; do
        if [ ! -f "$CONFIG_DIR/$file" ]; then
            log_message "ERROR" "Archivo de configuración faltante: $file"
            ((issues++))
        fi
    done
    
    # Verificar permisos
    if [ ! -x "$MONITORING_DIR" ] || [ ! -w "$LOG_DIR" ] || [ ! -r "$CONFIG_DIR" ]; then
        log_message "ERROR" "Permisos incorrectos en directorios"
        ((issues++))
    fi
    
    return $issues
}

# Generar documentación
generate_documentation() {
    local docs_dir="$MONITORING_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/monitoring_setup.md" << EOF
# Sistema de Monitorización

## Métricas Monitorizadas
$(for metric in "${!METRICS[@]}"; do
    echo "### ${METRICS[$metric]}"
    echo "- Tipo: $metric"
    echo
done)

## Umbrales Configurados
$(for threshold in "${!THRESHOLDS[@]}"; do
    echo "- $threshold: ${THRESHOLDS[$threshold]}"
done)

## Estructura de Directorios
- $MONITORING_DIR/ (Scripts y datos)
- $LOG_DIR/ (Logs del sistema)
- $CONFIG_DIR/ (Archivos de configuración)

## Configuración
Los siguientes archivos contienen la configuración del sistema:
- metrics_collection.yml
- metrics_storage.yml
- metrics_visualization.yml
- alerts.yml
- node_exporter.yml
- postgres_exporter.yml

## Alertas
- Críticas: CPU, Memoria, Disco
- Advertencias: Tiempo de consulta, Tasa de errores

## Retención de Datos
- Datos en crudo: 7 días
- Agregados por hora: 30 días
- Agregados por día: 365 días
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración del sistema de monitorización..."
    
    # Crear directorios necesarios
    mkdir -p "$MONITORING_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Configurar componentes
    setup_metrics_collection
    setup_metrics_storage
    setup_metrics_visualization
    setup_alerts
    setup_exporters
    
    # Verificar configuración
    verify_configuration
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        # Generar documentación
        generate_documentation
        log_message "SUCCESS" "Sistema de monitorización configurado correctamente"
    else
        log_message "ERROR" "Se encontraron $verify_status problemas en la configuración"
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