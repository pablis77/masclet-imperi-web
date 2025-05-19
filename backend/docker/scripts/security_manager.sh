#!/bin/bash
# Script para gestión de permisos y seguridad
# Ubicación: backend/docker/scripts/security_manager.sh

set -e

# Configuración
SECURITY_DIR="/app/config/security"
LOG_DIR="/logs/security"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Configuración de permisos por directorio
declare -A DIR_PERMS=(
    ["/app"]="755"                  # Directorio principal
    ["/app/data"]="750"            # Datos sensibles
    ["/app/logs"]="770"            # Logs del sistema
    ["/app/uploads"]="775"         # Archivos subidos
    ["/app/backups"]="700"         # Backups
    ["/app/config"]="750"          # Configuraciones
    ["/app/secrets"]="700"         # Secretos y claves
)

# Usuarios y grupos del sistema
declare -A SYSTEM_USERS=(
    ["api"]="www-data"
    ["db"]="postgres"
    ["backup"]="backup"
    ["monitor"]="monitor"
)

# Permisos especiales por archivo
declare -A FILE_PERMS=(
    [".env"]="600"
    ["*.key"]="600"
    ["*.pem"]="600"
    ["*.cert"]="600"
    ["*.conf"]="644"
    ["*.sh"]="755"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/security_${TIMESTAMP}.log"
}

# Verificar permisos
check_permissions() {
    local path="$1"
    local expected="$2"
    local current
    
    if [ ! -e "$path" ]; then
        log_message "ERROR" "Ruta no encontrada: $path"
        return 1
    fi
    
    current=$(stat -c "%a" "$path")
    if [ "$current" != "$expected" ]; then
        log_message "WARNING" "Permisos incorrectos en $path: esperado=$expected actual=$current"
        return 1
    fi
    
    return 0
}

# Aplicar permisos
apply_permissions() {
    log_message "INFO" "Aplicando permisos..."
    
    # Aplicar permisos por directorio
    for dir in "${!DIR_PERMS[@]}"; do
        if [ -d "$dir" ]; then
            chmod "${DIR_PERMS[$dir]}" "$dir"
            log_message "INFO" "Permisos aplicados a $dir: ${DIR_PERMS[$dir]}"
        fi
    done
    
    # Aplicar permisos especiales por tipo de archivo
    for pattern in "${!FILE_PERMS[@]}"; do
        find /app -type f -name "$pattern" -exec chmod "${FILE_PERMS[$pattern]}" {} \;
    done
    
    return 0
}

# Verificar usuarios y grupos
check_users() {
    log_message "INFO" "Verificando usuarios y grupos..."
    
    for user in "${!SYSTEM_USERS[@]}"; do
        if ! id "${SYSTEM_USERS[$user]}" &>/dev/null; then
            log_message "ERROR" "Usuario ${SYSTEM_USERS[$user]} no existe"
            return 1
        fi
    done
    
    return 0
}

# Verificar archivos sensibles
check_sensitive_files() {
    log_message "INFO" "Verificando archivos sensibles..."
    
    # Buscar archivos con permisos demasiado abiertos
    find /app -type f -perm /o+rwx -exec ls -l {} \; > "$LOG_DIR/sensitive_files_${TIMESTAMP}.log"
    
    # Buscar archivos de configuración con secretos
    grep -r -l "password\|secret\|key" /app/config/ >> "$LOG_DIR/sensitive_files_${TIMESTAMP}.log"
    
    return 0
}

# Realizar hardening del sistema
do_hardening() {
    log_message "INFO" "Realizando hardening del sistema..."
    
    # Configurar límites de sistema
    cat > /etc/security/limits.d/masclet.conf << EOF
*               soft    nofile          65535
*               hard    nofile          65535
*               soft    nproc           4096
*               hard    nproc           4096
EOF
    
    # Configurar sysctl
    cat > /etc/sysctl.d/99-masclet.conf << EOF
# Network protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Memory management
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2

# File system
fs.file-max = 65535
fs.inotify.max_user_watches = 524288
EOF
    
    # Aplicar cambios
    sysctl -p /etc/sysctl.d/99-masclet.conf
    
    return 0
}

# Generar reporte de seguridad
generate_security_report() {
    local report_file="$LOG_DIR/security_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de seguridad..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Seguridad</title>
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
    <h1>Reporte de Seguridad</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Permisos de Directorios</h2>
    <table>
        <tr>
            <th>Directorio</th>
            <th>Permisos Esperados</th>
            <th>Permisos Actuales</th>
            <th>Estado</th>
        </tr>
EOF
    
    # Verificar y añadir permisos de directorios
    for dir in "${!DIR_PERMS[@]}"; do
        local current_perm
        current_perm=$(stat -c "%a" "$dir" 2>/dev/null || echo "N/A")
        local status_class
        
        if [ "$current_perm" = "${DIR_PERMS[$dir]}" ]; then
            status_class="success"
            status_text="OK"
        else
            status_class="error"
            status_text="ERROR"
        fi
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$dir</td>
            <td>${DIR_PERMS[$dir]}</td>
            <td>$current_perm</td>
            <td class="$status_class">$status_text</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Archivos Sensibles</h2>
    <pre>
$(cat "$LOG_DIR/sensitive_files_${TIMESTAMP}.log")
    </pre>
    
    <h2>Log de Seguridad</h2>
    <pre>
$(cat "$LOG_DIR/security_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    
    # Crear directorios necesarios
    mkdir -p "$SECURITY_DIR" "$LOG_DIR"
    
    case "$action" in
        "check")
            log_message "INFO" "Iniciando verificación de seguridad..."
            check_permissions
            check_users
            check_sensitive_files
            generate_security_report
            ;;
        
        "apply")
            log_message "INFO" "Aplicando configuración de seguridad..."
            apply_permissions
            do_hardening
            generate_security_report
            ;;
        
        "report")
            log_message "INFO" "Generando reporte de seguridad..."
            check_sensitive_files
            generate_security_report
            ;;
        
        *)
            echo "Uso: $0 {check|apply|report}"
            exit 1
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