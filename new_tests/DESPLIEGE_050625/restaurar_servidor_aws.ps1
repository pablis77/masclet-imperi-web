#!/usr/bin/env pwsh
# Script para restaurar la base de datos y backend en AWS después del borrado accidental
# Fecha: 05/06/2025

# Configuración de variables
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2IP = "54.217.31.124"  # Nueva IP
$EC2User = "ec2-user@$EC2IP"
$LocalDBBackupPath = "C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-db-imagen-completa.tar.gz"
$LocalAPIBackupPath = "C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-api-imagen-completa.tar.gz"
$RemoteBackupDir = "/home/ec2-user/backup_images"

Write-Host "=== RESTAURACIÓN DE EMERGENCIA DEL SERVIDOR AWS ===" -ForegroundColor Cyan
Write-Host "Restaurando contenedores después del borrado accidental." -ForegroundColor Yellow

# Verificar que el servidor está disponible
Write-Host "Verificando conexión SSH al servidor AWS..." -ForegroundColor Yellow
try {
    $sshTestCommand = "ssh -i `"$AWSKey`" $EC2User -o StrictHostKeyChecking=no 'echo Conexion SSH exitosa'"
    Invoke-Expression $sshTestCommand 2>&1
    Write-Host "Conexión SSH establecida correctamente" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: No se pudo conectar al servidor AWS mediante SSH" -ForegroundColor Red
    exit 1
}

# Verificar que existen los archivos de backup localmente
if (-not (Test-Path $LocalDBBackupPath)) {
    Write-Host "ERROR: No se encuentra el backup de la base de datos en: $LocalDBBackupPath" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $LocalAPIBackupPath)) {
    Write-Host "ERROR: No se encuentra el backup del API en: $LocalAPIBackupPath" -ForegroundColor Red
    exit 1
}

# Crear directorio para las imágenes de backup en el servidor
Write-Host "Creando directorio para las imágenes de backup en el servidor..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "mkdir -p $RemoteBackupDir"

# Transferir las imágenes de backup al servidor
Write-Host "Transfiriendo la imagen de la base de datos al servidor..." -ForegroundColor Yellow
scp -i $AWSKey $LocalDBBackupPath $EC2User`:$RemoteBackupDir/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo transferir la imagen de la base de datos" -ForegroundColor Red
    exit 1
}

Write-Host "Transfiriendo la imagen del API al servidor..." -ForegroundColor Yellow
scp -i $AWSKey $LocalAPIBackupPath $EC2User`:$RemoteBackupDir/
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo transferir la imagen del API" -ForegroundColor Red
    exit 1
}

# Cargar las imágenes en Docker
Write-Host "Cargando la imagen de la base de datos en Docker..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker load -i $RemoteBackupDir/masclet-db-imagen-completa.tar.gz"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo cargar la imagen de la base de datos en Docker" -ForegroundColor Red
    exit 1
}

Write-Host "Cargando la imagen del API en Docker..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker load -i $RemoteBackupDir/masclet-api-imagen-completa.tar.gz"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo cargar la imagen del API en Docker" -ForegroundColor Red
    exit 1
}

# Iniciar los contenedores
Write-Host "Iniciando el contenedor de la base de datos..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker run -d --name masclet-db -p 5432:5432 masclet-db-imagen-completa:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo iniciar el contenedor de la base de datos" -ForegroundColor Red
    exit 1
}

# Esperar a que la base de datos esté lista antes de iniciar el API
Write-Host "Esperando 10 segundos para que la base de datos se inicialice..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Iniciando el contenedor del API..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker run -d --name masclet-backend -p 8000:8000 --link masclet-db:db masclet-api-imagen-completa:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo iniciar el contenedor del API" -ForegroundColor Red
    exit 1
}

# Verificar que los contenedores están en ejecución
Write-Host "Verificando que los contenedores están en ejecución..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker ps -a"

Write-Host "`n=== RESTAURACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "Los servicios de base de datos y backend deberían estar funcionando." -ForegroundColor Cyan
Write-Host "Ahora podemos proceder con el despliegue del frontend." -ForegroundColor Cyan
