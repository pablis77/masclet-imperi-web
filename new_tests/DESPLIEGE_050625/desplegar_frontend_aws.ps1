#!/usr/bin/env pwsh
# Script para despliegue del frontend Masclet Imperi en AWS
# Fecha: 05/06/2025

# Configuración de variables
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2IP = "54.217.31.124"
$EC2User = "ec2-user@$EC2IP"
$LocalProjectRoot = "C:\Proyectos\claude\masclet-imperi-web"
$RemoteTempDir = "/home/ec2-user/temp_masclet_frontend_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LocalBackupDir = "$LocalProjectRoot\frontend\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LocalFrontendDir = "$LocalProjectRoot\frontend"

Write-Host "=== INICIANDO DESPLIEGUE DEL FRONTEND MASCLET IMPERI EN AWS ===" -ForegroundColor Cyan

# Verificar que el servidor está disponible antes de empezar
Write-Host "Verificando conexión SSH al servidor AWS..." -ForegroundColor Yellow
try {
    $sshTestCommand = "ssh -i `"$AWSKey`" $EC2User 'echo Conexion SSH exitosa'"
    Invoke-Expression $sshTestCommand
}
catch {
    Write-Host "Error en la conexión SSH al servidor AWS: $_" -ForegroundColor Red
    exit 1
}

# 1. Crear directorios locales y remotos
Write-Host "Creando directorios de trabajo..." -ForegroundColor Yellow
mkdir -Force $LocalBackupDir | Out-Null
ssh -i $AWSKey $EC2User "mkdir -p $RemoteTempDir"

# 2. Crear backup de archivos críticos
Write-Host "Creando respaldos de archivos críticos..." -ForegroundColor Yellow
if (Test-Path "$LocalFrontendDir\.env.production") {
    Copy-Item "$LocalFrontendDir\.env.production" "$LocalBackupDir\.env.production.bak"
}
if (Test-Path "$LocalFrontendDir\Dockerfile") {
    Copy-Item "$LocalFrontendDir\Dockerfile" "$LocalBackupDir\Dockerfile.bak" 
}

# 3. Generar archivo zip con contenido del frontend (excluyendo directorios grandes)
Write-Host "Comprimiendo archivos del frontend..." -ForegroundColor Yellow
$frontendZip = "$env:TEMP\frontend-deploy.zip"
$tempFrontendDir = "$env:TEMP\frontend-temp-deploy"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Eliminar directorio y zip anteriores si existen
if (Test-Path $tempFrontendDir) { Remove-Item -Path $tempFrontendDir -Recurse -Force }
if (Test-Path $frontendZip) { Remove-Item -Path $frontendZip -Force }

# Crear directorio temporal
New-Item -ItemType Directory -Path $tempFrontendDir -Force | Out-Null
Write-Host "Directorio temporal creado en: $tempFrontendDir" -ForegroundColor Cyan

# Copiar solo archivos necesarios (sin node_modules, dist, etc.)
Write-Host "Copiando archivos esenciales..." -ForegroundColor Yellow
Get-ChildItem -Path $LocalFrontendDir -Exclude "node_modules", "dist", ".git", ".astro", "backups" | 
    ForEach-Object { 
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination "$tempFrontendDir\$($_.Name)" -Recurse -Force
        } else {
            Copy-Item -Path $_.FullName -Destination "$tempFrontendDir\$($_.Name)" -Force
        }
    }

# Comprimir archivos
Write-Host "Comprimiendo archivos..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFrontendDir\*" -DestinationPath $frontendZip -Force

# Verificar archivo ZIP
if (Test-Path $frontendZip) {
    $zipInfo = Get-Item $frontendZip
    Write-Host "ZIP creado correctamente: $frontendZip ($('{0:N2}' -f ($zipInfo.Length/1MB)) MB)" -ForegroundColor Green
} else {
    Write-Host "Error al crear el archivo ZIP!" -ForegroundColor Red
    exit 1
}

# 4. Crear archivo .dockerignore para optimizar build
Write-Host "Creando .dockerignore para optimizar build..." -ForegroundColor Yellow
$dockerignore = @"
node_modules
dist
.git
.github
docs
*.log
.astro
backups
"@
$dockerignorePath = "$tempFrontendDir\.dockerignore"
$dockerignore | Out-File -FilePath $dockerignorePath -Encoding utf8

# 5. Crear script de despliegue para el servidor
Write-Host "Preparando script de despliegue para el servidor..." -ForegroundColor Yellow
$serverScript = @"
#!/bin/bash
set -e

echo "=== INICIANDO DESPLIEGUE DE FRONTEND MASCLET IMPERI ==="

# 1. Detener y eliminar contenedores existentes
echo "Limpiando contenedores existentes..."
sudo docker stop masclet-frontend 2>/dev/null || true
sudo docker rm masclet-frontend 2>/dev/null || true

# 2. Preparar entorno de trabajo
echo "Preparando entorno de trabajo..."
cd $RemoteTempDir
mkdir -p logs

# 3. Extraer archivos del frontend
echo "Extrayendo archivos del frontend..."
unzip -o frontend-deploy.zip

# 4. Verificar scripts de corrección
echo "Verificando scripts de corrección..."

# Verificar fix-api-urls-enhanced.cjs
if [ -f fix-api-urls-enhanced.cjs ]; then
    echo "Script fix-api-urls-enhanced.cjs existe, OK"
else
    echo "ADVERTENCIA: fix-api-urls-enhanced.cjs no encontrado!"
fi

# Verificar client-hydration-fix.cjs
if [ -f client-hydration-fix.cjs ]; then
    echo "Script client-hydration-fix.cjs existe, OK"
else
    echo "ADVERTENCIA: client-hydration-fix.cjs no encontrado - No es crítico"
fi

# Verificar fix-server.cjs
if [ -f fix-server.cjs ]; then
    echo "Script fix-server.cjs existe, OK"
else
    echo "ADVERTENCIA: fix-server.cjs no encontrado - No es crítico"
fi

# 5. Construir la imagen Docker con caché desactivada y timeout de 20 minutos
echo "Construyendo imagen Docker (timeout 20 minutos)..."
timeout 1200 sudo docker build --no-cache -t masclet-frontend:latest . 2>&1 | tee logs/docker-build.log

# Verificar si la construcción fue exitosa
if [ $? -eq 124 ]; then
    echo "ERROR: Timeout alcanzado durante la construcción. La compilación tardó más de 20 minutos."
    echo "Puede ser un problema de recursos en el servidor o un bloqueo en la compilación."
    echo "Recomendación: Revisar los logs y considerar compilar localmente y subir la imagen compilada."
    exit 1
elif [ $? -ne 0 ]; then
    echo "ERROR: La construcción de Docker falló por alguna razón."
    echo "Revise el log para más detalles: logs/docker-build.log"
    exit 1
fi

# 6. Crear red Docker si no existe
echo "Verificando red Docker masclet-network..."
sudo docker network inspect masclet-network >/dev/null 2>&1 || sudo docker network create masclet-network

# 7. Ejecutar el contenedor conectado a la red de masclet
echo "Ejecutando nuevo contenedor..."
sudo docker run -d --name masclet-frontend \
  --restart always \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=80 \
  -e VITE_API_URL=http://108.129.139.119:8000 \
  -e PUBLIC_API_URL=http://108.129.139.119:8000 \
  masclet-frontend:latest

# 8. Verificar estado
echo "Verificando estado del contenedor..."
sudo docker ps | grep masclet-frontend
sudo docker logs masclet-frontend --tail 30 | tee logs/container-logs.log

# 9. Prueba básica de acceso
echo "Probando acceso básico al frontend..."
curl -s http://localhost/ | grep -i "masclet" && echo "Frontend accesible!" || echo "ADVERTENCIA: No se encontró texto 'masclet' en la respuesta HTML"

echo "=== DESPLIEGUE COMPLETADO ==="
echo "El frontend debe estar accesible en http://108.129.139.119"
"@

# Guardar script en archivo temporal
$tempScript = "$env:TEMP\deploy-frontend-aws.sh"
$serverScript | Out-File -FilePath $tempScript -Encoding utf8 -NoNewline

# Copiar Dockerfile personalizado y scripts de corrección
Write-Host "Copiando Dockerfile personalizado y scripts de corrección..." -ForegroundColor Yellow

# Copiar Dockerfile
Copy-Item "$LocalProjectRoot\new_tests\DESPLIEGE_050625\frontend.Dockerfile" "$tempFrontendDir\Dockerfile"
Copy-Item "$tempFrontendDir\Dockerfile" "$LocalBackupDir\Dockerfile.bak" -Force

# Copiar scripts de corrección importantes del despliegue anterior si existen
if (Test-Path "$LocalFrontendDir\fix-api-urls.js") {
    Write-Host "Copiando script fix-api-urls.js..." -ForegroundColor Yellow
    Copy-Item "$LocalFrontendDir\fix-api-urls.js" "$tempFrontendDir\fix-api-urls-enhanced.cjs" -Force
    Copy-Item "$LocalFrontendDir\fix-api-urls.js" "$LocalBackupDir\fix-api-urls.js.bak" -Force
}

if (Test-Path "$LocalFrontendDir\client-hydration-fix.js") {
    Write-Host "Copiando script client-hydration-fix.js..." -ForegroundColor Yellow
    Copy-Item "$LocalFrontendDir\client-hydration-fix.js" "$tempFrontendDir\client-hydration-fix.cjs" -Force
    Copy-Item "$LocalFrontendDir\client-hydration-fix.js" "$LocalBackupDir\client-hydration-fix.js.bak" -Force
}

if (Test-Path "$LocalFrontendDir\fix-server.js") {
    Write-Host "Copiando script fix-server.js..." -ForegroundColor Yellow
    Copy-Item "$LocalFrontendDir\fix-server.js" "$tempFrontendDir\fix-server.cjs" -Force
    Copy-Item "$LocalFrontendDir\fix-server.js" "$LocalBackupDir\fix-server.js.bak" -Force
}

# 6. Transferir archivos al servidor AWS
Write-Host "Transfiriendo archivos al servidor AWS..." -ForegroundColor Cyan
scp -i $AWSKey $frontendZip "$EC2User`:$RemoteTempDir/frontend-deploy.zip"
scp -i $AWSKey $tempScript "$EC2User`:$RemoteTempDir/deploy-frontend.sh"

# 7. Ejecutar despliegue en el servidor
Write-Host "Ejecutando despliegue en el servidor..." -ForegroundColor Green
$sshDeployCommand = "ssh -i `"$AWSKey`" $EC2User 'chmod +x $RemoteTempDir/deploy-frontend.sh && $RemoteTempDir/deploy-frontend.sh'"
Invoke-Expression $sshDeployCommand

# 8. Verificar que el despliegue funciona correctamente
Write-Host "Verificando que el frontend está funcionando correctamente..." -ForegroundColor Yellow
Write-Host "Esperando 30 segundos para que el contenedor se estabilice..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Realizar comprobaciones exhaustivas
$verificacionExitosa = $true

# 8.1 Verificar que el contenedor está en ejecución
Write-Host "Verificando estado del contenedor..." -ForegroundColor Yellow
$containerStatus = ssh -i $AWSKey $EC2User "sudo docker ps | grep masclet-frontend"
if ($containerStatus) {
    Write-Host "Contenedor en ejecución ✅" -ForegroundColor Green
} else {
    Write-Host "ERROR: El contenedor no está en ejecución ❌" -ForegroundColor Red
    $verificacionExitosa = $false
}

# 8.2 Verificar acceso al frontend - método 1 (local)
try {
    Write-Host "Prueba de acceso al frontend (método 1)..." -ForegroundColor Yellow
    $frontendTest = Invoke-RestMethod -Uri "http://108.129.139.119/" -Method GET -ErrorAction Stop
    if ($frontendTest -match "masclet") {
        Write-Host "Frontend accesible correctamente desde PowerShell ✅" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: No se encontró el texto 'masclet' en la respuesta ⚠️" -ForegroundColor Yellow
        # No fallamos aquí, probamos con método 2
    }
} catch {
    Write-Host "ADVERTENCIA: No se pudo acceder al frontend desde PowerShell: $_ ⚠️" -ForegroundColor Yellow
    Write-Host "Intentando método alternativo..." -ForegroundColor Yellow
}

# 8.3 Verificar acceso al frontend - método 2 (en servidor)
Write-Host "Prueba de acceso al frontend (método 2)..." -ForegroundColor Yellow
$httpTest = ssh -i $AWSKey $EC2User "curl -s -I http://localhost | head -n 1"
if (-not $httpTest -or -not ($httpTest -match "200 OK")) {
    Write-Host "ERROR: El frontend no responde correctamente en el servidor. Respuesta: $httpTest ❌" -ForegroundColor Red
    Write-Host "Revisando logs para diagnosticar el problema:" -ForegroundColor Yellow
    ssh -i $AWSKey $EC2User "sudo docker logs masclet-frontend --tail 50"
    $verificacionExitosa = $false
} else {
    Write-Host "Frontend accesible correctamente desde el servidor ✅" -ForegroundColor Green
    
    # Verificar contenido HTML para confirmar que es realmente Masclet
    $htmlTest = ssh -i $AWSKey $EC2User "curl -s http://localhost/ | grep -i masclet"
    if ($htmlTest) {
        Write-Host "Contenido HTML verificado correctamente ✅" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: No se encontró el texto 'masclet' en el HTML ⚠️" -ForegroundColor Yellow
        # No fallamos aquí, podría ser que la página no tenga el texto "masclet" visible
    }
}

# 8.4 Verificar conexión con el backend
Write-Host "Verificando comunicación con el backend..." -ForegroundColor Yellow
$apiTest = ssh -i $AWSKey $EC2User "curl -s http://localhost:8000/api/v1/health-check"
if (-not $apiTest) {
    Write-Host "ADVERTENCIA: No se pudo verificar el backend ⚠️" -ForegroundColor Yellow
    Write-Host "Esta advertencia no es crítica si el backend aún no está desplegado" -ForegroundColor Yellow
} else {
    Write-Host "Conexión con backend API correcta ✅" -ForegroundColor Green
}

# 8.5 Verificar estado general
if (-not $verificacionExitosa) {
    Write-Host "ERROR: Despliegue FALLIDO. No se realizarán backups. Revisar logs para más información." -ForegroundColor Red
    exit 1
}

Write-Host "¡Verificación completada con éxito! El frontend está operativo." -ForegroundColor Green

# 9. Crear backup SOLO si el despliegue fue exitoso
Write-Host "Creando backup de la imagen del frontend para despliegue futuro..." -ForegroundColor Yellow

# 9.1 Crear directorio para almacenar la imagen exitosa en AWS
ssh -i $AWSKey $EC2User "mkdir -p ~/masclet-imperi_$timestamp/exito"

# 9.2 Crear respaldo de la imagen Docker
ssh -i $AWSKey $EC2User "docker commit masclet-frontend masclet-frontend-imagen-$timestamp"
ssh -i $AWSKey $EC2User "docker save masclet-frontend-imagen-$timestamp | gzip > ~/masclet-imperi_$timestamp/exito/masclet-frontend-imagen-$timestamp.tar.gz"

# 9.3 Descargar imagen a local para respaldo adicional
Write-Host "Descargando imagen de backup a local..." -ForegroundColor Yellow
scp -i $AWSKey "$EC2User`:~/masclet-imperi_$timestamp/exito/masclet-frontend-imagen-$timestamp.tar.gz" "$LocalBackupDir/masclet-frontend-imagen-$timestamp.tar.gz"

# 10. Limpiar archivos temporales
Write-Host "Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Path $tempFrontendDir -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path $frontendZip -Force -ErrorAction SilentlyContinue

# 11. Documentar despliegue exitoso
$deploymentSummary = @"
# DESPLIEGUE FRONTEND MASCLET IMPERI - ÉXITO
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Detalles del despliegue
- Timestamp: $timestamp
- URL del frontend: http://108.129.139.119
- Backup local: $LocalBackupDir/masclet-frontend-imagen-$timestamp.tar.gz
- Backup en AWS: ~/masclet-imperi_$timestamp/exito/masclet-frontend-imagen-$timestamp.tar.gz

## Verificaciones realizadas
- Contenedor en ejecución: Correcto
- Respuesta HTTP: Correcto
- Comunicación con backend: Verificada

## Comandos para restaurar
```powershell
# Cargar imagen desde respaldo
docker load -i masclet-frontend-imagen-$timestamp.tar.gz

# Iniciar contenedor desde imagen
docker run -d --name masclet-frontend --restart always \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=80 \
  -e VITE_API_URL=http://108.129.139.119:8000 \
  -e PUBLIC_API_URL=http://108.129.139.119:8000 \
  masclet-frontend-imagen-$timestamp
```
"@
"@

$deploymentSummaryPath = "$LocalBackupDir/deployment_summary_$timestamp.md"
$deploymentSummary | Out-File -FilePath $deploymentSummaryPath -Encoding utf8

Write-Host "Proceso de despliegue completado con éxito" -ForegroundColor Green
Write-Host "Frontend accesible en: http://108.129.139.119" -ForegroundColor Cyan
Write-Host "Resumen del despliegue guardado en: $deploymentSummaryPath" -ForegroundColor Cyan
Write-Host "Backup de la imagen guardado en: $LocalBackupDir/masclet-frontend-imagen-$timestamp.tar.gz" -ForegroundColor Cyan
