# Script para desplegar la solución de login en el servidor AWS
# Este script transfiere e inyecta los archivos de corrección en el contenedor Node.js

$workDir = "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625"
$deployDir = "$workDir\deploy"
$sshKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "34.253.203.194"
$serverUser = "ec2-user"
$remoteDir = "/home/ec2-user/frontend-fix"

# Colores para mejor visualización
$colorInfo = "Cyan"
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"

function Write-Step {
    param (
        [string]$Message,
        [int]$Step
    )
    Write-Host ""
    Write-Host "PASO $Step : $Message" -ForegroundColor $colorInfo
    Write-Host "==============================================" -ForegroundColor $colorInfo
}

function Write-Success {
    param (
        [string]$Message
    )
    Write-Host "✅ $Message" -ForegroundColor $colorSuccess
}

function Write-Warning {
    param (
        [string]$Message
    )
    Write-Host "⚠️ $Message" -ForegroundColor $colorWarning
}

function Write-Error {
    param (
        [string]$Message
    )
    Write-Host "❌ $Message" -ForegroundColor $colorError
}

# Verificar que todos los archivos necesarios existen
Write-Step -Step 1 -Message "Verificando archivos de solución"

# Verificar directorio de despliegue
if (!(Test-Path $deployDir)) {
    Write-Error "No se encontró el directorio de despliegue: $deployDir"
    Write-Host "Ejecuta primero 'preparar_solucion_login.ps1' y 'crear_auth_service.ps1'" -ForegroundColor $colorWarning
    exit 1
}

# Verificar archivos específicos
$requiredFiles = @(
    "$deployDir\solucion_login.js",
    "$deployDir\authService.js",
    "$deployDir\apiConfig.js"
)

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Archivo requerido no encontrado: $file"
        exit 1
    } else {
        Write-Success "Archivo verificado: $file"
    }
}

Write-Success "Todos los archivos requeridos están disponibles"

# Crear un script de inyección para ejecutar en el servidor
Write-Step -Step 2 -Message "Preparando script de inyección para AWS"

@'
#!/bin/bash
# Script de inyección de la solución de login en el contenedor Node.js

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

# Configuración
CONTAINER_NAME="masclet-frontend-node"
HTML_DIR="/app/client"
LOGIN_PAGE="${HTML_DIR}/login.html"
INDEX_PAGE="${HTML_DIR}/index.html"
BACKUP_DIR="./container-backups"

# Iniciar proceso
print_step "1" "Creando directorio de respaldos"
mkdir -p "${BACKUP_DIR}"
print_success "Directorio de respaldos creado: ${BACKUP_DIR}"

# Verificar que el contenedor está en ejecución
print_step "2" "Verificando que el contenedor ${CONTAINER_NAME} está en ejecución"
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
    print_error "El contenedor ${CONTAINER_NAME} no está en ejecución"
    exit 1
fi
print_success "Contenedor ${CONTAINER_NAME} está en ejecución"

# Crear respaldos de las páginas principales
print_step "3" "Creando respaldos de archivos importantes"
docker cp "${CONTAINER_NAME}:${LOGIN_PAGE}" "${BACKUP_DIR}/login.html.bak" || true
docker cp "${CONTAINER_NAME}:${INDEX_PAGE}" "${BACKUP_DIR}/index.html.bak" || true
docker cp "${CONTAINER_NAME}:${HTML_DIR}/_astro" "${BACKUP_DIR}/_astro" || true
print_success "Respaldos creados en ${BACKUP_DIR}"

# Crear directorio para archivos JS
print_step "4" "Preparando directorio para archivos JS"
docker exec "${CONTAINER_NAME}" mkdir -p "${HTML_DIR}/js/fix"
print_success "Directorio creado: ${HTML_DIR}/js/fix"

# Copiar archivos de solución al contenedor
print_step "5" "Copiando archivos de solución al contenedor"
docker cp "./solucion_login.js" "${CONTAINER_NAME}:${HTML_DIR}/js/fix/"
docker cp "./authService.js" "${CONTAINER_NAME}:${HTML_DIR}/js/fix/"
docker cp "./apiConfig.js" "${CONTAINER_NAME}:${HTML_DIR}/js/fix/"
print_success "Archivos copiados al contenedor"

# Verificar que existen los archivos HTML principales
print_step "6" "Verificando archivos HTML principales"
if ! docker exec "${CONTAINER_NAME}" sh -c "[ -f ${LOGIN_PAGE} ]"; then
    print_error "No se encontró la página de login: ${LOGIN_PAGE}"
    print_warning "Es posible que el contenedor use una ruta diferente. Verificando estructura de directorios..."
    docker exec "${CONTAINER_NAME}" find /app -name "*.html" | grep -i login || true
    exit 1
