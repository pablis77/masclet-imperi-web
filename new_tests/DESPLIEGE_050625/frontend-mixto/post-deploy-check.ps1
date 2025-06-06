# Script para verificaciones post-despliegue completas
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

Write-ColorMessage "===== VERIFICACIONES POST-DESPLIEGUE =====" $colorSuccess

# Paso 1: Verificar que los contenedores están en ejecución
Write-ColorMessage "1. Verificando estado de los contenedores..." $colorInfo
$containers = Invoke-SshCommand "docker ps"
Write-ColorMessage $containers $colorInfo

# Comprobar contenedores críticos
$criticalContainers = @("masclet-db", "masclet-frontend-node", "masclet-frontend")
$containersOk = $true

foreach ($container in $criticalContainers) {
    if ($containers -match $container) {
        Write-ColorMessage "✅ Contenedor '$container' está en ejecución" $colorSuccess
    } else {
        Write-ColorMessage "❌ ERROR: Contenedor '$container' no está en ejecución" $colorError
        $containersOk = $false
    }
}

if (-not $containersOk) {
    Write-ColorMessage "`n❌ Hay problemas con los contenedores. Verificando logs..." $colorError
    
    foreach ($container in $criticalContainers) {
        Write-ColorMessage "Logs de '$container':" $colorInfo
        $logs = Invoke-SshCommand "docker logs --tail 20 $container 2>&1 || echo 'No se puede acceder a los logs'"
        Write-ColorMessage $logs $colorInfo
        Write-Host ""
    }
}

# Paso 2: Verificar recursos estáticos críticos
Write-ColorMessage "`n2. Verificando recursos estáticos críticos..." $colorInfo

$criticalResources = @(
    "/",
    "/index.html",
    "/client/index.html",
    "/client/assets/index.css",
    "/docker-api-health"
)

foreach ($resource in $criticalResources) {
    Write-ColorMessage "Verificando recurso: $resource..." $colorInfo -noNewLine
    
    $resourceStatus = Invoke-SshCommand "curl -s -o /dev/null -w '%{http_code}' http://${remoteHost}${resource}"
    
    if ($resourceStatus -eq "200") {
        Write-ColorMessage " [✅ OK $resourceStatus]" $colorSuccess
    } else {
        Write-ColorMessage " [❌ ERROR $resourceStatus]" $colorError
        
        # Intentar obtener más detalles
        $resourceDetails = Invoke-SshCommand "curl -v http://${remoteHost}${resource} 2>&1"
        Write-ColorMessage "Detalles del error:" $colorError
        Write-ColorMessage $resourceDetails $colorWarning
    }
}

# Paso 3: Verificar punto de diagnóstico
Write-ColorMessage "`n3. Verificando punto de diagnóstico Docker API..." $colorInfo

$diagnosticApi = Invoke-SshCommand "curl -s http://${remoteHost}/docker-api-health"

if ($diagnosticApi) {
    Write-ColorMessage "✅ API de diagnóstico responde correctamente" $colorSuccess
    Write-ColorMessage "Respuesta:" $colorInfo
    Write-ColorMessage $diagnosticApi $colorInfo
} else {
    Write-ColorMessage "❌ ERROR: API de diagnóstico no responde" $colorError
}

# Paso 4: Verificar logs de Nginx y Node.js
Write-ColorMessage "`n4. Verificando logs de componentes..." $colorInfo

Write-ColorMessage "Logs de Nginx:" $colorInfo
$nginxLogs = Invoke-SshCommand "docker logs masclet-frontend --tail 20"
Write-ColorMessage $nginxLogs $colorInfo

Write-ColorMessage "`nLogs de Node.js:" $colorInfo
$nodeLogs = Invoke-SshCommand "docker logs masclet-frontend-node --tail 20"
Write-ColorMessage $nodeLogs $colorInfo

# Paso 5: Verificar comunicación frontend-backend
Write-ColorMessage "`n5. Verificando comunicación frontend-backend..." $colorInfo

Write-ColorMessage "Probando conexión desde frontend-node a backend API..." $colorInfo
$apiTest = Invoke-SshCommand "docker exec masclet-frontend-node curl -s http://masclet-db:8000/api/v1/health || echo 'ERROR'"

if ($apiTest -eq "ERROR") {
    Write-ColorMessage "❌ ERROR: No hay conectividad desde frontend-node a backend" $colorError
} else {
    Write-ColorMessage "✅ Conectividad frontend-backend correcta" $colorSuccess
    Write-ColorMessage "Respuesta: $apiTest" $colorSuccess
}

# Paso 6: Ejecutar diagnóstico completo
Write-ColorMessage "`n6. Ejecutando diagnóstico completo dentro del contenedor..." $colorInfo

$diagnosticScript = Invoke-SshCommand "docker exec masclet-frontend-node node /app/docker-diagnose.js || echo 'ERROR: Script no encontrado'"

if ($diagnosticScript -match "ERROR") {
    Write-ColorMessage "❌ No se pudo ejecutar el script de diagnóstico" $colorError
} else {
    Write-ColorMessage "✅ Script de diagnóstico ejecutado correctamente" $colorSuccess
    
    # Buscar resultados específicos en la salida
    if ($diagnosticScript -match "DNS OK") {
        Write-ColorMessage "✅ Resolución DNS correcta" $colorSuccess
    }
    
    if ($diagnosticScript -match "API CONECTADA") {
        Write-ColorMessage "✅ Conexión API correcta" $colorSuccess
    }
}

# Paso 7: Verificar variables de entorno críticas
Write-ColorMessage "`n7. Verificando variables de entorno críticas..." $colorInfo

$envVars = Invoke-SshCommand "docker exec masclet-frontend-node env | grep -E 'API_|NODE_|DOCKER_'"
Write-ColorMessage $envVars $colorInfo

# Paso 8: Resumen final
Write-ColorMessage "`n===== RESUMEN DE VERIFICACIÓN POST-DESPLIEGUE =====" $colorSuccess

$allTestsPass = $containersOk -and ($apiTest -ne "ERROR")

if ($allTestsPass) {
    Write-ColorMessage "✅ ¡Todos los tests han pasado correctamente!" $colorSuccess
    Write-ColorMessage "✅ El despliegue de Masclet Imperi Web está funcionando correctamente" $colorSuccess
    Write-ColorMessage "✅ Frontend accesible en: http://$remoteHost" $colorSuccess
} else {
    Write-ColorMessage "❌ Se han detectado problemas en el despliegue" $colorError
    
    if (-not $containersOk) {
        Write-ColorMessage "  ❌ Hay contenedores que no están en ejecución" $colorError
        Write-ColorMessage "  👉 Solución: Revisar logs docker y reiniciar los contenedores" $colorWarning
    }
    
    if ($apiTest -eq "ERROR") {
        Write-ColorMessage "  ❌ Problema de conectividad entre frontend y backend" $colorError
        Write-ColorMessage "  👉 Solución: Verificar configuración de red y DNS en Docker" $colorWarning
    }
    
    # Mostrar instrucciones de rollback si es necesario
    Write-ColorMessage "`n🔄 Si es necesario hacer rollback, ejecutar:" $colorWarning
    Write-ColorMessage "ssh -i '$keyPath' ${remoteUser}@${remoteHost} '${remoteDeployDir}/rollback.sh'" $colorInfo
}
