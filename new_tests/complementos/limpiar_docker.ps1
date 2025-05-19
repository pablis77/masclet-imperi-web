# Script para limpiar contenedores Docker no utilizados
# Conserva solo los contenedores relacionados con Masclet Imperi

Write-Host "=== LIMPIEZA DE CONTENEDORES DOCKER ===" -ForegroundColor Green

# Contenedores a conservar (ajusta estos nombres según necesites)
$contenedores_a_conservar = @(
    "masclet-db-new",  # Nuevo contenedor PostgreSQL optimizado
    "masclet-api"      # API de Masclet Imperi (cuando esté activo)
)

# Obtener lista de todos los contenedores detenidos
Write-Host "Buscando contenedores detenidos..." -ForegroundColor Yellow
$contenedores_detenidos = docker ps -a --filter "status=exited" --format "{{.ID}} {{.Names}}"

# Contador para estadísticas
$total_eliminados = 0
$total_ignorados = 0

# Procesar cada contenedor
foreach ($contenedor in $contenedores_detenidos) {
    $id_y_nombre = $contenedor -split " ", 2
    $id = $id_y_nombre[0]
    $nombre = $id_y_nombre[1]
    
    # Verificar si debemos conservar este contenedor
    $conservar = $false
    foreach ($conservado in $contenedores_a_conservar) {
        if ($nombre -eq $conservado) {
            $conservar = $true
            break
        }
    }
    
    if ($conservar) {
        Write-Host "Ignorando contenedor '$nombre' ($id) - marcado para conservar" -ForegroundColor Cyan
        $total_ignorados++
    } else {
        Write-Host "Eliminando contenedor '$nombre' ($id)..." -ForegroundColor Yellow
        docker rm $id
        $total_eliminados++
    }
}

# Mostrar estadísticas
Write-Host "`n=== RESUMEN DE LIMPIEZA ===" -ForegroundColor Green
Write-Host "Contenedores eliminados: $total_eliminados" -ForegroundColor Yellow
Write-Host "Contenedores conservados: $total_ignorados" -ForegroundColor Cyan

# Limpiar imágenes huérfanas
Write-Host "`n=== LIMPIANDO IMÁGENES NO UTILIZADAS ===" -ForegroundColor Green
docker image prune -f

# Mostrar espacio liberado
Write-Host "`n=== ESPACIO EN DISCO RECUPERADO ===" -ForegroundColor Green
docker system df

Write-Host "`n¡Limpieza completada!" -ForegroundColor Green
