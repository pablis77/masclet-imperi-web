param(
    [string]$EC2_IP,
    [string]$PEM_PATH
)

# Variables de entorno
$LOCAL_DIST = ".\frontend\dist"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

# Paso 1: Comprobar que existan los archivos compilados
Write-Host "🔍 Verificando archivos compilados..." -ForegroundColor Yellow
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ Error: No se encontró la carpeta $LOCAL_DIST. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem -Path "$LOCAL_DIST\client" -Recurse -File).Count
Write-Host "✅ Se encontraron $fileCount archivos para desplegar" -ForegroundColor Green

# Paso 2: Limpiar el servidor antes de desplegar
Write-Host "🧹 Limpiando el servidor antes de desplegar..." -ForegroundColor Yellow
$sshCleanup = @"
# Detener y eliminar contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
if docker ps -a | grep -q masclet-frontend; then
    docker stop masclet-frontend
    docker rm masclet-frontend
fi

if docker ps -a | grep -q masclet-frontend-node; then
    docker stop masclet-frontend-node
    docker rm masclet-frontend-node
fi

# Limpiar directorio de frontend
echo "🗑️ Limpiando directorio de frontend..."
rm -rf $REMOTE_DIR/*

# Crear directorio si no existe
mkdir -p $REMOTE_DIR
echo "✅ Limpieza completada"
"@

$tempScriptCleanup = New-TemporaryFile
Add-Content -Path $tempScriptCleanup -Value $sshCleanup
$sshCleanupCommand = "ssh -i ""$PEM_PATH"" ec2-user@$EC2_IP 'bash -s' < ""$tempScriptCleanup"""
Invoke-Expression $sshCleanupCommand
Remove-Item $tempScriptCleanup -Force

# Paso 3: Transferir archivos compilados
Write-Host "📤 Transfiriendo archivos compilados a $EC2_IP..." -ForegroundColor Yellow
$scpCommand = "scp -r -i ""$PEM_PATH"" ""$LOCAL_DIST\client\*"" ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpCommand

# Transferir también archivos del servidor Node.js
Write-Host "📤 Transfiriendo fix-server.js a $EC2_IP..." -ForegroundColor Yellow
$scpServerCommand = "scp -i ""$PEM_PATH"" "".\frontend\fix-server.js"" ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpServerCommand

Write-Host "📤 Transfiriendo entry.mjs a $EC2_IP..." -ForegroundColor Yellow
$scpEntryCommand = "scp -r -i ""$PEM_PATH"" ""$LOCAL_DIST\server\*"" ec2-user@${EC2_IP}:$REMOTE_DIR/server/"
Invoke-Expression $scpEntryCommand

Write-Host "📤 Transfiriendo package.json a $EC2_IP..." -ForegroundColor Yellow
$scpPackageCommand = "scp -i ""$PEM_PATH"" "".\frontend\package.json"" ec2-user@${EC2_IP}:$REMOTE_DIR/"
Invoke-Expression $scpPackageCommand

# Paso 4: Crear archivo de configuración de Nginx como proxy inverso
Write-Host "⚙️ Creando configuración de Nginx..." -ForegroundColor Yellow

$nginxConfig = @"
server {
    listen 80;
    server_name localhost;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log;
}
"@

$tempNginxConfig = New-TemporaryFile
Add-Content -Path $tempNginxConfig -Value $nginxConfig
$scpNginxConfig = "scp -i ""$PEM_PATH"" ""$tempNginxConfig"" ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
Invoke-Expression $scpNginxConfig
Remove-Item $tempNginxConfig -Force

# Paso 5: Lanzar los contenedores Docker
Write-Host "🐳 Lanzando contenedores Docker..." -ForegroundColor Yellow

$dockerScript = @"
# Crear contenedor Node.js para la aplicación Astro SSR
echo "🚀 Creando contenedor Node.js para Astro SSR..."
docker run -d \
    --name masclet-frontend-node \
    --network masclet-imperi_default \
    -p 10000:10000 \
    -v $REMOTE_DIR:/app \
    -e BACKEND_URL=http://masclet-api:8000 \
    -w /app \
    node:18-alpine \
    sh -c "cd /app && npm install && node fix-server.js"

# Esperar a que el contenedor Node inicie
echo "⏳ Esperando a que el servidor Node.js inicie..."
sleep 5

# Crear contenedor Nginx como proxy inverso
echo "🚀 Creando contenedor Nginx como proxy inverso..."
docker run -d \
    --name masclet-frontend \
    --network masclet-imperi_default \
    -p 80:80 \
    -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \
    nginx:alpine

echo "✅ Despliegue completado"
"@

$tempDockerScript = New-TemporaryFile
Add-Content -Path $tempDockerScript -Value $dockerScript
$sshDockerCommand = "ssh -i ""$PEM_PATH"" ec2-user@$EC2_IP 'bash -s' < ""$tempDockerScript"""
Invoke-Expression $sshDockerCommand
Remove-Item $tempDockerScript -Force

# Paso 6: Verificar el estado de los contenedores
Write-Host "🔍 Verificando el estado de los contenedores..." -ForegroundColor Yellow
$sshVerifyCommand = "ssh -i ""$PEM_PATH"" ec2-user@$EC2_IP 'docker ps -a | grep masclet'"
Invoke-Expression $sshVerifyCommand

Write-Host "✅ Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "La aplicación debería estar disponible en http://$EC2_IP/" -ForegroundColor Cyan
