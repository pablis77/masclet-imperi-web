# Script para desplegar frontend mixto (Nginx + Node.js) en AWS
# Configuración
$remoteHost = "34.253.203.194"
$remoteUser = "ec2-user"
$keyPath = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$localSourceDir = "C:\Proyectos\claude\masclet-imperi-web"
$remoteDeployDir = "~/masclet-imperi-web-deploy"

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
    
    Write-ColorMessage "Ejecutando: $command" $colorInfo
    
    $output = ssh -i $keyPath "${remoteUser}@${remoteHost}" $command
    
    return $output
}

# Función para ejecutar comandos SCP
function Invoke-ScpTransfer {
    param (
        [string]$source,
        [string]$destination,
        [switch]$recursive
    )
    
    Write-ColorMessage "Transfiriendo archivos..." $colorInfo
    
    if ($recursive) {
        scp -i $keyPath -r $source "${remoteUser}@${remoteHost}:$destination"
    }
    else {
        scp -i $keyPath $source "${remoteUser}@${remoteHost}:$destination"
    }
}

# Paso 1: Preparar el entorno local
Write-ColorMessage "PASO 1: Preparando entorno local... 🔍" $colorSuccess

# Definir ubicación del frontend
$frontendPath = Join-Path -Path $localSourceDir -ChildPath "frontend"

# Comprobar que existen los archivos compilados de Astro
$distRootPath = Join-Path -Path $localSourceDir -ChildPath "dist"
$distFrontendPath = Join-Path -Path $localSourceDir -ChildPath "frontend\dist"

$distPath = $null
if (Test-Path $distRootPath) {
    Write-ColorMessage "Encontrados archivos compilados en la raíz: $distRootPath" $colorSuccess
    $distPath = $distRootPath
} elseif (Test-Path $distFrontendPath) {
    Write-ColorMessage "Encontrados archivos compilados en frontend: $distFrontendPath" $colorSuccess
    $distPath = $distFrontendPath
} else {
    Write-ColorMessage "No se encontraron archivos compilados. ¿Compilar ahora? (s/n)" $colorWarning -noNewLine
    $compilar = Read-Host
    
    if ($compilar -eq "s" -or $compilar -eq "S") {
        Write-ColorMessage "\nCompilando la aplicación frontend..." $colorInfo
        
        # Intentar compilar en la carpeta frontend
        $frontendPath = Join-Path -Path $localSourceDir -ChildPath "frontend"
        if (Test-Path (Join-Path -Path $frontendPath -ChildPath "package.json")) {
            Push-Location $frontendPath
            
            try {
                # Ejecutar npm install si node_modules no existe
                if (-not (Test-Path (Join-Path -Path $frontendPath -ChildPath "node_modules"))) {
                    Write-ColorMessage "Instalando dependencias con npm install..." $colorInfo
                    npm install
                }
                
                # Ejecutar la compilación
                Write-ColorMessage "Ejecutando npm run build..." $colorInfo
                npm run build
                
                if (Test-Path $distFrontendPath) {
                    Write-ColorMessage "Compilación completada con éxito" $colorSuccess
                    $distPath = $distFrontendPath
                } else {
                    Write-ColorMessage "ERROR: La compilación no generó el directorio 'dist'" $colorError
                    exit 1
                }
            } 
            catch {
                Write-ColorMessage "ERROR durante la compilación: $_" $colorError
                exit 1
            }
            finally {
                Pop-Location
            }
        } else {
            Write-ColorMessage "ERROR: No se encuentra package.json en $frontendPath" $colorError
            exit 1
        }
    } else {
        Write-ColorMessage "\nOperación cancelada. Compila la aplicación primero con 'npm run build'" $colorError
        exit 1
    }
}

# Paso 1.5: Verificación del espacio en disco (sin limpieza automática)
Write-ColorMessage "PASO 1.5: Verificando espacio en disco... 🧹" $colorSuccess
Write-ColorMessage "NOTA: La limpieza de Docker debe realizarse manualmente antes de ejecutar este script" $colorWarning
Write-ColorMessage "Comando recomendado:" $colorInfo
Write-ColorMessage "ssh -i '\path\to\key.pem' ec2-user@ip 'docker images | grep -v masclet-api-imagen-completa | grep -v masclet-db-imagen-completa | grep -v REPOSITORY | awk \'{print $3}\' | xargs -r docker rmi -f'" $colorInfo

