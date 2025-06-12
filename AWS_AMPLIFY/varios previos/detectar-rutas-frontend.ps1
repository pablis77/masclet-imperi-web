# Script para detectar rutas y componentes del frontend en Masclet Imperi Web
# Este script complementa el análisis de endpoints backend con un mapa de la estructura frontend

# Directorios a analizar
$frontendDir = "C:\Proyectos\claude\masclet-imperi-web\frontend"
$outputDir = "C:\Proyectos\claude\masclet-imperi-web\AWS_AMPLIFY\SONARQUBE\frontend-detectado"

# Crear directorio de salida si no existe
if (-not (Test-Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

# Timestamp para archivos de salida
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = "$outputDir\rutas-frontend-$timestamp.md"

Write-Host "🔍 DETECTOR DE RUTAS FRONTEND PARA AWS AMPLIFY" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Analizando estructura frontend en $frontendDir..."

# Arrays para almacenar resultados
$routeComponents = @{}
$pages = @()
$layouts = @()
$apiCalls = @()

# Buscar archivos de configuración de rutas
Write-Host "`n Buscando archivos de configuración de rutas..."
$configFiles = Get-ChildItem -Path $frontendDir -Recurse -Include "*route*", "*config*", "*navigation*" -File | 
                Where-Object { 
                    ($_.FullName -match "\.(tsx|jsx|ts|js|astro)$") -and 
                    ($_.FullName -notmatch "node_modules") 
                }

foreach ($file in $configFiles) {
    Write-Host "  Analizando: $($file.FullName)"
    $content = Get-Content $file.FullName -Raw
    
    # Buscar patrones de definición de rutas
    $routeMatches = [regex]::Matches($content, '(?:path|route):\s*[''"]([^''"]+)[''"]')
    foreach ($match in $routeMatches) {
        $route = $match.Groups[1].Value
        if (-not $routeComponents.ContainsKey($route)) {
            $routeComponents[$route] = @{
                "Path" = $route
                "SourceFile" = $file.FullName
                "Components" = @()
            }
        }
    }
}

# Buscar archivos de páginas y componentes
Write-Host "`n Buscando páginas y componentes..."
$componentFiles = Get-ChildItem -Path $frontendDir -Recurse -Include "*.tsx", "*.jsx", "*.astro" -File

foreach ($file in $componentFiles) {
    $relativePath = $file.FullName.Replace($frontendDir, "").TrimStart("\")
    
    # Verificar si el archivo existe físicamente antes de intentar leerlo
    if (Test-Path -Path $file.FullName) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        } catch {
            # Si hay error al leer el archivo, continuamos con contenido vacío
            $content = ""
            Write-Host "   - Advertencia: No se pudo leer $($file.FullName)" -ForegroundColor Yellow
        }
    } else {
        # Para archivos que no existen físicamente (como [id].astro)
        $content = ""
    }
    
    # Verificar si es una página
    $isPage = $file.FullName -match "[\\/]pages[\\/]" -or 
              $file.FullName -match "[\\/]views[\\/]" -or 
              $file.Name -match "^([A-Z][a-z]+)+(Page|View)\\." -or
              $file.Extension -eq ".astro"
    
    if ($isPage) {
        $pageName = $file.BaseName
        $pages += @{
            "Name" = $pageName
            "Path" = $relativePath
            "FullPath" = $file.FullName
        }
        
        # Detectar si es una ruta dinámica (contiene [id] u otro parámetro)
        $isDynamicRoute = $file.BaseName -match "\\[(.+?)\\]"
        if ($isDynamicRoute) {
            $routeParam = $Matches[1] # Captura el nombre del parámetro
            Write-Host "   - Ruta dinámica detectada: [$routeParam] en $relativePath" -ForegroundColor Cyan
        }
        
        # Intentar detectar la ruta asociada
        foreach ($route in $routeComponents.Keys) {
            # Comprobar si la ruta coincide con el nombre de archivo o contenido
            if ($relativePath -match [regex]::Escape($route) -or 
                $pageName -match [regex]::Escape($route) -or 
                ($content -and $content -match [regex]::Escape($route))) {
                $routeComponents[$route].Components += $relativePath
            }
        }
    }
    
    # Verificar si es un layout
    if ($file.FullName -match "[\\/]layout[\\/]" -or $file.Name -match "Layout\\.|layout\\.") {
        $layouts += @{
            "Name" = $file.BaseName
            "Path" = $relativePath
        }
    }
    
    # Buscar llamadas API solo si tenemos contenido
    if ($content) {
        try {
            $apiMatches = [regex]::Matches($content, '(?:fetch|axios|apiService)\.(get|post|put|delete|patch)\(\s*[''"]([\.\^''"]*)[''"]*')
            foreach ($match in $apiMatches) {
                $method = $match.Groups[1].Value
                $endpoint = $match.Groups[2].Value
                $apiCalls += @{
                    "Method" = $method.ToUpper()
                    "Endpoint" = $endpoint
                    "Component" = $relativePath
                }
            }
        } catch {
            Write-Host "   - Error al analizar llamadas API en ${relativePath}: ${_}" -ForegroundColor Yellow
        }
    }
    
    # Buscar específicamente componentes de explotaciones-react
    if (($content -and $content -match "explotaciones-react") -or $file.FullName -match "explotaciones-react" -or $file.FullName -match "[\\/]explotacio") {
        if (-not $routeComponents.ContainsKey("/explotaciones-react")) {
            $routeComponents["/explotaciones-react"] = @{
                "Path" = "/explotaciones-react"
                "SourceFile" = $file.FullName
                "Components" = @()
            }
        }
        $routeComponents["/explotaciones-react"].Components += $relativePath
    }
}

# Generar el informe
Write-Host "`n📝 Generando informe de rutas frontend..."
$report = @"
# Análisis de Rutas Frontend - Masclet Imperi Web
*Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

Este informe muestra la estructura de rutas, páginas y componentes del frontend de la aplicación.

## 1. Rutas Detectadas

| Ruta | Archivo Fuente | Componentes Asociados |
|------|---------------|---------------------|
"@

foreach ($route in $routeComponents.Keys | Sort-Object) {
    $details = $routeComponents[$route]
    $componentsList = if ($details.Components.Count -gt 0) { $details.Components -join "<br>" } else { "-" }
    $sourceFile = $details.SourceFile.Replace($frontendDir, "").TrimStart("\")
    $report += "`n| $($details.Path) | $sourceFile | $componentsList |"
}

$report += @"

## 2. Páginas Detectadas

| Nombre | Ruta del Archivo |
|--------|----------------|
"@

foreach ($page in $pages | Sort-Object -Property Name) {
    $report += "`n| $($page.Name) | $($page.Path) |"
}

$report += @"

## 3. Layouts Detectados

| Nombre | Ruta del Archivo |
|--------|----------------|
"@

foreach ($layout in $layouts | Sort-Object -Property Name) {
    $report += "`n| $($layout.Name) | $($layout.Path) |"
}

$report += @"

## 4. Llamadas a API desde Componentes

| Método | Endpoint | Componente |
|--------|---------|------------|
"@

foreach ($call in $apiCalls | Sort-Object -Property Endpoint) {
    $report += "`n| $($call.Method) | $($call.Endpoint) | $($call.Component) |"
}

$report += @"

## 5. Relación entre APIs Frontend y Backend

Este análisis muestra cómo los componentes frontend se conectan con los endpoints backend.

- **Total de rutas frontend:** $($routeComponents.Count)
- **Total de páginas:** $($pages.Count)
- **Total de llamadas API:** $($apiCalls.Count)

"@

# Guardar el informe
$report | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "`n✅ Análisis completado exitosamente" -ForegroundColor Green
Write-Host "  Informe generado: $outputFile" -ForegroundColor Green

# Devolver la ruta del informe para uso en otros scripts
return $outputFile
