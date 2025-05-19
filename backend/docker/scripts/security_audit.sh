#!/bin/bash
# Script para realizar auditorías de seguridad programadas
# Ubicación: backend/docker/scripts/security_audit.sh

set -e

# Configuración
LOG_DIR="/logs/security"
REPORT_DIR="/reports/security"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ALERT_THRESHOLD=3

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/audit_${TIMESTAMP}.log"
}

# Enviar alerta
send_alert() {
    local severity="$1"
    local message="$2"
    local alert_file="$LOG_DIR/alerts/security_${TIMESTAMP}.json"
    
    mkdir -p "$(dirname "$alert_file")"
    
    cat > "$alert_file" << EOF
{
    "timestamp": "$(date +'%Y-%m-%d %H:%M:%S')",
    "severity": "$severity",
    "type": "security_audit",
    "message": "$message"
}
EOF

    # Enviar notificación
    /usr/local/bin/notify.sh "Alerta de Seguridad" "$severity" "$message"
}

# Verificar permisos sensibles
check_sensitive_permissions() {
    log_message "INFO" "Verificando permisos sensibles..."
    local issues=0
    
    # Archivos con permisos 777
    local world_writable
    world_writable=$(find /app /logs /backups -type f -perm -0002 -ls 2>/dev/null || true)
    if [ -n "$world_writable" ]; then
        send_alert "high" "Encontrados archivos con permisos world-writable"
        log_message "WARNING" "Archivos world-writable:\n$world_writable"
        ((issues++))
    fi
    
    # SUID/SGID binarios
    local suid_files
    suid_files=$(find /app -type f \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null || true)
    if [ -n "$suid_files" ]; then
        send_alert "high" "Encontrados archivos SUID/SGID"
        log_message "WARNING" "Archivos SUID/SGID:\n$suid_files"
        ((issues++))
    fi
    
    return $issues
}

# Verificar configuración de servicios
check_services_config() {
    log_message "INFO" "Verificando configuración de servicios..."
    local issues=0
    
    # PostgreSQL
    if [ -f "/var/lib/postgresql/data/pg_hba.conf" ]; then
        if grep -q "trust" "/var/lib/postgresql/data/pg_hba.conf"; then
            send_alert "high" "PostgreSQL usando método trust"
            ((issues++))
        fi
    fi
    
    # Redis (si está instalado)
    if command -v redis-cli &>/dev/null; then
        if ! redis-cli CONFIG GET requirepass | grep -q "."; then
            send_alert "high" "Redis sin contraseña configurada"
            ((issues++))
        fi
    fi
    
    return $issues
}

# Verificar certificados SSL
check_ssl_certificates() {
    log_message "INFO" "Verificando certificados SSL..."
    local issues=0
    
    find /etc/ssl/certs -type f -name "*.pem" -o -name "*.crt" | while read -r cert; do
        local expiry
        expiry=$(openssl x509 -enddate -noout -in "$cert" | cut -d= -f2)
        local expiry_epoch
        expiry_epoch=$(date -d "$expiry" +%s)
        local now_epoch
        now_epoch=$(date +%s)
        local days_left
        days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
        
        if [ "$days_left" -lt 30 ]; then
            send_alert "medium" "Certificado próximo a expirar: $cert ($days_left días)"
            ((issues++))
        fi
    done
    
    return $issues
}

# Verificar archivos de configuración
check_config_files() {
    log_message "INFO" "Verificando archivos de configuración..."
    local issues=0
    
    # Archivos de configuración con credenciales
    local files_to_check=(
        "/app/config/credentials.env"
        "/app/config/secrets.env"
        "/app/config/db.conf"
    )
    
    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ]; then
            local perms
            perms=$(stat -c "%a" "$file")
            if [ "$perms" != "600" ]; then
                send_alert "high" "Archivo de credenciales con permisos incorrectos: $file ($perms)"
                ((issues++))
            fi
        fi
    done
    
    return $issues
}

# Verificar usuarios y grupos
check_users_groups() {
    log_message "INFO" "Verificando usuarios y grupos..."
    local issues=0
    
    # Verificar usuario de aplicación
    if ! id masclet &>/dev/null; then
        send_alert "medium" "Usuario masclet no existe"
        ((issues++))
    else
        # Verificar grupos
        if ! groups masclet | grep -q "masclet"; then
            send_alert "medium" "Usuario masclet no pertenece al grupo masclet"
            ((issues++))
        fi
    fi
    
    return $issues
}

# Generar reporte
generate_report() {
    local total_issues="$1"
    local report_file="$REPORT_DIR/audit_${TIMESTAMP}.html"
    
    mkdir -p "$(dirname "$report_file")"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Auditoría de Seguridad</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .high { color: red; }
        .medium { color: orange; }
        .low { color: yellow; }
    </style>
</head>
<body>
    <h1>Reporte de Auditoría de Seguridad</h1>
    <p>Fecha: $(date +'%Y-%m-%d %H:%M:%S')</p>
    <h2>Resumen</h2>
    <p>Total de problemas encontrados: $total_issues</p>
    
    <h2>Detalles</h2>
    <pre>$(cat "$LOG_DIR/audit_${TIMESTAMP}.log")</pre>
    
    <h2>Estado del Sistema</h2>
    <pre>$(df -h /)</pre>
    
    <h2>Usuarios Activos</h2>
    <pre>$(who)</pre>
</body>
</html>
EOF

    log_message "INFO" "Reporte generado: $report_file"
}

# Función principal
main() {
    local total_issues=0
    
    # Crear directorios necesarios
    mkdir -p "$LOG_DIR" "$REPORT_DIR"
    
    log_message "INFO" "Iniciando auditoría de seguridad..."
    
    # Ejecutar verificaciones
    check_sensitive_permissions
    total_issues=$((total_issues + $?))
    
    check_services_config
    total_issues=$((total_issues + $?))
    
    check_ssl_certificates
    total_issues=$((total_issues + $?))
    
    check_config_files
    total_issues=$((total_issues + $?))
    
    check_users_groups
    total_issues=$((total_issues + $?))
    
    # Generar reporte
    generate_report "$total_issues"
    
    # Enviar alerta si hay demasiados problemas
    if [ "$total_issues" -gt "$ALERT_THRESHOLD" ]; then
        send_alert "critical" "Encontrados $total_issues problemas de seguridad"
    fi
    
    log_message "INFO" "Auditoría completada. Total problemas: $total_issues"
    return "$total_issues"
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