# Verificar espacio disponible
$diskSpace = Invoke-SshCommand "df -h | grep '/dev/xvda1'"
Write-ColorMessage "Estado actual del disco: $diskSpace" $colorInfo

# Extraer el porcentaje de uso
if ($diskSpace -match '(\d+)%') {
    $diskUsagePercent = [int]$Matches[1]
    if ($diskUsagePercent -gt 90) {
        Write-ColorMessage "⚠️ ADVERTENCIA: Espacio en disco crítico ($diskUsagePercent%). Se recomienda ejecutar limpieza manual" $colorWarning
        return
    } else {
        Write-ColorMessage "✅ Espacio en disco suficiente ($diskUsagePercent%)." $colorSuccess
    }
}

# Mostrar contenedores activos - verificación de que DB y API están intactos
$runningContainers = Invoke-SshCommand "docker ps"
Write-ColorMessage "Contenedores activos (verificando que DB y API están intactos):" $colorInfo
Write-ColorMessage $runningContainers $colorInfo

# Paso 2: Preparar directorio remoto
Write-ColorMessage "PASO 2: Preparando directorios en el servidor AWS... 💻" $colorSuccess

# Limpiar directorio remoto si existe
Invoke-SshCommand "rm -rf $remoteDeployDir && mkdir -p $remoteDeployDir"

# Crear estructura de directorios
Invoke-SshCommand "mkdir -p $remoteDeployDir/client $remoteDeployDir/server"

# Paso 3: Transferir archivos al servidor
Write-ColorMessage "PASO 3: Transfiriendo archivos al servidor AWS... 📤" $colorSuccess

# Primero, eliminar cualquier archivo de configuración anterior para evitar conflictos
Write-ColorMessage "Limpiando archivos de configuración antiguos..." $colorInfo
Invoke-SshCommand "rm -f $remoteDeployDir/node.Dockerfile $remoteDeployDir/nginx.Dockerfile $remoteDeployDir/docker-compose.yml $remoteDeployDir/package*.json"

# Transferir archivos compilados de client y server
Invoke-ScpTransfer -recursive "$distPath/client/*" "$remoteDeployDir/client/"
Invoke-ScpTransfer -recursive "$distPath/server/*" "$remoteDeployDir/server/"

# Transferir package.json y package-lock.json - CRÍTICO para dependencias de Node.js
Write-ColorMessage "🔍 Buscando package.json para transferir..." $colorInfo

if (Test-Path (Join-Path -Path $frontendPath -ChildPath "package.json")) {
    Write-ColorMessage "📦 Copiando package.json del frontend..." $colorSuccess
    Invoke-ScpTransfer "$frontendPath/package.json" "$remoteDeployDir/"
    
    # Verificar que se transfirió correctamente - paso crítico
    $packageJsonCheck = Invoke-SshCommand "ls -la $remoteDeployDir/package.json"
    if ($packageJsonCheck -match "package.json") {
        Write-ColorMessage "✅ package.json transferido correctamente" $colorSuccess
    } else {
        Write-ColorMessage "❌ ERROR: No se pudo transferir package.json. Abortando despliegue." $colorError
        exit 1
    }
    
    if (Test-Path (Join-Path -Path $frontendPath -ChildPath "package-lock.json")) {
        Write-ColorMessage "🔒 Copiando package-lock.json del frontend..." $colorInfo
        Invoke-ScpTransfer "$frontendPath/package-lock.json" "$remoteDeployDir/"
    }
} elseif (Test-Path (Join-Path -Path $localSourceDir -ChildPath "package.json")) {
    Write-ColorMessage "📦 Copiando package.json de la raíz..." $colorSuccess
    Invoke-ScpTransfer "$localSourceDir/package.json" "$remoteDeployDir/"
    
    # Verificar que se transfirió correctamente
    $packageJsonCheck = Invoke-SshCommand "ls -la $remoteDeployDir/package.json"
    if ($packageJsonCheck -match "package.json") {
        Write-ColorMessage "✅ package.json transferido correctamente" $colorSuccess
    } else {
        Write-ColorMessage "❌ ERROR: No se pudo transferir package.json. Abortando despliegue." $colorError
        exit 1
    }
    
    if (Test-Path (Join-Path -Path $localSourceDir -ChildPath "package-lock.json")) {
        Write-ColorMessage "🔒 Copiando package-lock.json de la raíz..." $colorInfo
        Invoke-ScpTransfer "$localSourceDir/package-lock.json" "$remoteDeployDir/"
    }
} else {
    Write-ColorMessage "❌ ERROR CRÍTICO: No se encontró package.json en ninguna ubicación esperada" $colorError
    Write-ColorMessage "No se puede desplegar sin package.json ya que el contenedor Node.js requiere dependencias" $colorError
    exit 1
}

