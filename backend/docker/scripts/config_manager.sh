#!/bin/bash
# Script para gestión de configuraciones del sistema
# Ubicación: backend/docker/scripts/config_manager.sh

set -e

# Configuración
CONFIG_DIR="/app/config"
BACKUP_DIR="/app/config/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Archivos de configuración
declare -A CONFIG_FILES=(
    ["app"]="app.env"
    ["db"]="db.env"
    ["api"]="api.env"
    ["logging"]="logging.env"
    ["security"]="security.env"
)

# Variables requeridas por ambiente
declare -A REQUIRED_VARS=(
    ["development"]="DEBUG=1 LOG_LEVEL=DEBUG DB_HOST=localhost"
    ["staging"]="DEBUG=0 LOG_LEVEL=INFO DB_HOST=db"
    ["production"]="DEBUG=0 LOG_LEVEL=WARNING DB_HOST=db"
)

# Valores por defecto
declare -A DEFAULT_VALUES=(
    ["PORT"]="8000"
    ["DB_PORT"]="5432"
    ["LOG_ROTATION"]="1 week"
    ["MAX_CONNECTIONS"]="100"
    ["TIMEOUT"]="30"
    ["RETRY_LIMIT"]="3"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg"
}

# Validar configuración
validate_config() {
    local env="$1"
    local config_file="$2"
    log_message "INFO" "Validando configuración para ambiente: $env"
    
    # Verificar variables requeridas
    IFS=' ' read -ra required <<< "${REQUIRED_VARS[$env]}"
    local missing=()
    
    for var in "${required[@]}"; do
        local name="${var%%=*}"
        if ! grep -q "^$name=" "$config_file" 2>/dev/null; then
            missing+=("$name")
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
        
        # Validar según tipo
        case "$name" in
            *PORT)
                if ! [[ "$value" =~ ^[0-9]+$ ]] || [ "$value" -lt 1 ] || [ "$value" -gt 65535 ]; then
                    log_message "ERROR" "Puerto inválido: $name=$value"
                    return 1
                fi
                ;;
            *TIMEOUT)
                if ! [[ "$value" =~ ^[0-9]+$ ]]; then
                    log_message "ERROR" "Timeout inválido: $name=$value"
                    return 1
                fi
                ;;
            DEBUG)
                if ! [[ "$value" =~ ^[01]$ ]]; then
                    log_message "ERROR" "Valor DEBUG inválido: $value"
                    return 1
                fi
                ;;
            LOG_LEVEL)
                if ! [[ "$value" =~ ^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$ ]]; then
                    log_message "ERROR" "Nivel de log inválido: $value"
                    return 1
                fi
                ;;
        esac
    done < "$config_file"
    
    return 0
}

# Generar configuración
generate_config() {
    local env="$1"
    local output_dir="$CONFIG_DIR/$env"
    log_message "INFO" "Generando configuración para ambiente: $env"
    
    # Crear directorios
    mkdir -p "$output_dir"
    
    # Generar archivos de configuración
    for type in "${!CONFIG_FILES[@]}"; do
        local file="$output_dir/${CONFIG_FILES[$type]}"
        
        # Backup si existe
        if [ -f "$file" ]; then
            mkdir -p "$BACKUP_DIR/$env"
            cp "$file" "$BACKUP_DIR/$env/$(basename "$file").${TIMESTAMP}"
        fi
        
        # Generar nuevo archivo
        {
            echo "# Configuración generada para $type en ambiente $env"
            echo "# Generado: $(date +'%Y-%m-%d %H:%M:%S')"
            echo
            
            # Agregar variables requeridas
            IFS=' ' read -ra required <<< "${REQUIRED_VARS[$env]}"
            for var in "${required[@]}"; do
                echo "$var"
            done
            
            # Agregar valores por defecto
            for var in "${!DEFAULT_VALUES[@]}"; do
                if ! grep -q "^$var=" "$file" 2>/dev/null; then
                    echo "$var=${DEFAULT_VALUES[$var]}"
                fi
            done
        } > "$file"
        
        log_message "SUCCESS" "Generado archivo: $file"
    done
    
    return 0
}

