# Script para despliegue gradual y simplificado del frontend en AWS
# Configuración
$remoteHost = "34.253.203.194"
$remoteUser = "ec2-user"
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$localSourceDir = "C:\Proyectos\claude\masclet-imperi-web"
$deploySourceDir = "$localSourceDir\new_tests\DESPLIEGE_050625\frontend-mixto"
$remoteDeployDir = "~/masclet-imperi-web-deploy"

# Colores para mensajes
$colorInfo = "Cyan"
$colorSuccess = "Green" 
$colorError = "Red"
$colorWarning = "Yellow"

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color
    )
    Write-Host $Message -ForegroundColor $Color
}

function Invoke-SshCommand {
    param(
        [string]$Command
    )
    
    $sshArgs = "-i `"$keyPath`"", "$remoteUser@$remoteHost", $Command
    $result = & ssh $sshArgs
    return $result
}

function Invoke-ScpTransfer {
    param(
        [string]$Source,
        [string]$Destination,
        [switch]$Recursive
    )
    
    $scpArgs = if ($Recursive) { "-r" } else { "" }
    $scpCommand = "scp $scpArgs -i `"$keyPath`"" + " `"$Source`" `"$remoteUser@$remoteHost`:$Destination`""
    Write-Verbose "Ejecutando: $scpCommand"
    Invoke-Expression $scpCommand
}

function Get-ResourceStatus {
    $df = Invoke-SshCommand "df -h | grep xvda1"
    $free = Invoke-SshCommand "free -h | grep Mem"
    
    Write-ColorMessage "== Estado del servidor ==" $colorInfo
    Write-ColorMessage "Disco: $df" $colorInfo
    Write-ColorMessage "Memoria: $free" $colorInfo
}

# Paso 1: Verificar estado actual del servidor
Write-ColorMessage "`n== PASO 1: Verificando estado del servidor ==`n" $colorInfo
Get-ResourceStatus

# Paso 2: Crear o limpiar directorio de despliegue
Write-ColorMessage "`n== PASO 2: Preparando directorio de despliegue ==`n" $colorInfo
Invoke-SshCommand "mkdir -p $remoteDeployDir && rm -rf $remoteDeployDir/*"
Write-ColorMessage "Directorio $remoteDeployDir preparado" $colorSuccess

# Paso 3: Verificar y crear la red Docker si no existe
Write-ColorMessage "`n== PASO 3: Verificando red Docker ==`n" $colorInfo
$networkExists = Invoke-SshCommand "docker network ls | grep masclet-network || echo 'no_existe'"
if ($networkExists -like "*no_existe*") {
    Write-ColorMessage "Red 'masclet-network' no encontrada, creándola..." $colorWarning
    Invoke-SshCommand "docker network create masclet-network"
    Write-ColorMessage "Red 'masclet-network' creada correctamente" $colorSuccess
} else {
    Write-ColorMessage "Red 'masclet-network' ya existe" $colorSuccess
}

# Paso 4: Transferir archivos necesarios
Write-ColorMessage "`n== PASO 4: Transfiriendo archivos ==`n" $colorInfo

# Crear estructura de directorios
Write-ColorMessage "Creando estructura de directorios en servidor..." $colorInfo
Invoke-SshCommand "mkdir -p $remoteDeployDir/frontend/dist/client $remoteDeployDir/frontend/dist/server"

# Transferir archivos uno por uno para mejor control
$filesToCopy = @(
    # Configuración Docker simplificada
    @{Source="$deploySourceDir\node.Dockerfile.simple"; Destination="$remoteDeployDir/node.Dockerfile.simple"},
    @{Source="$deploySourceDir\docker-compose.yml.simple"; Destination="$remoteDeployDir/docker-compose.yml"},
    @{Source="$deploySourceDir\nginx.Dockerfile"; Destination="$remoteDeployDir/nginx.Dockerfile"},
    @{Source="$deploySourceDir\nginx.conf"; Destination="$remoteDeployDir/nginx.conf"},
    
    # Scripts de configuración de API
    @{Source="$deploySourceDir\docker-api-master.js"; Destination="$remoteDeployDir/docker-api-master.js"},
    @{Source="$deploySourceDir\docker-api-config.js"; Destination="$remoteDeployDir/docker-api-config.js"},
    @{Source="$deploySourceDir\docker-api-detector.js"; Destination="$remoteDeployDir/docker-api-detector.js"},
    @{Source="$deploySourceDir\docker-api-writer.js"; Destination="$remoteDeployDir/docker-api-writer.js"},
    @{Source="$deploySourceDir\docker-diagnose.js"; Destination="$remoteDeployDir/docker-diagnose.js"}
)

foreach ($file in $filesToCopy) {
    Write-ColorMessage "Transfiriendo $($file.Source)..." $colorInfo
    Invoke-ScpTransfer $file.Source $file.Destination
}

# Transferir archivos compilados del frontend
Write-ColorMessage "Transfiriendo archivos compilados del frontend..." $colorInfo

