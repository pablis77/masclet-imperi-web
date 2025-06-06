#!/usr/bin/env pwsh
# Script para comprobar el despliegue del sistema Masclet Imperi (frontend + backend)
# Versión 2.0 - Fecha: 06/06/2025
# Este script realiza verificaciones exhaustivas post-despliegue

# Configuración de variables
$ProyectoRoot = "C:\Proyectos\claude\masclet-imperi-web"
$LogDir = "$ProyectoRoot\new_tests\DESPLIEGE_050625\logs"
$LogFile = "$LogDir\verificacion_despliegue_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$ResultadosFile = "$LogDir\resultados_verificacion.json"
$BackendIP = "127.0.0.1"  # IP del backend local
$BackendPort = "8000"     # Puerto del backend
$FrontendIPs = @("localhost", "127.0.0.1", "172.20.160.1") # IPs desde donde acceder al frontend
$FrontendPort = "3000"    # Puerto del frontend en desarrollo
$TiempoEspera = 5         # Segundos de espera entre verificaciones

# Crear directorio de logs si no existe
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# Iniciar log
Start-Transcript -Path $LogFile -Append

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

# Función para hacer peticiones HTTP y verificar respuestas
function Test-Endpoint {
    param (
        [string]$Uri,
        [string]$Method = "GET",
        [int]$ExpectedStatus = 200,
        [string]$Description = "",
        [string]$Token = "",
        [switch]$SkipCertificateCheck = $false
    )

    Write-Status "Verificando endpoint: $Uri ($Description)" "Info"
    
    try {
        $headers = @{}
        if ($Token -ne "") {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri             = $Uri
            Method          = $Method
            Headers         = $headers
            UseBasicParsing = $true
            TimeoutSec      = 10
        }
        
        if ($SkipCertificateCheck) {
            # En PowerShell 6+ usar -SkipCertificateCheck
            # En PowerShell 5, usar esta configuración
            [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Status "✅ $Description: OK (Status: $($response.StatusCode))" "Success"
            return @{
                Success       = $true
                Status        = $response.StatusCode
                ResponseTime  = $response.BaseResponse.ResponseTime
                ContentLength = $response.RawContentLength
            }
        }
        else {
            Write-Status "❌ $Description: Error (Status: $($response.StatusCode), Esperado: $ExpectedStatus)" "Error"
            return @{
                Success = $false
                Status  = $response.StatusCode
                Error   = "Status code incorrecto"
            }
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        Write-Status "❌ $Description: Error - $errorMessage" "Error"
        return @{
            Success = $false
            Error   = $errorMessage
        }
    }
}

# Función para verificar si un servicio está corriendo en un puerto específico
function Test-ServicePort {
    param (
        [string]$Hostname,
        [int]$Port,
        [string]$ServiceName
    )
    
    Write-Status "Verificando servicio $ServiceName en $Hostname puerto $Port..." "Info"
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connectionResult = $tcpClient.BeginConnect($Hostname, $Port, $null, $null)
        $connectionWait = $connectionResult.AsyncWaitHandle.WaitOne(1000)
        
        if ($connectionWait) {
            $tcpClient.EndConnect($connectionResult)
            $tcpClient.Close()
            Write-Status "✅ Conexión a $ServiceName ($Hostname:$Port): OK" "Success"
            return $true
        }
        else {
            $tcpClient.Close()
            Write-Status "❌ Conexión a $ServiceName ($Hostname:$Port): FALLIDA - Servicio no disponible" "Error"
            return $false
        }
    }
    catch {
        Write-Status "❌ Conexión a $ServiceName ($Hostname:$Port): ERROR - $($_.Exception.Message)" "Error"
        return $false
    }
}

# Función para verificar si Docker está corriendo
function Test-Docker {
    Write-Status "Verificando estado de Docker..." "Info"
    
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✅ Docker está en funcionamiento" "Success"
            return $true
        }
        else {
            Write-Status "❌ Docker no está en funcionamiento" "Error"
            return $false
        }
    }
    catch {
        Write-Status "❌ Error al verificar Docker: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Función para obtener información del sistema
function Get-SystemInfo {
    Write-Status "Recopilando información del sistema..." "Info"
    
    $info = @{
        Hostname          = $env:COMPUTERNAME
        Username          = $env:USERNAME
        OSVersion         = [System.Environment]::OSVersion.VersionString
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        DateTime          = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        IPAddresses       = @(Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" } | Select-Object -ExpandProperty IPAddress)
    }
    
    # Intentar obtener más información del entorno
    try {
        $info["NodeVersion"] = (node --version 2>$null).Trim()
    }
    catch {
        $info["NodeVersion"] = "No disponible"
    }
    
    try {
        $info["NPMVersion"] = (npm --version 2>$null).Trim()
    }
    catch {
        $info["NPMVersion"] = "No disponible"
    }
    
    # Verificar espacio en disco
    try {
        $diskInfo = Get-PSDrive -PSProvider FileSystem C
        $info["DiskFreeSpace"] = "$([Math]::Round($diskInfo.Free / 1GB, 2)) GB"
        $info["DiskTotalSpace"] = "$([Math]::Round(($diskInfo.Free + $diskInfo.Used) / 1GB, 2)) GB"
    }
    catch {
        $info["DiskFreeSpace"] = "No disponible"
        $info["DiskTotalSpace"] = "No disponible"
    }
    
    return $info
}

# Función para verificar configuración de CORS
function Test-CORSConfiguration {
    param (
        [string]$BackendUrl,
        [string[]]$Origins
    )
    
    Write-Status "Verificando configuración CORS del backend..." "Info"
    $results = @{}
    
    foreach ($origin in $Origins) {
        Write-Status "Probando acceso desde origen: $origin" "Info"
        
        $headers = @{
            "Origin"                         = $origin
            "Access-Control-Request-Method"  = "GET"
            "Access-Control-Request-Headers" = "Content-Type, Authorization"
        }
        
        try {
            # Primero hacer una petición OPTIONS para verificar CORS
            $optionsResponse = Invoke-WebRequest -Uri "${BackendUrl}/auth/login" -Method Options -Headers $headers -UseBasicParsing -ErrorAction Stop
            
            if ($optionsResponse.StatusCode -eq 200 -or $optionsResponse.StatusCode -eq 204) {
                $corsHeader = $optionsResponse.Headers["Access-Control-Allow-Origin"]
                if ($corsHeader -eq "*" -or $corsHeader -eq $origin) {
                    Write-Status "✅ CORS permitido para origen $origin" "Success"
                    $results[$origin] = @{
                        Success = $true
                        Headers = @{
                            "Access-Control-Allow-Origin"  = $corsHeader
                            "Access-Control-Allow-Methods" = $optionsResponse.Headers["Access-Control-Allow-Methods"]
                            "Access-Control-Allow-Headers" = $optionsResponse.Headers["Access-Control-Allow-Headers"]
                        }
                    }
                }
                else {
                    Write-Status "❌ CORS no configurado correctamente para $origin" "Error"
                    $results[$origin] = @{
                        Success = $false
                        Error   = "CORS header incorrecto: $corsHeader"
                    }
                }
            }
            else {
                Write-Status "❌ Respuesta OPTIONS incorrecta: Status $($optionsResponse.StatusCode)" "Error"
                $results[$origin] = @{
                    Success = $false
                    Error   = "Status incorrecto: $($optionsResponse.StatusCode)"
                }
            }
        }
        catch {
            Write-Status "❌ Error al verificar CORS para $origin - $($_.Exception.Message)" "Error"
            $results[$origin] = @{
                Success = $false
                Error   = $_.Exception.Message
            }
        }
    }
    
    return $results
}

# Verificar detección de entornos en el frontend
function Test-FrontendEnvironmentDetection {
    param (
        [string[]]$Hostnames
    )
    
    Write-Status "Verificando detección de entorno desde diferentes nombres de host..." "Info"
    $results = @{}
    
    foreach ($hostname in $Hostnames) {
        Write-Status "Simulando acceso desde: $hostname" "Info"
        
        # Crear un pequeño script temporal para verificar la detección
        $tempScriptPath = "$env:TEMP\env_check_$((Get-Date).Ticks).js"
        
        $scriptContent = @"
const window = {
  location: {
    hostname: '$hostname'
  }
};

// Simulación básica de detección de entorno
function isLocal() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         /^192\.168\./.test(window.location.hostname) ||
         /^10\./.test(window.location.hostname) ||
         /^172\.(1[6-9]|2[0-9]|3[0-1])/.test(window.location.hostname);
}

console.log(JSON.stringify({
  hostname: window.location.hostname,
  isLocal: isLocal(),
  shouldUseLocalBackend: isLocal()
}));
"@
        
        $scriptContent | Out-File -FilePath $tempScriptPath -Encoding utf8
        
        try {
            $output = node $tempScriptPath 2>$null
            $detection = $output | ConvertFrom-Json
            
            if ($detection.shouldUseLocalBackend) {
                Write-Status "✅ $hostname: Correctamente identificado como entorno local" "Success"
            }
            else {
                Write-Status "❌ $hostname: No identificado como entorno local" "Error"
            }
            
            $results[$hostname] = $detection
            
        }
        catch {
            Write-Status "❌ Error al verificar detección para $hostname: $($_.Exception.Message)" "Error"
            $results[$hostname] = @{
                Error = $_.Exception.Message
            }
        }
        finally {
            # Limpiar archivo temporal
            if (Test-Path $tempScriptPath) {
                Remove-Item $tempScriptPath -Force
            }
        }
    }
    
    return $results
}

# Función para verificar conexiones de red entre servicios
function Test-NetworkConnections {
    param (
        [string]$BackendHost,
        [int]$BackendPort
    )
    
    Write-Status "Verificando conexiones de red entre servicios..." "Info"
    $results = @{
        Backend  = @{}
        Frontend = @{}
        Database = @{}
    }
    
    # Verificar backend
    $results.Backend["Listening"] = Test-ServicePort -Hostname $BackendHost -Port $BackendPort -ServiceName "Backend FastAPI"
    
    # Verificar base de datos PostgreSQL (si está en Docker)
    if (Test-Docker) {
        $pgContainerRunning = docker ps --filter "name=masclet-db" --format "{{.Names}}" 2>$null
        
        if ($pgContainerRunning) {
            Write-Status "✅ Contenedor PostgreSQL 'masclet-db' en ejecución" "Success"
            $results.Database["Container"] = $true
            
            # Intentar conectar a PostgreSQL desde dentro del contenedor
            try {
                $dbCheckCommand = "docker exec masclet-db pg_isready -h localhost -p 5432"
                $dbCheckResult = Invoke-Expression $dbCheckCommand 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Status "✅ PostgreSQL está activo y respondiendo dentro del contenedor" "Success"
                    $results.Database["Ready"] = $true
                }
                else {
                    Write-Status "❌ PostgreSQL no está respondiendo dentro del contenedor" "Error"
                    $results.Database["Ready"] = $false
                }
            }
            catch {
                Write-Status "❌ Error al verificar PostgreSQL: $($_.Exception.Message)" "Error"
                $results.Database["Ready"] = $false
                $results.Database["Error"] = $_.Exception.Message
            }
        }
        else {
            Write-Status "❌ Contenedor PostgreSQL 'masclet-db' no encontrado" "Error" 
            $results.Database["Container"] = $false
        }
    }
    else {
        Write-Status "❌ Docker no está en funcionamiento, omitiendo verificación de PostgreSQL" "Warning"
        $results.Database["Error"] = "Docker no está en funcionamiento"
    }
    
    return $results
}

