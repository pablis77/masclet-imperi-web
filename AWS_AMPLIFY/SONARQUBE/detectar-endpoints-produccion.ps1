# Script para detectar endpoints EN USO REAL en Masclet Imperi Web
# Este script detecta solo endpoints en archivos importados en router.py
# No modifica la base de datos ni ejecuta ningún endpoint

# Configuración de directorios
$proyectoPath = "C:\Proyectos\claude\masclet-imperi-web"
$resultadosPath = "$proyectoPath\AWS_AMPLIFY\SONARQUBE\endpoints-detectados"
$endpointsPath = "$proyectoPath\backend\app\api\endpoints" 
$routerFile = "$proyectoPath\backend\app\api\router.py"

# Crear directorio para resultados
if (-not (Test-Path $resultadosPath)) {
    New-Item -Path $resultadosPath -ItemType Directory | Out-Null
    Write-Host "Creado directorio para análisis: $resultadosPath"
}

Write-Host "🔍 DETECTOR DE ENDPOINTS EN USO REAL PARA AWS AMPLIFY" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Este análisis detecta SOLO endpoints actualmente en uso en router.py" -ForegroundColor Green
Write-Host "No se modificará la base de datos ni ejecutará ningún código" -ForegroundColor Green

# 1. Analizar router.py para encontrar qué archivos de endpoints están realmente importados
Write-Host "`n📂 Analizando router.py para detectar importaciones..." -ForegroundColor Yellow

$routerContent = Get-Content -Path $routerFile -Raw
$importedEndpoints = @()

# Buscar patrones como: from app.api.endpoints.animals import router
$importMatches = Select-String -InputObject $routerContent -Pattern 'from app\.api\.endpoints\.(\w+) import router' -AllMatches
foreach ($match in $importMatches.Matches) {
    $endpointFileName = $match.Groups[1].Value
    if ($endpointFileName -ne "admin") {  # 'admin' importa admin_router, no router
        $importedEndpoints += $endpointFileName
        Write-Host "  Importado: $endpointFileName.py" -ForegroundColor Green
    }
}

# Buscar el caso especial de admin
if ($routerContent -match 'from app\.api\.endpoints\.admin import admin_router') {
    $importedEndpoints += "admin"
    Write-Host "  Importado: admin.py (caso especial)" -ForegroundColor Green
}

Write-Host "Encontrados $($importedEndpoints.Count) archivos de endpoints importados" -ForegroundColor Green

# 2. Buscar solo los archivos Python del backend que están importados en router.py
Write-Host "`n📂 Buscando archivos de endpoints importados..." -ForegroundColor Yellow

$endpointFiles = @()
foreach ($endpoint in $importedEndpoints) {
    $file = Get-ChildItem -Path "$endpointsPath\$endpoint.py" -ErrorAction SilentlyContinue
    if ($file) {
        $endpointFiles += $file
        Write-Host "  Encontrado: $($file.Name)" -ForegroundColor Green
    }
    else {
        Write-Host "  No encontrado: $endpoint.py" -ForegroundColor Red
    }
}

Write-Host "Encontrados $($endpointFiles.Count) archivos de endpoints en uso" -ForegroundColor Green

# 3. Inicializar arrays para guardar resultados
$dashboardEndpoints = @()
$animalesEndpoints = @()
$usuariosEndpoints = @()
$importacionesEndpoints = @()
$backupsEndpoints = @()
$listadosEndpoints = @()
$notificacionesEndpoints = @()
$explotacionesDirectosEndpoints = @()
$otrosEndpoints = @()

# 4. Analizar solo los archivos que están en uso real
foreach ($file in $endpointFiles) {
    $fileName = $file.Name
    Write-Host "Analizando $fileName..." -ForegroundColor DarkCyan
    $content = Get-Content -Path $file.FullName -Raw
    
    # Extraer prefijo del router importado en router.py
    $prefixFromRouter = ""
    $prefixMatch = Select-String -InputObject $routerContent -Pattern "api_router\.include_router\(\s*$($file.BaseName)_router,\s*prefix=[\'""]([^'""]*)" -AllMatches
    
    if ($prefixMatch.Matches.Count -gt 0) {
        $prefixFromRouter = $prefixMatch.Matches[0].Groups[1].Value
        Write-Host "  - Prefijo desde router.py: $prefixFromRouter" -ForegroundColor Blue
    }
    
    # Primero intentamos detectar el prefijo en el archivo de endpoints
    $prefix = ""
    if ($content -match '(?:APIRouter|Router)\s*\(\s*(?:.*?prefix\s*=\s*[''"])([^''"]*)') {
        $prefix = $matches[1]
        Write-Host "  - Prefijo en archivo: $prefix" -ForegroundColor Green
    } 
    
    # Si el archivo no tiene prefijo pero router.py sí, usamos el de router.py
    if (!$prefix -and $prefixFromRouter) {
        $prefix = $prefixFromRouter
        Write-Host "  - Usando prefijo de router.py" -ForegroundColor Yellow
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
            
            # Si hay prefijo de router.py, usamos ese primero
            if ($prefixFromRouter) {
                if ($prefixFromRouter.StartsWith("/")) {
                    $fullRoute += $prefixFromRouter
                } else {
                    $fullRoute += "/$prefixFromRouter"
                }
            }
            # Si no hay prefijo en router.py pero sí en el archivo, usamos ese
            elseif ($prefix) {
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

# 5. Contar endpoints totales
$totalEndpoints = $dashboardEndpoints.Count + 
                 $animalesEndpoints.Count + 
                 $usuariosEndpoints.Count + 
                 $importacionesEndpoints.Count + 
                 $backupsEndpoints.Count + 
                 $listadosEndpoints.Count + 
                 $notificacionesEndpoints.Count + 
                 $explotacionesDirectosEndpoints.Count + 
                 $otrosEndpoints.Count

# 6. Generar informe Markdown
Write-Host "`n📝 Generando informe de endpoints..." -ForegroundColor Yellow

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportFile = "$resultadosPath\endpoints-produccion-$timestamp.md"

$reportContent = @"
# Endpoints en Uso Real - Masclet Imperi Web

Informe generado automáticamente el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

> **NOTA IMPORTANTE:** Este informe solo incluye endpoints de los archivos importados en router.py, es decir, los que están actualmente en uso en la aplicación.

## Resumen

- **Total endpoints detectados: $totalEndpoints**
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

## Archivos de Endpoints Analizados

Los siguientes archivos fueron analizados porque están importados en router.py:

```
$($endpointFiles.Name -join "`n")
```

## Nota Técnica

Este informe fue generado mediante análisis estático del código, considerando únicamente los archivos importados en el router principal de la aplicación. No se ejecutó ningún código ni se modificó la base de datos.

El análisis incluye endpoints definidos en los archivos y considera también los prefijos asignados en router.py.
"@

$reportContent | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "Informe generado: $reportFile" -ForegroundColor Green
Write-Host "`n✅ Análisis completado exitosamente" -ForegroundColor Cyan
