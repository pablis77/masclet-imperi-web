#!/bin/bash
# Script para reportar uso de espacio y configurar limpieza
# Ubicación: backend/docker/scripts/space_report.sh

set -e

# Configuración
LOG_FILE="/logs/space_report.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="/reports/space"
MIN_FREE_SPACE=5  # GB

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Función para convertir tamaños a MB
to_mb() {
    local size="$1"
    local unit="${size: -1}"
    local number="${size::-1}"
    
    case $unit in
        G) echo "$number * 1024" | bc ;;
        M) echo "$number" ;;
        K) echo "$number / 1024" | bc ;;
        B) echo "$number / 1024 / 1024" | bc ;;
        *) echo "0" ;;
    esac
}

# Análisis de espacio por directorio
analyze_directory() {
    local dir="$1"
    local output_file="$2"
    
    {
        echo "=== Análisis de $dir ==="
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        # Top 10 directorios más grandes
        echo "Top 10 directorios más grandes:"
        du -h "$dir" 2>/dev/null | sort -rh | head -n 10
        
        echo
        echo "Tipos de archivo y espacio:"
        find "$dir" -type f -exec file {} \; | \
            awk -F': ' '{print $2}' | \
            sort | uniq -c | sort -rn
            
    } >> "$output_file"
}

# Análisis de backups
analyze_backups() {
    local output_file="$1"
    
    {
        echo "=== Análisis de Backups ==="
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        # Espacio por tipo de backup
        echo "Espacio por tipo:"
        for type in daily weekly monthly yearly; do
            local size
            size=$(du -sh "/backups/$type" 2>/dev/null | cut -f1)
            echo "- $type: $size"
        done
        
        echo
        echo "Backups más antiguos:"
        for type in daily weekly monthly yearly; do
            if [ -d "/backups/$type" ]; then
                local oldest
                oldest=$(ls -rt "/backups/$type" | head -n 1)
                echo "- $type: $oldest"
            fi
        done
        
    } >> "$output_file"
}

# Análisis de logs
analyze_logs() {
    local output_file="$1"
    
    {
        echo "=== Análisis de Logs ==="
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        # Tamaño total de logs
        echo "Espacio total de logs:"
        du -sh /logs 2>/dev/null || echo "No se puede acceder a /logs"
        
        echo
        echo "Top 10 archivos de log más grandes:"
        find /logs -type f -name "*.log*" -exec du -h {} \; | \
            sort -rh | head -n 10
            
    } >> "$output_file"
}

# Análisis de base de datos
analyze_database() {
    local output_file="$1"
    
    {
        echo "=== Análisis de Base de Datos ==="
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        if command -v psql &> /dev/null; then
            PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${POSTGRES_HOST}" \
                -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" << EOF
\\echo 'Tamaño de tablas:'
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

\\echo '\nÍndices más grandes:'
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_indexes
ORDER BY pg_relation_size(indexname::regclass) DESC
LIMIT 5;

\\echo '\nEstadísticas de la base de datos:'
SELECT pg_size_pretty(pg_database_size('${POSTGRES_DB}')) as "Tamaño Total";
EOF
        else
            echo "Cliente PostgreSQL no disponible"
        fi
        
    } >> "$output_file"
}

# Generar reporte completo
generate_report() {
    local report_file="${REPORT_DIR}/space_report_${TIMESTAMP}.txt"
    mkdir -p "${REPORT_DIR}"
    
    {
        echo "=== Reporte de Uso de Espacio ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        echo "--- Espacio en Sistema ---"
        df -h /
        echo
        
        echo "--- Memoria ---"
        free -h
        echo
        
    } > "$report_file"
    
    # Análisis detallado
    analyze_directory "/app" "$report_file"
    analyze_backups "$report_file"
    analyze_logs "$report_file"
    analyze_database "$report_file"
    
    # Comprimir reportes antiguos
    find "${REPORT_DIR}" -name "space_report_*.txt" -mtime +7 -exec gzip {} \;
    
    log_message "📊 Reporte generado: $report_file"
}

# Verificar espacio crítico
check_critical_space() {
    local free_space
    free_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$free_space" -lt "$MIN_FREE_SPACE" ]; then
        log_message "⚠️ ALERTA: Espacio crítico (${free_space}GB libre)"
        /usr/local/bin/notify.sh "Espacio Crítico" "error" "Solo quedan ${free_space}GB libres"
        
        # Ejecutar limpieza de emergencia
        /usr/local/bin/cleanup_versions.sh --force
        return 1
    fi
    
    return 0
}

# Función principal
main() {
    log_message "🚀 Iniciando análisis de espacio..."
    
    # Verificar espacio crítico
    check_critical_space
    
    # Generar reporte
    generate_report
    
    log_message "✅ Análisis completado"
}

# Manejo de errores
trap 'log_message "❌ Error en línea $LINENO: $BASH_COMMAND"; exit 1' ERR

# Ejecutar script
main "$@"