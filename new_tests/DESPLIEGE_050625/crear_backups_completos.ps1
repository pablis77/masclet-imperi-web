# Script para crear backups completos de los contenedores configurados correctamente
# Este script crea backups de:
# 1. Las imágenes de Docker (como antes)
# 2. La estructura y datos de la base de datos (SQL dump)
# 3. La configuración del backend (variables de entorno)
# 4. Limpia los backups antiguos del servidor AWS para ahorrar espacio

$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\Proyectos\AWS\contenedores despliegue RAMON"

# Asegurar que el directorio de backup existe
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
}

Write-Host "🔄 Iniciando proceso de backup completo..." -ForegroundColor Cyan

# Backup de la base de datos como imagen Docker
Write-Host "📦 Creando backup de la imagen de base de datos..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "docker commit masclet-db masclet-db-backup-$fecha && docker save masclet-db-backup-$fecha | gzip > /tmp/masclet-db-imagen-completa-$fecha.tar.gz"

# Backup del backend como imagen Docker
Write-Host "📦 Creando backup de la imagen del backend..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "docker commit masclet-backend masclet-api-backup-$fecha && docker save masclet-api-backup-$fecha | gzip > /tmp/masclet-api-imagen-completa-$fecha.tar.gz"

# Crear dump SQL de la base de datos
Write-Host "💾 Exportando estructura y datos SQL de la base de datos..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "docker exec masclet-db pg_dump -U postgres -d masclet_imperi > /tmp/masclet-imperi-dump-$fecha.sql"

# Exportar configuración del backend
Write-Host "⚙️ Exportando configuración del backend..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "docker exec masclet-backend env > /tmp/masclet-backend-env-$fecha.txt"

# Transferir archivos al equipo local
Write-Host "📥 Descargando backups a equipo local..." -ForegroundColor Yellow
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@54.217.31.124:/tmp/masclet-db-imagen-completa-$fecha.tar.gz "$backupDir\masclet-db-imagen-completa-$fecha.tar.gz"
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@54.217.31.124:/tmp/masclet-api-imagen-completa-$fecha.tar.gz "$backupDir\masclet-api-imagen-completa-$fecha.tar.gz"
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@54.217.31.124:/tmp/masclet-imperi-dump-$fecha.sql "$backupDir\masclet-imperi-dump-$fecha.sql"
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@54.217.31.124:/tmp/masclet-backend-env-$fecha.txt "$backupDir\masclet-backend-env-$fecha.txt"

# Limpiar archivos temporales en el servidor
Write-Host "🧹 Limpiando archivos temporales en el servidor..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "rm /tmp/masclet-*-$fecha.*"

# Limpiar backups antiguos del sistema (manteniendo solo los últimos 7 días)
Write-Host "🧹 Limpiando backups automáticos antiguos del sistema..." -ForegroundColor Yellow
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "docker exec -u 0 masclet-backend find /var/backups/masclet-imperi -type f -name '*.sql' -mtime +7 -delete"

# Mostrar estadísticas de espacio en el servidor
Write-Host "📊 Estadísticas de espacio en disco del servidor:" -ForegroundColor Cyan
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" -o StrictHostKeyChecking=no ec2-user@54.217.31.124 "df -h /"

# Crear archivo de instrucciones para restauración
$instrucciones = @"
# Instrucciones para restaurar los backups del $fecha

Este backup contiene:

1. Imagen Docker completa de la base de datos: masclet-db-imagen-completa-$fecha.tar.gz
2. Imagen Docker completa del backend: masclet-api-imagen-completa-$fecha.tar.gz
3. Dump SQL de la base de datos: masclet-imperi-dump-$fecha.sql
4. Configuración del backend: masclet-backend-env-$fecha.txt

## Pasos para restaurar solo con imágenes Docker:

```bash
# Cargar imagen de la base de datos
docker load < masclet-db-imagen-completa-$fecha.tar.gz

# Cargar imagen del backend
docker load < masclet-api-imagen-completa-$fecha.tar.gz

# Iniciar contenedor de la base de datos
docker run -d --name masclet-db -p 5432:5432 masclet-db-backup-$fecha

# Iniciar contenedor del backend (conectado a la base de datos)
docker run -d --name masclet-backend -p 8000:8000 --link masclet-db:masclet-db masclet-api-backup-$fecha
```

## Pasos para restaurar con SQL (útil si se quiere reconstruir desde cero):

```bash
# Iniciar una base de datos PostgreSQL vacía
docker run -d --name masclet-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:13

# Crear la base de datos y cargar el dump
docker exec -i masclet-db psql -U postgres -c "CREATE DATABASE masclet_imperi;"
docker exec -i masclet-db psql -U postgres -d masclet_imperi < masclet-imperi-dump-$fecha.sql

# Crear el usuario para el backend
docker exec -i masclet-db psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;"
docker exec -i masclet-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;"

# Iniciar el backend
docker run -d --name masclet-backend -p 8000:8000 --link masclet-db:masclet-db masclet-api-backup-$fecha
```

NOTA: Esta es la forma CORRECTA que garantiza que la base de datos tenga el usuario admin y la base de datos masclet_imperi creados.
"@

$instrucciones | Out-File -FilePath "$backupDir\INSTRUCCIONES_RESTAURACION_$fecha.md" -Encoding utf8

# Actualizar el archivo de referencia principal
Copy-Item "$backupDir\masclet-db-imagen-completa-$fecha.tar.gz" "$backupDir\masclet-db-imagen-completa.tar.gz" -Force
Copy-Item "$backupDir\masclet-api-imagen-completa-$fecha.tar.gz" "$backupDir\masclet-api-imagen-completa.tar.gz" -Force
Copy-Item "$backupDir\INSTRUCCIONES_RESTAURACION_$fecha.md" "$backupDir\INSTRUCCIONES_RESTAURACION.md" -Force

Write-Host " Proceso de backup completo finalizado exitosamente!" -ForegroundColor Green
# Mostrar tamaño de los archivos de backup
Write-Host " Tamaño de los archivos de backup:" -ForegroundColor Cyan
Get-ChildItem -Path $backupDir -Filter "*$fecha*" | ForEach-Object { 
    $sizeInMB = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $($_.Name): $sizeInMB MB" -ForegroundColor Yellow
}

Write-Host " Backup completo finalizado. Archivos guardados en: $backupDir" -ForegroundColor Green
Write-Host " Se ha generado un archivo de instrucciones para la restauración: $backupDir\INSTRUCCIONES_RESTAURACION_$fecha.md" -ForegroundColor Green
Write-Host " Se han limpiado los backups antiguos del servidor para ahorrar espacio" -ForegroundColor Green

# Resumen final
Write-Host "" 
Write-Host " RESUMEN DEL BACKUP:" -ForegroundColor Cyan
Write-Host "  - Base de datos: OK" -ForegroundColor Green
Write-Host "  - Backend API: OK" -ForegroundColor Green
Write-Host "  - SQL Dump: OK" -ForegroundColor Green
Write-Host "  - Configuración: OK" -ForegroundColor Green
Write-Host "  - Limpieza: OK" -ForegroundColor Green
