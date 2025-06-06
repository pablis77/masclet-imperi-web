# Script para preparar respaldo para rollback
param (
    [string]$remoteHost = "3.253.32.134",
    [string]$remoteUser = "ec2-user",
    [string]$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem",
    [string]$remoteDeployDir = "~/masclet-imperi-web-deploy"
)

# Colores para mejorar la legibilidad
$colorSuccess = [ConsoleColor]::Green
$colorWarning = [ConsoleColor]::Yellow
$colorError = [ConsoleColor]::Red
$colorInfo = [ConsoleColor]::Cyan

# Función para mostrar mensajes con formato
function Write-ColorMessage {
    param (
        [string]$message,
        [ConsoleColor]$color,
        [switch]$noNewLine
    )
    
    if ($noNewLine) {
        Write-Host $message -ForegroundColor $color -NoNewLine
    }
    else {
        Write-Host $message -ForegroundColor $color
    }
}

# Función para ejecutar comandos SSH
function Invoke-SshCommand {
    param (
        [string]$command
    )
    
    Write-ColorMessage "Ejecutando: $command" $colorInfo -noNewLine
    Write-Host ""
    
    $output = ssh -i $keyPath "${remoteUser}@${remoteHost}" $command
    
    return $output
}

Write-ColorMessage "===== PREPARANDO ESTRATEGIA DE ROLLBACK =====" $colorSuccess

# Paso 1: Verificar si existe un respaldo previo
Write-ColorMessage "1. Verificando si existe respaldo previo..." $colorInfo
$backupExists = Invoke-SshCommand "test -d ${remoteDeployDir}.previous && echo 'exists' || echo 'not-exists'"

if ($backupExists -eq "exists") {
    Write-ColorMessage "✅ Se encontró un respaldo previo" $colorSuccess
    
    # Verificar si existe un respaldo anterior y moverlo
    $oldBackupExists = Invoke-SshCommand "test -d ${remoteDeployDir}.bak && echo 'exists' || echo 'not-exists'"
    
    if ($oldBackupExists -eq "exists") {
        Write-ColorMessage "Moviendo respaldo anterior a ${remoteDeployDir}.bak2..." $colorInfo
        Invoke-SshCommand "rm -rf ${remoteDeployDir}.bak2 2>/dev/null; mv ${remoteDeployDir}.bak ${remoteDeployDir}.bak2"
    }
    
    # Mover el respaldo previo
    Write-ColorMessage "Moviendo respaldo actual a ${remoteDeployDir}.bak..." $colorInfo
    Invoke-SshCommand "mv ${remoteDeployDir}.previous ${remoteDeployDir}.bak"
}

# Paso 2: Crear un nuevo directorio de respaldo
Write-ColorMessage "2. Creando nuevo directorio de respaldo..." $colorInfo
Invoke-SshCommand "mkdir -p ${remoteDeployDir}.previous"

# Paso 3: Copiar archivos actuales al directorio de respaldo
Write-ColorMessage "3. Copiando archivos actuales al directorio de respaldo..." $colorInfo
Invoke-SshCommand "cp -r ${remoteDeployDir}/* ${remoteDeployDir}.previous/"

# Paso 4: Crear script de rollback en el servidor
Write-ColorMessage "4. Creando script de rollback en el servidor..." $colorInfo

$rollbackScript = @"
#!/bin/bash
# Script de rollback para revertir cambios en caso de fallo
echo '===== EJECUTANDO ROLLBACK ====='

# Detener contenedores actuales
echo 'Deteniendo contenedores actuales...'
docker-compose -f $remoteDeployDir/docker-compose.yml down

# Verificar si existe backup
if [ ! -d "${remoteDeployDir}.previous" ] && [ ! -d "${remoteDeployDir}.bak" ]; then
    echo 'ERROR: No se encontraron archivos de respaldo para rollback'
    exit 1
fi

# Determinar qué backup usar
BACKUP_DIR=""
if [ -d "${remoteDeployDir}.previous" ]; then
    BACKUP_DIR="${remoteDeployDir}.previous"
    echo "Usando respaldo reciente: \$BACKUP_DIR"
elif [ -d "${remoteDeployDir}.bak" ]; then
    BACKUP_DIR="${remoteDeployDir}.bak"
    echo "Usando respaldo anterior: \$BACKUP_DIR"
fi

# Hacer backup del directorio actual antes de reemplazarlo
echo 'Haciendo backup de los archivos actuales...'
rm -rf ${remoteDeployDir}.failed 2>/dev/null
mv $remoteDeployDir ${remoteDeployDir}.failed

# Restaurar desde backup
echo 'Restaurando desde backup...'
cp -r \$BACKUP_DIR $remoteDeployDir

# Reiniciar contenedores
echo 'Reiniciando contenedores...'
cd $remoteDeployDir
docker-compose up -d

# Verificar estado
echo 'Verificando estado de los contenedores...'
docker ps

echo 'Rollback completado.'
"@

# Escribir script de rollback en el servidor
Invoke-SshCommand "cat > ${remoteDeployDir}/rollback.sh << 'EOF'
$rollbackScript
EOF"

# Hacer ejecutable el script de rollback
Invoke-SshCommand "chmod +x ${remoteDeployDir}/rollback.sh"

# Paso 5: Verificar que todo está preparado
Write-ColorMessage "5. Verificando que todo está preparado..." $colorInfo
$fileCount = Invoke-SshCommand "find ${remoteDeployDir}.previous -type f | wc -l"
$scriptExists = Invoke-SshCommand "test -x ${remoteDeployDir}/rollback.sh && echo 'exists' || echo 'not-exists'"

# Mostrar resultados
Write-ColorMessage "`n===== RESUMEN DE PREPARACIÓN DE ROLLBACK =====" $colorSuccess

if ([int]$fileCount -gt 0 -and $scriptExists -eq "exists") {
    Write-ColorMessage "✅ Respaldo preparado correctamente con $fileCount archivos" $colorSuccess
    Write-ColorMessage "✅ Script de rollback creado y es ejecutable" $colorSuccess
    Write-ColorMessage "`nPara ejecutar un rollback en caso de fallo, usar:" $colorInfo
    Write-ColorMessage "ssh -i '$keyPath' ${remoteUser}@${remoteHost} '${remoteDeployDir}/rollback.sh'" $colorInfo
} else {
    Write-ColorMessage "❌ Error al preparar el respaldo para rollback:" $colorError
    
    if ([int]$fileCount -eq 0) {
        Write-ColorMessage "  ❌ No se copiaron archivos al directorio de respaldo" $colorError
    }
    
    if ($scriptExists -ne "exists") {
        Write-ColorMessage "  ❌ El script de rollback no existe o no es ejecutable" $colorError
    }
}
