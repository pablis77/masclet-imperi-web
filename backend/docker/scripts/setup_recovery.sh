#!/bin/bash
# Script para configurar sistema de respaldo
# Ubicación: backend/docker/scripts/setup_recovery.sh

set -e

# Configuración
BACKUP_DIR="/app/backups"
LOG_DIR="/logs/backups"
CONFIG_DIR="/app/config/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Tipos de respaldo
declare -A BACKUP_TYPES=(
    ["full"]="Respaldo completo del sistema"
    ["db"]="Respaldo de base de datos"
    ["config"]="Respaldo de configuración"
    ["logs"]="Respaldo de logs"
)

# Configuración de retención
declare -A RETENTION=(
    ["daily"]="7"      # Días para respaldos diarios
    ["weekly"]="4"     # Semanas para respaldos semanales
    ["monthly"]="3"    # Meses para respaldos mensuales
    ["logs"]="30"      # Días para logs
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/setup_${TIMESTAMP}.log"
}

# Configurar estructura de directorios
setup_directories() {
    log_message "INFO" "Configurando estructura de directorios..."
    
    # Directorios principales
    mkdir -p "$BACKUP_DIR"/{full,db,config,logs}/{daily,weekly,monthly}
    mkdir -p "$LOG_DIR"
    mkdir -p "$CONFIG_DIR"
    
    # Permisos
    chmod 750 "$BACKUP_DIR" "$LOG_DIR" "$CONFIG_DIR"
}

# Configurar respaldo de base de datos
setup_db_backup() {
    log_message "INFO" "Configurando respaldo de base de datos..."
    
    cat > "$CONFIG_DIR/db_backup.yml" << EOF
database:
    host: localhost
    port: 5432
    name: masclet_imperi
    user: postgres
    password_file: /run/secrets/db_backup_password

backup:
    # Respaldos Diarios
    daily:
        time: "02:00"
        retention: ${RETENTION["daily"]}
        type: "incremental"
        compress: true
    
    # Respaldos Semanales
    weekly:
        day: "sunday"
        time: "03:00"
        retention: ${RETENTION["weekly"]}
        type: "full"
        compress: true
    
    # Respaldos Mensuales
    monthly:
        day: "1"
        time: "04:00"
        retention: ${RETENTION["monthly"]}
        type: "full"
        compress: true
        verify: true

options:
    compression_level: 9
    max_parallel_jobs: 2
    timeout: 3600
    verify_after_backup: true
EOF
}

# Configurar respaldo de configuración
setup_config_backup() {
    log_message "INFO" "Configurando respaldo de configuración..."
    
    cat > "$CONFIG_DIR/config_backup.yml" << EOF
config:
    directories:
        - /app/config
        - /etc/masclet
        - /etc/nginx/conf.d
    
    files:
        - /etc/environment
        - /etc/hosts
        - /etc/crontab
    
    exclusions:
        - "*.tmp"
        - "*.bak"
        - "*~"

schedule:
    # Respaldo diario de configs
    daily:
        time: "01:00"
        retention: ${RETENTION["daily"]}
    
    # Respaldo semanal de configs
    weekly:
        day: "sunday"
        time: "01:30"
        retention: ${RETENTION["weekly"]}

options:
    compress: true
    checksum: true
    incremental: true
EOF
}

# Configurar respaldo de logs
setup_log_backup() {
    log_message "INFO" "Configurando respaldo de logs..."
    
    cat > "$CONFIG_DIR/log_backup.yml" << EOF
logs:
    directories:
        - /logs/app
        - /logs/nginx
        - /logs/postgres
        - /logs/system
    
    retention:
        compressed: ${RETENTION["logs"]}
        uncompressed: 7
    
    rotation:
        size: "100M"
        age: "1d"
        compress: true
        dateformat: "%Y%m%d"

schedule:
    # Compresión diaria
    compress:
        time: "00:30"
        pattern: "*.log"
    
    # Limpieza semanal
    cleanup:
        day: "sunday"
        time: "00:00"
        pattern: "*.log.gz"
EOF
}

# Configurar scripts de respaldo
setup_backup_scripts() {
    log_message "INFO" "Configurando scripts de respaldo..."
    
    # Script de respaldo de base de datos
    cat > "$BACKUP_DIR/scripts/backup_db.sh" << 'EOF'
#!/bin/bash
set -e

BACKUP_NAME="db_$(date +%Y%m%d_%H%M%S)"
pg_dump -U postgres masclet_imperi | gzip > "$BACKUP_DIR/db/daily/$BACKUP_NAME.sql.gz"

# Verificar respaldo
gzip -t "$BACKUP_DIR/db/daily/$BACKUP_NAME.sql.gz"
if [ $? -eq 0 ]; then
    echo "Respaldo de base de datos completado: $BACKUP_NAME"
else
    echo "Error en respaldo de base de datos: $BACKUP_NAME"
    exit 1
fi
EOF

    # Script de respaldo de configuración
    cat > "$BACKUP_DIR/scripts/backup_config.sh" << 'EOF'
#!/bin/bash
set -e

BACKUP_NAME="config_$(date +%Y%m%d_%H%M%S)"
tar czf "$BACKUP_DIR/config/daily/$BACKUP_NAME.tar.gz" -C / \
    app/config \
    etc/masclet \
    etc/nginx/conf.d \
    etc/environment \
    etc/hosts \
    etc/crontab

# Verificar respaldo
tar tzf "$BACKUP_DIR/config/daily/$BACKUP_NAME.tar.gz" > /dev/null
if [ $? -eq 0 ]; then
    echo "Respaldo de configuración completado: $BACKUP_NAME"
else
    echo "Error en respaldo de configuración: $BACKUP_NAME"
    exit 1
fi
EOF

    # Hacer ejecutables los scripts
    chmod +x "$BACKUP_DIR/scripts/"*.sh
}

