#!/usr/bin/env pwsh
# Script para limpiar imágenes Docker innecesarias en AWS
# Fecha: 05/06/2025

# Configuración de variables
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2IP = "54.217.31.124"
$EC2User = "ec2-user@$EC2IP"

Write-Host "=== LIMPIEZA DE IMÁGENES DOCKER EN AWS ===" -ForegroundColor Cyan
Write-Host "Este script mantendrá solo las imágenes activas y el backup más reciente" -ForegroundColor Cyan

# Verificar que el servidor está disponible
Write-Host "Verificando conexión SSH al servidor AWS..." -ForegroundColor Yellow
try {
    $sshTestCommand = "ssh -i `"$AWSKey`" $EC2User 'echo Conexion SSH exitosa'"
    Invoke-Expression $sshTestCommand
}
catch {
    Write-Host "Error en la conexión SSH al servidor AWS: $_" -ForegroundColor Red
    exit 1
}

# Mostrar imágenes actuales
Write-Host "Listado de imágenes Docker actuales:" -ForegroundColor Yellow
ssh -i "$AWSKey" $EC2User "docker images"

# Preguntar confirmación
$confirmacion = Read-Host "¿Continuar con la limpieza? Solo se mantendrán las imágenes activas y el backup más reciente. [S/N]"
if ($confirmacion -ne "S") {
    Write-Host "Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

# Obtener espacio antes de la limpieza
Write-Host "Espacio en disco antes de la limpieza:" -ForegroundColor Yellow
ssh -i "$AWSKey" $EC2User "df -h"

# Ejecutar limpieza de imágenes
Write-Host "Eliminando imágenes de backup antiguas..." -ForegroundColor Yellow

# Eliminar directamente las imágenes por nombre
ssh -i "$AWSKey" $EC2User @"
# Imágenes a eliminar (todas menos las activas y el backup más reciente)
docker rmi masclet-api-backup-20250605_141502:latest
docker rmi masclet-db-backup-20250605_141502:latest
docker rmi masclet-api-backup-20250605_130400:latest
docker rmi masclet-db-backup-20250605_130400:latest

echo 'Imágenes que se mantendrán:'
echo '- masclet-api-imagen-completa (imagen activa API)'
echo '- masclet-db-imagen-completa (imagen activa DB)'
echo '- masclet-api-backup-20250605_141634 (backup más reciente API)'
echo '- masclet-db-backup-20250605_141634 (backup más reciente DB)'

echo 'Limpieza completada.'
"@

# Mostrar resultado final
Write-Host "Imágenes Docker después de la limpieza:" -ForegroundColor Green
ssh -i "$AWSKey" $EC2User "docker images"

# Obtener espacio después de la limpieza
Write-Host "Espacio en disco después de la limpieza:" -ForegroundColor Green
ssh -i "$AWSKey" $EC2User "df -h"

Write-Host "=== LIMPIEZA FINALIZADA ===" -ForegroundColor Cyan
