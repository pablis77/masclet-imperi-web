#!/bin/bash
# Script para configurar sistema de notificaciones
# Ubicación: backend/docker/scripts/setup_notifications.sh

set -e

# Configuración
NOTIFICATIONS_DIR="/app/notifications"
LOG_DIR="/logs/notifications"
CONFIG_DIR="/app/config/notifications"
TEMPLATES_DIR="/app/templates/notifications"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Canales de notificación
declare -A CHANNELS=(
    ["email"]="Email notifications"
    ["telegram"]="Telegram alerts"
    ["webhook"]="Webhook integrations"
    ["log"]="System logs"
)

# Niveles de notificación
declare -A LEVELS=(
    ["critical"]="Requiere atención inmediata"
    ["warning"]="Requiere revisión"
    ["info"]="Informativo"
    ["debug"]="Desarrollo"
)

# Función de logging
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/setup_${TIMESTAMP}.log"
}

# Crear estructura de directorios
create_directories() {
    log_message "INFO" "Creando estructura de directorios..."
    
    # Directorios principales
    mkdir -p "$NOTIFICATIONS_DIR"/{queue,sent,failed}
    mkdir -p "$LOG_DIR"/{email,telegram,webhook}
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$TEMPLATES_DIR"/{email,telegram,webhook}
    
    # Permisos
    chmod 750 "$NOTIFICATIONS_DIR" "$LOG_DIR" "$CONFIG_DIR" "$TEMPLATES_DIR"
}

