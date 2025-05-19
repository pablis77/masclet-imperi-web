#!/bin/bash
# Script para gestión de logs del sistema
# Ubicación: backend/docker/scripts/log_manager.sh

set -e

# Configuración
LOG_DIR="/logs"
ARCHIVE_DIR="/logs/archive"
REPORTS_DIR="/logs/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tipos de logs
declare -A LOG_TYPES=(
    ["app"]="masclet"
    ["api"]="api"
    ["db"]="postgres"
    ["nginx"]="nginx"
    ["security"]="security"
    ["backup"]="backup"
    ["import"]="import"
)

# Configuración de retención
declare -A RETENTION=(
    ["info"]="30"        # 30 días para logs info
    ["error"]="90"       # 90 días para logs error
    ["security"]="180"   # 180 días para logs seguridad
    ["audit"]="365"      # 1 año para logs auditoría
)

# Niveles de log
declare -A LOG_LEVELS=(
    ["DEBUG"]="7"
    ["INFO"]="6"
    ["NOTICE"]="5"
    ["WARNING"]="4"
    ["ERROR"]="3"
    ["CRITICAL"]="2"
    ["ALERT"]="1"
    ["EMERGENCY"]="0"
)

# Patrones de búsqueda
declare -A SEARCH_PATTERNS=(
    ["error"]="ERROR|CRITICAL|FATAL"
    ["warning"]="WARN|WARNING"
    ["security"]="SECURITY|AUTH|LOGIN"
    ["performance"]="SLOW|TIMEOUT|DELAY"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/logmanager_${TIMESTAMP}.log"
}

# Rotar logs
rotate_logs() {
    local type="$1"
    log_message "INFO" "Rotando logs de $type..."
    
    # Verificar y crear directorios
    mkdir -p "$ARCHIVE_DIR/$type"
    
    # Comprimir logs antiguos
    find "$LOG_DIR" -name "${LOG_TYPES[$type]}*.log" -type f -mtime +1 | while read -r file; do
        if [ ! -f "${file}.gz" ]; then
            gzip -c "$file" > "${ARCHIVE_DIR}/$type/$(basename "$file").${TIMESTAMP}.gz"
            rm -f "$file"
        fi
    done
    
    return 0
}

# Limpiar logs antiguos
cleanup_logs() {
    local type="$1"
    local days="${2:-30}"
    log_message "INFO" "Limpiando logs antiguos de $type (>$days días)..."
    
    find "$ARCHIVE_DIR/$type" -name "*.gz" -type f -mtime +"$days" -delete
    
    return 0
}

# Analizar logs
analyze_logs() {
    local type="$1"
    local output="$REPORTS_DIR/analysis_${type}_${TIMESTAMP}.txt"
    log_message "INFO" "Analizando logs de $type..."
    
    {
        echo "=== Análisis de Logs: $type ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        # Errores críticos
        echo "== Errores Críticos =="
        grep -h "ERROR\|CRITICAL\|FATAL" "$LOG_DIR/${LOG_TYPES[$type]}*.log" 2>/dev/null || echo "Ninguno encontrado"
        echo
        
        # Advertencias
        echo "== Advertencias =="
        grep -h "WARN\|WARNING" "$LOG_DIR/${LOG_TYPES[$type]}*.log" 2>/dev/null || echo "Ninguna encontrada"
        echo
        
        # Estadísticas
        echo "== Estadísticas =="
        echo "Total líneas: $(wc -l < "$LOG_DIR/${LOG_TYPES[$type]}.log" 2>/dev/null || echo 0)"
        echo "Errores: $(grep -c "ERROR" "$LOG_DIR/${LOG_TYPES[$type]}.log" 2>/dev/null || echo 0)"
        echo "Warnings: $(grep -c "WARN" "$LOG_DIR/${LOG_TYPES[$type]}.log" 2>/dev/null || echo 0)"
    } > "$output"
    
    return 0
}

