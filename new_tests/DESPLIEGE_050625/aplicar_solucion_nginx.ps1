# Script para aplicar la solución de autenticación real mediante Nginx
# Este script configura Nginx para inyectar nuestros scripts en todas las páginas

$sshKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "34.253.203.194"
$serverUser = "ec2-user"

# Función para mostrar mensajes con formato
function Write-ColorOutput {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🚀 Iniciando proceso de corrección de login en AWS..." "Cyan"
Write-ColorOutput "=============================================" "Cyan"

# Paso 1: Crear el script de filtrado Nginx
Write-ColorOutput "📝 Creando script de filtro Nginx..." "Yellow"

$nginxFilterScript = @'
#!/bin/bash
# Script de filtro para inyectar scripts de autenticación en respuestas HTML

# Leer contenido desde stdin
CONTENT=$(cat)

# Verificar si es HTML (comprobación simple)
if [[ "$CONTENT" == *"<head>"* && "$CONTENT" == *"</head>"* ]]; then
    # Preparar los scripts a inyectar (antes del cierre de head)
    SCRIPTS="
    <!-- Scripts de autenticación real inyectados por Nginx -->
    <script src=\"/js/fix/apiConfig.js\"></script>
    <script src=\"/js/fix/authService.js\"></script>
    <script src=\"/js/fix/solucion_login.js\"></script>
    "
    
    # Inyectar scripts antes del cierre de head
    echo "$CONTENT" | sed "s|</head>|$SCRIPTS</head>|"
else
    # No es HTML o no tiene etiqueta head, devolver sin cambios
    echo "$CONTENT"
fi
'@

# Transferir el script de filtro a AWS
$nginxFilterScript | Out-File -FilePath "temp_filter.sh" -Encoding UTF8
ssh -i $sshKey $serverUser@$serverIP "mkdir -p ~/nginx-fix"
scp -i $sshKey "temp_filter.sh" "$serverUser@$serverIP`:~/nginx-fix/html_filter.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/nginx-fix/html_filter.sh"
Remove-Item -Path "temp_filter.sh"

Write-ColorOutput "✅ Script de filtro creado y transferido" "Green"

# Paso 2: Configurar Nginx para usar el filtro
Write-ColorOutput "🔧 Configurando Nginx para usar el filtro..." "Yellow"

$nginxConfig = @'
# Configuración para inyectar scripts de autenticación
# Colocar en archivo de configuración de Nginx

server {
    listen 80;
    server_name localhost;
    
    # Configuración para servir los scripts de corrección directamente
    location /js/fix/ {
        alias /app/client/js/fix/;
    }
    
    # Configuración para filtrar respuestas HTML
    location / {
        # Configuración normal del proxy
        proxy_pass http://masclet-frontend-node:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Filtrar solo respuestas HTML
        proxy_set_header Accept-Encoding "";
        sub_filter_once off;
        sub_filter "</head>" "
        <!-- Scripts de autenticación real inyectados -->
        <script src='/js/fix/apiConfig.js'></script>
        <script src='/js/fix/authService.js'></script>
        <script src='/js/fix/solucion_login.js'></script>
        </head>";
    }
}
'@

# Crear archivo de configuración
$nginxConfig | Out-File -FilePath "nginx-fix.conf" -Encoding UTF8
scp -i $sshKey "nginx-fix.conf" "$serverUser@$serverIP`:~/nginx-fix/nginx.conf"
Remove-Item -Path "nginx-fix.conf"

Write-ColorOutput "✅ Archivo de configuración Nginx creado" "Green"

# Paso 3: Crear scripts de aplicación y restauración
Write-ColorOutput "📝 Creando scripts de aplicación y restauración..." "Yellow"

$applyScript = @'
#!/bin/bash
# Script para aplicar la configuración de corrección a Nginx

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Funciones de utilidad
print_step() {
    echo -e "\n${BLUE}PASO $1: $2${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Inicio del proceso
print_step "1" "Verificando contenedores Docker"
NGINX_CONTAINER="masclet-frontend"
NODE_CONTAINER="masclet-frontend-node"

# Verificar contenedor Nginx
if ! docker ps | grep -q "${NGINX_CONTAINER}"; then
    print_error "El contenedor ${NGINX_CONTAINER} no está en ejecución"
    exit 1
fi
print_success "Contenedor ${NGINX_CONTAINER} está en ejecución"

# Verificar contenedor Node
if ! docker ps | grep -q "${NODE_CONTAINER}"; then
    print_error "El contenedor ${NODE_CONTAINER} no está en ejecución"
    exit 1
fi
print_success "Contenedor ${NODE_CONTAINER} está en ejecución"

# Crear directorio de respaldos
print_step "2" "Creando respaldos de configuración"
BACKUP_DIR="./nginx-backups"
mkdir -p "${BACKUP_DIR}"

# Respaldar configuración actual de Nginx
docker cp "${NGINX_CONTAINER}:/etc/nginx/conf.d" "${BACKUP_DIR}/"
print_success "Respaldo de configuración Nginx creado en ${BACKUP_DIR}"

# Copiar nuestros scripts al volumen de Nginx
print_step "3" "Copiando scripts a contenedor Nginx"
docker exec "${NGINX_CONTAINER}" mkdir -p /usr/share/nginx/html/js/fix
docker cp "${NODE_CONTAINER}:/app/client/js/fix/apiConfig.js" "${NGINX_CONTAINER}:/usr/share/nginx/html/js/fix/"
docker cp "${NODE_CONTAINER}:/app/client/js/fix/authService.js" "${NGINX_CONTAINER}:/usr/share/nginx/html/js/fix/"
docker cp "${NODE_CONTAINER}:/app/client/js/fix/solucion_login.js" "${NGINX_CONTAINER}:/usr/share/nginx/html/js/fix/"
print_success "Scripts copiados al contenedor Nginx"

# Actualizar configuración de Nginx
print_step "4" "Actualizando configuración de Nginx"
docker cp ./nginx.conf "${NGINX_CONTAINER}:/etc/nginx/conf.d/default.conf"
print_success "Configuración de Nginx actualizada"

# Reiniciar Nginx para aplicar cambios
print_step "5" "Reiniciando Nginx"
docker exec "${NGINX_CONTAINER}" nginx -t && docker exec "${NGINX_CONTAINER}" nginx -s reload
if [ $? -eq 0 ]; then
    print_success "Nginx reiniciado correctamente"
else
    print_error "Error al reiniciar Nginx"
    print_warning "Restaurando configuración original..."
    docker cp "${BACKUP_DIR}/conf.d/default.conf" "${NGINX_CONTAINER}:/etc/nginx/conf.d/default.conf"
    docker exec "${NGINX_CONTAINER}" nginx -s reload
    exit 1
fi

print_step "6" "Completado"
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ SOLUCIÓN DE LOGIN APLICADA CON ÉXITO${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Para verificar el funcionamiento:"
echo "1. Accede a la URL del servidor AWS"
echo "2. Intenta iniciar sesión con credenciales reales"
echo "3. Verifica en la consola del navegador que los scripts están cargados"
echo ""
echo "Para restaurar la configuración original:"
echo "Ejecuta el script: ./restore_nginx.sh"

# Crear script de restauración
cat > ./restore_nginx.sh << 'EOT'
#!/bin/bash
# Script para restaurar configuración original de Nginx

echo "Restaurando configuración original de Nginx..."
docker cp ./nginx-backups/conf.d/default.conf masclet-frontend:/etc/nginx/conf.d/default.conf
docker exec masclet-frontend nginx -s reload
echo "Configuración restaurada y Nginx reiniciado"
EOT
chmod +x ./restore_nginx.sh
'@

# Crear script de aplicación
$applyScript | Out-File -FilePath "apply_script.sh" -Encoding UTF8
scp -i $sshKey "apply_script.sh" "$serverUser@$serverIP`:~/nginx-fix/apply.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/nginx-fix/apply.sh"
Remove-Item -Path "apply_script.sh"

Write-ColorOutput "✅ Scripts de aplicación y restauración creados" "Green"

# Paso 4: Aplicar la solución
Write-ColorOutput "🚀 Aplicando la solución en el servidor..." "Yellow"

# Ejecutar el script de aplicación
ssh -i $sshKey $serverUser@$serverIP "cd ~/nginx-fix && sudo ./apply.sh"

Write-ColorOutput "✅ Proceso completado" "Green"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput "📝 Próximos pasos:" "Yellow"
Write-ColorOutput "1. Acceder a la URL del servidor AWS" "White"
Write-ColorOutput "2. Verificar que se puede iniciar sesión con usuarios reales" "White"
Write-ColorOutput "3. Comprobar que todas las funcionalidades del frontend trabajan correctamente" "White"
Write-ColorOutput "=============================================" "Cyan"
