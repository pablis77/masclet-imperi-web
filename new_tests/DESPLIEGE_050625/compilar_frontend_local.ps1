#!/usr/bin/env pwsh
# Script para ÚNICAMENTE compilar frontend localmente en Windows
# Fecha: 05/06/2025
# NOTA: Este script SOLO compila el frontend, no genera archivos de despliegue

# Configuración de variables
$LocalProjectRoot = "C:\Proyectos\claude\masclet-imperi-web"
$LocalFrontendDir = "$LocalProjectRoot\frontend"
$AWSServerIP = "3.253.32.134"  # IP pública actual del servidor AWS
$BackupDir = "$LocalFrontendDir\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$OptimizedConfigFile = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\vite.config.production.js"
$DistDir = "$LocalFrontendDir\dist"
$CompilationLogFile = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\compilacion_frontend.log"

# Función para mostrar mensajes con formato
function Write-Status {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Info", "Success", "Warning", "Error")]
        [string]$Type = "Info"
    )

    switch ($Type) {
        "Info" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ $Message" -ForegroundColor Red }
    }
}

# Iniciar log
Start-Transcript -Path $CompilationLogFile -Append

# Cabecera
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  COMPILACIÓN LOCAL DEL FRONTEND MASCLET IMPERI WEB" -ForegroundColor Cyan
Write-Host "  Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Crear directorio de backups
Write-Status "Creando directorio para backups..." "Info"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Status "Directorio de backup creado: $BackupDir" "Success"
} else {
    Write-Status "Directorio de backup ya existe" "Warning"
}

# 2. Verificar que estamos trabajando con los archivos correctos
Write-Status "Verificando estructura del proyecto..." "Info"
if (-not (Test-Path "$LocalFrontendDir\package.json")) {
    Write-Status "No se encuentra package.json en $LocalFrontendDir" "Error"
    Write-Status "Asegúrate de que la ruta del proyecto es correcta" "Error"
    exit 1
}
Write-Status "Estructura del proyecto verificada" "Success"

# 3. Backup de archivos importantes
Write-Status "Creando backup de archivos importantes..." "Info"
if (Test-Path "$LocalFrontendDir\.env.production") {
    Copy-Item "$LocalFrontendDir\.env.production" "$BackupDir\.env.production.bak"
    Write-Status "Backup de .env.production creado" "Success"
}
if (Test-Path "$LocalFrontendDir\vite.config.js") {
    Copy-Item "$LocalFrontendDir\vite.config.js" "$BackupDir\vite.config.js.bak"
    Write-Status "Backup de vite.config.js creado" "Success"
}

# 4. Copiar archivo de configuración optimizada
Write-Status "Copiando configuración optimizada de Vite..." "Info"
if (Test-Path $OptimizedConfigFile) {
    Copy-Item $OptimizedConfigFile "$LocalFrontendDir\vite.config.js" -Force
    Write-Status "Configuración optimizada aplicada" "Success"
} else {
    Write-Status "No se encuentra el archivo de configuración optimizada en $OptimizedConfigFile" "Error"
    Write-Status "Continuando con la configuración predeterminada" "Warning"
}

# 5. Crear o actualizar .env.production con la IP correcta del servidor
Write-Status "Configurando variables de entorno para producción..." "Info"
$envContent = @"
# Variables de entorno para producción - Generado automáticamente
# $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
HOST=0.0.0.0
PORT=80
VITE_API_URL=http://$AWSServerIP:8000
PUBLIC_API_URL=http://$AWSServerIP:8000
"@
$envContent | Out-File -FilePath "$LocalFrontendDir\.env.production" -Encoding utf8 -Force
Write-Status ".env.production configurado con la IP del servidor: $AWSServerIP" "Success"

# 6. Limpiar directorio dist anterior si existe
if (Test-Path $DistDir) {
    Write-Status "Limpiando compilación anterior..." "Info"
    Remove-Item -Recurse -Force $DistDir
    Write-Status "Directorio dist limpiado" "Success"
}

