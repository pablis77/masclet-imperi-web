#!/usr/bin/env pwsh
# Script para limpiar el servidor AWS y actualizar la configuración de Swagger
# Fecha: 05/06/2025

# Configuración de variables
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2IP = "54.217.31.124"
$EC2User = "ec2-user@$EC2IP"

Write-Host "=== LIMPIEZA DE EMERGENCIA DEL SERVIDOR AWS ===" -ForegroundColor Cyan

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

# Mostrar estado inicial del sistema
Write-Host "`nEstado actual del servidor:" -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "df -h"

# Mostrar estado actual de Docker
Write-Host "`nEstado actual de Docker:" -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker system df"

# Parar y eliminar todos los contenedores
Write-Host "`nEliminando todos los contenedores Docker..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker ps -aq | xargs -r docker stop && docker ps -aq | xargs -r docker rm"

# Eliminar todas las imágenes Docker
Write-Host "`nEliminando todas las imágenes Docker..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker images -q | xargs -r docker rmi -f"

# Eliminar todos los volúmenes no utilizados
Write-Host "`nEliminando volúmenes Docker no utilizados..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker volume prune -f"

# Limpiar el caché de construcción de Docker
Write-Host "`nLimpiando caché de construcción de Docker..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker builder prune -af"

# Eliminar archivos temporales del sistema
Write-Host "`nEliminando archivos temporales del sistema..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "sudo rm -rf /tmp/* /var/tmp/* /home/ec2-user/temp_* 2>/dev/null || true"

# Limpiar logs antiguos
Write-Host "`nEliminando logs antiguos..." -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "sudo find /var/log -type f -name '*.gz' -delete"

# Mostrar estado final del sistema
Write-Host "`nEstado final del servidor:" -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "df -h"

# Mostrar estado final de Docker
Write-Host "`nEstado final de Docker:" -ForegroundColor Yellow
ssh -i $AWSKey $EC2User -o StrictHostKeyChecking=no "docker system df"

Write-Host "`n=== LIMPIEZA COMPLETADA ===" -ForegroundColor Green
Write-Host "El servidor está listo para el despliegue." -ForegroundColor Cyan