# Buscar en logs
search_logs() {
    local pattern="$1"
    local days="${2:-7}"
    local output="$REPORTS_DIR/search_${TIMESTAMP}.txt"
    log_message "INFO" "Buscando patrón '$pattern' en logs de últimos $days días..."
    
    {
        echo "=== Búsqueda de Logs ==="
        echo "Patrón: $pattern"
        echo "Período: últimos $days días"
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        find "$LOG_DIR" -name "*.log" -type f -mtime -"$days" -exec grep -H "$pattern" {} \;
    } > "$output"
    
    return 0
}

# Generar reporte
generate_report() {
    local type="$1"
    local report_file="$REPORTS_DIR/report_${type}_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte para $type..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Logs - $type</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .error { color: red; }
        .warning { color: orange; }
        .info { color: blue; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .chart { width: 100%; height: 300px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Reporte de Logs - $type</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Resumen</h2>
    <table>
        <tr>
            <th>Nivel</th>
            <th>Cantidad</th>
            <th>Porcentaje</th>
        </tr>
EOF
    
    # Añadir estadísticas por nivel
    local total=0
    declare -A counts
    
    for level in "${!LOG_LEVELS[@]}"; do
        counts[$level]=$(grep -c "$level" "$LOG_DIR/${LOG_TYPES[$type]}.log" 2>/dev/null || echo 0)
        ((total+=counts[$level]))
    done
    
    for level in "${!LOG_LEVELS[@]}"; do
        local count="${counts[$level]}"
        local percentage=0
        [ "$total" -gt 0 ] && percentage=$(( count * 100 / total ))
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$level</td>
            <td>$count</td>
            <td>$percentage%</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Errores Críticos (últimas 24h)</h2>
    <pre class="error">
$(grep "ERROR\|CRITICAL\|FATAL" "$LOG_DIR/${LOG_TYPES[$type]}.log" | tail -n 10)
    </pre>
    
    <h2>Advertencias Recientes</h2>
    <pre class="warning">
$(grep "WARN\|WARNING" "$LOG_DIR/${LOG_TYPES[$type]}.log" | tail -n 10)
    </pre>
    
    <h2>Gráfico de Actividad</h2>
    <div class="chart">
        <!-- Aquí se podría añadir un gráfico con JavaScript -->
    </div>
</body>
</html>
EOF
    
    return 0
}

# Monitorizar logs en tiempo real
monitor_logs() {
    local type="$1"
    local pattern="${2:-.*}"
    log_message "INFO" "Monitorizando logs de $type en tiempo real..."
    
    tail -f "$LOG_DIR/${LOG_TYPES[$type]}.log" | grep --line-buffered -E "$pattern"
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local type="${2:-all}"
    local extra_arg="$3"
    
    # Crear directorios necesarios
    mkdir -p "$LOG_DIR" "$ARCHIVE_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "rotate")
            if [ "$type" = "all" ]; then
                for t in "${!LOG_TYPES[@]}"; do
                    rotate_logs "$t"
                done
            else
                rotate_logs "$type"
            fi
            ;;
        
        "cleanup")
            if [ "$type" = "all" ]; then
                for t in "${!LOG_TYPES[@]}"; do
                    cleanup_logs "$t" "${RETENTION[info]}"
                done
            else
                cleanup_logs "$type" "$extra_arg"
            fi
            ;;
        
        "analyze")
            if [ "$type" = "all" ]; then
                for t in "${!LOG_TYPES[@]}"; do
                    analyze_logs "$t"
                done
            else
                analyze_logs "$type"
            fi
            ;;
        
        "search")
            if [ -z "$extra_arg" ]; then
                log_message "ERROR" "Debe especificar patrón de búsqueda"
                return 1
            fi
            search_logs "$extra_arg" "$type"
            ;;
        
        "report")
            if [ "$type" = "all" ]; then
                for t in "${!LOG_TYPES[@]}"; do
                    generate_report "$t"
                done
            else
                generate_report "$type"
            fi
            ;;
        
        "monitor")
            monitor_logs "$type" "$extra_arg"
            ;;
        
        *)
            echo "Uso: $0 {rotate|cleanup|analyze|search|report|monitor} [tipo] [args]"
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