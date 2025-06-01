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

# Paso 3: Crear script para limpiar el servidor (asegurando formato Unix)
Write-ColorText "🧹 Preparando script de limpieza..." "Yellow"
$cleanupScript = "echo '🧹 Limpiando entorno previo...'`n`n" +
                "# Detener y eliminar contenedores anteriores si existen`n" +
                "if docker ps -a | grep -q masclet-frontend; then`n" +
                "    echo 'Deteniendo contenedor Nginx anterior...'`n" +
                "    docker stop masclet-frontend`n" +
                "    docker rm masclet-frontend`n" +
                "fi`n`n" +
                "if docker ps -a | grep -q masclet-frontend-node; then`n" +
                "    echo 'Deteniendo contenedor Node.js anterior...'`n" +
                "    docker stop masclet-frontend-node`n" +
                "    docker rm masclet-frontend-node`n" +
                "fi`n`n" +
                "# Limpiar directorio de frontend`n" +
                "echo 'Limpiando directorio de frontend...'`n" +
                "rm -rf /home/ec2-user/masclet-imperi-frontend/*`n`n" +
                "# Crear directorio si no existe`n" +
                "mkdir -p /home/ec2-user/masclet-imperi-frontend`n" +
                "mkdir -p /home/ec2-user/masclet-imperi-frontend/server`n`n" +
                "echo '✅ Limpieza completada'"

# Guardar script de limpieza en un archivo temporal con formato Unix (LF)
$tempCleanupScript = Join-Path $env:TEMP "cleanup_script_$(Get-Random).sh"
[System.IO.File]::WriteAllText($tempCleanupScript, $cleanupScript.Replace("`r`n", "`n"))

# Ejecutar script de limpieza en el servidor
Write-ColorText "🧹 Ejecutando limpieza en el servidor..." "Yellow"
$cleanupCommand = "scp -i '$PEM_PATH' '$tempCleanupScript' ec2-user@$EC2_IP:/home/ec2-user/cleanup.sh; ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/cleanup.sh && /home/ec2-user/cleanup.sh && rm /home/ec2-user/cleanup.sh'"
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

# Paso 8: Crear archivo de configuración de Nginx (asegurando formato Unix)
Write-ColorText "⚙️ Creando configuración de Nginx..." "Yellow"
$nginxConfig = "server {`n" +
               "    listen 80;`n" +
               "    server_name localhost;`n`n" +
               "    # Proxy inverso a la aplicación Node.js (Astro SSR)`n" +
               "    location / {`n" +
               "        proxy_pass http://localhost:10000;`n" +
               "        proxy_http_version 1.1;`n" +
               "        proxy_set_header Upgrade \$http_upgrade;`n" +
               "        proxy_set_header Connection \"upgrade\";`n" +
               "        proxy_set_header Host \$host;`n" +
               "        proxy_set_header X-Real-IP \$remote_addr;`n" +
               "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;`n" +
               "        proxy_set_header X-Forwarded-Proto \$scheme;`n" +
               "        proxy_cache_bypass \$http_upgrade;`n" +
               "    }`n`n" +
               "    access_log /var/log/nginx/masclet_access.log;`n" +
               "    error_log /var/log/nginx/masclet_error.log;`n" +
               "}"

# Guardar configuración de Nginx en un archivo temporal con formato Unix (LF)
$tempNginxConf = Join-Path $env:TEMP "nginx_conf_$(Get-Random).conf"
[System.IO.File]::WriteAllText($tempNginxConf, $nginxConfig.Replace("`r`n", "`n"))

# Transferir configuración de Nginx al servidor
Write-ColorText "📤 Transfiriendo configuración de Nginx a $EC2_IP..." "Yellow"
$scpNginxCommand = "scp -i '$PEM_PATH' '$tempNginxConf' ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
Invoke-Expression $scpNginxCommand

# Eliminar el archivo temporal de configuración de Nginx
Remove-Item $tempNginxConf -Force

# Paso 9: Crear script para configurar Docker (asegurando formato Unix)
Write-ColorText "🐳 Preparando configuración Docker..." "Yellow"
$dockerScript = "echo '🚀 Configurando contenedores Docker...'`n`n" +
                "# Crear contenedor Node.js para la aplicación Astro SSR`n" +
                "echo 'Creando contenedor Node.js para Astro SSR...'`n" +
                "docker run -d \\`n" +
                "    --name masclet-frontend-node \\`n" +
                "    --network masclet-imperi_default \\`n" +
                "    -p 10000:10000 \\`n" +
                "    -v /home/ec2-user/masclet-imperi-frontend:/app \\`n" +
                "    -e BACKEND_URL=http://masclet-api:8000 \\`n" +
                "    -w /app \\`n" +
                "    node:18-alpine \\`n" +
                "    sh -c \"cd /app && npm install && node fix-server.js\"`n`n" +
                "# Esperar a que el contenedor Node inicie`n" +
                "echo '⏳ Esperando a que el servidor Node.js inicie...'`n" +
                "sleep 5`n`n" +
                "# Crear contenedor Nginx como proxy inverso`n" +
                "echo 'Creando contenedor Nginx como proxy inverso...'`n" +
                "docker run -d \\`n" +
                "    --name masclet-frontend \\`n" +
                "    --network masclet-imperi_default \\`n" +
                "    -p 80:80 \\`n" +
                "    -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \\`n" +
                "    nginx:alpine`n`n" +
                "# Verificar que los contenedores estén corriendo`n" +
                "echo '✅ Verificando estado de los contenedores...'`n" +
                "docker ps | grep masclet`n`n" +
                "echo '✅ Despliegue completado'"

# Guardar script Docker en un archivo temporal con formato Unix (LF)
$tempDockerScript = Join-Path $env:TEMP "docker_script_$(Get-Random).sh"
[System.IO.File]::WriteAllText($tempDockerScript, $dockerScript.Replace("`r`n", "`n"))

# Ejecutar script Docker en el servidor
Write-ColorText "🐳 Ejecutando configuración Docker en el servidor..." "Yellow"
$dockerCommand = "scp -i '$PEM_PATH' '$tempDockerScript' ec2-user@$EC2_IP:/home/ec2-user/setup_docker.sh; ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/setup_docker.sh && /home/ec2-user/setup_docker.sh && rm /home/ec2-user/setup_docker.sh'"
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
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
    
    Write-ColorText "📋 Para ver logs de Nginx:" "Yellow"
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend'" "White"
} else {
    Write-ColorText "❌ Error: Al menos uno de los contenedores no está en ejecución." "Red"
    Write-ColorText "   Revisa los logs para más información:" "Yellow"
    Write-ColorText "   ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'docker logs masclet-frontend-node'" "White"
}
