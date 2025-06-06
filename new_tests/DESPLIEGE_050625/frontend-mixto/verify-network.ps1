# Script para verificar y corregir la configuración de red Docker
param (
    [string]$remoteHost = "34.253.203.194",
    [string]$remoteUser = "ec2-user",
    [string]$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
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

Write-ColorMessage "===== VERIFICACIÓN DE RED DOCKER =====" $colorSuccess

# Paso 1: Listar todas las redes Docker
Write-ColorMessage "1. Listando redes Docker disponibles..." $colorInfo
$networks = Invoke-SshCommand "docker network ls"
Write-ColorMessage $networks $colorInfo

# Paso 2: Verificar si existe la red masclet-network
Write-ColorMessage "2. Verificando red 'masclet-network'..." $colorInfo
$networkExists = Invoke-SshCommand "docker network ls | grep masclet-network"

if (-not $networkExists) {
    Write-ColorMessage "❌ La red 'masclet-network' no existe, creándola..." $colorWarning
    Invoke-SshCommand "docker network create masclet-network"
} else {
    Write-ColorMessage "✅ La red 'masclet-network' existe" $colorSuccess
}

# Paso 3: Inspeccionar la red masclet-network
Write-ColorMessage "3. Inspeccionando configuración detallada de la red..." $colorInfo
$networkDetails = Invoke-SshCommand "docker network inspect masclet-network"
Write-Host $networkDetails

# Paso 4: Listar contenedores activos
Write-ColorMessage "4. Listando contenedores activos..." $colorInfo
$containers = Invoke-SshCommand "docker ps"
Write-ColorMessage $containers $colorInfo

# Paso 5: Identificar los contenedores críticos
Write-ColorMessage "5. Verificando contenedores críticos..." $colorInfo
$criticalContainers = @("masclet-db", "masclet-frontend-node", "masclet-frontend")

foreach ($container in $criticalContainers) {
    $containerExists = Invoke-SshCommand "docker ps | grep $container"
    
    if (-not $containerExists) {
        Write-ColorMessage "❌ El contenedor '$container' no está activo" $colorError
        continue
    }
    
    Write-ColorMessage "Verificando red para '$container'..." $colorInfo
    $containerNetwork = Invoke-SshCommand "docker inspect --format='{{json .NetworkSettings.Networks}}' $container"
    
    if ($containerNetwork -match "masclet-network") {
        Write-ColorMessage "✅ '$container' está conectado a 'masclet-network'" $colorSuccess
    } else {
        Write-ColorMessage "❌ '$container' no está conectado a 'masclet-network', conectando..." $colorWarning
        Invoke-SshCommand "docker network connect masclet-network $container || echo 'Ya conectado o error al conectar'"
        
        # Verificar de nuevo
        $containerNetworkAfter = Invoke-SshCommand "docker inspect --format='{{json .NetworkSettings.Networks}}' $container"
        
        if ($containerNetworkAfter -match "masclet-network") {
            Write-ColorMessage "✅ '$container' ahora está conectado a 'masclet-network'" $colorSuccess
        } else {
            Write-ColorMessage "❌ No se pudo conectar '$container' a 'masclet-network'" $colorError
        }
    }
}

# Paso 6: Verificar resolución DNS entre contenedores
Write-ColorMessage "`n6. Verificando resolución DNS entre contenedores..." $colorInfo

Write-ColorMessage "Probando DNS desde masclet-frontend-node a masclet-db..." $colorInfo
$dnsFrontendToDb = Invoke-SshCommand "docker exec masclet-frontend-node getent hosts masclet-db || echo 'ERROR: No se puede resolver'"

if ($dnsFrontendToDb -match "ERROR") {
    Write-ColorMessage "❌ ERROR: masclet-frontend-node no puede resolver 'masclet-db'" $colorError
} else {
    Write-ColorMessage "✅ masclet-frontend-node puede resolver 'masclet-db': $dnsFrontendToDb" $colorSuccess
}

# Paso 7: Verificar conectividad HTTP
Write-ColorMessage "`n7. Verificando conectividad HTTP entre contenedores..." $colorInfo

Write-ColorMessage "Probando conectividad HTTP desde masclet-frontend-node a masclet-db:8000/api/v1/health..." $colorInfo
$httpTest = Invoke-SshCommand "docker exec masclet-frontend-node curl -s -o /dev/null -w '%{http_code}' http://masclet-db:8000/api/v1/health || echo 'ERROR'"

if ($httpTest -eq "ERROR" -or $httpTest -eq "000") {
    Write-ColorMessage "❌ ERROR: No hay conectividad HTTP desde masclet-frontend-node a masclet-db" $colorError
    
    # Mostrar más detalles del error
    $curlVerbose = Invoke-SshCommand "docker exec masclet-frontend-node curl -v http://masclet-db:8000/api/v1/health"
    Write-ColorMessage "Detalles del error:" $colorError
    Write-ColorMessage $curlVerbose $colorError
} else {
    Write-ColorMessage "✅ Conectividad HTTP correcta, código de estado: $httpTest" $colorSuccess
    
    # Mostrar respuesta del endpoint
    $apiResponse = Invoke-SshCommand "docker exec masclet-frontend-node curl -s http://masclet-db:8000/api/v1/health"
    Write-ColorMessage "Respuesta del endpoint: $apiResponse" $colorSuccess
}

# Paso 8: Resumen y recomendaciones
Write-ColorMessage "`n===== RESUMEN DE VERIFICACIÓN DE RED =====" $colorSuccess

if ($dnsFrontendToDb -notmatch "ERROR" -and $httpTest -ne "ERROR" -and $httpTest -ne "000") {
    Write-ColorMessage "✅ ¡La red Docker está configurada correctamente!" $colorSuccess
    Write-ColorMessage "✅ Todos los contenedores están en la red 'masclet-network'" $colorSuccess
    Write-ColorMessage "✅ La resolución DNS entre contenedores funciona correctamente" $colorSuccess
    Write-ColorMessage "✅ La conectividad HTTP entre frontend y backend funciona correctamente" $colorSuccess
} else {
    Write-ColorMessage "❌ Hay problemas en la configuración de red Docker:" $colorError
    
    if ($dnsFrontendToDb -match "ERROR") {
        Write-ColorMessage "  ❌ Problema de resolución DNS entre contenedores" $colorError
    }
    
    if ($httpTest -eq "ERROR" -or $httpTest -eq "000") {
        Write-ColorMessage "  ❌ Problema de conectividad HTTP entre contenedores" $colorError
    }
    
    Write-ColorMessage "`nRecomendaciones:" $colorWarning
    Write-ColorMessage "1. Reiniciar los contenedores: docker restart masclet-frontend-node masclet-db" $colorInfo
    Write-ColorMessage "2. Verificar que los servicios dentro de los contenedores están activos" $colorInfo
    Write-ColorMessage "3. Comprobar reglas de firewall en los contenedores" $colorInfo
    Write-ColorMessage "4. Revisar configuración de red en docker-compose.yml" $colorInfo
}