# Comprobar si existen los archivos compilados
if (-not (Test-Path "$localSourceDir\frontend\dist\client")) {
    Write-ColorMessage "No se encuentran archivos compilados del frontend. ¿Quieres compilar ahora? (S/N)" $colorWarning
    $response = Read-Host
    if ($response -eq "S") {
        # Compilar frontend
        Write-ColorMessage "Compilando frontend..." $colorInfo
        Push-Location "$localSourceDir\frontend"
        npm run build
        Pop-Location
    } else {
        Write-ColorMessage "Cancelando despliegue. Primero debes compilar el frontend." $colorError
        return
    }
}

# Transferir los archivos compilados
Write-ColorMessage "Transfiriendo archivos del cliente..." $colorInfo
Invoke-ScpTransfer -Source "$localSourceDir\frontend\dist\client\*" -Destination "$remoteDeployDir/frontend/dist/client/" -Recursive
Write-ColorMessage "Transfiriendo archivos del servidor..." $colorInfo
Invoke-ScpTransfer -Source "$localSourceDir\frontend\dist\server\*" -Destination "$remoteDeployDir/frontend/dist/server/" -Recursive

# Transferir archivos de configuración frontend
Write-ColorMessage "Transfiriendo archivos de configuración de npm..." $colorInfo
Invoke-ScpTransfer -Source "$localSourceDir\frontend\package.json" -Destination "$remoteDeployDir/frontend/"
Invoke-ScpTransfer -Source "$localSourceDir\frontend\.npmrc" -Destination "$remoteDeployDir/frontend/" 

# Paso 5: Construir y desplegar la imagen de Nginx primero
Write-ColorMessage "`n== PASO 5: Construyendo y desplegando Nginx ==`n" $colorInfo
# Detener y eliminar contenedor anterior si existe
Invoke-SshCommand "docker rm -f masclet-frontend-nginx || true"

# Construir imagen Nginx (más pequeña)
Write-ColorMessage "Construyendo imagen de Nginx..." $colorInfo
$buildResult = Invoke-SshCommand "cd $remoteDeployDir && docker build -f nginx.Dockerfile -t masclet-frontend-nginx:latest ../.."
Write-ColorMessage "Imagen de Nginx construida" $colorSuccess

# Ver espacio recuperado
Get-ResourceStatus

# Paso 6: Verificar estado y construir Node.js solo si hay recursos suficientes
Write-ColorMessage "`n== PASO 6: Verificando recursos antes de construir Node.js ==`n" $colorInfo
$memInfo = Invoke-SshCommand "free -m | grep 'Mem:' | awk '{print `$2,`$3,`$4}'"
$memParts = $memInfo -split '\s+'
if ([int]$memParts[2] -lt 400) {
    Write-ColorMessage "ADVERTENCIA: Memoria disponible insuficiente (<400MB)" $colorWarning
    Write-ColorMessage "¿Continuar de todos modos? (S/N)" $colorWarning
    $response = Read-Host
    if ($response -ne "S") {
        Write-ColorMessage "Abortando construcción de Node.js por falta de recursos." $colorError
        return
    }
}

# Paso 7: Construir y desplegar Node.js
Write-ColorMessage "`n== PASO 7: Construyendo y desplegando Node.js ==`n" $colorInfo
# Detener y eliminar contenedor anterior si existe
Invoke-SshCommand "docker rm -f masclet-frontend-node || true"

# Construir imagen Node
Write-ColorMessage "Construyendo imagen de Node.js..." $colorInfo
$buildResult = Invoke-SshCommand "cd $remoteDeployDir && docker build -f node.Dockerfile.simple -t masclet-frontend-node:latest ../.."
Write-ColorMessage "Imagen de Node.js construida" $colorSuccess

# Paso 8: Iniciar servicios con docker-compose
Write-ColorMessage "`n== PASO 8: Iniciando servicios con docker-compose ==`n" $colorInfo
Invoke-SshCommand "cd $remoteDeployDir && docker-compose up -d"

# Paso 9: Verificar estado final
Write-ColorMessage "`n== PASO 9: Verificando estado final ==`n" $colorInfo
$containers = Invoke-SshCommand "docker ps"
Write-ColorMessage "Contenedores en ejecución:" $colorInfo
Write-ColorMessage $containers $colorInfo

$logs = Invoke-SshCommand "docker logs -n 20 masclet-frontend-nginx"
Write-ColorMessage "`nÚltimos logs de Nginx:" $colorInfo
Write-ColorMessage $logs $colorInfo

$logs = Invoke-SshCommand "docker logs -n 20 masclet-frontend-node"
Write-ColorMessage "`nÚltimos logs de Node:" $colorInfo
Write-ColorMessage $logs $colorInfo

# Final
Write-ColorMessage "`n== DESPLIEGUE COMPLETADO ==`n" $colorSuccess
Write-ColorMessage "Puedes acceder a la aplicación en: http://$remoteHost" $colorSuccess
Write-ColorMessage "Para ver los logs en tiempo real:" $colorInfo
Write-ColorMessage "  ssh -i `"$keyPath`" $remoteUser@$remoteHost 'docker logs -f masclet-frontend-nginx'" $colorInfo
Write-ColorMessage "  ssh -i `"$keyPath`" $remoteUser@$remoteHost 'docker logs -f masclet-frontend-node'" $colorInfo
