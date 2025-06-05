# =================================================================
# Script de restauración de emergencia para la base de datos Masclet Imperi en AWS
# =================================================================
# Este script permite:
#  1. Restaurar cualquier backup SQL en el servidor AWS sin complicaciones
#  2. Realizar la restauración limpia eliminando la base de datos anterior
#  3. Verificar que la restauración fue correcta
#  4. Reiniciar automáticamente los servicios necesarios
# =================================================================

param(
    [string]$backupFile = "",
    [switch]$listarBackups = $false,
    [switch]$latest = $false,
    [string]$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem",
    [string]$serverIP = "54.217.31.124",
    [string]$awsUser = "ec2-user",
    [string]$awsDbUser = "admin",
    [string]$awsDbName = "masclet_imperi"
)

# Colores para facilitar la lectura de logs
$colorInfo = "Cyan"
$colorSuccess = "Green" 
$colorWarning = "Yellow"
$colorError = "Red"

# Función para mostrar mensajes formateados
function Write-LogMessage {
    param (
        [string]$message,
        [string]$color = $colorInfo,
        [switch]$noNewline = $false
    )
    
    if ($noNewline) {
        Write-Host $message -ForegroundColor $color -NoNewline
    } else {
        Write-Host $message -ForegroundColor $color
    }
}

# Verificar conexión SSH con el servidor AWS
function Test-SshConnection {
    Write-LogMessage "Verificando conexión SSH al servidor AWS..." -color $colorWarning
    
    try {
        $output = ssh -i "$keyPath" "${awsUser}@${serverIP}" "echo Conexión SSH exitosa"
        if ($output -like "*exitosa*") {
            Write-LogMessage "  - Conexión SSH establecida" -color $colorSuccess
            return $true
        } else {
            Write-LogMessage "ERROR: No se pudo establecer conexión SSH con el servidor" -color $colorError
            return $false
        }
    } catch {
        Write-LogMessage "ERROR: Fallo en la conexión SSH" -color $colorError
        Write-LogMessage $_.Exception.Message -color $colorError
        return $false
    }
}

# Listar backups disponibles en la carpeta local
function Get-LocalBackups {
    $backupFolder = "C:\Proyectos\claude\masclet-imperi-web\backend\backups"
    if (!(Test-Path $backupFolder)) {
        Write-LogMessage "ERROR: No se encontró la carpeta de backups: $backupFolder" -color $colorError
        return @()
    }
    
    $backups = Get-ChildItem -Path $backupFolder -Filter "*.sql" | Sort-Object LastWriteTime -Descending
    return $backups
}

# Transferir archivo de backup al servidor AWS
function Send-BackupToServer {
    param([string]$localBackupPath)
    
    $backupFileName = Split-Path $localBackupPath -Leaf
    $remoteBackupPath = "/home/$awsUser/backup_para_restaurar.sql"
    
    Write-LogMessage "Transfiriendo backup al servidor AWS..." -color $colorWarning
    Write-LogMessage "  - Origen: $localBackupPath"
    Write-LogMessage "  - Destino: $remoteBackupPath"
    
    try {
        scp -i "$keyPath" "$localBackupPath" "${awsUser}@${serverIP}:$remoteBackupPath"
        Write-LogMessage "  - Transferencia completada correctamente" -color $colorSuccess
        return $true
    } catch {
        Write-LogMessage "ERROR: Fallo al transferir archivo de backup" -color $colorError
        Write-LogMessage $_.Exception.Message -color $colorError
        return $false
    }
}

