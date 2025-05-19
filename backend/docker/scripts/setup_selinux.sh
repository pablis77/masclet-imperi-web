#!/bin/bash
# Script para configurar políticas SELinux para Masclet Imperi
# Ubicación: backend/docker/scripts/setup_selinux.sh

set -e

# Configuración
LOG_FILE="/logs/selinux_setup.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_FILE"
}

# Verificar si SELinux está disponible
check_selinux() {
    if ! command -v semanage &> /dev/null; then
        log_message "ERROR" "SELinux no está instalado"
        return 1
    fi
    
    if [ "$(getenforce)" = "Disabled" ]; then
        log_message "ERROR" "SELinux está desactivado"
        return 1
    fi
    
    return 0
}

# Configurar contextos de directorio
setup_directory_contexts() {
    log_message "INFO" "Configurando contextos de directorios..."
    
    # Directorios de aplicación
    semanage fcontext -a -t httpd_sys_content_t "/app(/.*)?"
    semanage fcontext -a -t httpd_sys_rw_content_t "/app/uploads(/.*)?"
    
    # Directorios de logs
    semanage fcontext -a -t httpd_log_t "/logs(/.*)?"
    semanage fcontext -a -t auditd_log_t "/logs/audit(/.*)?"
    
    # Directorios de datos
    semanage fcontext -a -t httpd_sys_rw_content_t "/app/data(/.*)?"
    semanage fcontext -a -t postgresql_db_t "/var/lib/postgresql/data(/.*)?"
    
    # Aplicar contextos
    restorecon -Rv /app /logs /var/lib/postgresql
    
    log_message "INFO" "Contextos de directorios configurados"
}

# Configurar puertos
setup_ports() {
    log_message "INFO" "Configurando puertos..."
    
    # Puerto API FastAPI
    semanage port -a -t http_port_t -p tcp 8000
    
    # Puerto PostgreSQL
    semanage port -m -t postgresql_port_t -p tcp 5432
    
    log_message "INFO" "Puertos configurados"
}

# Configurar políticas personalizadas
setup_custom_policies() {
    log_message "INFO" "Configurando políticas personalizadas..."
    
    # Permitir conexiones de red para FastAPI
    setsebool -P httpd_can_network_connect 1
    
    # Permitir conexiones a PostgreSQL
    setsebool -P httpd_can_network_connect_db 1
    
    # Permitir envío de correo
    setsebool -P httpd_can_sendmail 1
    
    log_message "INFO" "Políticas personalizadas configuradas"
}

# Configurar políticas de usuarios
setup_user_policies() {
    log_message "INFO" "Configurando políticas de usuarios..."
    
    # Usuario de aplicación
    semanage user -a -R "staff_r system_r" -s "staff_u" masclet_u
    
    # Mapeo de usuarios
    semanage login -a -s masclet_u masclet
    
    log_message "INFO" "Políticas de usuarios configuradas"
}

# Configurar reglas de transición
setup_transitions() {
    log_message "INFO" "Configurando reglas de transición..."
    
    # Scripts de mantenimiento
    semanage fcontext -a -t bin_t "/app/scripts/.*\.sh"
    
    # Archivos temporales
    semanage fcontext -a -t tmp_t "/tmp/masclet(/.*)?"
    
    log_message "INFO" "Reglas de transición configuradas"
}

# Verificar configuración
verify_setup() {
    log_message "INFO" "Verificando configuración..."
    
    local errors=0
    
    # Verificar contextos
    if ! ls -Z /app &>/dev/null; then
        log_message "ERROR" "Contexto de /app incorrecto"
        ((errors++))
    fi
    
    # Verificar políticas
    if ! getsebool httpd_can_network_connect | grep -q "on$"; then
        log_message "ERROR" "Política httpd_can_network_connect no activada"
        ((errors++))
    fi
    
    # Verificar puertos
    if ! semanage port -l | grep -q "8000.*http_port_t"; then
        log_message "ERROR" "Puerto 8000 no configurado correctamente"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        log_message "SUCCESS" "Verificación completada exitosamente"
        return 0
    else
        log_message "ERROR" "Se encontraron $errors errores"
        return 1
    fi
}

# Generar reporte
generate_report() {
    local report_file="/logs/selinux_report_${TIMESTAMP}.txt"
    log_message "INFO" "Generando reporte en $report_file"
    
    {
        echo "=== Reporte SELinux ==="
        echo "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        echo "Estado SELinux:"
        sestatus
        echo
        echo "Contextos:"
        ls -Z /app /logs /var/lib/postgresql/data
        echo
        echo "Políticas Activas:"
        getsebool -a | grep "on$"
        echo
        echo "Puertos:"
        semanage port -l | grep -E "8000|5432"
    } > "$report_file"
    
    log_message "INFO" "Reporte generado"
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración de SELinux..."
    
    # Verificar SELinux
    if ! check_selinux; then
        log_message "ERROR" "No se puede continuar sin SELinux"
        exit 1
    fi
    
    # Ejecutar configuraciones
    setup_directory_contexts
    setup_ports
    setup_custom_policies
    setup_user_policies
    setup_transitions
    
    # Verificar configuración
    if ! verify_setup; then
        log_message "ERROR" "La verificación falló"
        exit 1
    fi
    
    # Generar reporte
    generate_report
    
    log_message "SUCCESS" "Configuración de SELinux completada"
}

# Manejo de errores
trap 'log_message "ERROR" "Error en línea $LINENO: $BASH_COMMAND"' ERR

# Verificar root
if [ "$(id -u)" != "0" ]; then
    log_message "ERROR" "Este script debe ejecutarse como root"
    exit 1
fi

# Ejecutar script
main "$@"