# Definir directorio de origen del despliegue
$deploySourceDir = "C:\Proyectos\claude\masclet-imperi-web\new_tests\DESPLIEGE_050625\frontend-mixto"
Write-ColorMessage "Directorio de origen: $deploySourceDir" $colorInfo

# Transferir todos los archivos de configuración de la API para Docker
Write-ColorMessage "Transfiriendo scripts modulares de configuración de API para Docker..." $colorInfo
Invoke-ScpTransfer "$deploySourceDir\docker-api-master.js" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-api-detector.js" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-api-config.js" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-api-injector.js" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-diagnose.js" "$remoteDeployDir/"
Write-ColorMessage "Script de diagnóstico transferido correctamente" $colorSuccess

# Transferir archivos de configuración
Invoke-ScpTransfer "$deploySourceDir\nginx.conf" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\node.Dockerfile" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\nginx.Dockerfile" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-compose.yml" "$remoteDeployDir/"
Invoke-ScpTransfer "$deploySourceDir\docker-api-fix.js" "$remoteDeployDir/"

# Verificar que docker-api-fix.js fue transferido correctamente
$apiFixCheck = Invoke-SshCommand "ls -la $remoteDeployDir/docker-api-fix.js"
if ($apiFixCheck -match "docker-api-fix.js") {
    Write-ColorMessage "✅ Script docker-api-fix.js transferido correctamente" $colorSuccess
} else {
    Write-ColorMessage "❌ Error al transferir docker-api-fix.js - intentando de nuevo..." $colorWarning
    # Segundo intento
    Invoke-ScpTransfer "$deploySourceDir/docker-api-fix.js" "$remoteDeployDir/"
}

# Paso 4: Crear red Docker si no existe
Write-ColorMessage "PASO 4: Preparando red Docker... 🔗" $colorSuccess

$networkExists = Invoke-SshCommand "docker network inspect masclet-network > /dev/null 2>&1 && echo 'exists' || echo 'not-exists'"
if ($networkExists -eq "not-exists") {
    Write-ColorMessage "Creando red Docker 'masclet-network'..." $colorInfo
    Invoke-SshCommand "docker network create masclet-network"
} else {
    Write-ColorMessage "Red Docker 'masclet-network' ya existe" $colorInfo
}

# Paso 5: Detener y eliminar contenedores anteriores (LIMPIEZA FORZOSA)
Write-ColorMessage "PASO 5: Limpiando contenedores anteriores... 🗝️" $colorSuccess

# Limpieza completa y forzosa de contenedores e imágenes
Write-ColorMessage "Deteniendo y eliminando contenedores anteriores..." $colorInfo
Invoke-SshCommand "docker-compose -f $remoteDeployDir/docker-compose.yml down 2>/dev/null || true"
Invoke-SshCommand "docker stop masclet-frontend masclet-frontend-node 2>/dev/null || true"
Invoke-SshCommand "docker rm masclet-frontend masclet-frontend-node 2>/dev/null || true"

Write-ColorMessage "Eliminando imágenes anteriores..." $colorInfo
Invoke-SshCommand "docker rmi masclet-imperi-web-deploy-masclet-frontend-node masclet-imperi-web-deploy-masclet-frontend-nginx masclet-frontend-nginx:latest masclet-frontend-node:latest 2>/dev/null || echo 'No hay imágenes que eliminar'"

# Paso 6: Construir y desplegar con docker-compose (sin cache)
Write-ColorMessage "PASO 6: Desplegando contenedores Docker... 🚀" $colorSuccess

# Utilizamos --no-cache para forzar una reconstrucción completa de las imágenes
$deployResult = Invoke-SshCommand "cd $remoteDeployDir && docker-compose build --no-cache && docker-compose up -d"
Write-ColorMessage $deployResult $colorInfo

# Paso 7: Verificar estado de los contenedores
Write-ColorMessage "PASO 7: Verificando estado de los contenedores... ⚙️" $colorSuccess

    # Esperar para que los contenedores se inicien completamente (más tiempo para mejor estabilidad)
    Write-ColorMessage "Esperando 15 segundos para que los servicios se inicialicen completamente..." $colorInfo
    Start-Sleep -Seconds 15

