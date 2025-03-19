#!/bin/bash
# Script de inicialización del sistema de mantenimiento
# Ubicación: backend/docker/scripts/init_maintenance.sh

set -e

# Configuración
INIT_DIR="/app/init"
LOG_DIR="/logs/init"
CONFIG_DIR="/app/config/init"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Dependencias requeridas
declare -A REQUIRED_PACKAGES=(
    ["base"]="curl wget tar gzip"
    ["monitoring"]="htop sysstat iotop"
    ["network"]="net-tools netcat-openbsd"
    ["security"]="acl setfacl"
    ["backup"]="rsync"
)

# Variables de entorno requeridas
declare -A REQUIRED_ENV=(
    ["database"]="POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD"
    ["app"]="APP_SECRET_KEY APP_DEBUG APP_ENV"
    ["mail"]="SMTP_HOST SMTP_PORT SMTP_USER"
    ["backup"]="BACKUP_DIR BACKUP_RETENTION"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/init_${TIMESTAMP}.log"
}

# Verificar sistema operativo
check_system() {
    log_message "INFO" "Verificando sistema operativo..."
    
    # Verificar que estamos en Linux
    if [ "$(uname)" != "Linux" ]; then
        log_message "ERROR" "Este script requiere Linux"
        return 1
    fi
    
    # Verificar versión mínima del kernel
    local kernel_version
    kernel_version=$(uname -r | cut -d. -f1)
    if [ "$kernel_version" -lt 4 ]; then
        log_message "ERROR" "Se requiere kernel 4.0 o superior"
        return 1
    fi
    
    # Verificar espacio en disco
    local free_space
    free_space=$(df -m / | awk 'NR==2 {print $4}')
    if [ "$free_space" -lt 1024 ]; then  # Mínimo 1GB libre
        log_message "ERROR" "Espacio insuficiente en disco"
        return 1
    }
    
    return 0
}

# Verificar dependencias
check_dependencies() {
    log_message "INFO" "Verificando dependencias..."
    local missing_deps=()
    
    # Verificar paquetes por categoría
    for category in "${!REQUIRED_PACKAGES[@]}"; do
        for package in ${REQUIRED_PACKAGES[$category]}; do
            if ! command -v "$package" >/dev/null 2>&1; then
                missing_deps+=("$package")
            fi
        done
    done
    
    # Instalar dependencias faltantes
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_message "WARNING" "Instalando dependencias faltantes: ${missing_deps[*]}"
        apt-get update && apt-get install -y "${missing_deps[@]}"
    fi
}

# Verificar variables de entorno
check_environment() {
    log_message "INFO" "Verificando variables de entorno..."
    local missing_vars=0
    
    for category in "${!REQUIRED_ENV[@]}"; do
        for var in ${REQUIRED_ENV[$category]}; do
            if [ -z "${!var}" ]; then
                log_message "ERROR" "Variable de entorno faltante: $var"
                ((missing_vars++))
            fi
        done
    done
    
    return $missing_vars
}

# Crear estructura de directorios
create_directory_structure() {
    log_message "INFO" "Creando estructura de directorios..."
    
    # Directorios base
    local base_dirs=(
        "$INIT_DIR"
        "$LOG_DIR"
        "$CONFIG_DIR"
        "/app/data"
        "/app/backups"
        "/app/monitoring"
        "/app/security"
        "/logs"
    )
    
    for dir in "${base_dirs[@]}"; do
        mkdir -p "$dir"
        chmod 750 "$dir"
    done
    
    # Directorios especiales con permisos específicos
    mkdir -p "/app/config/secrets" && chmod 700 "/app/config/secrets"
    mkdir -p "/app/ssl" && chmod 700 "/app/ssl"
}