# Aplicar configuración
apply_config() {
    local env="$1"
    local config_dir="$CONFIG_DIR/$env"
    log_message "INFO" "Aplicando configuración para ambiente: $env"
    
    # Verificar existencia de archivos
    for type in "${!CONFIG_FILES[@]}"; do
        local file="$config_dir/${CONFIG_FILES[$type]}"
        if [ ! -f "$file" ]; then
            log_message "ERROR" "No se encuentra archivo: $file"
            return 1
        fi
        
        # Validar configuración
        if ! validate_config "$env" "$file"; then
            log_message "ERROR" "Validación falló para: $file"
            return 1
        fi
    done
    
    # Aplicar configuración
    for type in "${!CONFIG_FILES[@]}"; do
        local file="$config_dir/${CONFIG_FILES[$type]}"
        # Cargar variables de entorno
        set -a
        source "$file"
        set +a
    done
    
    # Reiniciar servicios si es necesario
    if [ "$env" != "development" ]; then
        log_message "INFO" "Reiniciando servicios..."
        docker-compose restart
    fi
    
    return 0
}

# Mostrar configuración actual
show_config() {
    local env="${1:-current}"
    log_message "INFO" "Mostrando configuración para: $env"
    
    if [ "$env" = "current" ]; then
        # Mostrar variables actuales
        printenv | sort
    else
        # Mostrar configuración de ambiente
        local config_dir="$CONFIG_DIR/$env"
        if [ ! -d "$config_dir" ]; then
            log_message "ERROR" "Ambiente no encontrado: $env"
            return 1
        fi
        
        for type in "${!CONFIG_FILES[@]}"; do
            local file="$config_dir/${CONFIG_FILES[$type]}"
            if [ -f "$file" ]; then
                echo "=== $type ==="
                cat "$file"
                echo
            fi
        done
    fi
    
    return 0
}

# Exportar configuración
export_config() {
    local env="$1"
    local output="$2"
    log_message "INFO" "Exportando configuración de $env a $output"
    
    # Verificar ambiente
    local config_dir="$CONFIG_DIR/$env"
    if [ ! -d "$config_dir" ]; then
        log_message "ERROR" "Ambiente no encontrado: $env"
        return 1
    fi
    
    # Crear archivo de salida
    {
        echo "# Configuración exportada desde $env"
        echo "# Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
        echo
        
        for type in "${!CONFIG_FILES[@]}"; do
            local file="$config_dir/${CONFIG_FILES[$type]}"
            if [ -f "$file" ]; then
                echo "### $type ###"
                cat "$file"
                echo
            fi
        done
    } > "$output"
    
    log_message "SUCCESS" "Configuración exportada a: $output"
    return 0
}

# Función principal
main() {
    local action="$1"
    local env="$2"
    local extra_arg="$3"
    
    case "$action" in
        "generate")
            if [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar ambiente"
                return 1
            fi
            generate_config "$env"
            ;;
        
        "validate")
            if [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar ambiente"
                return 1
            fi
            validate_config "$env" "$CONFIG_DIR/$env"
            ;;
        
        "apply")
            if [ -z "$env" ]; then
                log_message "ERROR" "Debe especificar ambiente"
                return 1
            fi
            apply_config "$env"
            ;;
        
        "show")
            show_config "${env:-current}"
            ;;
        
        "export")
            if [ -z "$env" ] || [ -z "$extra_arg" ]; then
                log_message "ERROR" "Debe especificar ambiente y archivo de salida"
                return 1
            fi
            export_config "$env" "$extra_arg"
            ;;
        
        *)
            echo "Uso: $0 {generate|validate|apply|show|export} [ambiente] [archivo_salida]"
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