# Verificar que los contenedores están corriendo
$containersRunning = Invoke-SshCommand "docker ps --format '{{.Names}}' | grep -E 'masclet-frontend|masclet-frontend-node'"

if ($containersRunning -match "masclet-frontend" -and $containersRunning -match "masclet-frontend-node") {
    Write-ColorMessage "✅ Despliegue COMPLETADO con éxito! 🎉" $colorSuccess
    Write-ColorMessage "Frontend Masclet Imperi accesible en: http://$remoteHost 🌐" $colorInfo
    Write-ColorMessage $containersRunning $colorInfo
    
    # Verificar logs de Nginx para detectar problemas
    Write-ColorMessage "Comprobando logs de Nginx para verificar estado..." $colorInfo
    $nginxLogs = Invoke-SshCommand "docker logs masclet-frontend --tail 10"
    Write-ColorMessage $nginxLogs $colorInfo
    
    # Verificar logs de Node.js para detectar problemas
    Write-ColorMessage "Comprobando logs de Node.js para verificar estado..." $colorInfo
    $nodeLogs = Invoke-SshCommand "docker logs masclet-frontend-node --tail 20"
    Write-ColorMessage $nodeLogs $colorInfo
    
    # Verificar si hay errores específicos de módulos no encontrados
    if ($nodeLogs -match "ERR_MODULE_NOT_FOUND") {
        Write-ColorMessage "⚠️ ADVERTENCIA: Se detectaron errores de módulos no encontrados en Node.js" $colorWarning
        Write-ColorMessage "Módulos faltantes detectados:" $colorWarning
        $missingModules = [regex]::Matches($nodeLogs, "Cannot find package '([^']+)'")
        foreach ($module in $missingModules) {
            Write-ColorMessage "  - $($module.Groups[1].Value)" $colorWarning
        }
    }
    
    # Hacer una petición a la raíz para verificar que responde (usando la IP pública)
    Write-ColorMessage "Verificando respuesta del servidor..." $colorInfo
    # Primero verificamos localmente desde AWS
    $httpStatusLocal = Invoke-SshCommand "curl -s -o /dev/null -w '%{http_code}' http://localhost/"
    # Luego verificamos usando la IP pública
    $httpStatusPublic = Invoke-SshCommand "curl -s -o /dev/null -w '%{http_code}' http://$remoteHost/"
    
    Write-ColorMessage "Status desde localhost: $httpStatusLocal, Status desde IP pública: $httpStatusPublic" $colorInfo
    $httpStatus = $httpStatusPublic # Usamos el estado de la IP pública para la evaluación final
    
    if ($httpStatus -eq "200") {
        Write-ColorMessage "¡El servidor responde correctamente (HTTP 200)!" $colorSuccess
        Write-ColorMessage "Frontend disponible en: http://$remoteHost/" $colorSuccess
    } else {
        Write-ColorMessage "ADVERTENCIA: El servidor responde con código HTTP $httpStatus" $colorWarning
        Write-ColorMessage "Revisa los logs para más detalles:" $colorWarning
        Write-ColorMessage "docker logs masclet-frontend" $colorInfo
        Write-ColorMessage "docker logs masclet-frontend-node" $colorInfo
    }
} else {
    Write-ColorMessage "❌ ERROR: Uno o más contenedores no están ejecutándose correctamente" $colorError
    Write-ColorMessage "⚠️ Estado actual de los contenedores:" $colorWarning
    $dockerPs = Invoke-SshCommand "docker ps -a"
    Write-ColorMessage $dockerPs $colorInfo
    
    Write-ColorMessage "Revisando logs de los contenedores para diagnosticar problemas:" $colorWarning
    $frontendLogs = Invoke-SshCommand "docker logs masclet-frontend 2>&1 || echo 'No logs available'"
    Write-ColorMessage "LOGS DE NGINX:" $colorInfo
    Write-ColorMessage $frontendLogs $colorInfo
    
    $nodeLogs = Invoke-SshCommand "docker logs masclet-frontend-node 2>&1 || echo 'No logs available'"
    Write-ColorMessage "LOGS DE NODE.JS:" $colorInfo
    Write-ColorMessage $nodeLogs $colorInfo
}

Write-ColorMessage "Proceso de despliegue finalizado" $colorSuccess
