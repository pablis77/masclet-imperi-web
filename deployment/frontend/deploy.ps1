# Script para desplegar el frontend en EC2 usando Nginx y Node.js para Astro SSR
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

# Definición de variables y directorios
$LOCAL_DIST = ".\frontend\dist"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Paso 1: Verificar que existe el directorio de compilación
Write-ColorText "🔍 Verificando archivos compilados..." "Cyan"
if (-not (Test-Path "$LOCAL_DIST\client")) {
    Write-ColorText "❌ No se encontró el directorio de compilación: $LOCAL_DIST\client" "Red"
    Write-ColorText "   Asegúrate de compilar el frontend primero con 'npm run build'" "Yellow"
    exit 1
}

# Paso 2: Verificar que hay archivos en el directorio
$fileCount = (Get-ChildItem -Path "$LOCAL_DIST\client" -Recurse -File).Count
if ($fileCount -eq 0) {
    Write-ColorText "❌ El directorio de compilación está vacío" "Red"
    exit 1
}
Write-ColorText "✅ Se encontraron $fileCount archivos para desplegar" "Green"

# Paso 3: Transferir script de limpieza y ejecutarlo
Write-ColorText "🧹 Enviando script de limpieza al servidor..." "Yellow"
$scpCleanupCommand = "scp -i '$PEM_PATH' '.\deployment\frontend\cleanup-linux.sh' ec2-user@${EC2_IP}:/home/ec2-user/cleanup.sh"
Invoke-Expression $scpCleanupCommand

Write-ColorText "🧹 Ejecutando limpieza en el servidor..." "Yellow"
$sshCleanupCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/cleanup.sh && /home/ec2-user/cleanup.sh'"
Invoke-Expression $sshCleanupCommand

# Paso 4: Crear estructura de directorios en el servidor
Write-ColorText "📁 Creando estructura de directorios en el servidor..." "Yellow"
$sshCreateDirsCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'mkdir -p $REMOTE_DIR/dist/client $REMOTE_DIR/dist/server'"
Invoke-Expression $sshCreateDirsCommand

# Paso 5: Transferir archivos compilados del cliente
Write-ColorText "📤 Transfiriendo archivos compilados del cliente a $EC2_IP..." "Yellow"
$scpClientCommand = "scp -r -i '$PEM_PATH' '$LOCAL_DIST\client\*' ec2-user@${EC2_IP}:$REMOTE_DIR/dist/client/"
Invoke-Expression $scpClientCommand

# Paso 6: Transferir archivos compilados del servidor
Write-ColorText "📤 Transfiriendo archivos compilados del servidor a $EC2_IP..." "Yellow"
$scpServerCommand = "scp -r -i '$PEM_PATH' '$LOCAL_DIST\server\*' ec2-user@${EC2_IP}:$REMOTE_DIR/dist/server/"
Invoke-Expression $scpServerCommand

# Paso 7: Transferir fix-server.js
Write-ColorText "📤 Transfiriendo fix-server.js a $EC2_IP..." "Yellow"
$scpFixServerCommand = "scp -i '$PEM_PATH' '.\frontend\fix-server.js' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpFixServerCommand

# Paso 8: Transferir fix-api-urls.js (corrección de URLs API)
Write-ColorText "📤 Transfiriendo fix-api-urls.js a $EC2_IP..." "Yellow"
$scpFixApiUrlsCommand = "scp -i '$PEM_PATH' '.\frontend\fix-api-urls.js' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpFixApiUrlsCommand

# Paso 9: Transferir script de corrección de hidratación
Write-ColorText "📤 Transfiriendo script de corrección de hidratación a $EC2_IP..." "Yellow"
$scpHydrationFixCommand = "scp -i '$PEM_PATH' '.\frontend\client-hydration-fix.js' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpHydrationFixCommand

# Paso 10: Transferir package.json
Write-ColorText "📤 Transfiriendo package.json a $EC2_IP..." "Yellow"
$scpPackageCommand = "scp -i '$PEM_PATH' '.\frontend\package.json' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpPackageCommand

# Paso 11: Transferir configuración de Nginx
Write-ColorText "⚙️ Transfiriendo configuración de Nginx..." "Yellow"
$scpNginxCommand = "scp -i '$PEM_PATH' '.\deployment\frontend\nginx-linux.conf' ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
Invoke-Expression $scpNginxCommand

# Paso 12: Transferir y ejecutar script Docker
Write-ColorText "🐳 Enviando script Docker al servidor..." "Yellow"
$scpDockerCommand = "scp -i '$PEM_PATH' '.\deployment\frontend\docker-linux.sh' ec2-user@${EC2_IP}:/home/ec2-user/setup_docker.sh"
Invoke-Expression $scpDockerCommand

Write-ColorText "🐳 Ejecutando configuración Docker en el servidor..." "Yellow"
$sshDockerCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/setup_docker.sh && /home/ec2-user/setup_docker.sh'"
Invoke-Expression $sshDockerCommand

# Paso 13: Verificar despliegue
Write-ColorText "🔍 Verificando despliegue..." "Cyan"

# Comprobar si los contenedores están funcionando
$checkContainersCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker ps | grep masclet'"
$containers = Invoke-Expression $checkContainersCommand

if ($containers -match "masclet-frontend" -and $containers -match "masclet-frontend-node") {
    Write-ColorText "✅ Despliegue completado con éxito!" "Green"
    Write-ColorText "   El frontend ahora está disponible en: http://${EC2_IP}/" "Cyan"
    
    Write-ColorText "📋 Para ver logs del servidor Node:" "Yellow"
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
    
    Write-ColorText "📋 Para ver logs de Nginx:" "Yellow"
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend'" "White"
} else {
    Write-ColorText "❌ Error: Al menos uno de los contenedores no está en ejecución." "Red"
    Write-ColorText "   Revisa los logs para más información:" "Yellow"
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
}
