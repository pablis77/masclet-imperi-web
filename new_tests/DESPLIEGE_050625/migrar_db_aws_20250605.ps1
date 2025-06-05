# Script de migración de base de datos local a AWS
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "C:\Proyectos\claude\masclet-imperi-web\backend\backups\backup_masclet_imperi_$timestamp.sql"
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "108.129.139.119"

# Credenciales locales (del archivo .env)
$localDbUser = "postgres"
$localDbPass = "1234"
$localDbName = "masclet_imperi"
$localDbPort = "5433"

# Credenciales AWS
$awsDbUser = "admin"
$awsDbPass = "admin123"
$awsDbName = "masclet_imperi"

Write-Host "=== MIGRACIÓN DE BASE DE DATOS LOCAL A AWS ===" -ForegroundColor Cyan
Write-Host "1. Creando backup local..." -ForegroundColor Yellow
# Usamos la variable de entorno PGPASSWORD para evitar que pida contraseña
$env:PGPASSWORD = $localDbPass
pg_dump -U $localDbUser -d $localDbName -p $localDbPort -f "$backupFile"

# Verificamos que se creó correctamente
if (Test-Path $backupFile) {
    $fileInfo = Get-Item $backupFile
    Write-Host "  - Backup creado: $($fileInfo.FullName)" -ForegroundColor Green
    Write-Host "  - Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "ERROR: No se pudo crear el archivo de backup" -ForegroundColor Red
    exit 1
}

Write-Host "2. Transfiriendo backup a AWS..." -ForegroundColor Yellow
Try {
    scp -i "$keyPath" "$backupFile" "ec2-user@${serverIP}:/home/ec2-user/masclet_backup.sql"
    Write-Host "  - Transferencia completada" -ForegroundColor Green
} Catch {
    Write-Host "ERROR: Fallo al transferir el archivo de backup a AWS" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "3. Restaurando en AWS..." -ForegroundColor Yellow

# Primero verificamos si hay tablas existentes y las contamos
Write-Host "  - Verificando estado actual de la base de datos AWS..." -ForegroundColor Yellow
$tablesBeforeImport = ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c '\dt' | wc -l"
Write-Host "  - Tablas antes de importar: $tablesBeforeImport" -ForegroundColor Cyan

# Ejecutamos la restauración
Try {
    # En PowerShell SSH no podemos usar el operador < para redirección
    # En su lugar, usamos cat para enviar el contenido del archivo por SSH
    ssh -i "$keyPath" "ec2-user@$serverIP" "cat /home/ec2-user/masclet_backup.sql | docker exec -i masclet-db psql -U $awsDbUser -d $awsDbName"
    Write-Host "  - Restauración completada" -ForegroundColor Green
} Catch {
    Write-Host "ERROR: Fallo al restaurar la base de datos en AWS" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "4. Verificando restauración..." -ForegroundColor Yellow

# Verificamos que las tablas principales existan
Write-Host "  - Listado de tablas en AWS:" -ForegroundColor Yellow
$tablesAfterImport = ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c '\dt' | wc -l"
ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -c '\dt'"

# Comparamos el número de tablas antes y después
Write-Host "  - Tablas antes de la importación: $tablesBeforeImport" -ForegroundColor Cyan
Write-Host "  - Tablas después de la importación: $tablesAfterImport" -ForegroundColor Cyan

# Obtenemos conteos de registros en las tablas principales
Write-Host "`n  - Recuento de registros en tablas principales:" -ForegroundColor Yellow

$animalsCount = ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM animals;'"
Write-Host "    * Animals: $($animalsCount.Trim())" -ForegroundColor Cyan

$partsCount = ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM part;'"
Write-Host "    * Part: $($partsCount.Trim())" -ForegroundColor Cyan

$usersCount = ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM users;'"
Write-Host "    * Users: $($usersCount.Trim())" -ForegroundColor Cyan

# Verificamos si hay conexiones activas a la base de datos
Write-Host "`n  - Conexiones activas a la base de datos:" -ForegroundColor Yellow
ssh -i "$keyPath" "ec2-user@$serverIP" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -c 'SELECT count(*) FROM pg_stat_activity WHERE datname = ''$awsDbName'''"

# Limpiamos el archivo de backup temporal en el servidor AWS
Write-Host "`n5. Limpiando archivos temporales..." -ForegroundColor Yellow
ssh -i "$keyPath" "ec2-user@$serverIP" "rm -f /home/ec2-user/masclet_backup.sql"
Write-Host "  - Archivos temporales eliminados" -ForegroundColor Green

# Resumen final
Write-Host "`n=== RESUMEN DE LA MIGRACIÓN ===" -ForegroundColor Green
Write-Host "Archivo de backup: $backupFile" -ForegroundColor Cyan
Write-Host "Tablas migradas: $tablesAfterImport" -ForegroundColor Cyan
Write-Host "Registros en Animals: $($animalsCount.Trim())" -ForegroundColor Cyan
Write-Host "Registros en Part: $($partsCount.Trim())" -ForegroundColor Cyan
Write-Host "Registros en Users: $($usersCount.Trim())" -ForegroundColor Cyan
Write-Host "`n=== MIGRACIÓN COMPLETADA CON ÉXITO ===" -ForegroundColor Green
Write-Host "Fecha y hora: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
