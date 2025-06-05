#!/usr/bin/env pwsh
# Script para desplegar el frontend compilado en AWS EC2 usando NGINX
# Fecha: 05/06/2025

# Configuración de variables
$LocalProjectRoot = "C:\Proyectos\claude\masclet-imperi-web"
$DeployDir = "$LocalProjectRoot\new_tests\DESPLIEGE_050625"
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$AWSServerIP = "3.253.32.134"  # IP pública actual del servidor AWS
$EC2User = "ec2-user@$AWSServerIP"
$RemoteDir = "/home/ec2-user/frontend-deploy"
$DeployLogFile = "$DeployDir\despliegue_frontend_nginx_aws.log"

# Función para mostrar mensajes con formato
function Write-Status {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Info", "Success", "Warning", "Error", "Header")]
        [string]$Type = "Info"
    )

    switch ($Type) {
        "Info" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "Header" { 
            Write-Host "======================================================" -ForegroundColor Magenta
            Write-Host "  $Message" -ForegroundColor Magenta
            Write-Host "======================================================" -ForegroundColor Magenta
        }
    }

    # También escribir al log
    $timeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $DeployLogFile -Value "[$timeStamp] [$Type] $Message"
}

# Iniciar log
"" | Out-File -FilePath $DeployLogFile -Force

# Cabecera
Write-Status "DESPLIEGUE DE FRONTEND MASCLET IMPERI CON NGINX EN AWS" "Header"
Write-Status "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Info"
Write-Host ""

# 1. Verificar archivos necesarios
Write-Status "VERIFICANDO ARCHIVOS NECESARIOS" "Header"

# Verificar el archivo ZIP de compilación
$compiledZip = "$DeployDir\frontend-compiled.zip"
if (Test-Path $compiledZip) {
    $zipSize = (Get-Item $compiledZip).Length / 1MB
    Write-Status "Frontend compilado encontrado ($([math]::Round($zipSize, 2)) MB)" "Success"
} else {
    Write-Status "No se encontró el archivo de frontend compilado en $compiledZip" "Error"
    Write-Status "Ejecuta primero 'compilar_frontend_local.ps1'" "Error"
    exit 1
}

# Verificar el Dockerfile y scripts de despliegue
$nginxDir = "$DeployDir\frontend-nginx"
$requiredFiles = @(
    "$nginxDir\frontend-nginx.Dockerfile",
    "$nginxDir\nginx.conf",
    "$nginxDir\deploy-nginx-detailed.sh"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Status "Archivo $([IO.Path]::GetFileName($file)) encontrado" "Success"
    } else {
        Write-Status "No se encontró el archivo $([IO.Path]::GetFileName($file))" "Error"
        exit 1
    }
}

# Verificar clave SSH
if (Test-Path $AWSKey) {
    Write-Status "Clave SSH para AWS encontrada" "Success"
} else {
    Write-Status "No se encontró la clave SSH en $AWSKey" "Error"
    exit 1
}

# 2. Preparar servidor y verificar conexión
Write-Status "VERIFICANDO CONEXIÓN AL SERVIDOR AWS" "Header"

