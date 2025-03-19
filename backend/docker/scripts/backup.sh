#!/bin/bash
# Script principal de backup
# Ubicación: backend/docker/scripts/backup.sh

set -e

# Configuración
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="/logs/backup.log"
BACKUP_DIR="/backups"
CONFIG_FILE="/app/.env"
HEALTHCHECK_FILE="/tmp/backup_health"
RETENTION_DAYS=7

# Cargar variables de entorno
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Error: No se encuentra archivo de configuración" | tee -a "$LOG_FILE"
    exit 1
fi

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Función de notificación
notify() {
    if [ "${NOTIFY_ON_SUCCESS:-false}" = "true" ] || [ "$2" != "success" ]; then
        /usr/local/bin/notify.sh "$1" "$3" "$2"
    fi
}

# Verificar espacio disponible
check_disk_space() {
    log_message "💾 Verificando espacio en disco..."
    
    local min_space=5120  # 5GB en MB
    local available
    available=$(df -m "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    
    if [ "$available" -lt "$min_space" ]; then
        log_message "❌ Error: Espacio insuficiente (${available}MB)"
        notify "Error en Backup" "error" "Espacio insuficiente en disco: ${available}MB"
        return 1
    fi
    
    log_message "✅ Espacio suficiente: ${available}MB"
    return 0
}

# Verificar base de datos
check_database() {
    log_message "🔍 Verificando conexión a base de datos..."
    
    if PGPASSWORD="${POSTGRES_PASSWORD}" pg_isready -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" > /dev/null 2>&1; then
        log_message "✅ Conexión establecida"
        return 0
    else
        log_message "❌ Error: No se puede conectar a la base de datos"
        notify "Error en Backup" "error" "No se puede conectar a la base de datos"
        return 1
    fi
}

# Realizar backup
perform_backup() {
    log_message "📦 Iniciando backup..."
    
    local backup_file="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
    local start_time
    start_time=$(date +%s)
    
    # Crear backup
    if PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" \
        -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
        -F p -b > "${backup_file}"; then
        
        # Comprimir backup
        gzip -9 "${backup_file}"
        local end_time
        end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        # Verificar tamaño
        local size
        size=$(stat -f%z "${backup_file}.gz" 2>/dev/null || stat -c%s "${backup_file}.gz")
        local min_size=${MIN_BACKUP_SIZE:-1048576}  # 1MB por defecto
        
        if [ "$size" -lt "$min_size" ]; then
            log_message "❌ Error: Backup demasiado pequeño (${size} bytes)"
            rm "${backup_file}.gz"
            notify "Error en Backup" "error" "Backup demasiado pequeño: ${size} bytes"
            return 1
        fi
        
        log_message "✅ Backup completado en ${duration}s (${size} bytes)"
        return 0
    else
        log_message "❌ Error al crear backup"
        notify "Error en Backup" "error" "Error al crear backup de la base de datos"
        return 1
    fi
}

# Rotar backups antiguos
rotate_backups() {
    log_message "🔄 Rotando backups antiguos..."
    
    local retention_days=${BACKUP_RETENTION_DAYS:-$RETENTION_DAYS}
    
    find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -mtime "+${retention_days}" -delete
    
    log_message "✅ Rotación completada"
    return 0
}

# Validar backup
validate_backup() {
    log_message "🔬 Validando último backup..."
    
    local latest_backup
    latest_backup=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d" ")
    
    if [ -z "$latest_backup" ]; then
        log_message "❌ Error: No se encuentra backup para validar"
        return 1
    fi
    
    if ! /usr/local/bin/test-backup.sh "$latest_backup"; then
        log_message "❌ Error: Falló la validación del backup"
        notify "Error en Backup" "error" "Falló la validación del backup"
        return 1
    fi
    
    log_message "✅ Backup validado correctamente"
    return 0
}

# Actualizar healthcheck
update_healthcheck() {
    echo "$TIMESTAMP" > "$HEALTHCHECK_FILE"
}

# Función principal
main() {
    log_message "🚀 Iniciando proceso de backup..."
    
    # Array de pasos
    declare -a steps=(
        "check_disk_space"
        "check_database"
        "perform_backup"
        "validate_backup"
        "rotate_backups"
    )
    
    # Ejecutar pasos
    for step in "${steps[@]}"; do
        if ! $step; then
            update_healthcheck
            exit 1
        fi
    done
    
    # Notificar éxito
    notify "Backup Completado" "success" "Backup realizado y validado correctamente"
    
    # Actualizar healthcheck
    update_healthcheck
    
    log_message "✅ Proceso completado exitosamente"
    exit 0
}

# Manejo de señales
trap cleanup EXIT
cleanup() {
    local rc=$?
    
    if [ $rc -ne 0 ]; then
        log_message "❌ Script interrumpido con código $rc"
        notify "Error en Backup" "error" "Proceso interrumpido con código $rc"
    fi
    
    update_healthcheck
    exit $rc
}

# Ejecutar script
main "$@"