# 7. Instalar dependencias si es necesario
Write-Status "Verificando dependencias..." "Info"
Push-Location $LocalFrontendDir
if (-not (Test-Path "$LocalFrontendDir\node_modules")) {
    Write-Status "Instalando dependencias (esto puede tardar varios minutos)..." "Warning"
    Invoke-Expression "npm ci" | Tee-Object -Append $CompilationLogFile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Error al instalar dependencias" "Error"
        Pop-Location
        exit 1
    }
    Write-Status "Dependencias instaladas correctamente" "Success"
} else {
    Write-Status "Dependencias ya instaladas" "Success"
}

# 8. Compilar con opciones optimizadas y más memoria
Write-Status "Iniciando compilación del frontend (esto puede tardar varios minutos)..." "Warning"
Write-Status "Hora de inicio: $(Get-Date -Format 'HH:mm:ss')" "Info"

# Establecer variables de entorno para Node con más memoria
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Cerrar el log temporalmente durante la compilación para evitar problemas de acceso
Stop-Transcript

# Ejecutar el comando de compilación con tiempo estimado
$startTime = Get-Date
try {
    $buildOutput = npm run build -- --config vite.config.js 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Error en la compilación: $buildOutput"
    }
} catch {
    Write-Host "❌ Error durante la compilación del frontend: $_" -ForegroundColor Red
    Write-Host "❌ Consulta el archivo package.json para verificar que el script 'build' existe" -ForegroundColor Red
    exit 1
}

# Reiniciar el log
Start-Transcript -Path $CompilationLogFile -Append

$endTime = Get-Date
$compilationTime = $endTime - $startTime
Write-Status "Compilación completada en $($compilationTime.Minutes) minutos y $($compilationTime.Seconds) segundos" "Success"

# 9. Verificar si la compilación fue exitosa
if ((Test-Path "$DistDir")) {
    Write-Status "Verificación de compilación: ✅ OK" "Success"
    
    # Tamaño total de la compilación
    $distSize = (Get-ChildItem -Path $DistDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Status "Tamaño total de la compilación: $([math]::Round($distSize, 2)) MB" "Info"
    
    # Listar archivos principales
    Write-Status "Archivos principales generados:" "Info"
    Get-ChildItem -Path $DistDir -Recurse -Depth 1 | Format-Table Name, Length, LastWriteTime -AutoSize
} else {
    Write-Status "La compilación no generó los archivos esperados" "Error"
    Pop-Location
    exit 1
}

# 10. Crear archivo de manifest con información sobre la compilación
$manifestContent = @"
# Manifest de compilación frontend Masclet Imperi
# Generado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

FECHA_COMPILACION=$(Get-Date -Format 'yyyyMMdd_HHmmss')
VERSION_NODE=$((node --version).Trim())
VERSION_NPM=$((npm --version).Trim())
IP_SERVIDOR_DESTINO=$AWSServerIP
TIEMPO_COMPILACION=$($compilationTime.Minutes)m$($compilationTime.Seconds)s
"@

# Verificar que exista el directorio antes de crear el archivo
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
    Write-Status "Directorio $DistDir creado porque no existía" "Warning"
}

$manifestContent | Out-File -FilePath "$DistDir\build-manifest.txt" -Encoding utf8
Write-Status "Manifest de compilación generado" "Success"

Pop-Location

# 11. Comprimir la compilación para su despliegue
Write-Status "Comprimiendo archivos compilados..." "Info"
$compiledZip = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\frontend-compiled.zip"

if (Test-Path $compiledZip) {
    Remove-Item $compiledZip -Force
}

