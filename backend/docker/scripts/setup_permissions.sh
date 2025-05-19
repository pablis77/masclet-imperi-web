#!/bin/bash
# Script para configurar permisos del sistema
# Ubicación: backend/docker/scripts/setup_permissions.sh

set -e

# Configuración
PERMISSIONS_DIR="/app/permissions"
LOG_DIR="/logs/permissions"
CONFIG_DIR="/app/config/permissions"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Grupos del sistema
declare -A SYSTEM_GROUPS=(
    ["masclet_admin"]="Administradores del sistema"
    ["masclet_editor"]="Editores de contenido"
    ["masclet_user"]="Usuarios básicos"
    ["masclet_backup"]="Grupo de respaldo"
    ["masclet_monitor"]="Grupo de monitorización"
)

# Directorios a gestionar
declare -A MANAGED_DIRS=(
    ["/app"]="Directorio principal de la aplicación"
    ["/app/config"]="Configuraciones"
    ["/app/data"]="Datos de la aplicación"
    ["/app/backups"]="Respaldos"
    ["/logs"]="Logs del sistema"
    ["/var/lib/masclet"]="Datos persistentes"
)

# Mapeo de permisos por grupo
declare -A GROUP_PERMISSIONS=(
    ["masclet_admin"]="770"      # rwxrwx---
    ["masclet_editor"]="750"     # rwxr-x---
    ["masclet_user"]="550"       # r-xr-x---
    ["masclet_backup"]="740"     # rwxr-----
    ["masclet_monitor"]="540"    # r-xr-----
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/setup_${TIMESTAMP}.log"
}

# Crear grupos del sistema
create_system_groups() {
    log_message "INFO" "Creando grupos del sistema..."
    
    for group in "${!SYSTEM_GROUPS[@]}"; do
        if ! getent group "$group" >/dev/null; then
            groupadd "$group"
            log_message "SUCCESS" "Grupo creado: $group"
        else
            log_message "INFO" "Grupo ya existe: $group"
        fi
    done
}

# Configurar directorios base
setup_base_directories() {
    log_message "INFO" "Configurando directorios base..."
    
    for dir in "${!MANAGED_DIRS[@]}"; do
        # Crear directorio si no existe
        mkdir -p "$dir"
        
        # Establecer propietario y grupo base
        chown root:masclet_admin "$dir"
        
        # Establecer permisos base
        chmod 750 "$dir"
        
        log_message "SUCCESS" "Directorio configurado: $dir"
    done
}

# Configurar permisos específicos
setup_specific_permissions() {
    log_message "INFO" "Configurando permisos específicos..."
    
    # Permisos para directorio de logs
    chmod 760 "/logs"
    chown root:masclet_monitor "/logs"
    
    # Permisos para backups
    chmod 740 "/app/backups"
    chown root:masclet_backup "/app/backups"
    
    # Permisos para configuración
    chmod 750 "/app/config"
    chown root:masclet_admin "/app/config"
    
    # Permisos para datos
    chmod 770 "/app/data"
    chown root:masclet_editor "/app/data"
}

# Configurar ACLs
setup_acls() {
    log_message "INFO" "Configurando ACLs..."
    
    # Verificar si getfacl/setfacl están instalados
    if ! command -v setfacl >/dev/null; then
        log_message "ERROR" "setfacl no está instalado"
        return 1
    fi
    
    # Configurar ACLs para directorios principales
    for dir in "${!MANAGED_DIRS[@]}"; do
        # Permisos por defecto para nuevos archivos
        setfacl -R -d -m g:masclet_admin:rwx "$dir"
        setfacl -R -d -m g:masclet_editor:rx "$dir"
        setfacl -R -d -m g:masclet_user:rx "$dir"
        
        # Aplicar ACLs a archivos existentes
        setfacl -R -m g:masclet_admin:rwx "$dir"
        setfacl -R -m g:masclet_editor:rx "$dir"
        setfacl -R -m g:masclet_user:rx "$dir"
    done
    
    # ACLs específicas para logs
    setfacl -R -m g:masclet_monitor:rx "/logs"
    setfacl -R -d -m g:masclet_monitor:rx "/logs"
    
    # ACLs específicas para backups
    setfacl -R -m g:masclet_backup:rwx "/app/backups"
    setfacl -R -d -m g:masclet_backup:rwx "/app/backups"
}

