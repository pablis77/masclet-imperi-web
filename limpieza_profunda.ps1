# Script para limpieza profunda del proyecto
# Creado: 2025-06-04
# Actualizado: 2025-06-04

# Crear carpetas de archivos temporales si no existen
$tempFolder = ".\archivos_antiguos"
$oldTestsFolder = ".\old_tests"
$deploymentJunkFolder = ".\deployment_junk"

foreach ($folder in @($tempFolder, $oldTestsFolder, $deploymentJunkFolder)) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory -Force | Out-Null
    }
}

Write-Host "🧹 Iniciando limpieza profunda del proyecto..." -ForegroundColor Cyan

# 1. Archivos grandes en la raíz que no son necesarios
$archivosGrandesInnecesarios = @(
    "masclet-imperi-web-main.zip",
    "0001-Versi-n-limpia-con-todos-los-archivos-actuales-pero-.patch",
    "bfg.jar",
    "salida_test.txt"
)

Write-Host "📦 Moviendo archivos grandes innecesarios..." -ForegroundColor Yellow
foreach ($archivo in $archivosGrandesInnecesarios) {
    if (Test-Path $archivo) {
        $destino = Join-Path -Path $tempFolder -ChildPath $archivo
        Write-Host "  - Moviendo: $archivo -> $destino" -ForegroundColor Gray
        Move-Item -Path $archivo -Destination $destino -Force
    }
}

# 2. Scripts de despliegue innecesarios
$patronesScripts = @(
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
    "ARREGLO-*.sh"
)

Write-Host "📜 Moviendo scripts innecesarios de despliegue..." -ForegroundColor Yellow
foreach ($patron in $patronesScripts) {
    $archivos = Get-ChildItem -Path . -Filter $patron -File -Recurse -ErrorAction SilentlyContinue
    foreach ($archivo in $archivos) {
        # Conservar los scripts importantes
        if (($archivo.FullName -like "*deployment\deploy.ps1") -or 
            ($archivo.FullName -like "*deployment\frontend\deploy.ps1")) {
            Write-Host "  - Conservando script importante: $($archivo.FullName)" -ForegroundColor Green
            continue
        }
        
        $rutaDestino = Join-Path -Path $tempFolder -ChildPath $archivo.Name
        if (Test-Path $rutaDestino) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $rutaDestino = Join-Path -Path $tempFolder -ChildPath ($archivo.BaseName + "_" + $timestamp + $archivo.Extension)
        }
        Write-Host "  - Moviendo script: $($archivo.Name) -> $rutaDestino" -ForegroundColor Gray
        Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
    }
}

# 3. Archivos Dockerfile redundantes
$dockerfilesRedundantes = @(
    "Dockerfile-temp",
    "Dockerfile-final",
    "docker-compose-temp.yml"
)

Write-Host "🐳 Moviendo archivos Docker redundantes..." -ForegroundColor Yellow
foreach ($archivo in $dockerfilesRedundantes) {
    if (Test-Path $archivo) {
        $destino = Join-Path -Path $tempFolder -ChildPath $archivo
        Write-Host "  - Moviendo: $archivo -> $destino" -ForegroundColor Gray
        Move-Item -Path $archivo -Destination $destino -Force
    }
}

# 4. Logs y archivos temporales
$patronesLogsTemp = @(
    "reset_database_*.log",
    "*_backup.log",
    "*.tmp",
    "temp_*.py",
    "temp_*.js",
    "main-temp.py",
    "requirements-temp.txt"
)

Write-Host "📝 Moviendo logs y archivos temporales..." -ForegroundColor Yellow
foreach ($patron in $patronesLogsTemp) {
    $archivos = Get-ChildItem -Path . -Filter $patron -File -Recurse -ErrorAction SilentlyContinue
    foreach ($archivo in $archivos) {
        $rutaDestino = Join-Path -Path $tempFolder -ChildPath $archivo.Name
        if (Test-Path $rutaDestino) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $rutaDestino = Join-Path -Path $tempFolder -ChildPath ($archivo.BaseName + "_" + $timestamp + $archivo.Extension)
        }
        Write-Host "  - Moviendo log/temp: $($archivo.Name) -> $rutaDestino" -ForegroundColor Gray
        Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
    }
}

# 5. Carpetas temporales específicas
$carpetasTemporales = @(
    ".\temp_deploy",
    ".\deployment\temp-aws",
    ".\deployment\temp-deploy",
    ".\deployment\temp-final",
    ".\.pytest_cache",
    ".\htmlcov"
)

