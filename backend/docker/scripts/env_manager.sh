#!/bin/bash
# Script para gestión de variables de entorno
# Ubicación: backend/docker/scripts/env_manager.sh

set -e

# Configuración
ENV_DIR="/app/config/env"
BACKUP_DIR="/app/config/env/backups"
TEMPLATE_DIR="/app/config/env/templates"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Archivos de entorno por servicio
declare -A ENV_FILES=(
    ["api"]=".env.api"
    ["db"]=".env.db"
    ["backup"]=".env.backup"
    ["web"]=".env.web"
    ["monitoring"]=".env.monitoring"
)

# Variables requeridas por servicio
declare -A REQUIRED_VARS=(
    ["api"]="API_PORT API_HOST API_DEBUG LOG_LEVEL"
    ["db"]="POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD"
    ["backup"]="BACKUP_RETENTION BACKUP_SCHEDULE"
    ["web"]="NGINX_PORT SSL_ENABLED"
    ["monitoring"]="METRICS_ENABLED ALERT_EMAIL"
)

# Variables con valores predeterminados
declare -A DEFAULT_VALUES=(
    ["API_PORT"]="8000"
    ["API_HOST"]="0.0.0.0"
    ["API_DEBUG"]="false"
    ["LOG_LEVEL"]="INFO"
    ["POSTGRES_PORT"]="5432"
    ["NGINX_PORT"]="80"
    ["SSL_ENABLED"]="false"
    ["METRICS_ENABLED"]="true"
    ["BACKUP_RETENTION"]="7"
)

# Configuración de validación
declare -A VAR_PATTERNS=(
    ["*_PORT"]="^[0-9]{1,5}$"
    ["*_EMAIL"]="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    ["*_DEBUG"]="^(true|false)$"
    ["LOG_LEVEL"]="^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg"
}

# Validar variable
validate_var() {
    local name="$1"
    local value="$2"
    
    # Verificar si hay un patrón para este tipo de variable
    for pattern in "${!VAR_PATTERNS[@]}"; do
        if [[ "$name" =~ ${pattern/\*/.*} ]]; then
            if ! echo "$value" | grep -qE "${VAR_PATTERNS[$pattern]}"; then
                log_message "ERROR" "Valor inválido para $name: $value"
                return 1
            fi
        fi
    done
    
    return 0
}