# Verificar que podemos conectarnos al servidor
try {
    Write-Status "Comprobando conexión SSH..." "Info"
    $sshTestCommand = "ssh -i `"$AWSKey`" $EC2User 'echo Conexion SSH exitosa'"
    $sshResult = Invoke-Expression $sshTestCommand
    if ($sshResult -like "*Conexion SSH exitosa*") {
        Write-Status "Conexión SSH verificada" "Success"
    } else {
        throw "La conexión no devolvió el mensaje esperado"
    }
} catch {
    Write-Status "Error en la conexión SSH al servidor AWS: $_" "Error"
    Write-Status "Verifica que la IP del servidor sea correcta y que la clave SSH tenga los permisos adecuados" "Warning"
    exit 1
}

# 3. Crear directorios remotos
Write-Status "PREPARANDO DIRECTORIOS REMOTOS" "Header"
Invoke-Expression "ssh -i `"$AWSKey`" $EC2User 'mkdir -p $RemoteDir/frontend-nginx'"

# 4. Transferir archivos al servidor
Write-Status "TRANSFIRIENDO ARCHIVOS AL SERVIDOR" "Header"

# Transferir frontend compilado
Write-Status "Transfiriendo frontend compilado..." "Info"
Invoke-Expression "scp -i `"$AWSKey`" `"$compiledZip`" $EC2User`:$RemoteDir/"
if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend compilado transferido" "Success"
} else {
    Write-Status "Error al transferir frontend compilado" "Error"
    exit 1
}

# Transferir archivos de Nginx
Write-Status "Transfiriendo archivos de configuración de Nginx..." "Info"
Invoke-Expression "scp -i `"$AWSKey`" `"$nginxDir\frontend-nginx.Dockerfile`" $EC2User`:$RemoteDir/frontend-nginx/"
Invoke-Expression "scp -i `"$AWSKey`" `"$nginxDir\nginx.conf`" $EC2User`:$RemoteDir/frontend-nginx/"
Invoke-Expression "scp -i `"$AWSKey`" `"$nginxDir\deploy-nginx-detailed.sh`" $EC2User`:$RemoteDir/frontend-nginx/"
Invoke-Expression "scp -i `"$AWSKey`" `"$nginxDir\index.html`" $EC2User`:$RemoteDir/frontend-nginx/"

if ($LASTEXITCODE -eq 0) {
    Write-Status "Archivos de configuración transferidos" "Success"
} else {
    Write-Status "Error al transferir archivos de configuración" "Error"
    exit 1
}

# 5. Ejecutar script de despliegue remoto
Write-Status "EJECUTANDO DESPLIEGUE EN EL SERVIDOR" "Header"

# Hacer el script ejecutable
Invoke-Expression "ssh -i `"$AWSKey`" $EC2User 'chmod +x $RemoteDir/frontend-nginx/deploy-nginx-detailed.sh'"

# Ejecutar el script de despliegue
Write-Status "Iniciando despliegue en el servidor (puede tardar unos minutos)..." "Warning"
Write-Status "Los logs detallados se mostrarán a continuación:" "Info"
Write-Host "" "Info"

$deployCommand = "ssh -i `"$AWSKey`" $EC2User 'cd $RemoteDir && cp frontend-compiled.zip frontend-nginx/ && cd frontend-nginx && ./deploy-nginx-detailed.sh'"
Invoke-Expression $deployCommand

# Verificar resultado del despliegue
if ($LASTEXITCODE -eq 0) {
    Write-Status "DESPLIEGUE COMPLETADO EXITOSAMENTE" "Header"
} else {
    Write-Status "ERROR EN EL DESPLIEGUE" "Error"
    Write-Status "Revisa los logs en el servidor para más detalles" "Warning"
    exit 1
}

# 6. Verificar acceso al frontend
Write-Status "VERIFICANDO ACCESO AL FRONTEND" "Header"

# Intentar acceder al frontend
try {
    $response = Invoke-WebRequest -Uri "http://$AWSServerIP" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Status "Frontend accesible en http://$AWSServerIP" "Success"
    } else {
        Write-Status "El servidor respondió con código: $($response.StatusCode)" "Warning"
    }
} catch {
    Write-Status "No se pudo acceder al frontend: $_" "Error"
}

# 7. Recuperar logs del servidor
Write-Status "RECUPERANDO LOGS DEL SERVIDOR" "Header"

$remoteLogsCommand = "ssh -i `"$AWSKey`" $EC2User 'cd $RemoteDir/frontend-nginx && cat deploy-frontend-nginx.log'"
$remoteLogs = Invoke-Expression $remoteLogsCommand
$remoteLogs | Out-File -FilePath "$DeployDir\despliegue_frontend_nginx_aws_remote.log" -Force

Write-Status "Logs remotos guardados en $DeployDir\despliegue_frontend_nginx_aws_remote.log" "Success"

# 8. Resumen final
Write-Status "RESUMEN FINAL DEL DESPLIEGUE" "Header"
Write-Status "Frontend desplegado en http://$AWSServerIP" "Success"
Write-Status "Para ver los logs del contenedor: ssh -i `"$AWSKey`" $EC2User 'docker logs masclet-frontend'" "Info"
Write-Status "Para reiniciar el contenedor: ssh -i `"$AWSKey`" $EC2User 'docker restart masclet-frontend'" "Info"
Write-Status "Para verificar el estado: ssh -i `"$AWSKey`" $EC2User 'docker ps | grep masclet-frontend'" "Info"

Write-Status "Despliegue completado a las $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Success"