Write-Host "📁 Moviendo carpetas temporales..." -ForegroundColor Magenta
foreach ($carpeta in $carpetasTemporales) {
    if (Test-Path $carpeta) {
        $nombreCarpeta = Split-Path $carpeta -Leaf
        $carpetaDestino = Join-Path -Path $tempFolder -ChildPath $nombreCarpeta
        
        if (Test-Path $carpetaDestino) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $carpetaDestino = $carpetaDestino + "_" + $timestamp
        }
        
        Write-Host "  - Moviendo carpeta: $carpeta -> $carpetaDestino" -ForegroundColor Magenta
        
        # Crear la carpeta de destino
        New-Item -Path $carpetaDestino -ItemType Directory -Force | Out-Null
        
        # Mover todo el contenido
        Get-ChildItem -Path $carpeta | Move-Item -Destination $carpetaDestino -Force
        
        # Eliminar la carpeta original (ahora vacía)
        Remove-Item -Path $carpeta -Force -Recurse -ErrorAction SilentlyContinue
    }
}

# 6. Archivos de texto temporales o notas
$patronesTexto = @(
    "*.txt",
    "Sin título.txt"
)

Write-Host "📄 Moviendo archivos de texto temporales..." -ForegroundColor Yellow
foreach ($patron in $patronesTexto) {
    $archivos = Get-ChildItem -Path . -Filter $patron -File -Depth 1  # Solo en el directorio raíz
    foreach ($archivo in $archivos) {
        # Excluir archivos importantes
        if ($archivo.Name -eq "requirements.txt" -or 
            $archivo.Name -eq "requirements-dev.txt") {
            continue
        }
        
        $rutaDestino = Join-Path -Path $tempFolder -ChildPath $archivo.Name
        if (Test-Path $rutaDestino) {
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $rutaDestino = Join-Path -Path $tempFolder -ChildPath ($archivo.BaseName + "_" + $timestamp + $archivo.Extension)
        }
        Write-Host "  - Moviendo texto: $($archivo.Name) -> $rutaDestino" -ForegroundColor Gray
        Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
    }
}

# 7. .env duplicados - conservar solo .env y .env.example
Write-Host "🔧 Organizando archivos .env..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path . -Filter ".env.*" -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne ".env.example" -and $_.Name -ne ".env.production" }

foreach ($archivo in $envFiles) {
    if ($archivo.FullName -like "*\.git\*") {
        continue  # Ignorar archivos en carpeta .git
    }
    
    $rutaDestino = Join-Path -Path $tempFolder -ChildPath ($archivo.Directory.Name + "_" + $archivo.Name)
    if (Test-Path $rutaDestino) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $rutaDestino = Join-Path -Path $tempFolder -ChildPath ($archivo.Directory.Name + "_" + $archivo.BaseName + "_" + $timestamp + $archivo.Extension)
    }
    Write-Host "  - Moviendo env: $($archivo.FullName) -> $rutaDestino" -ForegroundColor Gray
    Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
}

# 8. Limpiar carpetas de tests antiguas (no new_tests)
Write-Host " Buscando y moviendo carpetas de tests antiguas..." -ForegroundColor Yellow

# Buscar todas las carpetas que contengan 'test' en su nombre pero no sean 'new_tests'
$carpetasTests = Get-ChildItem -Path . -Directory -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { 
        ($_.Name -like "*test*" -or $_.Name -like "*Test*") -and 
        $_.Name -ne "new_tests" -and 
        $_.FullName -notlike "*\new_tests\*" -and
        $_.FullName -notlike "*\node_modules\*" -and
        $_.FullName -notlike "*\.git\*"
    }

