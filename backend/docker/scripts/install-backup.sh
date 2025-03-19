#!/bin/bash
# Script de instalación del servicio de backup
# Ubicación: backend/docker/scripts/install-backup.sh

set -e

# Configuración
LOG_FILE="/logs/install.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Crear directorios necesarios
create_directories() {
    log_message "🗂️ Creando directorios..."
    
    local dirs=(
        "/app"
        "/backups"
        "/logs"
        "/etc/postfix/sasl"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_message "✅ Creado directorio: $dir"
        else
            log_message "ℹ️ Directorio ya existe: $dir"
        fi
    done
}

# Configurar permisos
set_permissions() {
    log_message "🔒 Configurando permisos..."
    
    # Archivos ejecutables
    chmod +x /usr/local/bin/backup.sh \
            /usr/local/bin/test-backup.sh \
            /usr/local/bin/notify.sh
    
    # Directorios
    chown -R postgres:postgres /app /backups /logs
    chmod 755 /app /backups /logs
    
    # Logs
    touch /logs/backup.log /logs/notifications.log /logs/test.log
    chown postgres:postgres /logs/*.log
    chmod 644 /logs/*.log
    
    log_message "✅ Permisos configurados"
}

# Configurar Postfix
setup_postfix() {
    log_message "📧 Configurando Postfix..."
    
    if [ ! -f "/etc/postfix/main.cf" ]; then
        log_message "❌ Error: No se encuentra configuración de Postfix"
        return 1
    fi
    
    # Crear archivos de configuración
    touch /etc/postfix/sasl_passwd
    touch /etc/postfix/header_checks
    
    # Generar mapas
    postmap /etc/postfix/sasl_passwd
    postmap /etc/postfix/header_checks
    
    # Configurar permisos
    chown root:postfix /etc/postfix/sasl_passwd*
    chmod 640 /etc/postfix/sasl_passwd*
    chmod 644 /etc/postfix/main.cf
    
    log_message "✅ Postfix configurado"
}

# Configurar logrotate
setup_logrotate() {
    log_message "📑 Configurando logrotate..."
    
    if [ ! -f "/etc/logrotate.d/backup" ]; then
        log_message "❌ Error: No se encuentra configuración de logrotate"
        return 1
    fi
    
    chmod 644 /etc/logrotate.d/backup
    mkdir -p /var/lib/logrotate
    touch /var/lib/logrotate/status
    
    log_message "✅ Logrotate configurado"
}

# Configurar zona horaria
setup_timezone() {
    log_message "🕒 Configurando zona horaria..."
    
    if [ -z "$TZ" ]; then
        TZ="Europe/Madrid"
    fi
    
    ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime
    echo "$TZ" > /etc/timezone
    
    log_message "✅ Zona horaria configurada: $TZ"
}

# Verificar instalación
verify_installation() {
    log_message "🔍 Verificando instalación..."
    
    local required_files=(
        "/usr/local/bin/backup.sh"
        "/usr/local/bin/test-backup.sh"
        "/usr/local/bin/notify.sh"
        "/etc/postfix/main.cf"
        "/etc/logrotate.d/backup"
        "/app/.env"
    )
    
    local required_dirs=(
        "/app"
        "/backups"
        "/logs"
        "/etc/postfix/sasl"
    )
    
    # Verificar archivos
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_message "❌ Error: No se encuentra archivo requerido: $file"
            return 1
        fi
    done
    
    # Verificar directorios
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_message "❌ Error: No se encuentra directorio requerido: $dir"
            return 1
        fi
    done
    
    # Verificar servicios
    if ! postfix status >/dev/null 2>&1; then
        log_message "❌ Error: Postfix no está funcionando"
        return 1
    fi
    
    log_message "✅ Verificación completada con éxito"
    return 0
}

# Función principal
main() {
    log_message "🚀 Iniciando instalación..."
    
    # Array de pasos
    declare -a steps=(
        "create_directories"
        "set_permissions"
        "setup_postfix"
        "setup_logrotate"
        "setup_timezone"
        "verify_installation"
    )
    
    # Ejecutar pasos
    for step in "${steps[@]}"; do
        if ! $step; then
            log_message "❌ Error en paso: $step"
            exit 1
        fi
    done
    
    log_message "✅ Instalación completada con éxito"
    exit 0
}

# Manejo de señales
trap cleanup EXIT
cleanup() {
    local rc=$?
    
    if [ $rc -ne 0 ]; then
        log_message "❌ Instalación interrumpida con código $rc"
    fi
    
    exit $rc
}

# Ejecutar script
main "$@"