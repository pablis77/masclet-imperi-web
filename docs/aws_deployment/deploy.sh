#!/bin/bash
# Script de despliegue automático para Masclet Imperi en AWS

# Variables de configuración
APP_DIR="/home/ec2-user/masclet-imperi"
BACKEND_DIR="$APP_DIR/backend"
BACKUP_DIR="$APP_DIR/backups"
LOG_DIR="$APP_DIR/logs"
VENV_DIR="$APP_DIR/venv"
GIT_REPO="https://github.com/usuario/masclet-imperi-web.git"
BRANCH="production"
DATE=$(date +%Y%m%d_%H%M%S)

# Función para registrar mensajes
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a $LOG_DIR/deploy.log
}

# Crear backup antes de actualizar
create_backup() {
    log "Creando backup de seguridad antes de actualizar..."
    cd $BACKEND_DIR
    python scripts/backup_database.py --tag pre_deploy_$DATE
    if [ $? -ne 0 ]; then
        log "⚠️ Error al crear backup. Abortando despliegue."
        exit 1
    fi
    log "✅ Backup creado correctamente."
}

# Detener el servidor
stop_server() {
    log "Deteniendo el servidor..."
    pkill -f gunicorn
    sleep 5
    log "✅ Servidor detenido."
}

# Actualizar código fuente
update_code() {
    log "Actualizando código fuente desde $BRANCH..."
    cd $APP_DIR
    
    # Guardar cambios locales si existen
    git stash
    
    # Actualizar código
    git pull origin $BRANCH
    
    if [ $? -ne 0 ]; then
        log "⚠️ Error al actualizar código. Abortando despliegue."
        exit 1
    fi
    log "✅ Código actualizado correctamente."
}

# Actualizar dependencias
update_dependencies() {
    log "Actualizando dependencias..."
    cd $BACKEND_DIR
    source $VENV_DIR/bin/activate
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        log "⚠️ Error al actualizar dependencias. Abortando despliegue."
        exit 1
    fi
    log "✅ Dependencias actualizadas correctamente."
}

# Aplicar migraciones
apply_migrations() {
    log "Aplicando migraciones de base de datos..."
    cd $BACKEND_DIR
    source $VENV_DIR/bin/activate
    python -m aerich upgrade
    if [ $? -ne 0 ]; then
        log "⚠️ Error al aplicar migraciones. Intentando restaurar backup..."
        python scripts/restore_database.py --latest
        exit 1
    fi
    log "✅ Migraciones aplicadas correctamente."
}

# Iniciar servidor
start_server() {
    log "Iniciando servidor..."
    cd $APP_DIR
    bash start-backend.sh
    sleep 5
    
    # Verificar que el servidor está funcionando
    if curl -s http://localhost:8000/api/v1/health | grep -q "ok"; then
        log "✅ Servidor iniciado correctamente."
    else
        log "⚠️ Error al iniciar servidor. Verificar logs."
        exit 1
    fi
}

# Ejecutar despliegue completo
main() {
    mkdir -p $LOG_DIR
    log "🚀 Iniciando despliegue de Masclet Imperi v$(date +%Y.%m.%d)"
    
    create_backup
    stop_server
    update_code
    update_dependencies
    apply_migrations
    start_server
    
    log "✅ Despliegue completado exitosamente."
}

# Ejecutar el script principal
main
