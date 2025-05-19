#!/bin/bash
# Script de entrada para el servicio de backup
# Ubicación: backend/docker/scripts/entrypoint.sh

set -e

# Configuración
LOG_FILE="/logs/entrypoint.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

# Verificar directorios
check_directories() {
    log_message "🔍 Verificando directorios..."
    
    local dirs=("/backups" "/logs" "/app")
    local errors=0
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            log_message "❌ Error: No se encuentra el directorio $dir"
            ((errors++))
        else
            log_message "✅ Directorio $dir OK"
        fi
    done
    
    return $errors
}

# Verificar permisos
check_permissions() {
    log_message "🔒 Verificando permisos..."
    
    local files=(
        "/usr/local/bin/backup.sh"
        "/usr/local/bin/notify.sh"
        "/usr/local/bin/test-backup.sh"
        "/usr/local/bin/install-backup.sh"
    )
    
    local errors=0
    
    for file in "${files[@]}"; do
        if [[ ! -x "$file" ]]; then
            log_message "❌ Error: $file no es ejecutable"
            ((errors++))
        else
            log_message "✅ Permisos de $file OK"
        fi
    done
    
    return $errors
}

# Verificar configuración
check_config() {
    log_message "⚙️ Verificando configuración..."
    
    local files=(
        "/etc/postfix/main.cf"
        "/etc/cron.d/backup"
        "/app/.env"
    )
    
    local errors=0
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_message "❌ Error: No se encuentra el archivo $file"
            ((errors++))
        else
            log_message "✅ Archivo $file OK"
        fi
    done
    
    return $errors
}

# Configurar timezone
setup_timezone() {
    log_message "🕒 Configurando zona horaria..."
    
    if [[ -n "$TZ" ]]; then
        cp /usr/share/zoneinfo/$TZ /etc/localtime
        echo "$TZ" > /etc/timezone
        log_message "✅ Zona horaria configurada a $TZ"
    else
        log_message "⚠️ No se especificó zona horaria, usando default"
    fi
}

# Iniciar servicios
start_services() {
    log_message "🚀 Iniciando servicios..."
    
    # Iniciar Postfix
    postfix start
    log_message "✉️ Postfix iniciado"
    
    # Iniciar cron
    crond -f -d 8 &
    log_message "⏰ Cron iniciado"
}

# Ejecutar test inicial
run_initial_test() {
    log_message "🧪 Ejecutando test inicial..."
    
    if /usr/local/bin/test-backup.sh; then
        log_message "✅ Test inicial exitoso"
        return 0
    else
        log_message "❌ Test inicial falló"
        return 1
    fi
}

# Función principal
main() {
    log_message "🚀 Iniciando servicio de backup..."
    
    local errors=0
    
    # Verificaciones iniciales
    check_directories || ((errors++))
    check_permissions || ((errors++))
    check_config || ((errors++))
    
    # Si hay errores, salir
    if [[ $errors -gt 0 ]]; then
        log_message "❌ Se encontraron $errors errores durante la inicialización"
        exit 1
    fi
    
    # Configuración del sistema
    setup_timezone
    
    # Iniciar servicios
    start_services
    
    # Test inicial
    if ! run_initial_test; then
        log_message "⚠️ Test inicial falló, pero continuando..."
        /usr/local/bin/notify.sh "Warning: Test Inicial" "El test inicial del sistema de backup falló"
    fi
    
    log_message "✅ Servicio de backup iniciado exitosamente"
    
    # Mantener el contenedor ejecutándose
    exec "$@"
}

# Ejecutar script
main "$@"