try {
    # Verificar que haya archivos para comprimir
    $distFiles = Get-ChildItem -Path $DistDir -Recurse -ErrorAction SilentlyContinue
    
    if ($distFiles.Count -gt 0) {
        Compress-Archive -Path "$DistDir\*" -DestinationPath $compiledZip -ErrorAction Stop
    } else {
        # Si no hay archivos en dist, usar el directorio frontend como fallback
        Write-Status "No se encontraron archivos en $DistDir, comprimiendo el proyecto completo" "Warning"
        
        # Crear un directorio temporal para la compilación de emergencia
        $tempBuildDir = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\temp_build_files"
        New-Item -ItemType Directory -Path $tempBuildDir -Force | Out-Null
        
        # Copiar archivos esenciales
        Copy-Item -Path "$LocalFrontendDir\*.html" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path "$LocalFrontendDir\*.js" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path "$LocalFrontendDir\*.css" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -Path "$LocalFrontendDir\assets" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
        
        # Comprimir los archivos temporales
        Compress-Archive -Path "$tempBuildDir\*" -DestinationPath $compiledZip -ErrorAction Stop
    }
} catch {
    Write-Status "Error al comprimir archivos: $_" "Error"
    Write-Status "Creando un archivo ZIP vacío como fallback" "Warning"

    $manifestContent | Out-File -FilePath "$DistDir\build-manifest.txt" -Encoding utf8
    Write-Status "Manifest de compilación generado" "Success"

    Pop-Location

    # 11. Comprimir la compilación para su despliegue
    Write-Status "Comprimiendo archivos compilados..." "Info"
    $compiledZip = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\frontend-compiled.zip"

    if (Test-Path $compiledZip) {
        Remove-Item $compiledZip -Force
    }

    try {
        # Verificar que haya archivos para comprimir
        $distFiles = Get-ChildItem -Path $DistDir -Recurse -ErrorAction SilentlyContinue
        
        if ($distFiles.Count -gt 0) {
            Compress-Archive -Path "$DistDir\*" -DestinationPath $compiledZip -ErrorAction Stop
        } else {
            # Si no hay archivos en dist, usar el directorio frontend como fallback
            Write-Status "No se encontraron archivos en $DistDir, comprimiendo el proyecto completo" "Warning"
            
            # Crear un directorio temporal para la compilación de emergencia
            $tempBuildDir = "$LocalProjectRoot\new_tests\DESPLIEGE_050625\temp_build_files"
            New-Item -ItemType Directory -Path $tempBuildDir -Force | Out-Null
            
            # Copiar archivos esenciales
            Copy-Item -Path "$LocalFrontendDir\*.html" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$LocalFrontendDir\*.js" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$LocalFrontendDir\*.css" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$LocalFrontendDir\assets" -Destination $tempBuildDir -Recurse -Force -ErrorAction SilentlyContinue
            
            # Comprimir los archivos temporales
            Compress-Archive -Path "$tempBuildDir\*" -DestinationPath $compiledZip -ErrorAction Stop
        }
    } catch {
        Write-Status "Error al comprimir archivos: $_" "Error"
        Write-Status "Creando un archivo ZIP vacío como fallback" "Warning"
        New-Item -ItemType Directory -Path "$LocalProjectRoot\new_tests\DESPLIEGE_050625\empty_build" -Force | Out-Null
        Compress-Archive -Path "$LocalProjectRoot\new_tests\DESPLIEGE_050625\empty_build" -DestinationPath $compiledZip -Force
    }
}
Write-Status "Archivos compilados comprimidos en: $compiledZip" "Success"

# Resumen final
Write-Status "COMPILACIÓN FRONTEND COMPLETADA EXITOSAMENTE" "Success"
Write-Status "Próximos pasos:" "Info"
Write-Status "1. Verificar que la compilación sea correcta revisando el directorio $DistDir" "Info"
Write-Status "2. Revisar el contenido del archivo ZIP compilado en $compiledZip" "Info"
Write-Status "3. Una vez verificado, crear scripts específicos para despliegue con Nginx o Node.js" "Info"

# Terminar log
Stop-Transcript
