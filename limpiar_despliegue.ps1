# Script para limpiar archivos de despliegue innecesarios
# Creado: 2025-06-04

# Crear carpeta de archivos temporales si no existe
$tempFolder = ".\archivos_antiguos_despliegue"
if (-not (Test-Path $tempFolder)) {
    New-Item -Path $tempFolder -ItemType Directory
}

# Archivos a conservar (rutas relativas desde la raíz del proyecto)
$archivosConservar = @(
    "deployment\deploy.ps1", 
    "new_tests\complementos\comprobar_despliegue.py",
    "deployment\frontend\deploy.ps1"
)

Write-Host "🧹 Iniciando limpieza de archivos de despliegue..." -ForegroundColor Cyan

# Lista de patrones para identificar archivos relacionados con despliegue
$patronesDespliegue = @(
    "DESPLIEGUE*.ps1", 
    "DESPLIEGUE*.sh", 
    "deploy-*.ps1", 
    "deploy-*.sh", 
    "despliegue-*.ps1", 
    "arreglo-*.sh",
    "fix-server*.js",
    "fix_api*.ps1",
    "fix_nginx*.ps1",
    "restaurar-backend*.ps1",
    "restaurar-backend*.sh",
    "SOLUCION-*.ps1",
    "SOLUCION-*.sh",
    "super-final.ps1",
    "ARREGLO-*.sh"
)

# Archivos encontrados para mover
$archivosParaMover = @()

# Buscar archivos en el directorio raíz
foreach ($patron in $patronesDespliegue) {
    $archivos = Get-ChildItem -Path . -Filter $patron -File -Recurse
    foreach ($archivo in $archivos) {
        $rutaRelativa = $archivo.FullName.Replace((Get-Location).Path + "\", "")
        
        # Verificar si el archivo está en la lista de archivos a conservar
        $conservar = $false
        foreach ($archivoConservar in $archivosConservar) {
            if ($rutaRelativa -eq $archivoConservar) {
                $conservar = $true
                break
            }
        }
        
        if (-not $conservar) {
            $archivosParaMover += $archivo
        }
    }
}

# Mover archivos temporales de despliegue
Write-Host "📋 Se encontraron $($archivosParaMover.Count) archivos para mover:" -ForegroundColor Yellow

foreach ($archivo in $archivosParaMover) {
    $nombreDestino = $archivo.Name
    $rutaDestino = Join-Path -Path $tempFolder -ChildPath $nombreDestino
    
    # Si ya existe un archivo con el mismo nombre en el destino, agregar un sufijo
    if (Test-Path $rutaDestino) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $nombreDestino = [System.IO.Path]::GetFileNameWithoutExtension($archivo.Name) + "_" + $timestamp + $archivo.Extension
        $rutaDestino = Join-Path -Path $tempFolder -ChildPath $nombreDestino
    }
    
    Write-Host "🔄 Moviendo: $($archivo.FullName) -> $rutaDestino" -ForegroundColor Gray
    Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
}

# Limpiar carpetas temporales de despliegue
$carpetasTemporales = @(
    ".\temp_deploy",
    ".\deployment\temp-aws",
    ".\deployment\temp-deploy",
    ".\deployment\temp-final"
)

foreach ($carpeta in $carpetasTemporales) {
    if (Test-Path $carpeta) {
        $carpetaDestino = Join-Path -Path $tempFolder -ChildPath (Split-Path $carpeta -Leaf)
        Write-Host "📁 Moviendo carpeta: $carpeta -> $carpetaDestino" -ForegroundColor Magenta
        
        if (Test-Path $carpetaDestino) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $carpetaDestino = $carpetaDestino + "_" + $timestamp
        }
        
        # Crear la carpeta de destino
        New-Item -Path $carpetaDestino -ItemType Directory -Force | Out-Null
        
        # Mover todo el contenido
        Get-ChildItem -Path $carpeta | Move-Item -Destination $carpetaDestino -Force
        
        # Eliminar la carpeta original (ahora vacía)
        Remove-Item -Path $carpeta -Force -Recurse
    }
}

Write-Host "✅ Limpieza completada. Los archivos se han movido a: $tempFolder" -ForegroundColor Green
Write-Host "❓ Para eliminar permanentemente estos archivos, ejecute: Remove-Item -Path '$tempFolder' -Recurse -Force" -ForegroundColor Yellow
