# Script para desplegar el frontend en EC2 usando Nginx
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

# Definición de variables y directorios
$LOCAL_DIST = ".\frontend\dist\client"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi-frontend"

# Paso 1: Verificar que existe el directorio de compilación
Write-Host "🔍 Verificando archivos compilados..." -ForegroundColor Cyan
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ No se encontró el directorio de compilación: $LOCAL_DIST" -ForegroundColor Red
    Write-Host "   Asegúrate de compilar el frontend primero con 'npm run build'" -ForegroundColor Yellow
    exit 1
}
    
    # Paso 2: Verificar que hay archivos en el directorio
    $fileCount = (Get-ChildItem -Path $LOCAL_DIST -Recurse -File).Count
    if ($fileCount -eq 0) {
        Write-Host "❌ El directorio de compilación está vacío" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Se encontraron $fileCount archivos para desplegar" -ForegroundColor Green
    
    # Paso 3: Transferir archivos compilados
    Write-Host "📤 Transfiriendo archivos compilados a $EC2_IP..." -ForegroundColor Yellow
    
    $scpCommand = "scp -r -i ""$PEM_PATH"" $LOCAL_DIST/* ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi-frontend"
    Invoke-Expression $scpCommand
    
    # Transferir también el archivo fix-server.js necesario para ejecutar la aplicación SSR
    Write-Host "📤 Transfiriendo fix-server.js a $EC2_IP..." -ForegroundColor Yellow
    $scpFixServerCommand = "scp -i ""$PEM_PATH"" .\frontend\fix-server.js ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi-frontend/"
    Invoke-Expression $scpFixServerCommand
    
    # Transferir package.json para que npm install funcione
    Write-Host "📤 Transfiriendo package.json a $EC2_IP..." -ForegroundColor Yellow
    $scpPackageJsonCommand = "scp -i ""$PEM_PATH"" .\frontend\package.json ec2-user@${EC2_IP}:/home/ec2-user/masclet-imperi-frontend/"
    Invoke-Expression $scpPackageJsonCommand
    
    # Paso 4: Crear archivo de configuración de Nginx
    Write-Host "⚙️ Configurando Nginx..." -ForegroundColor Yellow
    # Crear archivo de configuración de Nginx como proxy inverso para la aplicación Node.js
    Write-Host "📝 Creando archivo de configuración para Nginx..." -ForegroundColor Yellow
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
    
    # Guardamos la configuración en un archivo temporal
    $tempNginxConf = New-TemporaryFile
    $nginxConfig | Out-File -FilePath $tempNginxConf -Encoding utf8
    
    # Transferimos el archivo al servidor
    $scpNginxCommand = "scp -i ""${PEM_PATH}"" ""${tempNginxConf}"" ec2-user@${EC2_IP}:/home/ec2-user/nginx.conf"
    Invoke-Expression $scpNginxCommand
    
    # Paso 5: Crear y configurar Docker en el servidor
    Write-Host "🐳 Configurando Docker en el servidor..." -ForegroundColor Yellow
    $dockerCommands = @'
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
        sh -c "npm install && node fix-server.js"
    
    # Crear contenedor con Nginx como proxy inverso
    echo "Creando contenedor Nginx como proxy inverso..."
    docker run -d \
        --name masclet-frontend \
        --network masclet-imperi_default \
        -p 80:80 \
        -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \
        nginx:alpine
        
    # Verificar que el contenedor está corriendo
    if docker ps | grep -q masclet-frontend; then
        echo "✅ Contenedor masclet-frontend iniciado correctamente"
    else
        echo "❌ Error al iniciar el contenedor"
        docker logs masclet-frontend
        exit 1
    fi
'@

    # Guardamos los comandos Docker en un archivo temporal para ejecutarlos en el servidor
    $tempDockerScript = New-TemporaryFile
    $dockerCommands | Out-File -FilePath $tempDockerScript -Encoding utf8
    
    # Ejecutamos el comando SSH con los comandos Docker
    $sshCommand = "Get-Content ""${tempDockerScript}"" | ssh -i ""${PEM_PATH}"" ec2-user@${EC2_IP} 'bash -s'"
    Invoke-Expression $sshCommand
    
    # Limpiamos el archivo temporal
    Remove-Item $tempDockerScript -Force
    
    # Paso 6: Verificar despliegue
    Write-Host "🔍 Verificando despliegue..." -ForegroundColor Cyan
    Write-Host "✅ Despliegue completado con éxito!" -ForegroundColor Green
    Write-Host "   El frontend ahora está disponible en: http://${EC2_IP}" -ForegroundColor Cyan
    Write-Host "   Para verificar los logs: ssh -i ${PEM_PATH} ec2-user@${EC2_IP} 'docker logs masclet-frontend'" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error durante el despliegue: $_" -ForegroundColor Red
    exit 1
}