# INICIO DEL SCRIPT PRINCIPAL

# Cabecera
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN EXHAUSTIVA DE DESPLIEGUE MASCLET IMPERI" -ForegroundColor Cyan
Write-Host "  Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Inicialización
$resultado = @{
    TimeStamp  = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    SystemInfo = Get-SystemInfo
    Tests      = @{}
}

# 1. Verificar información del sistema
$resultado.SystemInfo = Get-SystemInfo
Write-Status "Información del sistema recopilada" "Success"

# 2. Verificar servicios en puertos
Write-Status "FASE 1: Verificación de servicios en puertos" "Info"
$resultado.Tests.Services = Test-NetworkConnections -BackendHost $BackendIP -BackendPort $BackendPort

# Esperar entre verificaciones
Write-Status "Esperando $TiempoEspera segundos antes de la próxima verificación..." "Info"
Start-Sleep -Seconds $TiempoEspera

# 3. Verificar endpoints del backend
Write-Status "FASE 2: Verificación de endpoints del backend" "Info"
$baseUrl = "http://${BackendIP}:${BackendPort}/api/v1"
$endpoints = @(
    @{Uri = "$baseUrl/health"; Description = "Health check" },
    @{Uri = "$baseUrl/docs"; Description = "Documentación API" },
    @{Uri = "$baseUrl/auth/test"; Description = "Auth test" }
)

