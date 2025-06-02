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

# Paso 3: Crear script para limpiar el servidor
Write-ColorText "🧹 Preparando script de limpieza..." "Yellow"
$cleanupScript = @'
echo "🧹 Limpiando entorno previo..."

# Detener y eliminar contenedores anteriores si existen
if docker ps -a | grep -q masclet-frontend; then
    echo "Deteniendo contenedor Nginx anterior..."
    docker stop masclet-frontend
    docker rm masclet-frontend
fi

if docker ps -a | grep -q masclet-frontend-node; then
    echo "Deteniendo contenedor Node.js anterior..."
    docker stop masclet-frontend-node
    docker rm masclet-frontend-node
fi

# Limpiar directorio de frontend
echo "Limpiando directorio de frontend..."
rm -rf /home/ec2-user/masclet-imperi-frontend/*

# Crear directorio si no existe
mkdir -p /home/ec2-user/masclet-imperi-frontend
mkdir -p /home/ec2-user/masclet-imperi-frontend/server

echo "✅ Limpieza completada"
'@

# Guardar script de limpieza en un archivo temporal
$tempCleanupScript = New-TemporaryFile
$cleanupScript | Out-File -FilePath $tempCleanupScript -Encoding utf8 -NoNewline

# Ejecutar script de limpieza en el servidor
Write-ColorText "🧹 Ejecutando limpieza en el servidor..." "Yellow"
$cleanupCommand = "Get-Content '$tempCleanupScript' | ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'bash'"
Invoke-Expression $cleanupCommand

# Eliminar el archivo temporal de limpieza
Remove-Item $tempCleanupScript -Force

# Paso 4: Transferir archivos compilados del cliente
Write-ColorText "📤 Transfiriendo archivos compilados a $EC2_IP..." "Yellow"
$scpClientCommand = "scp -r -i '$PEM_PATH' '$LOCAL_DIST\client\*' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpClientCommand

# Paso 5: Transferir archivos del servidor
Write-ColorText "📤 Transfiriendo archivos del servidor a $EC2_IP..." "Yellow"
$scpServerCommand = "scp -r -i '$PEM_PATH' '$LOCAL_DIST\server\*' ec2-user@${EC2_IP}:$REMOTE_DIR/server/"
Invoke-Expression $scpServerCommand

# Paso 6: Transferir fix-server.js
Write-ColorText "📤 Transfiriendo fix-server.js a $EC2_IP..." "Yellow"
$scpFixServerCommand = "scp -i '$PEM_PATH' '.\frontend\fix-server.js' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpFixServerCommand

# Paso 7: Transferir package.json
Write-ColorText "📤 Transfiriendo package.json a $EC2_IP..." "Yellow"
$scpPackageCommand = "scp -i '$PEM_PATH' '.\frontend\package.json' ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpPackageCommand

# Paso 8: Crear archivo de configuración de Nginx
Write-ColorText "⚙️ Creando configuración de Nginx..." "Yellow"
$nginxConfig = @'
server {
    listen 80;
    server_name localhost;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log;
}
'@

# Guardar configuración de Nginx en un archivo temporal
$tempNginxConf = New-TemporaryFile
$nginxConfig | Out-File -FilePath $tempNginxConf -Encoding utf8 -NoNewline

# Transferir configuración de Nginx al servidor
Write-ColorText "📤 Transfiriendo configuración de Nginx a $EC2_IP..." "Yellow"
$scpNginxCommand = "scp -i '$PEM_PATH' '$tempNginxConf' ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
Invoke-Expression $scpNginxCommand

# Eliminar el archivo temporal de configuración de Nginx
Remove-Item $tempNginxConf -Force

# Paso 9: Crear script para configurar Docker
Write-ColorText "🐳 Preparando configuración Docker..." "Yellow"
$dockerScript = @'
echo "🚀 Configurando contenedores Docker..."

# Crear contenedor Node.js para la aplicación Astro SSR
echo "Creando contenedor Node.js para Astro SSR..."
docker run -d \
    --name masclet-frontend-node \
    --network masclet-imperi_default \
    -p 10000:10000 \
    -v /home/ec2-user/masclet-imperi-frontend:/app \
    -e BACKEND_URL=http://masclet-api:8000 \
    -w /app \
    node:18-alpine \
    sh -c "cd /app && npm install && node fix-server.js"

# Esperar a que el contenedor Node inicie
echo "⏳ Esperando a que el servidor Node.js inicie..."
sleep 5

# Crear contenedor Nginx como proxy inverso
echo "Creando contenedor Nginx como proxy inverso..."
docker run -d \
    --name masclet-frontend \
    --network masclet-imperi_default \
    -p 80:80 \
    -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine

# Verificar que los contenedores estén corriendo
echo "✅ Verificando estado de los contenedores..."
docker ps | grep masclet

echo "✅ Despliegue completado"
'@

# Guardar script Docker en un archivo temporal
$tempDockerScript = New-TemporaryFile
$dockerScript | Out-File -FilePath $tempDockerScript -Encoding utf8 -NoNewline

# Ejecutar script Docker en el servidor
Write-ColorText "🐳 Ejecutando configuración Docker en el servidor..." "Yellow"
$dockerCommand = "Get-Content '$tempDockerScript' | ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'bash'"
Invoke-Expression $dockerCommand

# Eliminar el archivo temporal de Docker
Remove-Item $tempDockerScript -Force

# Paso 10: Verificar despliegue
Write-ColorText "🔍 Verificando despliegue..." "Cyan"

# Comprobar si los contenedores están funcionando
$checkContainersCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker ps | grep masclet'"
$containers = Invoke-Expression $checkContainersCommand

if ($containers -match "masclet-frontend" -and $containers -match "masclet-frontend-node") {
    Write-ColorText "✅ Despliegue completado con éxito!" "Green"
    Write-ColorText "   El frontend ahora está disponible en: http://${EC2_IP}/" "Cyan"
    
    Write-ColorText "📋 Para ver logs del servidor Node:" "Yellow"
    Write-ColorText "   ssh -i $PEM_PATH ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
    
    Write-ColorText "📋 Para ver logs de Nginx:" "Yellow"
    Write-ColorText "   ssh -i $PEM_PATH ec2-user@$EC2_IP 'docker logs masclet-frontend'" "White"
} else {
    Write-ColorText "❌ Error: Al menos uno de los contenedores no está en ejecución." "Red"
    Write-ColorText "   Revisa los logs para más información:" "Yellow"
    Write-ColorText "   ssh -i $PEM_PATH ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
}