# Cargar plantilla
load_template() {
    local service="$1"
    local env="$2"
    local template="$TEMPLATE_DIR/$service.$env.template"
    
    if [ ! -f "$template" ]; then
        log_message "ERROR" "Plantilla no encontrada: $template"
        return 1
    fi
    
    # Procesar plantilla
    while IFS='=' read -r name value; do
        # Ignorar líneas vacías y comentarios
        [[ -z "$name" || "$name" =~ ^# ]] && continue
        
        # Sustituir variables
        value=$(eval echo "$value")
        echo "$name=$value"
    done < "$template"
    
    return 0
}

# Generar archivo de entorno
generate_env() {
    local service="$1"
    local env="$2"
    log_message "INFO" "Generando entorno para $service en ambiente $env"
    
    local env_file="$ENV_DIR/$env/${ENV_FILES[$service]}"
    
    # Crear directorio si no existe
    mkdir -p "$(dirname "$env_file")"
    
    # Hacer backup si existe
    if [ -f "$env_file" ]; then
        mkdir -p "$BACKUP_DIR/$env"
        cp "$env_file" "$BACKUP_DIR/$env/$(basename "$env_file").${TIMESTAMP}"
    fi
    
    # Generar nuevo archivo
    {
        echo "# Configuración de entorno para $service"
        echo "# Generado: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "# Ambiente: $env"
        echo
        
        # Cargar desde plantilla
        load_template "$service" "$env"
        
        # Agregar valores por defecto para variables faltantes
        IFS=' ' read -ra required <<< "${REQUIRED_VARS[$service]}"
        for var in "${required[@]}"; do
            if ! grep -q "^$var=" "$env_file" 2>/dev/null; then
                if [ -n "${DEFAULT_VALUES[$var]}" ]; then
                    echo "$var=${DEFAULT_VALUES[$var]}"
                fi
            fi
        done
    } > "$env_file"
    
    log_message "SUCCESS" "Archivo de entorno generado: $env_file"
    return 0
}

# Validar archivo de entorno
validate_env() {
    local service="$1"
    local env_file="$2"
    log_message "INFO" "Validando entorno: $env_file"
    
    # Verificar existencia del archivo
    if [ ! -f "$env_file" ]; then
        log_message "ERROR" "Archivo no encontrado: $env_file"
        return 1
    fi
    
    # Verificar variables requeridas
    local missing=()
    IFS=' ' read -ra required <<< "${REQUIRED_VARS[$service]}"
    for var in "${required[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            missing+=("$var")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_message "ERROR" "Variables requeridas faltantes: ${missing[*]}"
        return 1
    fi
    
    # Validar valores
    while IFS='=' read -r name value; do
        # Ignorar líneas vacías y comentarios
        [[ -z "$name" || "$name" =~ ^# ]] && continue
        
        # Validar valor
        if ! validate_var "$name" "$value"; then
            return 1
        fi
    done < "$env_file"
    
    log_message "SUCCESS" "Validación exitosa: $env_file"
    return 0
}

# Aplicar archivo de entorno
apply_env() {
    local service="$1"
    local env="$2"
    log_message "INFO" "Aplicando entorno $env para $service"
    
    local env_file="$ENV_DIR/$env/${ENV_FILES[$service]}"
    
    # Validar archivo
    if ! validate_env "$service" "$env_file"; then
        return 1
    fi
    
    # Copiar al destino final
    cp "$env_file" "/app/$service/.env"
    
    # Recargar servicio si está corriendo
    if docker-compose ps "$service" | grep -q "Up"; then
        log_message "INFO" "Recargando servicio: $service"
        docker-compose restart "$service"
    fi
    
    return 0
}

# Mostrar variables de entorno
show_env() {
    local service="$1"
    local env="$2"
    
    if [ "$service" = "all" ]; then
        # Mostrar todas las variables
        for s in "${!ENV_FILES[@]}"; do
            echo "=== $s ==="
            show_env "$s" "$env"
            echo
        done
        return 0
    fi
    
    local env_file="$ENV_DIR/$env/${ENV_FILES[$service]}"
    if [ -f "$env_file" ]; then
        # Mostrar variables ocultando valores sensibles
        while IFS='=' read -r name value; do
            # Ignorar líneas vacías y comentarios
            [[ -z "$name" || "$name" =~ ^# ]] && continue
            
            # Ocultar valores sensibles
            if [[ "$name" =~ (PASSWORD|SECRET|KEY)$ ]]; then
                echo "$name=********"
            else
                echo "$name=$value"
            fi
        done < "$env_file"
    else
        log_message "ERROR" "Archivo no encontrado: $env_file"
        return 1
    fi
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local service="$2"
    local env="$3"
    
    # Crear directorios necesarios
    mkdir -p "$ENV_DIR" "$BACKUP_DIR" "$TEMPLATE_DIR"
    
    case "$action" in
        "generate")
            if [ -z "$service" ] || [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar servicio y ambiente"
                return 1
            fi
            generate_env "$service" "$env"
            ;;
        
        "validate")
            if [ -z "$service" ] || [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar servicio y ambiente"
                return 1
            fi
            validate_env "$service" "$ENV_DIR/$env/${ENV_FILES[$service]}"
            ;;
        
        "apply")
            if [ -z "$service" ] || [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar servicio y ambiente"
                return 1
            fi
            apply_env "$service" "$env"
            ;;
        
        "show")
            if [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar ambiente"
                return 1
            fi
            show_env "${service:-all}" "$env"
            ;;
        
        *)
            echo "Uso: $0 {generate|validate|apply|show} [servicio] [ambiente]"
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