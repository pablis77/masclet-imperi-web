#!/bin/bash
# Script para limpiar archivos innecesarios
# Ubicación: backend/docker/scripts/clean_old_files.sh

set -e

# Configuración
LOG_FILE="/logs/cleanup.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Función para obtener tamaño de directorio
get_dir_size() {
    du -sh "$1" 2>/dev/null | cut -f1
}

# Limpiar archivos temporales de backup
cleanup_backup_temps() {
    log_message "🧹 Limpiando archivos temporales de backup..."
    local size_before=$(get_dir_size "/tmp")
    
    # Eliminar backups temporales de más de 24h
    find /tmp -name "masclet_backup_*" -mtime +1 -delete
    
    local size_after=$(get_dir_size "/tmp")
    log_message "✅ Espacio liberado en /tmp: $size_before -> $size_after"
}

# Limpiar logs comprimidos antiguos
cleanup_old_logs() {
    log_message "📜 Limpiando logs antiguos..."
    local count=0
    
    # Eliminar logs comprimidos > 30 días
    count=$(find /logs -name "*.log.gz" -mtime +30 -delete -print | wc -l)
    
    log_message "✅ Eliminados $count archivos de log antiguos"
}

# Limpiar backups duplicados
cleanup_duplicate_backups() {
    log_message "♻️ Verificando backups duplicados..."
    
    local backup_dirs=("/backups/daily" "/backups/weekly" "/backups/monthly")
    local total_removed=0
    
    for dir in "${backup_dirs[@]}"; do
        if [ -d "$dir" ]; then
            # Encontrar duplicados por checksum
            find "$dir" -type f -name "*.gz" -exec md5sum {} \; | \
            sort | uniq -w32 --all-repeated=separate | \
            while read -r checksum file; do
                # Mantener el backup más reciente de cada checksum
                ls -t "${file}"* | tail -n +2 | while read -r dup; do
                    rm -f "$dup"
                    ((total_removed++))
                done
            done
        fi
    done
    
    log_message "✅ Eliminados $total_removed backups duplicados"
}

# Limpiar archivos huérfanos
cleanup_orphaned_files() {
    log_message "🔍 Buscando archivos huérfanos..."
    local count=0
    
    # Encontrar y eliminar archivos parciales o incorrectos
    find /backups -type f \( -name "*.tmp" -o -name "*.part" -o -name "*.incomplete" \) -delete -print | \
    while read -r file; do
        ((count++))
        log_message "  - Eliminado: $file"
    done
    
    log_message "✅ Eliminados $count archivos huérfanos"
}

# Generar informe del estado actual
generate_status_report() {
    local report_file="/logs/storage_report_${TIMESTAMP}.txt"
    
    {
        echo "=== Informe de Estado de Almacenamiento ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "1. Espacio en Disco"
        df -h /
        echo
        echo "2. Tamaños de Directorios"
        echo "- /backups: $(get_dir_size /backups)"
        echo "- /logs: $(get_dir_size /logs)"
        echo "- /tmp: $(get_dir_size /tmp)"
        echo
        echo "3. Conteo de Backups"
        echo "- Diarios: $(find /backups/daily -type f -name "*.gz" 2>/dev/null | wc -l)"
        echo "- Semanales: $(find /backups/weekly -type f -name "*.gz" 2>/dev/null | wc -l)"
        echo "- Mensuales: $(find /backups/monthly -type f -name "*.gz" 2>/dev/null | wc -l)"
        echo
        echo "4. Últimos Backups"
        find /backups -type f -name "*.gz" -exec ls -lh {} \; | tail -n 5
    } > "$report_file"
    
    log_message "📊 Informe generado: $report_file"
}

# Función principal
main() {
    log_message "🚀 Iniciando limpieza de archivos innecesarios..."
    
    # Ejecutar tareas de limpieza
    cleanup_backup_temps
    cleanup_old_logs
    cleanup_duplicate_backups
    cleanup_orphaned_files
    
    # Generar informe final
    generate_status_report
    
    log_message "✅ Limpieza completada exitosamente"
}

# Manejo de errores
trap 'log_message "❌ Error en línea $LINENO: $BASH_COMMAND"; exit 1' ERR

# Ejecutar script
main "$@"