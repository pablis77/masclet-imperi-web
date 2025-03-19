#!/bin/bash
# Script para gestión de backups del sistema
# Ubicación: backend/docker/scripts/backup_manager.sh

set -e

# Configuración
BACKUP_DIR="/app/backups"
LOG_DIR="/logs/backups"
REPORTS_DIR="/app/reports/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tipos de backup
declare -A BACKUP_TYPES=(
    ["db"]="Base de datos"
    ["files"]="Archivos del sistema"
    ["config"]="Configuración"
    ["logs"]="Logs del sistema"
)

# Configuración de retención
declare -A RETENTION=(
    ["daily"]="7"          # 7 días
    ["weekly"]="4"         # 4 semanas
    ["monthly"]="12"       # 12 meses
    ["yearly"]="5"         # 5 años
)

# Configuración de compresión
declare -A COMPRESSION=(
    ["method"]="gzip"      # gzip, bzip2, xz
    ["level"]="6"          # 1-9
    ["exclude"]="*.tmp"    # patrones a excluir
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/backup_${TIMESTAMP}.log"
}

# Backup de base de datos
backup_database() {
    local output="$BACKUP_DIR/db/masclet_imperi_${TIMESTAMP}.sql"
    log_message "INFO" "Iniciando backup de base de datos..."
    
    # Crear directorio si no existe
    mkdir -p "$BACKUP_DIR/db"
    
    # Ejecutar pg_dump
    if PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h db -U $POSTGRES_USER -d masclet_imperi > "$output"; then
        # Comprimir backup
        gzip -${COMPRESSION[level]} "$output"
        log_message "SUCCESS" "Backup de base de datos completado: ${output}.gz"
        return 0
    else
        log_message "ERROR" "Error al realizar backup de base de datos"
        return 1
    fi
}

# Backup de archivos
backup_files() {
    local output="$BACKUP_DIR/files/files_${TIMESTAMP}.tar.gz"
    log_message "INFO" "Iniciando backup de archivos..."
    
    # Crear directorio si no existe
    mkdir -p "$BACKUP_DIR/files"
    
    # Crear archivo tar comprimido
    if tar -czf "$output" \
        --exclude="${COMPRESSION[exclude]}" \
        --exclude="*.pyc" \
        --exclude="__pycache__" \
        -C /app .; then
        log_message "SUCCESS" "Backup de archivos completado: $output"
        return 0
    else
        log_message "ERROR" "Error al realizar backup de archivos"
        return 1
    fi
}

# Backup de configuración
backup_config() {
    local output="$BACKUP_DIR/config/config_${TIMESTAMP}.tar.gz"
    log_message "INFO" "Iniciando backup de configuración..."
    
    # Crear directorio si no existe
    mkdir -p "$BACKUP_DIR/config"
    
    # Crear archivo tar comprimido
    if tar -czf "$output" \
        -C /app/config .; then
        log_message "SUCCESS" "Backup de configuración completado: $output"
        return 0
    else
        log_message "ERROR" "Error al realizar backup de configuración"
        return 1
    fi
}

# Backup de logs
backup_logs() {
    local output="$BACKUP_DIR/logs/logs_${TIMESTAMP}.tar.gz"
    log_message "INFO" "Iniciando backup de logs..."
    
    # Crear directorio si no existe
    mkdir -p "$BACKUP_DIR/logs"
    
    # Crear archivo tar comprimido
    if tar -czf "$output" \
        -C /logs .; then
        log_message "SUCCESS" "Backup de logs completado: $output"
        return 0
    else
        log_message "ERROR" "Error al realizar backup de logs"
        return 1
    fi
}

# Rotar backups antiguos
rotate_backups() {
    local type="$1"
    local days="${2:-7}"
    log_message "INFO" "Rotando backups antiguos de $type (>$days días)..."
    
    find "$BACKUP_DIR/$type" -name "*.*" -type f -mtime +"$days" -delete
    
    return 0
}