# Configurar archivos base
setup_base_files() {
    log_message "INFO" "Configurando archivos base..."
    
    # Archivo de configuración principal
    cat > "$CONFIG_DIR/maintenance.yml" << EOF
maintenance:
    scheduling:
        backup: "0 2 * * *"        # 2 AM diario
        monitoring: "*/5 * * * *"  # Cada 5 minutos
        cleanup: "0 3 * * 0"       # 3 AM domingo
    
    thresholds:
        cpu_usage: 80
        memory_usage: 85
        disk_usage: 90
        backup_age: 7
    
    notifications:
        email: "admin@mascletimperi.com"
        telegram_chat: "-100xxxxxxxxxxxx"
        alert_levels: ["critical", "warning"]
    
    logging:
        level: "INFO"
        rotation: "weekly"
        compression: true
        retention: 30
EOF

    # Script de diagnóstico rápido
    cat > "$INIT_DIR/quick_check.sh" << 'EOF'
#!/bin/bash
echo "Estado del Sistema:"
echo "==================="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "Memoria: $(free -m | awk '/Mem:/ {printf "%.2f%%", $3/$2*100}')"
echo "Disco: $(df -h / | awk 'NR==2 {print $5}')"
echo "Procesos: $(ps aux | wc -l)"
echo "Conexiones: $(netstat -an | wc -l)"
EOF
    chmod +x "$INIT_DIR/quick_check.sh"
}

# Configurar permisos iniciales
setup_initial_permissions() {
    log_message "INFO" "Configurando permisos iniciales..."
    
    # Usuario y grupo del sistema
    groupadd -f masclet
    useradd -r -g masclet -s /sbin/nologin masclet 2>/dev/null || true
    
    # Permisos base
    chown -R masclet:masclet "/app"
    chown -R masclet:masclet "/logs"
    
    # ACLs base
    setfacl -R -d -m g:masclet:rwx "/app/data"
    setfacl -R -d -m g:masclet:rx "/logs"
}

# Generar documentación inicial
generate_initial_documentation() {
    local docs_dir="$INIT_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/README.md" << EOF
# Sistema de Mantenimiento

## Estructura del Sistema
- /app/: Directorio principal de la aplicación
  - /app/data/: Datos de la aplicación
  - /app/backups/: Respaldos del sistema
  - /app/config/: Configuración
  - /app/monitoring/: Datos de monitorización
- /logs/: Logs del sistema

## Dependencias Instaladas
$(for category in "${!REQUIRED_PACKAGES[@]}"; do
    echo "### $category"
    echo "${REQUIRED_PACKAGES[$category]}"
    echo
done)

## Variables de Entorno
$(for category in "${!REQUIRED_ENV[@]}"; do
    echo "### $category"
    echo "${REQUIRED_ENV[$category]}"
    echo
done)

## Mantenimiento
- Respaldos: Diarios a las 2 AM
- Monitorización: Cada 5 minutos
- Limpieza: Domingos a las 3 AM

## Diagnóstico Rápido
Ejecutar: $INIT_DIR/quick_check.sh
EOF
}

# Verificar configuración
verify_initialization() {
    log_message "INFO" "Verificando inicialización..."
    local issues=0
    
    # Verificar directorios críticos
    for dir in "/app" "/logs" "/app/config" "/app/data"; do
        if [ ! -d "$dir" ]; then
            log_message "ERROR" "Directorio crítico no encontrado: $dir"
            ((issues++))
        fi
    done
    
    # Verificar archivos de configuración
    if [ ! -f "$CONFIG_DIR/maintenance.yml" ]; then
        log_message "ERROR" "Archivo de configuración principal no encontrado"
        ((issues++))
    fi
    
    # Verificar permisos críticos
    if ! getent group masclet >/dev/null; then
        log_message "ERROR" "Grupo masclet no encontrado"
        ((issues++))
    fi
    
    # Verificar script de diagnóstico
    if [ ! -x "$INIT_DIR/quick_check.sh" ]; then
        log_message "ERROR" "Script de diagnóstico no ejecutable"
        ((issues++))
    fi
    
    return $issues
}

# Función principal
main() {
    log_message "INFO" "Iniciando inicialización del sistema..."
    
    # Verificaciones iniciales
    check_system || {
        log_message "ERROR" "Verificación del sistema fallida"
        return 1
    }
    
    check_dependencies || {
        log_message "ERROR" "Verificación de dependencias fallida"
        return 1
    }
    
    check_environment || {
        log_message "ERROR" "Verificación de variables de entorno fallida"
        return 1
    }
    
    # Configuración inicial
    create_directory_structure
    setup_base_files
    setup_initial_permissions
    
    # Generar documentación
    generate_initial_documentation
    
    # Verificación final
    verify_initialization
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        log_message "SUCCESS" "Sistema inicializado correctamente"
        "$INIT_DIR/quick_check.sh"
    else
        log_message "ERROR" "Se encontraron $verify_status problemas en la inicialización"
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