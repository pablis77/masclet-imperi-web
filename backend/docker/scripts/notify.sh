#!/bin/bash
# Script de notificaciones por email
# Ubicación: backend/docker/scripts/notify.sh

set -e

# Configuración
CONFIG_FILE="/app/.env"
LOG_FILE="/logs/notify.log"
TEMPLATE_DIR="/app/templates/email"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Cargar variables de entorno
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Error: No se encuentra archivo de configuración" | tee -a "$LOG_FILE"
    exit 1
fi

# Función de logging
log_message() {
    local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "${msg}" | tee -a "$LOG_FILE"
}

# Validación de parámetros
if [ "$#" -lt 2 ]; then
    log_message "❌ Error: Uso: $0 <subject> <type> [details]"
    exit 1
fi

SUBJECT="$1"
TYPE="$2"
DETAILS="${3:-Sin detalles adicionales}"

# Verificar configuración SMTP
check_smtp_config() {
    if [ -z "${SMTP_HOST}" ] || [ -z "${SMTP_PORT}" ] || [ -z "${SMTP_USER}" ] || [ -z "${SMTP_PASS}" ]; then
        log_message "❌ Error: Falta configuración SMTP"
        return 1
    fi
    return 0
}

# Generar cuerpo del email HTML
generate_email_body() {
    local template="${TEMPLATE_DIR}/${TYPE}.html"
    local default_template="${TEMPLATE_DIR}/default.html"
    local body
    
    if [ -f "$template" ]; then
        body=$(cat "$template")
    elif [ -f "$default_template" ]; then
        body=$(cat "$default_template")
    else
        body="<html><body><h2>${SUBJECT}</h2><p>${DETAILS}</p></body></html>"
    fi
    
    # Reemplazar variables
    body=${body//\{\{subject\}\}/$SUBJECT}
    body=${body//\{\{details\}\}/$DETAILS}
    body=${body//\{\{timestamp\}\}/$TIMESTAMP}
    body=${body//\{\{type\}\}/$TYPE}
    
    echo "$body"
}

# Enviar email
send_email() {
    local body
    body=$(generate_email_body)
    local recipients="${NOTIFY_EMAIL:-$ADMIN_EMAIL}"
    local tmpfile
    tmpfile=$(mktemp)
    
    # Construir email con headers MIME
    cat > "$tmpfile" << EOF
From: ${SMTP_USER}
To: ${recipients}
Subject: [Masclet] ${SUBJECT}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${body}
EOF
    
    # Enviar email usando SMTP
    if ! curl --ssl-reqd \
        --url "smtps://${SMTP_HOST}:${SMTP_PORT}" \
        --user "${SMTP_USER}:${SMTP_PASS}" \
        --mail-from "${SMTP_USER}" \
        --mail-rcpt "${recipients}" \
        --upload-file "$tmpfile" \
        --silent --output /dev/null; then
        
        log_message "❌ Error: Falló el envío del email"
        rm -f "$tmpfile"
        return 1
    fi
    
    rm -f "$tmpfile"
    return 0
}

# Función principal
main() {
    log_message "📧 Enviando notificación: ${SUBJECT}"
    
    # Verificar configuración
    if ! check_smtp_config; then
        log_message "❌ Error: Verificación de configuración falló"
        exit 1
    fi
    
    # Intentar envío con reintentos
    local max_retries=3
    local retry=0
    local success=false
    
    while [ $retry -lt $max_retries ]; do
        if send_email; then
            success=true
            break
        fi
        ((retry++))
        log_message "⚠️ Reintento $retry de $max_retries"
        sleep 5
    done
    
    if [ "$success" = true ]; then
        log_message "✅ Notificación enviada correctamente"
        exit 0
    else
        log_message "❌ Error: No se pudo enviar la notificación después de $max_retries intentos"
        exit 1
    fi
}

# Manejo de errores
trap cleanup EXIT
cleanup() {
    local rc=$?
    if [ $rc -ne 0 ]; then
        log_message "❌ Script interrumpido con código $rc"
    fi
    exit $rc
}

# Ejecutar script
main