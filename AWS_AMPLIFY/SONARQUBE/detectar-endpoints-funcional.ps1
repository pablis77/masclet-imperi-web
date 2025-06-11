# Script para detectar endpoints en Masclet Imperi Web
# Este script NO modifica la base de datos ni ejecuta ningún endpoint
 este script dice qu TODOS los endpoints que tiene cada archio .py... sin deferenciar cuales estan funcionando con ROUTER.py es una vision egeneral de lo que teniamos, e incluso util apra borrar archvios .py obsoletos
#
# Configuración de directorios
$proyectoPath = "C:\Proyectos\claude\masclet-imperi-web"
$resultadosPath = "$proyectoPath\AWS_AMPLIFY\SONARQUBE\endpoints-detectados"
$endpointsPath = "$proyectoPath\backend\app\api\endpoints" # Ruta CORRECTA

# Crear directorio para resultados
if (-not (Test-Path $resultadosPath)) {
    New-Item -Path $resultadosPath -ItemType Directory | Out-Null
    Write-Host "Creado directorio para análisis: $resultadosPath" -ForegroundColor Green
}

Write-Host "🔍 DETECTOR DE ENDPOINTS PARA AWS AMPLIFY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Este análisis NO modifica la base de datos" -ForegroundColor Green

# 1. Buscar todos los archivos Python del backend que pueden contener endpoints
Write-Host "`n📂 Buscando archivos de endpoints..." -ForegroundColor Yellow

$endpointFiles = Get-ChildItem -Path $endpointsPath -Recurse -Include "*.py"
Write-Host "Encontrados $($endpointFiles.Count) archivos de endpoints" -ForegroundColor Green

# 2. Inicializar arrays para guardar resultados
$dashboardEndpoints = @()
$animalesEndpoints = @()
$usuariosEndpoints = @()
$importacionesEndpoints = @()
$backupsEndpoints = @()
$listadosEndpoints = @()
$notificacionesEndpoints = @()
$explotacionesDirectosEndpoints = @()
$otrosEndpoints = @()

# 3. Analizar cada archivo
foreach ($file in $endpointFiles) {
    $fileName = $file.Name
    Write-Host "Analizando $fileName..." -ForegroundColor DarkCyan
    $content = Get-Content -Path $file.FullName -Raw
    
    # Primero intentamos detectar el prefijo del router
    $prefix = ""
    if ($content -match '(?:APIRouter|Router)\s*\(\s*(?:.*?prefix\s*=\s*[''"])([^''"]*)') {
        $prefix = $matches[1]
        Write-Host "  - Prefijo encontrado: $prefix" -ForegroundColor Green
    } else {
        Write-Host "  - No se encontró prefijo en $fileName" -ForegroundColor Yellow
    }
    
    # Luego extraemos todas las rutas
    $routeMatches = Select-String -InputObject $content -Pattern '@router\.(get|post|put|delete|patch)\(\s*[''"]([^''"]*)' -AllMatches
    
    if ($routeMatches.Matches.Count -gt 0) {
        Write-Host "  - Encontradas $($routeMatches.Matches.Count) rutas" -ForegroundColor Green
        
        foreach ($match in $routeMatches.Matches) {
            $method = $match.Groups[1].Value.ToUpper()
            $route = $match.Groups[2].Value
            
            # Construir la ruta completa correctamente
            $fullRoute = "/api/v1"
            
            # Si hay prefijo, lo agregamos asegurándonos de que tenga la barra inicial
            if ($prefix) {
                if ($prefix.StartsWith("/")) {
                    $fullRoute += $prefix
                } else {
                    $fullRoute += "/$prefix"
                }
            }
            
            # Agregamos la ruta específica si no es "/" o vacía
            if ($route -and $route -ne "/") {
                if ($route.StartsWith("/")) {
                    $fullRoute += $route
                } else {
                    $fullRoute += "/$route"
                }
            }
            
            # Crear el endpoint completo
            $endpoint = "$method $fullRoute"
            Write-Host "    * $endpoint" -ForegroundColor DarkGray
            
            # Clasificación por tipo en función del endpoint
            if ($fullRoute -like "*dashboard*") {
                $dashboardEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*animals*" -or $fullRoute -like "*partos*") {
                $animalesEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*users*" -or $fullRoute -like "*auth*" -or $fullRoute -like "*login*") {
                $usuariosEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*import*") {
                $importacionesEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*backup*") {
                $backupsEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*list*" -or $fullRoute -like "*report*") {
                $listadosEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*notif*") {
                $notificacionesEndpoints += $endpoint
            }
            elseif ($fullRoute -like "*explotacion*" -and $fullRoute -notlike "*dashboard*") {
                $explotacionesDirectosEndpoints += $endpoint
            }
            else {
                $otrosEndpoints += $endpoint
            }
        }
    } else {
        Write-Host "  - No se encontraron rutas en $fileName" -ForegroundColor Yellow
    }
}

# 4. Generar informe Markdown
Write-Host "`n📝 Generando informe de endpoints..." -ForegroundColor Yellow

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportFile = "$resultadosPath\endpoints-detectados-$timestamp.md"

$reportContent = @"
# Endpoints Detectados en Masclet Imperi Web

Informe generado automáticamente el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Resumen

- Dashboard: $($dashboardEndpoints.Count) endpoints
- Animales: $($animalesEndpoints.Count) endpoints
- Usuarios: $($usuariosEndpoints.Count) endpoints
- Importaciones: $($importacionesEndpoints.Count) endpoints
- Backups: $($backupsEndpoints.Count) endpoints
- Listados: $($listadosEndpoints.Count) endpoints
- Notificaciones: $($notificacionesEndpoints.Count) endpoints
- Explotaciones (directos): $($explotacionesDirectosEndpoints.Count) endpoints
- Otros: $($otrosEndpoints.Count) endpoints

## Endpoints por Módulo

### Dashboard

```
$($dashboardEndpoints -join "`n")
```

### Animales

```
$($animalesEndpoints -join "`n")
```

### Usuarios

```
$($usuariosEndpoints -join "`n")
```

### Importaciones

```
$($importacionesEndpoints -join "`n")
```

### Backups

```
$($backupsEndpoints -join "`n")
```

### Listados

```
$($listadosEndpoints -join "`n")
```

### Notificaciones

```
$($notificacionesEndpoints -join "`n")
```

### Explotaciones (Directos)

```
$($explotacionesDirectosEndpoints -join "`n")
```

### Otros

```
$($otrosEndpoints -join "`n")
```

## Nota Importante

Este informe fue generado mediante análisis estático del código. No se ejecutó ningún código ni se modificó la base de datos.
"@

$reportContent | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "Informe generado: $reportFile" -ForegroundColor Green
Write-Host "`n✅ Análisis completado exitosamente" -ForegroundColor Cyan