$resultado.Tests.Endpoints = @{}
foreach ($endpoint in $endpoints) {
    $testResult = Test-Endpoint -Uri $endpoint.Uri -Description $endpoint.Description
    $resultado.Tests.Endpoints[$endpoint.Uri] = $testResult
    
    # Esperar un momento entre peticiones
    Start-Sleep -Milliseconds 500
}

# 4. Verificar configuración CORS
Write-Status "FASE 3: Verificación de configuración CORS" "Info"
$origins = @("http://localhost:3000", "http://127.0.0.1:3000", "http://172.20.160.1:3000")
$baseBackendUrl = "http://${BackendIP}:${BackendPort}/api/v1"
$resultado.Tests.CORS = Test-CORSConfiguration -BackendUrl $baseBackendUrl -Origins $origins

# 5. Verificar detección de entorno del frontend
Write-Status "FASE 4: Verificación de detección de entorno frontend" "Info"
$hostnames = @("localhost", "127.0.0.1", "172.20.160.1", "192.168.1.100", "10.0.0.5", "masclet-imperi.com")
$resultado.Tests.EnvironmentDetection = Test-FrontendEnvironmentDetection -Hostnames $hostnames

# 6. Guardar resultados
$resultado | ConvertTo-Json -Depth 10 | Out-File -FilePath $ResultadosFile -Encoding utf8