fi
print_success "Página de login encontrada: ${LOGIN_PAGE}"

# Inyectar el script de solución en las páginas principales
print_step "7" "Inyectando scripts en páginas HTML"

# Crear respaldo antes de modificar
docker exec "${CONTAINER_NAME}" cp "${LOGIN_PAGE}" "${LOGIN_PAGE}.original"

# Inyectar en página de login
docker exec "${CONTAINER_NAME}" sh -c "grep -q 'solucion_login.js' ${LOGIN_PAGE} || sed -i 's/<head>/<head>\\n  <!-- Script de corrección de login inyectado --><script src=\"\/js\/fix\/solucion_login.js\"><\/script>\\n  <script src=\"\/js\/fix\/authService.js\"><\/script>\\n  <script src=\"\/js\/fix\/apiConfig.js\"><\/script>/g' ${LOGIN_PAGE}"

# Verificar la inyección
if docker exec "${CONTAINER_NAME}" grep -q "solucion_login.js" "${LOGIN_PAGE}"; then
    print_success "Script inyectado correctamente en página de login"
else
    print_error "No se pudo inyectar el script en la página de login"
    exit 1
fi

# También inyectar en index.html para asegurar cobertura completa
if docker exec "${CONTAINER_NAME}" sh -c "[ -f ${INDEX_PAGE} ]"; then
    docker exec "${CONTAINER_NAME}" cp "${INDEX_PAGE}" "${INDEX_PAGE}.original"
    docker exec "${CONTAINER_NAME}" sh -c "grep -q 'solucion_login.js' ${INDEX_PAGE} || sed -i 's/<head>/<head>\\n  <!-- Script de corrección de login inyectado --><script src=\"\/js\/fix\/solucion_login.js\"><\/script>\\n  <script src=\"\/js\/fix\/authService.js\"><\/script>\\n  <script src=\"\/js\/fix\/apiConfig.js\"><\/script>/g' ${INDEX_PAGE}"
    
    if docker exec "${CONTAINER_NAME}" grep -q "solucion_login.js" "${INDEX_PAGE}"; then
        print_success "Script inyectado correctamente en página index"
    else
        print_warning "No se pudo inyectar el script en la página index"
    fi
else
    print_warning "No se encontró la página index.html"
fi

# Buscar otras páginas HTML para inyectar (dashboard, animals)
print_step "8" "Buscando otras páginas importantes para inyectar scripts"
DASHBOARD_PAGE="${HTML_DIR}/dashboard.html"
ANIMALS_PAGE="${HTML_DIR}/animals.html"

if docker exec "${CONTAINER_NAME}" sh -c "[ -f ${DASHBOARD_PAGE} ]"; then
    docker exec "${CONTAINER_NAME}" cp "${DASHBOARD_PAGE}" "${DASHBOARD_PAGE}.original"
    docker exec "${CONTAINER_NAME}" sh -c "grep -q 'solucion_login.js' ${DASHBOARD_PAGE} || sed -i 's/<head>/<head>\\n  <!-- Script de corrección de login inyectado --><script src=\"\/js\/fix\/solucion_login.js\"><\/script>\\n  <script src=\"\/js\/fix\/authService.js\"><\/script>\\n  <script src=\"\/js\/fix\/apiConfig.js\"><\/script>/g' ${DASHBOARD_PAGE}"
    print_success "Script inyectado en dashboard.html"
fi

if docker exec "${CONTAINER_NAME}" sh -c "[ -f ${ANIMALS_PAGE} ]"; then
    docker exec "${CONTAINER_NAME}" cp "${ANIMALS_PAGE}" "${ANIMALS_PAGE}.original"
    docker exec "${CONTAINER_NAME}" sh -c "grep -q 'solucion_login.js' ${ANIMALS_PAGE} || sed -i 's/<head>/<head>\\n  <!-- Script de corrección de login inyectado --><script src=\"\/js\/fix\/solucion_login.js\"><\/script>\\n  <script src=\"\/js\/fix\/authService.js\"><\/script>\\n  <script src=\"\/js\/fix\/apiConfig.js\"><\/script>/g' ${ANIMALS_PAGE}"
    print_success "Script inyectado en animals.html"
fi