# Restaurar base de datos desde el backup
function Restore-Database {
    Write-LogMessage "Restaurando base de datos en AWS..." -color $colorWarning
    
    try {
        # 1. Detener el backend para evitar conexiones durante la restauración
        Write-LogMessage "  - Deteniendo contenedor del backend..." -color $colorInfo
        ssh -i "$keyPath" "${awsUser}@${serverIP}" "sudo docker stop masclet-backend"
        
        # 2. Eliminar la base de datos actual
        Write-LogMessage "  - Eliminando base de datos existente..." -color $colorInfo
        ssh -i "$keyPath" "${awsUser}@${serverIP}" "sudo docker exec masclet-db psql -U postgres -c 'DROP DATABASE IF EXISTS $awsDbName;'"
        
        # 3. Recrear la base de datos vacía
        Write-LogMessage "  - Creando nueva base de datos vacía..." -color $colorInfo
        ssh -i "$keyPath" "${awsUser}@${serverIP}" "sudo docker exec masclet-db psql -U postgres -c 'CREATE DATABASE $awsDbName;'"
        
        # 4. Otorgar permisos al usuario admin
        Write-LogMessage "  - Configurando permisos..." -color $colorInfo
        ssh -i "$keyPath" "${awsUser}@${serverIP}" "sudo docker exec masclet-db psql -U postgres -c 'GRANT ALL PRIVILEGES ON DATABASE $awsDbName TO $awsDbUser;'"
        
        # 5. Restaurar datos desde el backup
        Write-LogMessage "  - Importando datos del backup..." -color $colorInfo -noNewline
        $result = ssh -i "$keyPath" "${awsUser}@${serverIP}" "cat /home/$awsUser/backup_para_restaurar.sql | sudo docker exec -i masclet-db psql -U $awsDbUser -d $awsDbName"
        Write-LogMessage " Completado" -color $colorSuccess
        
        # 6. Reiniciar el backend
        Write-LogMessage "  - Reiniciando contenedor del backend..." -color $colorInfo
        ssh -i "$keyPath" "${awsUser}@${serverIP}" "sudo docker start masclet-backend"
        
        # 7. Esperar que el backend se inicie
        Write-LogMessage "  - Esperando que el backend esté operativo..." -color $colorInfo
        Start-Sleep -Seconds 5
        
        return $true
    } catch {
        Write-LogMessage "ERROR: Falló la restauración de la base de datos" -color $colorError
        Write-LogMessage $_.Exception.Message -color $colorError
        return $false
    }
}

# Verificar el estado de la base de datos restaurada
function Verify-Restoration {
    Write-LogMessage "Verificando estado de la base de datos restaurada..." -color $colorWarning
    
    try {
        # Verificamos tablas y conteos de registros
        $animalsCount = ssh -i "$keyPath" "${awsUser}@${serverIP}" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM animals;'"
        $partsCount = ssh -i "$keyPath" "${awsUser}@${serverIP}" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM part;'"
        $usersCount = ssh -i "$keyPath" "${awsUser}@${serverIP}" "docker exec masclet-db psql -U $awsDbUser -d $awsDbName -t -c 'SELECT COUNT(*) FROM users;'"
        
        Write-LogMessage "=== RESULTADOS DE LA RESTAURACIÓN ===" -color $colorSuccess
        Write-LogMessage "  - Animales: $($animalsCount.Trim())" -color $colorSuccess
        Write-LogMessage "  - Partos: $($partsCount.Trim())" -color $colorSuccess
        Write-LogMessage "  - Usuarios: $($usersCount.Trim())" -color $colorSuccess
        
        Write-LogMessage "Verificando estado del backend..." -color $colorWarning
        $backendStatus = ssh -i "$keyPath" "${awsUser}@${serverIP}" "docker inspect --format='{{.State.Status}}' masclet-backend"
        
        if ($backendStatus -eq "running") {
            Write-LogMessage "  - Estado del backend: CORRECTO (running)" -color $colorSuccess
        } else {
            Write-LogMessage "  - Estado del backend: ERROR ($backendStatus)" -color $colorError
            Write-LogMessage "  - Intentando reiniciar el backend..." -color $colorWarning
            ssh -i "$keyPath" "${awsUser}@${serverIP}" "docker start masclet-backend"
        }
        
        return $true
    } catch {
        Write-LogMessage "ERROR: Falló la verificación de la restauración" -color $colorError
        Write-LogMessage $_.Exception.Message -color $colorError
        return $false
    }
}

# LÓGICA PRINCIPAL DEL SCRIPT

# Mostrar banner
Write-LogMessage "============================================================" -color $colorInfo
Write-LogMessage "=== RESTAURADOR DE EMERGENCIA - BASE DE DATOS MASCLET IMPERI ===" -color $colorInfo
Write-LogMessage "============================================================" -color $colorInfo

# Verificar si solo necesitamos listar los backups disponibles
if ($listarBackups) {
    $backups = Get-LocalBackups
    Write-LogMessage "Backups disponibles en local:" -color $colorWarning
    
    if ($backups.Count -eq 0) {
        Write-LogMessage "  - No se encontraron backups" -color $colorError
    } else {
        for ($i = 0; $i -lt $backups.Count; $i++) {
            $backup = $backups[$i]
            $size = "{0:N2} MB" -f ($backup.Length / 1MB)
            $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-LogMessage "  $($i+1). $($backup.Name) - $size - $date" -color $colorInfo
        }
    }
    
    exit 0
}