# Verificar integridad de backup
verify_backup() {
    local file="$1"
    log_message "INFO" "Verificando integridad de $file"
    
    case "${file##*.}" in
        "gz")
            if gzip -t "$file" &>/dev/null; then
                log_message "SUCCESS" "Archivo $file íntegro"
                return 0
            else
                log_message "ERROR" "Archivo $file corrupto"
                return 1
            fi
            ;;
        "sql")
            if psql -f "$file" --list &>/dev/null; then
                log_message "SUCCESS" "Archivo SQL $file válido"
                return 0
            else
                log_message "ERROR" "Archivo SQL $file inválido"
                return 1
            fi
            ;;
        *)
            log_message "WARNING" "No se puede verificar integridad de $file"
            return 1
            ;;
    esac
}

# Restaurar backup
restore_backup() {
    local file="$1"
    log_message "INFO" "Restaurando backup desde $file"
    
    case "${file##*.}" in
        "gz")
            if [ "${file%.*}" = "sql" ]; then
                # Restaurar backup de base de datos
                if gunzip -c "$file" | PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d masclet_imperi; then
                    log_message "SUCCESS" "Base de datos restaurada desde $file"
                    return 0
                else
                    log_message "ERROR" "Error al restaurar base de datos desde $file"
                    return 1
                fi
            else
                # Restaurar backup de archivos
                if tar -xzf "$file" -C /; then
                    log_message "SUCCESS" "Archivos restaurados desde $file"
                    return 0
                else
                    log_message "ERROR" "Error al restaurar archivos desde $file"
                    return 1
                fi
            fi
            ;;
        *)
            log_message "ERROR" "Formato de backup no soportado: $file"
            return 1
            ;;
    esac
}

# Generar reporte de backups
generate_backup_report() {
    local report_file="$REPORTS_DIR/backup_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de backups..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Backups</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .warning { color: orange; }
        .error { color: red; }
        .success { color: green; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Reporte de Backups</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Estado de Backups</h2>
    <table>
        <tr>
            <th>Tipo</th>
            <th>Último Backup</th>
            <th>Tamaño</th>
            <th>Estado</th>
            <th>Retención</th>
        </tr>
EOF
    
    # Añadir información de cada tipo de backup
    for type in "${!BACKUP_TYPES[@]}"; do
        local last_backup
        last_backup=$(ls -t "$BACKUP_DIR/$type" 2>/dev/null | head -1)
        
        if [ -n "$last_backup" ]; then
            local backup_date
            local backup_size
            local backup_status
            
            backup_date=$(stat -c %y "$BACKUP_DIR/$type/$last_backup" 2>/dev/null | cut -d. -f1)
            backup_size=$(du -h "$BACKUP_DIR/$type/$last_backup" 2>/dev/null | cut -f1)
            
            if verify_backup "$BACKUP_DIR/$type/$last_backup" &>/dev/null; then
                backup_status="success"
                status_text="OK"
            else
                backup_status="error"
                status_text="ERROR"
            fi
        else
            backup_date="Never"
            backup_size="N/A"
            backup_status="warning"
            status_text="No backup"
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>${BACKUP_TYPES[$type]}</td>
            <td>${backup_date:-Never}</td>
            <td>${backup_size:-N/A}</td>
            <td class="$backup_status">$status_text</td>
            <td>${RETENTION[daily]} días</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Espacio en Disco</h2>
    <pre>
$(df -h "$BACKUP_DIR")
    </pre>
    
    <h2>Log de Operaciones</h2>
    <pre>
$(tail -n 20 "$LOG_DIR/backup_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local type="$2"
    local file="$3"
    
    # Crear directorios necesarios
    mkdir -p "$BACKUP_DIR" "$LOG_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "backup")
            if [ "$type" = "all" ]; then
                backup_database
                backup_files
                backup_config
                backup_logs
            else
                case "$type" in
                    "db")
                        backup_database
                        ;;
                    "files")
                        backup_files
                        ;;
                    "config")
