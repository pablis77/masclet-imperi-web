# Script para hacer backup del backend en AWS
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\Proyectos\claude\masclet-imperi-web\backend\backups"
$backupFile = "$backupDir\backend_$timestamp.tar"
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "108.129.139.119"

# Asegurar que existe la carpeta de destino
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
}

Write-Host "=== BACKUP DEL CONTENEDOR BACKEND EN AWS ===" -ForegroundColor Cyan
Write-Host "1. Generando archivo TAR del contenedor backend..." -ForegroundColor Yellow

# Conectar por SSH y crear un backup del contenedor backend
$sshCommand = "docker commit masclet-backend masclet-backend-backup:$timestamp && docker save -o ~/backend_$timestamp.tar masclet-backend-backup:$timestamp"
ssh -i $keyPath "ec2-user@$serverIP" $sshCommand

Write-Host "2. Descargando archivo de backup desde AWS..." -ForegroundColor Yellow
$remotePath = "~/backend_$timestamp.tar"
scp -i $keyPath "ec2-user@$serverIP`:$remotePath" $backupFile

# Verificar que se descargó correctamente
if (Test-Path $backupFile) {
    $fileInfo = Get-Item $backupFile
    Write-Host "  - Backup del backend descargado: $($fileInfo.FullName)" -ForegroundColor Green
    Write-Host "  - Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
    
    # Limpiar archivo temporal en el servidor
    $cleanCommand = "rm -f ~/backend_$timestamp.tar && docker rmi masclet-backend-backup:$timestamp"
    ssh -i $keyPath "ec2-user@$serverIP" $cleanCommand
} else {
    Write-Host "ERROR: No se pudo descargar el archivo de backup" -ForegroundColor Red
    exit 1
}

# Descargar también el Dockerfile y requirements.txt
Write-Host "3. Descargando archivos de configuración..." -ForegroundColor Yellow
$dockerfileCommand = "cat /home/ec2-user/backend.Dockerfile"
ssh -i $keyPath "ec2-user@$serverIP" $dockerfileCommand | Out-File -FilePath "$backupDir\backend.Dockerfile" -Encoding utf8 -Force

$requirementsCommand = "cat /home/ec2-user/requirements.txt"
ssh -i $keyPath "ec2-user@$serverIP" $requirementsCommand | Out-File -FilePath "$backupDir\requirements.txt" -Encoding utf8 -Force

Write-Host "`nBACKUP DEL BACKEND COMPLETADO" -ForegroundColor Green
Write-Host "Archivo de backup: $backupFile" -ForegroundColor Cyan
Write-Host "Dockerfile: $backupDir\backend.Dockerfile" -ForegroundColor Cyan
Write-Host "Requirements: $backupDir\requirements.txt" -ForegroundColor Cyan
