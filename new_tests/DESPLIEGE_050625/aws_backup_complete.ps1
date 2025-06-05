# Script de backup completo del backend AWS - 05/06/2025
# Este script realiza:
# 1. Backup de la base de datos
# 2. Copia de archivos de configuración
# 3. Verificación del estado de los contenedores

# Configuración
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2User = "ec2-user"
$EC2Address = "108.129.139.119"
$LocalBackupFolder = "C:\Proyectos\claude\masclet-imperi-web\backup_aws_20250605"
$DBContainer = "masclet-db"
$BackendContainer = "masclet-backend"

# Crear directorio local si no existe
if (-not (Test-Path -Path $LocalBackupFolder)) {
    New-Item -ItemType Directory -Path $LocalBackupFolder | Out-Null
    Write-Host "Directorio de backup creado: $LocalBackupFolder" -ForegroundColor Green
}

# 1. Backup de la base de datos completa
Write-Host "Iniciando backup de la base de datos desde AWS..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "backup_masclet_imperi_aws_$timestamp.sql"
$backupFileTemp = "/home/ec2-user/$backupFileName"

# Ejecutar el backup en el servidor AWS
ssh -i $AWSKey $EC2User@$EC2Address "docker exec $DBContainer pg_dump -U admin -d masclet_imperi > $backupFileTemp"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup de base de datos creado en AWS: $backupFileTemp" -ForegroundColor Green
} else {
    Write-Host "Error al crear backup de base de datos en AWS" -ForegroundColor Red
    exit 1
}

# Descargar el backup a local
Write-Host "Descargando backup a disco local..." -ForegroundColor Cyan
scp -i $AWSKey "$EC2User@$EC2Address`:$backupFileTemp" "$LocalBackupFolder\$backupFileName"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup de base de datos descargado a: $LocalBackupFolder\$backupFileName" -ForegroundColor Green
} else {
    Write-Host "Error al descargar backup de base de datos" -ForegroundColor Red
}

# 2. Copiar archivos de configuración
Write-Host "Copiando archivos de configuración desde AWS..." -ForegroundColor Cyan

# Crear directorio para archivos de configuración
$configDir = "$LocalBackupFolder\config"
if (-not (Test-Path -Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir | Out-Null
}

# Descargar archivo .env.aws
ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/masclet-backend/.env" > "$configDir\backend.env.aws"
Write-Host "Archivo backend.env.aws copiado" -ForegroundColor Green

# Copiar archivo requirements.txt usado en AWS
ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/masclet-backend/requirements.txt" > "$configDir\requirements.txt.aws"
Write-Host "Archivo requirements.txt.aws copiado" -ForegroundColor Green

# Copiar docker-compose si existe
ssh -i $AWSKey $EC2User@$EC2Address "if [ -f /home/ec2-user/masclet-backend/docker-compose.yml ]; then cat /home/ec2-user/masclet-backend/docker-compose.yml; fi" > "$configDir\docker-compose.backend.yml"
Write-Host "Archivo docker-compose.backend.yml copiado" -ForegroundColor Green

# 3. Obtener información de los contenedores
Write-Host "Obteniendo información de los contenedores..." -ForegroundColor Cyan
$containersDir = "$LocalBackupFolder\containers"
if (-not (Test-Path -Path $containersDir)) {
    New-Item -ItemType Directory -Path $containersDir | Out-Null
}

# Información del contenedor de base de datos
ssh -i $AWSKey $EC2User@$EC2Address "docker inspect $DBContainer" > "$containersDir\db_container.json"
Write-Host "Información del contenedor DB guardada" -ForegroundColor Green

# Información del contenedor de backend
ssh -i $AWSKey $EC2User@$EC2Address "docker inspect $BackendContainer" > "$containersDir\backend_container.json"
Write-Host "Información del contenedor Backend guardada" -ForegroundColor Green

# 4. Crear archivo de documentación con timestamp
$docsContent = @"
# BACKUP COMPLETO DE MASCLET-IMPERI BACKEND EN AWS

Fecha: $(Get-Date -Format "dd/MM/yyyy")
Hora: $(Get-Date -Format "HH:mm:ss")

## Contenidos de este backup

1. **Base de datos**
   - Archivo: $backupFileName
   - Tamaño: $((Get-Item "$LocalBackupFolder\$backupFileName").Length / 1MB) MB

2. **Archivos de configuración**
   - backend.env.aws: Variables de entorno para el backend
   - requirements.txt.aws: Dependencias compatibles para el backend
   - docker-compose.backend.yml: Configuración del contenedor backend

3. **Información de contenedores**
   - db_container.json: Configuración del contenedor PostgreSQL
   - backend_container.json: Configuración del contenedor Backend FastAPI

## Instrucciones para restauración rápida

1. **Base de datos**: Usar uno de estos métodos:
   - Opción 1: Restaurar desde el archivo SQL:
     ```
     cat $backupFileName | docker exec -i masclet-db psql -U admin -d masclet_imperi
     ```
   - Opción 2: Usar nuestro script de importación:
     ```
     python backend\scripts\restore_database.py --file backup_aws_20250605\$backupFileName
     ```

2. **Backend**: Crear contenedor con:
   ```
   docker-compose -f docker-compose.backend.yml up -d
   ```

3. **Frontend**: Usar configuración estándar con:
   ```
   docker-compose -f docker-compose.frontend.yml up -d
   ```

Nota: Este backup contiene toda la configuración necesaria para recrear el entorno de AWS localmente o en otro servidor.
"@

$docsContent | Out-File -FilePath "$LocalBackupFolder\README.md" -Encoding utf8
Write-Host "Documentación generada: $LocalBackupFolder\README.md" -ForegroundColor Green

# Resumen final
Write-Host "`nBACKUP COMPLETO FINALIZADO" -ForegroundColor Green
Write-Host "Todos los archivos guardados en: $LocalBackupFolder" -ForegroundColor Green
Write-Host "Para instrucciones detalladas, consulta: $LocalBackupFolder\README.md" -ForegroundColor Cyan
