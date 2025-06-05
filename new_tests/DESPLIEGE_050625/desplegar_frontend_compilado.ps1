#!/usr/bin/env pwsh
# Script para desplegar frontend compilado localmente en AWS con Node.js
# Fecha: 05/06/2025

# Configuración de variables
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2IP = "3.253.32.134"  # IP pública actual del servidor AWS
$EC2User = "ec2-user@$EC2IP"
$LocalProjectRoot = "C:\Proyectos\claude\masclet-imperi-web"
$RemoteTempDir = "/home/ec2-user/frontend_compiled_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LocalCompiledZip = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\frontend-compiled.zip"
$LocalDockerfile = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\frontend-node.Dockerfile"
$LocalDeployScript = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\deploy-compiled-frontend.sh"
$LogFile = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\despliegue_frontend_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Función para mostrar mensajes con formato y barra de progreso
function Write-Status {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Info", "Success", "Warning", "Error", "Progress")]
        [string]$Type = "Info",
        
        [Parameter(Mandatory = $false)]
        [int]$ProgressValue = 0,
        
        [Parameter(Mandatory = $false)]
        [int]$ProgressTotal = 100
    )

    switch ($Type) {
        "Info" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "Progress" {
            $percent = [math]::Round(($ProgressValue / $ProgressTotal) * 100)
            $progressBar = "[" + ("=" * [math]::Floor($percent / 5)) + ">" + (" " * (20 - [math]::Floor($percent / 5))) + "]"
            Write-Host "$progressBar $percent% - $Message" -ForegroundColor Magenta
        }
    }
}

# Iniciar log
Start-Transcript -Path $LogFile -Append

# Cabecera
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE DE FRONTEND COMPILADO EN AWS" -ForegroundColor Cyan
Write-Host "  Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar requisitos previos
$totalSteps = 8
$currentStep = 0

# 1. Verificar que existe el archivo compilado
$currentStep++
Write-Status -Type "Progress" -Message "Verificando archivos compilados..." -ProgressValue $currentStep -ProgressTotal $totalSteps

if (-not (Test-Path $LocalCompiledZip)) {
    Write-Status "No se encuentra el archivo compilado en $LocalCompiledZip" "Error"
    Write-Status "Ejecuta primero el script 'compilar_frontend_local.ps1'" "Error"
    Stop-Transcript
    exit 1
}

$zipInfo = Get-Item $LocalCompiledZip
Write-Status "Frontend compilado encontrado: $([math]::Round($zipInfo.Length/1MB, 2)) MB" "Success"

# 2. Verificar archivos de configuración
$currentStep++
Write-Status -Type "Progress" -Message "Verificando archivos de configuración..." -ProgressValue $currentStep -ProgressTotal $totalSteps

$missingFiles = @()
if (-not (Test-Path $LocalNginxConfig)) { $missingFiles += "nginx.conf" }
if (-not (Test-Path $LocalDockerfile)) { $missingFiles += "frontend-nginx.Dockerfile" }
if (-not (Test-Path $LocalDeployScript)) { $missingFiles += "deploy-compiled-frontend.sh" }

if ($missingFiles.Count -gt 0) {
    Write-Status "Faltan archivos de configuración: $($missingFiles -join ', ')" "Error"
    Write-Status "Ejecuta primero el script 'compilar_frontend_local.ps1'" "Error"
    Stop-Transcript
    exit 1
}
Write-Status "Todos los archivos de configuración están disponibles" "Success"

# 3. Verificar conexión SSH
$currentStep++
Write-Status -Type "Progress" -Message "Verificando conexión SSH..." -ProgressValue $currentStep -ProgressTotal $totalSteps