# Verificar conexión SSH
if (-not (Test-SshConnection)) {
    exit 1
}

# Determinar qué archivo de backup usar
if ($latest) {
    $backups = Get-LocalBackups
    
    if ($backups.Count -eq 0) {
        Write-LogMessage "ERROR: No se encontraron backups locales para restaurar" -color $colorError
        exit 1
    }
    
    $backupFile = $backups[0].FullName
    Write-LogMessage "Seleccionando el backup más reciente: $($backups[0].Name)" -color $colorSuccess
}

if ([string]::IsNullOrEmpty($backupFile)) {
    $backups = Get-LocalBackups
    
    if ($backups.Count -eq 0) {
        Write-LogMessage "ERROR: No se encontraron backups locales para restaurar" -color $colorError
        exit 1
    }
    
    Write-LogMessage "Seleccione un backup para restaurar:" -color $colorWarning
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $size = "{0:N2} MB" -f ($backup.Length / 1MB)
        $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        Write-LogMessage "  $($i+1). $($backup.Name) - $size - $date" -color $colorInfo
    }
    
    $validOption = $false
    while (-not $validOption) {
        $option = Read-Host "Introduzca el número del backup a restaurar (1-$($backups.Count)), o 'q' para cancelar"
        
        if ($option -eq 'q') {
            Write-LogMessage "Operación cancelada por el usuario" -color $colorWarning
            exit 0
        }
        
        $optionNum = 0
        if ([int]::TryParse($option, [ref]$optionNum) -and $optionNum -ge 1 -and $optionNum -le $backups.Count) {
            $backupFile = $backups[$optionNum-1].FullName
            $validOption = $true
        } else {
            Write-LogMessage "Opción inválida. Introduzca un número entre 1 y $($backups.Count), o 'q' para cancelar" -color $colorError
        }
    }
}

# Confirmar la operación
$fileInfo = Get-Item $backupFile
Write-LogMessage "===============================" -color $colorWarning
Write-LogMessage "ATENCIÓN: Va a restaurar la base de datos con:" -color $colorWarning
Write-LogMessage "  - Archivo: $($fileInfo.Name)" -color $colorWarning
Write-LogMessage "  - Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -color $colorWarning
Write-LogMessage "  - Fecha: $($fileInfo.LastWriteTime)" -color $colorWarning
Write-LogMessage "¡Esta operación eliminará TODOS los datos actuales de la base de datos!" -color $colorError
Write-LogMessage "===============================" -color $colorWarning

$confirmation = Read-Host "¿Está seguro de que desea continuar? (s/N)"
if ($confirmation.ToLower() -ne "s") {
    Write-LogMessage "Operación cancelada por el usuario" -color $colorWarning
    exit 0
}

# Ejecutar la restauración
$success = Send-BackupToServer -localBackupPath $backupFile
if (-not $success) {
    Write-LogMessage "ERROR: No se pudo enviar el archivo de backup al servidor" -color $colorError
    exit 1
}

$success = Restore-Database
if (-not $success) {
    Write-LogMessage "ERROR: No se pudo restaurar la base de datos" -color $colorError
    exit 1
}

$success = Verify-Restoration
if (-not $success) {
    Write-LogMessage "ERROR: La restauración no se pudo verificar correctamente" -color $colorError
    exit 1
}

# Mostrar resumen final
Write-LogMessage "===============================" -color $colorSuccess
Write-LogMessage "RESTAURACIÓN COMPLETADA CORRECTAMENTE" -color $colorSuccess
Write-LogMessage "La base de datos ha sido restaurada desde: $($fileInfo.Name)" -color $colorSuccess
Write-LogMessage "El backend ha sido reiniciado y está funcionando correctamente" -color $colorSuccess
Write-LogMessage "===============================" -color $colorSuccess

# Mostrar URL para acceder al sistema
Write-LogMessage "Para acceder al sistema use:" -color $colorInfo
Write-LogMessage "  - Panel admin: http://${serverIP}:80" -color $colorInfo
Write-LogMessage "  - API Backend: http://${serverIP}:8000/docs" -color $colorInfo
Write-LogMessage "  - Usuario admin: admin / admin123" -color $colorInfo