foreach ($carpeta in $carpetasTests) {
    $nombreRelativo = $carpeta.FullName.Replace((Get-Location).Path + "\", "")
    $carpetaDestino = Join-Path -Path $oldTestsFolder -ChildPath $nombreRelativo
    
    # Crear estructura de carpetas en el destino
    $carpetaPadre = Split-Path -Path $carpetaDestino -Parent
    if (-not (Test-Path $carpetaPadre)) {
        New-Item -Path $carpetaPadre -ItemType Directory -Force | Out-Null
    }
    
    Write-Host "  - Moviendo carpeta de tests antigua: $nombreRelativo -> $carpetaDestino" -ForegroundColor Magenta
    
    try {
        # Crear la carpeta de destino
        if (-not (Test-Path $carpetaDestino)) {
            New-Item -Path $carpetaDestino -ItemType Directory -Force | Out-Null
        }
        
        # Mover todo el contenido manteniendo la estructura
        Get-ChildItem -Path $carpeta.FullName -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($carpeta.FullName.Length)
            $targetPath = Join-Path -Path $carpetaDestino -ChildPath $relativePath
            
            if ($_ -is [System.IO.DirectoryInfo]) {
                if (-not (Test-Path $targetPath)) {
                    New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
                }
            } else {
                $targetParent = Split-Path -Path $targetPath -Parent
                if (-not (Test-Path $targetParent)) {
                    New-Item -Path $targetParent -ItemType Directory -Force | Out-Null
                }
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
        
        # Eliminar la carpeta original
        Remove-Item -Path $carpeta.FullName -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "    Error al mover: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. Limpiar archivos innecesarios en deployment/frontend
Write-Host " Limpiando archivos innecesarios en deployment/frontend..." -ForegroundColor Yellow

# Archivos a conservar en deployment/frontend
$archivosConservar = @(
    "deploy.ps1",
    "Dockerfile.frontend",
    "Dockerfile.prod",
    "README.md",
    "docker-compose.prod.yml",
    "docker-compose.yml",
    "nginx.conf"
)

# Mover archivos innecesarios de deployment/frontend
if (Test-Path "deployment\frontend") {
    $archivos = Get-ChildItem -Path "deployment\frontend" -File
    foreach ($archivo in $archivos) {
        if ($archivosConservar -notcontains $archivo.Name) {
            $rutaDestino = Join-Path -Path $deploymentJunkFolder -ChildPath $archivo.Name
            
            if (Test-Path $rutaDestino) {
                $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
                $rutaDestino = Join-Path -Path $deploymentJunkFolder -ChildPath ($archivo.BaseName + "_" + $timestamp + $archivo.Extension)
            }
            
            Write-Host "  - Moviendo archivo innecesario: deployment\frontend\$($archivo.Name) -> $rutaDestino" -ForegroundColor Gray
            Move-Item -Path $archivo.FullName -Destination $rutaDestino -Force
        }
    }
}

# 10. Limpiar carpetas innecesarias en deployment/frontend
$carpetasDeploymentFrontend = Get-ChildItem -Path "deployment\frontend" -Directory -ErrorAction SilentlyContinue
foreach ($carpeta in $carpetasDeploymentFrontend) {
    $carpetaDestino = Join-Path -Path $deploymentJunkFolder -ChildPath $carpeta.Name
    
    if (Test-Path $carpetaDestino) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $carpetaDestino = Join-Path -Path $deploymentJunkFolder -ChildPath ($carpeta.Name + "_" + $timestamp)
    }
    
    Write-Host "  - Moviendo carpeta innecesaria: deployment\frontend\$($carpeta.Name) -> $carpetaDestino" -ForegroundColor Magenta
    
    # Crear la carpeta de destino
    New-Item -Path $carpetaDestino -ItemType Directory -Force | Out-Null
    
    # Mover todo el contenido
    Get-ChildItem -Path $carpeta.FullName | Move-Item -Destination $carpetaDestino -Force
    
    # Eliminar la carpeta original (ahora vacía)
    Remove-Item -Path $carpeta.FullName -Force -Recurse -ErrorAction SilentlyContinue
}

# 11. Calcular espacio liberado
$totalBytesTemp = (Get-ChildItem -Path $tempFolder -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalBytesOldTests = (Get-ChildItem -Path $oldTestsFolder -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$totalBytesDeployment = (Get-ChildItem -Path $deploymentJunkFolder -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum

$totalBytes = $totalBytesTemp + $totalBytesOldTests + $totalBytesDeployment
$totalMB = [math]::Round($totalBytes / 1MB, 2)

Write-Host "`n Limpieza completada." -ForegroundColor Green
Write-Host " Resultados de la limpieza:" -ForegroundColor Cyan
Write-Host "  - Archivos temporales movidos a: $tempFolder" -ForegroundColor White
Write-Host "  - Tests antiguos movidos a: $oldTestsFolder" -ForegroundColor White
Write-Host "  - Archivos de despliegue innecesarios movidos a: $deploymentJunkFolder" -ForegroundColor White
Write-Host " Espacio aproximado liberado: $totalMB MB" -ForegroundColor Cyan
Write-Host "`n Para eliminar permanentemente estos archivos, ejecute:" -ForegroundColor Yellow
Write-Host "   Remove-Item -Path '$tempFolder' -Recurse -Force" -ForegroundColor Yellow
Write-Host "   Remove-Item -Path '$oldTestsFolder' -Recurse -Force" -ForegroundColor Yellow
Write-Host "   Remove-Item -Path '$deploymentJunkFolder' -Recurse -Force" -ForegroundColor Yellow