try {
    $sshTestCommand = "ssh -i `"$AWSKey`" -o ConnectTimeout=10 $EC2User 'echo Conexión SSH exitosa'"
    $sshResult = Invoke-Expression $sshTestCommand
    
    if ($sshResult -like "*Conexión SSH exitosa*") {
        Write-Status "Conexión SSH establecida correctamente" "Success"
    } else {
        Write-Status "La conexión SSH no devolvió la respuesta esperada" "Warning"
    }
} catch {
    Write-Status "Error en la conexión SSH al servidor AWS: $_" "Error"
    Write-Status "Verifica que la IP ($EC2IP) y la clave SSH sean correctas" "Error"
    Stop-Transcript
    exit 1
}

# 4. Crear directorio remoto
$currentStep++
Write-Status -Type "Progress" -Message "Creando directorio remoto..." -ProgressValue $currentStep -ProgressTotal $totalSteps

ssh -i $AWSKey $EC2User "mkdir -p $RemoteTempDir"
Write-Status "Directorio remoto creado: $RemoteTempDir" "Success"

# 5. Transferir archivos al servidor
$currentStep++
Write-Status -Type "Progress" -Message "Transfiriendo archivos al servidor..." -ProgressValue $currentStep -ProgressTotal $totalSteps

Write-Status "Transfiriendo frontend compilado ($([math]::Round($zipInfo.Length/1MB, 2)) MB)..." "Info"
scp -i $AWSKey $LocalCompiledZip "$EC2User`:$RemoteTempDir/frontend-compiled.zip"
scp -i $AWSKey $LocalNginxConfig "$EC2User`:$RemoteTempDir/nginx.conf"
scp -i $AWSKey $LocalDockerfile "$EC2User`:$RemoteTempDir/frontend-nginx.Dockerfile"
scp -i $AWSKey $LocalDeployScript "$EC2User`:$RemoteTempDir/deploy-compiled-frontend.sh"

Write-Status "Archivos transferidos correctamente" "Success"

# 6. Dar permisos de ejecución al script de despliegue
$currentStep++
Write-Status -Type "Progress" -Message "Preparando script de despliegue..." -ProgressValue $currentStep -ProgressTotal $totalSteps

ssh -i $AWSKey $EC2User "chmod +x $RemoteTempDir/deploy-compiled-frontend.sh"
Write-Status "Permisos de ejecución asignados al script de despliegue" "Success"

# 7. Ejecutar script de despliegue con timeout para evitar bloqueos
$currentStep++
Write-Status -Type "Progress" -Message "Desplegando frontend compilado..." -ProgressValue $currentStep -ProgressTotal $totalSteps

Write-Status "Iniciando despliegue (timeout: 5 minutos)..." "Info"
Write-Status "Esto tomará menos tiempo porque ya tenemos los archivos compilados" "Info"

$startTime = Get-Date
$deployCommand = "cd $RemoteTempDir && ./deploy-compiled-frontend.sh"

ssh -i $AWSKey $EC2User $deployCommand

$endTime = Get-Date
$deployTime = $endTime - $startTime
Write-Status "Despliegue completado en $($deployTime.Minutes) minutos y $($deployTime.Seconds) segundos" "Success"

# 8. Verificar estado final
$currentStep++
Write-Status -Type "Progress" -Message "Verificando estado final..." -ProgressValue $currentStep -ProgressTotal $totalSteps

$containerStatus = ssh -i $AWSKey $EC2User "docker ps | grep masclet-frontend"
if ($containerStatus) {
    Write-Status "Contenedor frontend desplegado correctamente" "Success"
    Write-Status "Detalles del contenedor:" "Info"
    Write-Host $containerStatus
} else {
    Write-Status "No se encontró el contenedor masclet-frontend en ejecución" "Error"
    Write-Status "Verifica los logs del servidor para más detalles" "Warning"
    ssh -i $AWSKey $EC2User "docker logs masclet-frontend 2>&1 | tail -n 20"
}

# Resumen final
Write-Status "DESPLIEGUE FRONTEND COMPLETADO" "Success"
Write-Status "Frontend accesible en: http://$EC2IP" "Info"
Write-Status "Comandos útiles:" "Info"
Write-Status "  - Ver logs: ssh -i `"$AWSKey`" $EC2User 'docker logs masclet-frontend'" "Info"
Write-Status "  - Reiniciar: ssh -i `"$AWSKey`" $EC2User 'docker restart masclet-frontend'" "Info"
Write-Status "  - Detener: ssh -i `"$AWSKey`" $EC2User 'docker stop masclet-frontend'" "Info"

Stop-Transcript