# Crear un script de restauración
print_step "9" "Creando script de restauración"
cat > "./restore_login.sh" << 'EOT'
#!/bin/bash
# Script para restaurar las páginas originales si es necesario
CONTAINER_NAME="masclet-frontend-node"
HTML_DIR="/app/client"
LOGIN_PAGE="${HTML_DIR}/login.html"
INDEX_PAGE="${HTML_DIR}/index.html"
DASHBOARD_PAGE="${HTML_DIR}/dashboard.html"
ANIMALS_PAGE="${HTML_DIR}/animals.html"

echo "Restaurando páginas originales..."
docker exec "${CONTAINER_NAME}" sh -c "[ -f ${LOGIN_PAGE}.original ] && cp ${LOGIN_PAGE}.original ${LOGIN_PAGE}"
docker exec "${CONTAINER_NAME}" sh -c "[ -f ${INDEX_PAGE}.original ] && cp ${INDEX_PAGE}.original ${INDEX_PAGE}"
docker exec "${CONTAINER_NAME}" sh -c "[ -f ${DASHBOARD_PAGE}.original ] && cp ${DASHBOARD_PAGE}.original ${DASHBOARD_PAGE}"
docker exec "${CONTAINER_NAME}" sh -c "[ -f ${ANIMALS_PAGE}.original ] && cp ${ANIMALS_PAGE}.original ${ANIMALS_PAGE}"

echo "Eliminando archivos de solución..."
docker exec "${CONTAINER_NAME}" rm -rf "${HTML_DIR}/js/fix"

echo "Restauración completada"
EOT
chmod +x "./restore_login.sh"
print_success "Script de restauración creado: ./restore_login.sh"

print_step "10" "Completado"
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ SOLUCIÓN DE LOGIN INYECTADA CON ÉXITO${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Para verificar el funcionamiento:"
echo "1. Accede a la URL del servidor AWS"
echo "2. Intenta iniciar sesión con credenciales reales"
echo "3. Verifica en la consola del navegador que el script está activo"
echo ""
echo "Para restaurar la configuración original:"
echo "Ejecuta el script: ./restore_login.sh"
'@ | Out-File -FilePath "$deployDir\inject_login_fix.sh" -Encoding UTF8
Write-Success "Script de inyección generado: $deployDir\inject_login_fix.sh"

# Transferir los archivos al servidor
Write-Step -Step 3 -Message "Transfiriendo archivos al servidor AWS"

# Crear directorio remoto
Write-Host "Creando directorio en el servidor: $remoteDir" -ForegroundColor $colorInfo
ssh -i $sshKey $serverUser@$serverIP "mkdir -p $remoteDir"

# Transferir archivos
Write-Host "Transfiriendo archivos al servidor..." -ForegroundColor $colorInfo
scp -i $sshKey "$deployDir\solucion_login.js" "$serverUser@$serverIP`:$remoteDir/"
scp -i $sshKey "$deployDir\authService.js" "$serverUser@$serverIP`:$remoteDir/"
scp -i $sshKey "$deployDir\apiConfig.js" "$serverUser@$serverIP`:$remoteDir/"
scp -i $sshKey "$deployDir\inject_login_fix.sh" "$serverUser@$serverIP`:$remoteDir/"

Write-Success "Archivos transferidos correctamente"

# Dar permisos de ejecución al script
Write-Host "Dando permisos de ejecución al script..." -ForegroundColor $colorInfo
ssh -i $sshKey $serverUser@$serverIP "chmod +x $remoteDir/inject_login_fix.sh"

Write-Step -Step 4 -Message "Ejecutando script de inyección en el servidor"
Write-Host "Este proceso puede tardar unos minutos. Por favor, espere..." -ForegroundColor $colorWarning

# Ejecutar el script en el servidor
ssh -i $sshKey $serverUser@$serverIP "cd $remoteDir && ./inject_login_fix.sh"

Write-Step -Step 5 -Message "Verificación de despliegue"
Write-Host "Despliegue completado." -ForegroundColor $colorSuccess
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor $colorInfo
Write-Host "  1. Accede a la URL del servidor AWS"
Write-Host "  2. Intenta iniciar sesión con credenciales reales"
Write-Host "  3. Verifica en la consola del navegador que el script está activo"
Write-Host "  4. Prueba diferentes usuarios y roles"
Write-Host ""
Write-Host "PARA REVERTIR CAMBIOS:" -ForegroundColor $colorInfo
Write-Host "  Para restaurar la configuración original, ejecuta:"
Write-Host "    ssh -i '$sshKey' $serverUser@$serverIP 'cd $remoteDir && ./restore_login.sh'" -ForegroundColor $colorWarning