# Configurar tareas programadas
setup_cron_jobs() {
    log_message "INFO" "Configurando tareas programadas..."
    
    cat > "/etc/cron.d/masclet-backup" << EOF
# Respaldos Diarios
0 2 * * * root $BACKUP_DIR/scripts/backup_db.sh daily >> $LOG_DIR/backup_db_daily.log 2>&1
0 1 * * * root $BACKUP_DIR/scripts/backup_config.sh daily >> $LOG_DIR/backup_config_daily.log 2>&1

# Respaldos Semanales
0 3 * * 0 root $BACKUP_DIR/scripts/backup_db.sh weekly >> $LOG_DIR/backup_db_weekly.log 2>&1
30 1 * * 0 root $BACKUP_DIR/scripts/backup_config.sh weekly >> $LOG_DIR/backup_config_weekly.log 2>&1

# Respaldos Mensuales
0 4 1 * * root $BACKUP_DIR/scripts/backup_db.sh monthly >> $LOG_DIR/backup_db_monthly.log 2>&1

# Rotación de Logs
0 0 * * * root find $LOG_DIR -name "*.log" -mtime +${RETENTION["logs"]} -delete
EOF

    # Reiniciar cron para aplicar cambios
    systemctl restart cron
}

# Configurar sistema de restauración
setup_restore() {
    log_message "INFO" "Configurando sistema de restauración..."
    
    cat > "$BACKUP_DIR/scripts/restore.sh" << 'EOF'
#!/bin/bash
set -e

# Función para restaurar base de datos
restore_db() {
    local backup_file="$1"
    echo "Restaurando base de datos desde $backup_file..."
    
    # Detener aplicación
    systemctl stop masclet
    
    # Restaurar DB
    gunzip -c "$backup_file" | psql -U postgres masclet_imperi
    
    # Reiniciar aplicación
    systemctl start masclet
}

# Función para restaurar configuración
restore_config() {
    local backup_file="$1"
    echo "Restaurando configuración desde $backup_file..."
    
    # Backup de configuración actual
    tar czf "/tmp/config_backup_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz" -C / \
        app/config \
        etc/masclet \
        etc/nginx/conf.d
    
    # Restaurar configs
    tar xzf "$backup_file" -C /
    
    # Reiniciar servicios
    systemctl restart nginx
    systemctl restart masclet
}

# Procesar argumentos
backup_type="$1"
backup_file="$2"

case "$backup_type" in
    "db")
        restore_db "$backup_file"
        ;;
    "config")
        restore_config "$backup_file"
        ;;
    *)
        echo "Uso: $0 {db|config} archivo_backup"
        exit 1
        ;;
esac
EOF

    chmod +x "$BACKUP_DIR/scripts/restore.sh"
}

# Verificar configuración
verify_configuration() {
    log_message "INFO" "Verificando configuración..."
    local issues=0
    
    # Verificar directorios
    for type in "${!BACKUP_TYPES[@]}"; do
        for period in "daily" "weekly" "monthly"; do
            if [ ! -d "$BACKUP_DIR/$type/$period" ]; then
                log_message "ERROR" "Directorio no encontrado: $BACKUP_DIR/$type/$period"
                ((issues++))
            fi
        done
    done
    
    # Verificar scripts
    for script in "backup_db.sh" "backup_config.sh" "restore.sh"; do
        if [ ! -x "$BACKUP_DIR/scripts/$script" ]; then
            log_message "ERROR" "Script no encontrado o no ejecutable: $script"
            ((issues++))
        fi
    done
    
    # Verificar cron
    if [ ! -f "/etc/cron.d/masclet-backup" ]; then
        log_message "ERROR" "Archivo cron no encontrado"
        ((issues++))
    fi
    
    return $issues
}

# Generar documentación
generate_documentation() {
    local docs_dir="$BACKUP_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/backup_recovery.md" << EOF
# Sistema de Respaldo y Recuperación

## Tipos de Respaldo
$(for type in "${!BACKUP_TYPES[@]}"; do
    echo "### $type"
    echo "${BACKUP_TYPES[$type]}"
    echo
done)

## Retención de Respaldos
$(for period in "${!RETENTION[@]}"; do
    echo "- $period: ${RETENTION[$period]} días"
done)

## Estructura de Directorios
\`\`\`
$BACKUP_DIR/
├── full/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
├── db/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
├── config/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
├── logs/
└── scripts/
\`\`\`

## Programación de Respaldos
- DB Diario: 2:00 AM
- Config Diario: 1:00 AM
- DB Semanal: Domingo 3:00 AM
- Config Semanal: Domingo 1:30 AM
- DB Mensual: Día 1 4:00 AM

## Restauración
Para restaurar un respaldo:
\`\`\`bash
$BACKUP_DIR/scripts/restore.sh {db|config} archivo_backup
\`\`\`
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración del sistema de respaldo..."
    
    # Crear estructura base
    setup_directories
    
    # Configurar componentes
    setup_db_backup
    setup_config_backup
    setup_log_backup
    setup_backup_scripts
    setup_cron_jobs
    setup_restore
    
    # Verificar configuración
    verify_configuration
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        # Generar documentación
        generate_documentation
        log_message "SUCCESS" "Sistema de respaldo configurado correctamente"
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