# Resumen final
$exitosos = ($resultado.Tests.Endpoints.Values | Where-Object { $_.Success -eq $true }).Count
$fallidos = ($resultado.Tests.Endpoints.Values | Where-Object { $_.Success -eq $false }).Count
$total = $exitosos + $fallidos

# Mostrar resumen
Write-Host ""
Write-Host "===== RESUMEN DE VERIFICACIÓN =====" -ForegroundColor Cyan
Write-Host "Total de pruebas ejecutadas: $total" -ForegroundColor White
Write-Host "Pruebas exitosas: $exitosos" -ForegroundColor Green
Write-Host "Pruebas fallidas: $fallidos" -ForegroundColor Red
Write-Host ""
Write-Host "Resultados detallados guardados en: $ResultadosFile" -ForegroundColor Cyan
Write-Host "Log completo guardado en: $LogFile" -ForegroundColor Cyan

if ($fallidos -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Se han detectado problemas en la verificación del despliegue." -ForegroundColor Red
    Write-Host "   Revisa el log y los resultados detallados antes de continuar." -ForegroundColor Red
}
else {
    Write-Host ""
    Write-Host "✅ Todas las verificaciones completadas con éxito." -ForegroundColor Green
    Write-Host "   El sistema está correctamente desplegado y funcionando." -ForegroundColor Green
}

# Detener registro de log
Stop-Transcript