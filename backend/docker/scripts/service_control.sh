#!/bin/bash
# Script para control de servicios del sistema
# Ubicación: backend/docker/scripts/service_control.sh

set -e

# Configuración
SERVICE_DIR="/app/services"
LOG_DIR="/logs/services"
CONFIG_DIR="/app/config/services"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Servicios a gestionar
declare -A SERVICES=(
    ["api"]="masclet-api"
    ["db"]="masclet-db"
    ["redis"]="masclet-cache"
    ["nginx"]="masclet-web"
    ["worker"]="masclet-worker"
)

# Orden de arranque
START_ORDER=(
    "db"
    "redis"
    "api"
    "worker"
    "nginx"
)

# Orden de parada (inverso al arranque)
STOP_ORDER=($(echo "${START_ORDER[@]}" | tr ' ' '\n' | tac | tr '\n' ' '))

# Dependencias entre servicios
declare -A SERVICE_DEPS=(
    ["api"]="db,redis"
    ["worker"]="db,redis"
    ["nginx"]="api"
)

# Tiempos de espera
declare -A TIMEOUTS=(
    ["start"]="60"    # Segundos para arranque
    ["stop"]="30"     # Segundos para parada
    ["check"]="5"     # Segundos entre checks
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/service_${TIMESTAMP}.log"
}

# Verificar estado de servicio
check_service() {
    local service="$1"
    local container_name="${SERVICES[$service]}"
    
    if [ -z "$container_name" ]; then
        log_message "ERROR" "Servicio desconocido: $service"
        return 1
    fi
    
    local status
    status=$(docker container inspect -f '{{.State.Status}}' "$container_name" 2>/dev/null || echo "not_found")
    
    case "$status" in
        "running")
            return 0
            ;;
        "not_found")
            log_message "ERROR" "Contenedor no encontrado: $container_name"
            return 2
            ;;
        *)
            log_message "ERROR" "Estado inesperado ($status) para: $container_name"
            return 1
            ;;
    esac
}

# Arrancar servicio
start_service() {
    local service="$1"
    local container_name="${SERVICES[$service]}"
    log_message "INFO" "Arrancando servicio: $service ($container_name)"
    
    # Verificar dependencias
    if [ -n "${SERVICE_DEPS[$service]}" ]; then
        IFS=',' read -ra deps <<< "${SERVICE_DEPS[$service]}"
        for dep in "${deps[@]}"; do
            if ! check_service "$dep"; then
                log_message "ERROR" "Dependencia no disponible: $dep"
                return 1
            fi
        done
    fi
    
    # Arrancar contenedor
    docker-compose up -d "$container_name"
    
    # Esperar a que esté disponible
    local timeout="${TIMEOUTS[start]}"
    while [ "$timeout" -gt 0 ]; do
        if check_service "$service"; then
            log_message "SUCCESS" "Servicio arrancado: $service"
            return 0
        fi
        sleep "${TIMEOUTS[check]}"
        ((timeout-=TIMEOUTS[check]))
    done
    
    log_message "ERROR" "Timeout arrancando: $service"
    return 1
}

# Parar servicio
stop_service() {
    local service="$1"
    local container_name="${SERVICES[$service]}"
    log_message "INFO" "Parando servicio: $service ($container_name)"
    
    # Verificar si hay servicios dependientes
    for s in "${!SERVICE_DEPS[@]}"; do
        if [[ "${SERVICE_DEPS[$s]}" == *"$service"* ]] && check_service "$s"; then
            log_message "WARNING" "Parando servicio dependiente: $s"
            stop_service "$s"
        fi
    done
    
    # Parar contenedor
    docker-compose stop "$container_name"
    
    # Verificar que se ha parado
    local timeout="${TIMEOUTS[stop]}"
    while [ "$timeout" -gt 0 ]; do
        if ! check_service "$service"; then
            log_message "SUCCESS" "Servicio parado: $service"
            return 0
        fi
        sleep "${TIMEOUTS[check]}"
        ((timeout-=TIMEOUTS[check]))
    done
    
    log_message "ERROR" "Timeout parando: $service"
    return 1
}

# Reiniciar servicio
restart_service() {
    local service="$1"
    log_message "INFO" "Reiniciando servicio: $service"
    
    stop_service "$service" && start_service "$service"
    return $?
}

# Mostrar estado
show_status() {
    log_message "INFO" "Estado de los servicios:"
    
    printf "%-20s %-15s %-10s\n" "SERVICIO" "CONTENEDOR" "ESTADO"
    echo "------------------------------------------------"
    
    for service in "${!SERVICES[@]}"; do
        local container_name="${SERVICES[$service]}"
        local status
        if check_service "$service" >/dev/null 2>&1; then
            status="RUNNING"
        else
            status="STOPPED"
        fi
        printf "%-20s %-15s %-10s\n" "$service" "$container_name" "$status"
    done
}

# Realizar healthcheck
do_healthcheck() {
    log_message "INFO" "Realizando healthcheck..."
    local failed=0
    
    # Verificar servicios
    for service in "${START_ORDER[@]}"; do
        if ! check_service "$service"; then
            log_message "ERROR" "Healthcheck fallido para: $service"
            ((failed++))
        fi
    done
    
    # Verificar API
    if curl -f "http://localhost:8000/api/health" >/dev/null 2>&1; then
        log_message "SUCCESS" "API respondiendo correctamente"
    else
        log_message "ERROR" "API no responde"
        ((failed++))
    fi
    
    # Verificar DB
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        log_message "SUCCESS" "Base de datos respondiendo correctamente"
    else
        log_message "ERROR" "Base de datos no responde"
        ((failed++))
    fi
    
    return "$failed"
}

# Función principal
main() {
    local action="$1"
    local target="${2:-all}"
    
    # Crear directorios necesarios
    mkdir -p "$SERVICE_DIR" "$LOG_DIR" "$CONFIG_DIR"
    
    case "$action" in
        "start")
            if [ "$target" = "all" ]; then
                log_message "INFO" "Arrancando todos los servicios..."
                for service in "${START_ORDER[@]}"; do
                    start_service "$service"
                done
            else
                start_service "$target"
            fi
            ;;
        
        "stop")
            if [ "$target" = "all" ]; then
                log_message "INFO" "Parando todos los servicios..."
                for service in "${STOP_ORDER[@]}"; do
                    stop_service "$service"
                done
            else
                stop_service "$target"
            fi
            ;;
        
        "restart")
            if [ "$target" = "all" ]; then
                log_message "INFO" "Reiniciando todos los servicios..."
                for service in "${STOP_ORDER[@]}"; do
                    stop_service "$service"
                done
                for service in "${START_ORDER[@]}"; do
                    start_service "$service"
                done
            else
                restart_service "$target"
            fi
            ;;
        
        "status")
            show_status
            ;;
        
        "healthcheck")
            do_healthcheck
            ;;
        
        *)
            echo "Uso: $0 {start|stop|restart|status|healthcheck} [servicio]"
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