# Configurar plantillas de notificación
setup_templates() {
    log_message "INFO" "Configurando plantillas de notificación..."
    
    # Template de email
    cat > "$TEMPLATES_DIR/email/base.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #2C5282; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; }
        .critical { color: #E53E3E; }
        .warning { color: #ECC94B; }
        .info { color: #4299E1; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
    </div>
    <div class="content">
        {{message}}
    </div>
    <div class="footer">
        Masclet Imperi - Sistema de Notificaciones<br>
        {{timestamp}}
    </div>
</body>
</html>
EOF

    # Template de Telegram
    cat > "$TEMPLATES_DIR/telegram/alert.txt" << EOF
🔔 *{{title}}*
{{level_emoji}} Nivel: {{level}}

{{message}}

⏰ {{timestamp}}
#{{tag}}
EOF

    # Template de webhook
    cat > "$TEMPLATES_DIR/webhook/payload.json" << EOF
{
    "title": "{{title}}",
    "message": "{{message}}",
    "level": "{{level}}",
    "timestamp": "{{timestamp}}",
    "metadata": {
        "system": "Masclet Imperi",
        "component": "{{component}}",
        "tag": "{{tag}}"
    }
}
EOF
}

# Configurar canales de notificación
setup_channels() {
    log_message "INFO" "Configurando canales de notificación..."
    
    # Configuración de email
    cat > "$CONFIG_DIR/email_config.yml" << EOF
smtp:
    server: smtp.mascletimperi.com
    port: 587
    username: notifications@mascletimperi.com
    password: "{{SMTP_PASSWORD}}"
    tls: true

recipients:
    admin:
        - admin@mascletimperi.com
    tech:
        - tech@mascletimperi.com
    alerts:
        - alerts@mascletimperi.com

settings:
    retry_attempts: 3
    retry_delay: 300
    max_batch_size: 50
EOF

    # Configuración de Telegram
    cat > "$CONFIG_DIR/telegram_config.yml" << EOF
bot:
    token: "{{TELEGRAM_BOT_TOKEN}}"
    name: "MascletBot"

chats:
    admin: "-100xxxxxxxxxxxxx"
    tech: "-100xxxxxxxxxxxxx"
    alerts: "-100xxxxxxxxxxxxx"

settings:
    rate_limit: "20/minute"
    retry_attempts: 3
    silent_hours: "23:00-07:00"
EOF

    # Configuración de webhooks
    cat > "$CONFIG_DIR/webhook_config.yml" << EOF
endpoints:
    monitoring:
        url: "https://monitor.mascletimperi.com/webhook"
        method: "POST"
        headers:
            Authorization: "Bearer {{MONITOR_TOKEN}}"
            Content-Type: "application/json"
    
    backup:
        url: "https://backup.mascletimperi.com/webhook"
        method: "POST"
        headers:
            Authorization: "Bearer {{BACKUP_TOKEN}}"
            Content-Type: "application/json"

settings:
    timeout: 10
    retry_attempts: 3
    verify_ssl: true
EOF
}

# Configurar reglas de notificación
setup_rules() {
    log_message "INFO" "Configurando reglas de notificación..."
    
    cat > "$CONFIG_DIR/notification_rules.yml" << EOF
rules:
    critical:
        channels: ["email", "telegram", "webhook"]
        recipients: ["admin", "tech"]
        immediate: true
        retry: true
        template: "critical_alert"
    
    warning:
        channels: ["email", "telegram"]
        recipients: ["tech"]
        immediate: false
        batch_window: "15m"
        template: "warning_alert"
    
    info:
        channels: ["telegram"]
        recipients: ["tech"]
        immediate: false
        batch_window: "1h"
        template: "info_update"
    
    debug:
        channels: ["log"]
        log_level: "DEBUG"
        retention: "7d"

thresholds:
    error_rate: 10
    response_time: 5000
    disk_usage: 90
    memory_usage: 85
EOF
}

# Configurar retención y rotación
setup_retention() {
    log_message "INFO" "Configurando retención y rotación..."
    
    cat > "$CONFIG_DIR/retention_config.yml" << EOF
retention:
    logs:
        critical: 365d
        warning: 90d
        info: 30d
        debug: 7d
    
    notifications:
        sent: 90d
        failed: 30d
        queue: 7d
    
    templates:
        versions: 5
        archive: true

rotation:
    logs:
        size: "100M"
        files: 10
        compress: true
    
    notifications:
        size: "50M"
        files: 5
        compress: true
EOF

    # Configurar logrotate
    cat > "/etc/logrotate.d/masclet-notifications" << EOF
$LOG_DIR/*.log {
    daily
    rotate 10
    compress
    delaycompress
    notifempty
    create 640 root root
    postrotate
        systemctl restart masclet-notifications
    endscript
}
EOF
}

# Verificar configuración
verify_configuration() {
    log_message "INFO" "Verificando configuración..."
    local issues=0
    
    # Verificar directorios
    for dir in "$NOTIFICATIONS_DIR" "$LOG_DIR" "$CONFIG_DIR" "$TEMPLATES_DIR"; do
        if [ ! -d "$dir" ]; then
            log_message "ERROR" "Directorio no encontrado: $dir"
            ((issues++))
        fi
    done
    
    # Verificar archivos de configuración
    for config in "email_config.yml" "telegram_config.yml" "webhook_config.yml" "notification_rules.yml"; do
        if [ ! -f "$CONFIG_DIR/$config" ]; then
            log_message "ERROR" "Archivo de configuración no encontrado: $config"
            ((issues++))
        fi
    done
    
    # Verificar templates
    for template in "email/base.html" "telegram/alert.txt" "webhook/payload.json"; do
        if [ ! -f "$TEMPLATES_DIR/$template" ]; then
            log_message "ERROR" "Template no encontrado: $template"
            ((issues++))
        fi
    done
    
    return $issues
}

# Configurar permisos
setup_permissions() {
    log_message "INFO" "Configurando permisos..."
    
    # Crear grupo de notificaciones
    groupadd -f notifications
    
    # Asignar permisos
    chown -R root:notifications "$NOTIFICATIONS_DIR" "$LOG_DIR" "$CONFIG_DIR" "$TEMPLATES_DIR"
    chmod -R 750 "$NOTIFICATIONS_DIR" "$LOG_DIR" "$CONFIG_DIR" "$TEMPLATES_DIR"
    
    # Proteger archivos sensibles
    find "$CONFIG_DIR" -type f -name "*config.yml" -exec chmod 640 {} \;
}

# Generar documentación
generate_documentation() {
    local docs_dir="$NOTIFICATIONS_DIR/docs"
    mkdir -p "$docs_dir"
    
    cat > "$docs_dir/notifications_setup.md" << EOF
# Sistema de Notificaciones

## Canales Configurados
$(for channel in "${!CHANNELS[@]}"; do
    echo "- $channel: ${CHANNELS[$channel]}"
done)

## Niveles de Notificación
$(for level in "${!LEVELS[@]}"; do
    echo "- $level: ${LEVELS[$level]}"
done)

## Estructura de Directorios
- $NOTIFICATIONS_DIR/
  - queue/ (Notificaciones pendientes)
  - sent/ (Notificaciones enviadas)
  - failed/ (Notificaciones fallidas)
  - docs/ (Documentación)

## Templates
- Email: \`$TEMPLATES_DIR/email/base.html\`
- Telegram: \`$TEMPLATES_DIR/telegram/alert.txt\`
- Webhook: \`$TEMPLATES_DIR/webhook/payload.json\`

## Configuración
Archivos principales en $CONFIG_DIR:
- email_config.yml
- telegram_config.yml
- webhook_config.yml
- notification_rules.yml
- retention_config.yml

## Retención de Logs
- Críticos: 365 días
- Advertencias: 90 días
- Info: 30 días
- Debug: 7 días
EOF
}

# Función principal
main() {
    log_message "INFO" "Iniciando configuración del sistema de notificaciones..."
    
    # Crear estructura
    create_directories
    
    # Configurar sistema
    setup_templates
    setup_channels
    setup_rules
    setup_retention
    
    # Configurar permisos
    setup_permissions
    
    # Verificar configuración
    verify_configuration
    local verify_status=$?
    
    if [ $verify_status -eq 0 ]; then
        # Generar documentación
        generate_documentation
        log_message "SUCCESS" "Sistema de notificaciones configurado correctamente"
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