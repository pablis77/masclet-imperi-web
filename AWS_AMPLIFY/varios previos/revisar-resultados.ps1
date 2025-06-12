# Script para revisar y consolidar los resultados del análisis

param (
    [string]$DirectorioResultados = "./navegador-analisis/resultados"
)

Write-Host "🔍 Revisando resultados del análisis..." -ForegroundColor Cyan

# Verificar si existe el directorio de resultados
if (-not (Test-Path -Path $DirectorioResultados)) {
    Write-Host "❌ No se encontró el directorio de resultados: $DirectorioResultados" -ForegroundColor Red
    exit 1
}

# Verificar si existen los archivos principales
$archivoJson = Join-Path -Path $DirectorioResultados -ChildPath "analisis-navegador.json"
$archivoMd = Join-Path -Path $DirectorioResultados -ChildPath "analisis-navegador.md"
$archivoMapeo = Join-Path -Path $DirectorioResultados -ChildPath "componentes-endpoints.md"
$archivoPatrones = Join-Path -Path $DirectorioResultados -ChildPath "api-patterns-detectados.json"

$archivosExistentes = @()
$archivosFaltantes = @()

foreach ($archivo in @($archivoJson, $archivoMd, $archivoMapeo, $archivoPatrones)) {
    if (Test-Path -Path $archivo) {
        $archivosExistentes += $archivo
    } else {
        $archivosFaltantes += $archivo
    }
}

# Informar sobre archivos encontrados y faltantes
Write-Host "📂 Archivos encontrados: $($archivosExistentes.Count)" -ForegroundColor Green
foreach ($archivo in $archivosExistentes) {
    $tamanoKB = [math]::Round((Get-Item $archivo).Length / 1KB, 2)
    Write-Host "   ✅ $([System.IO.Path]::GetFileName($archivo)) ($tamanoKB KB)" -ForegroundColor Green
}

if ($archivosFaltantes.Count -gt 0) {
    Write-Host "⚠️ Archivos faltantes: $($archivosFaltantes.Count)" -ForegroundColor Yellow
    foreach ($archivo in $archivosFaltantes) {
        Write-Host "   ❌ $([System.IO.Path]::GetFileName($archivo))" -ForegroundColor Yellow
    }
}

# Verificar si hay capturas de pantalla
$capturas = Get-ChildItem -Path $DirectorioResultados -Filter "screenshot-*.png"
if ($capturas.Count -gt 0) {
    Write-Host "📸 Capturas de pantalla encontradas: $($capturas.Count)" -ForegroundColor Green
    foreach ($captura in $capturas) {
        $tamanoKB = [math]::Round($captura.Length / 1KB, 2)
        Write-Host "   ✅ $($captura.Name) ($tamanoKB KB)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ No se encontraron capturas de pantalla" -ForegroundColor Yellow
}

# Si existe el archivo de componentes-endpoints.md, mostrar un resumen
if (Test-Path -Path $archivoMapeo) {
    Write-Host "`n📝 Resumen del mapeo de componentes a endpoints:" -ForegroundColor Cyan
    
    $contenido = Get-Content -Path $archivoMapeo -Raw
    $secciones = [regex]::Matches($contenido, '### Sección: ([^\n]+)')
    
    Write-Host "   Secciones detectadas: $($secciones.Count)" -ForegroundColor Green
    foreach ($seccion in $secciones) {
        $nombreSeccion = $seccion.Groups[1].Value
        Write-Host "   - $nombreSeccion" -ForegroundColor Green
    }
    
    # Contar relaciones
    $relaciones = [regex]::Matches($contenido, '\| .+ \| .+ \|')
    Write-Host "   Relaciones componente-endpoint detectadas: $($relaciones.Count)" -ForegroundColor Green
    
    # Mostrar el contenido completo del archivo
    Write-Host "`n📋 Contenido del archivo de mapeo:" -ForegroundColor Cyan
    Get-Content -Path $archivoMapeo | ForEach-Object {
        Write-Host "   $_"
    }
}

# Si existe el archivo de api-patterns-detectados.json, mostrar los patrones
if (Test-Path -Path $archivoPatrones) {
    Write-Host "`n🔍 Patrones de API detectados en el código:" -ForegroundColor Cyan
    
    $patrones = Get-Content -Path $archivoPatrones -Raw | ConvertFrom-Json
    Write-Host "   Patrones detectados: $($patrones.Count)" -ForegroundColor Green
    
    foreach ($patron in $patrones) {
        Write-Host "   - $patron" -ForegroundColor Green
    }
}

Write-Host "`n✅ Revisión de resultados completada" -ForegroundColor Cyan
Write-Host "Los resultados están disponibles en: $DirectorioResultados" -ForegroundColor Cyan
