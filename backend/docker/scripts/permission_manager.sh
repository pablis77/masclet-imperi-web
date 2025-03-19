#!/bin/bash
# Script para gestión de permisos y roles del sistema
# Ubicación: backend/docker/scripts/permission_manager.sh

set -e

# Configuración
PERMISSION_DIR="/app/permissions"
LOG_DIR="/logs/permissions"
REPORTS_DIR="/app/reports/permissions"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Roles del sistema
declare -A ROLES=(
    ["admin"]="Administrador"
    ["gerente"]="Gerente"
    ["editor"]="Editor"
    ["user"]="Usuario"
)

# Permisos por rol
declare -A ROLE_PERMISSIONS=(
    ["admin"]="consultar,actualizar,crear,gestionar_usuarios,gestionar_explotaciones,importar_datos,ver_estadisticas,exportar_datos"
    ["gerente"]="consultar,actualizar,crear,gestionar_explotaciones,ver_estadisticas,exportar_datos"
    ["editor"]="consultar,actualizar,ver_estadisticas"
    ["user"]="consultar"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/permissions_${TIMESTAMP}.log"
}

# Verificar permisos de usuario
check_user_permissions() {
    local username="$1"
    local action="$2"
    log_message "INFO" "Verificando permisos de $username para $action"
    
    # Obtener rol del usuario
    local user_role
    user_role=$(psql -t -c "SELECT role FROM users WHERE username = '$username';")
    user_role=$(echo "$user_role" | tr -d '[:space:]')
    
    if [ -z "$user_role" ]; then
        log_message "ERROR" "Usuario $username no encontrado"
        return 1
    fi
    
    # Verificar permisos
    local permissions="${ROLE_PERMISSIONS[$user_role]}"
    if [[ "$permissions" =~ $action ]]; then
        log_message "SUCCESS" "Usuario $username tiene permiso para $action"
        return 0
    else
        log_message "WARNING" "Usuario $username no tiene permiso para $action"
        return 1
    fi
}

# Asignar rol a usuario
assign_role() {
    local username="$1"
    local role="$2"
    log_message "INFO" "Asignando rol $role a $username"
    
    # Validar rol
    if [ -z "${ROLES[$role]}" ]; then
        log_message "ERROR" "Rol $role no válido"
        return 1
    fi
    
    # Actualizar rol
    if ! psql -c "UPDATE users SET role = '$role' WHERE username = '$username';"; then
        log_message "ERROR" "Error al asignar rol $role a $username"
        return 1
    fi
    
    log_message "SUCCESS" "Rol $role asignado a $username"
    return 0
}

# Listar permisos
list_permissions() {
    local role="$1"
    log_message "INFO" "Listando permisos${role:+ para rol $role}"
    
    if [ -n "$role" ]; then
        if [ -z "${ROLES[$role]}" ]; then
            log_message "ERROR" "Rol $role no válido"
            return 1
        fi
        echo "Permisos para rol $role:"
        echo "${ROLE_PERMISSIONS[$role]}" | tr ',' '\n'
    else
        echo "Permisos por rol:"
        for r in "${!ROLE_PERMISSIONS[@]}"; do
            echo "[$r]"
            echo "${ROLE_PERMISSIONS[$r]}" | tr ',' '\n'
            echo
        done
    fi
    
    return 0
}

# Verificar duplicidad de administradores
check_admin_duplicity() {
    log_message "INFO" "Verificando duplicidad de administradores..."
    
    local admin_count
    admin_count=$(psql -t -c "SELECT COUNT(*) FROM users WHERE role = 'admin';")
    admin_count=$(echo "$admin_count" | tr -d '[:space:]')
    
    if [ "$admin_count" -gt 1 ]; then
        log_message "ERROR" "Detectados múltiples administradores ($admin_count)"
        return 1
    fi
    
    log_message "SUCCESS" "Verificación de administradores OK"
    return 0
}

# Generar reporte de permisos
generate_permission_report() {
    local report_file="$REPORTS_DIR/permission_report_${TIMESTAMP}.html"
    log_message "INFO" "Generando reporte de permisos..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Permisos</title>
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
    <h1>Reporte de Permisos del Sistema</h1>
    <p>Generado: $(date +'%Y-%m-%d %H:%M:%S')</p>
    
    <h2>Roles y Permisos</h2>
    <table>
        <tr>
            <th>Rol</th>
            <th>Descripción</th>
            <th>Permisos</th>
            <th>Usuarios</th>
        </tr>
EOF
    
    # Añadir roles
    for role in "${!ROLES[@]}"; do
        local description="${ROLES[$role]}"
        local permissions="${ROLE_PERMISSIONS[$role]}"
        local user_count
        user_count=$(psql -t -c "SELECT COUNT(*) FROM users WHERE role = '$role';")
        user_count=$(echo "$user_count" | tr -d '[:space:]')
        
        cat >> "$report_file" << EOF
        <tr>
            <td>$role</td>
            <td>$description</td>
            <td>${permissions//,/<br>}</td>
            <td>$user_count</td>
        </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Usuarios por Rol</h2>
    <table>
        <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Último Acceso</th>
            <th>Estado</th>
        </tr>
EOF
    
    # Añadir usuarios
    psql -t -c "SELECT username, role, last_login, is_active FROM users;" | while read -r line; do
        if [ -n "$line" ]; then
            IFS='|' read -r username role last_login is_active <<< "$line"
            username=$(echo "$username" | tr -d '[:space:]')
            role=$(echo "$role" | tr -d '[:space:]')
            last_login=$(echo "$last_login" | tr -d '[:space:]')
            is_active=$(echo "$is_active" | tr -d '[:space:]')
            
            local status_class="success"
            local status_text="Activo"
            if [ "$is_active" != "t" ]; then
                status_class="error"
                status_text="Inactivo"
            fi
            
            cat >> "$report_file" << EOF
        <tr>
            <td>$username</td>
            <td>$role</td>
            <td>${last_login:-Never}</td>
            <td class="$status_class">$status_text</td>
        </tr>
EOF
        fi
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Log de Cambios</h2>
    <pre>
$(tail -n 20 "$LOG_DIR/permissions_${TIMESTAMP}.log")
    </pre>
</body>
</html>
EOF
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local arg1="$2"
    local arg2="$3"
    
    # Crear directorios necesarios
    mkdir -p "$PERMISSION_DIR" "$LOG_DIR" "$REPORTS_DIR"
    
    case "$action" in
        "check")
            if [ -n "$arg1" ] && [ -n "$arg2" ]; then
                check_user_permissions "$arg1" "$arg2"
            else
                check_admin_duplicity
            fi
            ;;
        
        "assign")
            if [ -n "$arg1" ] && [ -n "$arg2" ]; then
                assign_role "$arg1" "$arg2"
            else
                echo "Uso: $0 assign <username> <role>"
                return 1
            fi
            ;;
        
        "list")
            list_permissions "$arg1"
            ;;
        
        "report")
            check_admin_duplicity
            generate_permission_report
            ;;
        
        *)
            echo "Uso: $0 {check|assign|list|report} [args]"
            return 1
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