#!/bin/bash
# Script para gestión de contenedores Docker
# Ubicación: backend/docker/scripts/docker_manager.sh

set -e

# Configuración
LOG_DIR="/logs/docker"
CONFIG_DIR="/app/config/docker"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Servicios del sistema
declare -A SERVICES=(
    ["api"]="masclet-api:latest"         # API FastAPI
    ["db"]="postgres:17"                 # Base de datos
    ["cache"]="redis:7-alpine"           # Cache Redis
    ["nginx"]="nginx:1.25-alpine"        # Servidor web
    ["backup"]="masclet-backup:latest"   # Servicio de backup
)

# Orden de arranque
START_ORDER=(
    "db"
    "cache"
    "api"
    "nginx"
    "backup"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/docker_${TIMESTAMP}.log"
}

# Verificar requisitos
check_requirements() {
    log_message "INFO" "Verificando requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_message "ERROR" "Docker no está instalado"
        return 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_message "ERROR" "Docker Compose no está instalado"
        return 1
    }
    
    # Verificar imágenes
    for service in "${!SERVICES[@]}"; do
        local image="${SERVICES[$service]}"
        if ! docker image inspect "$image" >/dev/null 2>&1; then
            log_message "ERROR" "Imagen no encontrada: $image"
            return 1
        fi
    done
    
    return 0
}

# Construir imágenes
build_images() {
    log_message "INFO" "Construyendo imágenes Docker..."
    
    # API
    docker build -t masclet-api:latest \
        -f Dockerfile \
        --build-arg VERSION="${TIMESTAMP}" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        .
    
    # Backup
    docker build -t masclet-backup:latest \
        -f Dockerfile.backup \
        --build-arg VERSION="${TIMESTAMP}" \
        .
    
    return 0
}

# Verificar salud del contenedor
check_container_health() {
    local container="$1"
    local retries=30
    local wait=2
    
    while [ "$retries" -gt 0 ]; do
        if [ "$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null)" = "healthy" ]; then
            return 0
        fi
        sleep "$wait"
        ((retries--))
    done
    
    return 1
}

# Arrancar servicios
start_services() {
    local service="$1"
    log_message "INFO" "Arrancando servicios: $service"
    
    if [ "$service" = "all" ]; then
        # Arrancar todos los servicios en orden
        for s in "${START_ORDER[@]}"; do
            start_services "$s"
        done
        return 0
    fi
    
    # Arrancar servicio específico
    local image="${SERVICES[$service]}"
    if [ -z "$image" ]; then
        log_message "ERROR" "Servicio no encontrado: $service"
        return 1
    fi
    
    docker-compose up -d "$service"
    
    # Verificar salud si es un servicio crítico
    case "$service" in
        "db"|"api")
            if ! check_container_health "$service"; then
                log_message "ERROR" "Servicio no saludable: $service"
                return 1
            fi
            ;;
    esac
    
    log_message "SUCCESS" "Servicio arrancado: $service"
    return 0
}

# Parar servicios
stop_services() {
    local service="$1"
    log_message "INFO" "Parando servicios: $service"
    
    if [ "$service" = "all" ]; then
        docker-compose down --remove-orphans
        return 0
    fi
    
    docker-compose stop "$service"
    return 0
}

# Reiniciar servicios
restart_services() {
    local service="$1"
    log_message "INFO" "Reiniciando servicios: $service"
    
    stop_services "$service" && start_services "$service"
    return $?
}

# Limpiar recursos Docker
cleanup_resources() {
    log_message "INFO" "Limpiando recursos Docker..."
    
    # Eliminar contenedores parados
    docker container prune -f
    
    # Eliminar imágenes sin uso
    docker image prune -f
    
    # Eliminar volúmenes sin uso
    docker volume prune -f
    
    # Eliminar redes sin uso
    docker network prune -f
    
    return 0
}

# Verificar volúmenes
check_volumes() {
    log_message "INFO" "Verificando volúmenes Docker..."
    
    # Listar volúmenes
    docker volume ls
    
    # Verificar espacio
    docker system df -v
    
    return 0
}

# Mostrar logs de contenedores
show_logs() {
    local service="$1"
    local lines="${2:-100}"
    
    if [ "$service" = "all" ]; then
        docker-compose logs --tail="$lines"
        return 0
    fi
    
    docker-compose logs --tail="$lines" "$service"
    return 0
}

# Mostrar estadísticas
show_stats() {
    log_message "INFO" "Mostrando estadísticas Docker..."
    
    # Uso de recursos
    docker stats --no-stream
    
    # Información del sistema
    docker system df
    
    return 0
}

# Función principal
main() {
    local action="$1"
    local target="${2:-all}"
    local extra_arg="$3"
    
    # Crear directorios necesarios
    mkdir -p "$LOG_DIR" "$CONFIG_DIR"
    
    # Verificar requisitos
    check_requirements || exit 1
    
    case "$action" in
        "build")
            build_images
            ;;
        
        "start")
            start_services "$target"
            ;;
        
        "stop")
            stop_services "$target"
            ;;
        
        "restart")
            restart_services "$target"
            ;;
        
        "cleanup")
            cleanup_resources
            ;;
        
        "volumes")
            check_volumes
            ;;
        
        "logs")
            show_logs "$target" "$extra_arg"
            ;;
        
        "stats")
            show_stats
            ;;
        
        *)
            echo "Uso: $0 {build|start|stop|restart|cleanup|volumes|logs|stats} [servicio] [args]"
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