# Configurar sticky bits y bits especiales
setup_special_bits() {
    log_message "INFO" "Configurando bits especiales..."
    
    # Sticky bit para directorios compartidos
    chmod +t "/app/data"
    
    # SGID para mantener grupo en nuevos archivos
    chmod g+s "/app/data"
    chmod g+s "/logs"
    chmod g+s "/app/backups"
}

# Configurar permisos de scripts
setup_script_permissions() {
    log_message "INFO" "Configurando permisos de scripts..."
    
    # Scripts de sistema
    local system_scripts=(
        "/app/scripts/backup.sh"
        "/app/scripts/monitor.sh"
        "/app/scripts/maintenance.sh"
    )
    
    for script in "${system_scripts[@]}"; do
        if [ -f "$script" ]; then
            chmod 750 "$script"
            chown root:masclet_admin "$script"
        fi
    done
    
    # Scripts de respaldo
    find "/app/backups/scripts" -type f -name "*.sh" -exec chmod 750 {} \;
    find "/app/backups/scripts" -type f -name "*.sh" -exec chown root:masclet_backup {} \;
}

# Configurar permisos de archivos sensibles
setup_sensitive_files() {
    log_message "INFO" "Configurando permisos de archivos sensibles..."
    
    # Archivos de configuración
    local config_files=(
        "/app/config/.env"
        "/app/config/secrets.yml"
        "/app/config/credentials.json"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            chmod 600 "$file"
            chown root:root "$file"
        fi
    done
}

# Verificar permisos
verify_permissions() {
    log_message "INFO" "Verificando permisos..."
    local issues=0
    
    # Verificar grupos
    for group in "${!SYSTEM_GROUPS[@]}"; do
        if ! getent group "$group" >/dev/null; then
            log_message "ERROR" "Grupo no existe: $group"
            ((issues++))
        fi
    done
    
    # Verificar directorios y permisos
    for dir in "${!MANAGED_DIRS[@]}"; do
        if [ ! -d "$dir" ]; then
            log_message "ERROR" "Directorio no existe: $dir"
            ((issues++))
            continue
        fi
        
        # Verificar permisos
        local perms
        perms=$(stat -c "%a" "$dir")
        if [ "$perms" != "750" ] && [ "$perms" != "770" ] && [ "$perms" != "740" ]; then
            log_message "ERROR" "Permisos incorrectos en $dir: $perms"
            ((issues++))
        fi
    done
    
    return $issues
}

# Generar documentación
generate_documentation() {
    local docs_dir="$CONFIG_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/permissions.md" << EOF
# Sistema de Permisos

## Grupos del Sistema
$(for group in "${!SYSTEM_GROUPS[@]}"; do
    echo "### $group"
    echo "${SYSTEM_GROUPS[$group]}"
    echo
done)

## Directorios Gestionados
$(for dir in "${!MANAGED_DIRS[@]}"; do
    echo "### $dir"
    echo "${MANAGED_DIRS[$dir]}"
    echo "- Propietario: $(stat -c "%U:%G" "$dir")"
    echo "- Permisos: $(stat -c "%a" "$dir")"
    echo
done)

## ACLs Configuradas
\`\`\`bash
# Mostrar ACLs actuales
$(for dir in "${!MANAGED_DIRS[@]}"; do
    echo "# $dir"
    getfacl -p "$dir" 2>/dev/null || echo "No ACLs configuradas"
    echo
done)
\`\`\`

## Bits Especiales
- Sticky Bit: /app/data
- SGID: /app/data, /logs, /app/backups

## Archivos Sensibles
Los siguientes archivos tienen permisos 600 (solo root):
- /app/config/.env
- /app/config/secrets.yml
- /app/config/credentials.json
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración de permisos..."
    
    # Crear directorios base
    mkdir -p "$PERMISSIONS_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    # Configurar sistema
    create_system_groups
    setup_base_directories
    setup_specific_permissions
    setup_acls || log_message "WARNING" "ACLs no configuradas completamente"
    setup_special_bits
    setup_script_permissions
    setup_sensitive_files
    
    # Verificar configuración
    verify_permissions
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        # Generar documentación
        generate_documentation
        log_message "SUCCESS" "Sistema de permisos configurado correctamente"
    else
        log_message "ERROR" "Se encontraron $verify_status problemas en la configuración"
        return 1
    fi
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