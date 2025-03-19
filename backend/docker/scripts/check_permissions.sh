#!/bin/bash
# Script para verificar y notificar errores en los permisos
# Ubicación: backend/docker/scripts/check_permissions.sh

set -e

# Configuración
LOG_FILE="/logs/permissions_check.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ALERT_FILE="/alerts/permissions_${TIMESTAMP}.json"

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_FILE"
}

# Enviar alerta
send_alert() {
    local severity="$1"
    local message="$2"
    
    cat > "$ALERT_FILE" << EOF
{
    "timestamp": "$(date +'%Y-%m-%d %H:%M:%S')",
    "severity": "$severity",
    "message": "$message",
    "type": "permissions"
}
EOF

    /usr/local/bin/notify.sh "Alerta de Permisos" "$severity" "$message"
}

# Verificar permisos de directorios
check_directory_permissions() {
    local directory="$1"
    local expected_owner="$2"
    local expected_group="$3"
    local expected_perms="$4"
    
    local actual_perms
    actual_perms=$(stat -c "%a" "$directory")
    local actual_owner
    actual_owner=$(stat -c "%U" "$directory")
    local actual_group
    actual_group=$(stat -c "%G" "$directory")
    
    if [[ "$actual_perms" != "$expected_perms" ]]; then
        send_alert "error" "Permisos incorrectos en $directory: $actual_perms (esperado: $expected_perms)"
        return 1
    fi
    
    if [[ "$actual_owner" != "$expected_owner" ]]; then
        send_alert "error" "Propietario incorrecto en $directory: $actual_owner (esperado: $expected_owner)"
        return 1
    fi
    
    if [[ "$actual_group" != "$expected_group" ]]; then
        send_alert "error" "Grupo incorrecto en $directory: $actual_group (esperado: $expected_group)"
        return 1
    fi
    
    return 0
}

# Verificar permisos de archivos críticos
check_critical_files() {
    local files=(
        "/app/scripts/maintenance.sh:750:masclet:masclet"
        "/app/scripts/alert_space.sh:750:masclet:masclet"
        "/app/config/credentials.env:600:root:root"
        "/etc/logrotate.d/masclet:644:root:root"
        "/etc/cron.d/maintenance:644:root:root"
    )
    
    for file_info in "${files[@]}"; do
        IFS=':' read -r file perms owner group <<< "$file_info"
        
        if [[ ! -f "$file" ]]; then
            send_alert "error" "Archivo crítico no encontrado: $file"
            continue
        fi
        
        local actual_perms
        actual_perms=$(stat -c "%a" "$file")
        if [[ "$actual_perms" != "$perms" ]]; then
            send_alert "error" "Permisos incorrectos en $file: $actual_perms (esperado: $perms)"
        fi
        
        local actual_owner
        actual_owner=$(stat -c "%U" "$file")
        if [[ "$actual_owner" != "$owner" ]]; then
            send_alert "error" "Propietario incorrecto en $file: $actual_owner (esperado: $owner)"
        fi
        
        local actual_group
        actual_group=$(stat -c "%G" "$file")
        if [[ "$actual_group" != "$group" ]]; then
            send_alert "error" "Grupo incorrecto en $file: $actual_group (esperado: $group)"
        fi
    done
}

# Verificar permisos especiales
check_special_permissions() {
    # Verificar SUID/SGID
    local suid_files
    suid_files=$(find /app -type f \( -perm -4000 -o -perm -2000 \))
    if [[ -n "$suid_files" ]]; then
        send_alert "warning" "Archivos con SUID/SGID encontrados: $suid_files"
    fi
    
    # Verificar world-writable
    local writable_files
    writable_files=$(find /app -type f -perm -0002)
    if [[ -n "$writable_files" ]]; then
        send_alert "error" "Archivos escribibles por todos encontrados: $writable_files"
    fi
}

# Verificar ACLs si están soportadas
check_acls() {
    if command -v getfacl &> /dev/null; then
        local files_with_acls
        files_with_acls=$(find /app -type f -exec getfacl {} \; 2>/dev/null | grep -l "^user:" || true)
        
        if [[ -n "$files_with_acls" ]]; then
            log_message "INFO" "Archivos con ACLs: $files_with_acls"
        fi
    fi
}

# Verificar usuarios y grupos
check_users() {
    if ! getent passwd masclet > /dev/null; then
        send_alert "error" "Usuario masclet no encontrado"
    fi
    
    if ! getent group masclet > /dev/null; then
        send_alert "error" "Grupo masclet no encontrado"
    fi
}

# Función principal
main() {
    log_message "INFO" "Iniciando verificación de permisos..."
    
    # Verificar directorios principales
    check_directory_permissions "/app" "masclet" "masclet" "750"
    check_directory_permissions "/logs" "masclet" "masclet" "750"
    check_directory_permissions "/backups" "masclet" "masclet" "750"
    check_directory_permissions "/app/scripts" "masclet" "masclet" "750"
    check_directory_permissions "/app/config" "root" "root" "755"
    
    # Verificaciones adicionales
    check_critical_files
    check_special_permissions
    check_acls
    check_users
    
    log_message "INFO" "Verificación de permisos completada"
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"' ERR

# Ejecutar script
main "$@"