# Script para probar el endpoint dashboard-detallado/animales-detallado

# 1. Obtener token
$loginUrl = "http://localhost:8000/api/v1/auth/login"
$credentials = @{
    username = "admin@admin.com"
    password = "admin"
} | ConvertTo-Json

Write-Host "Obteniendo token JWT..."
$tokenResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $credentials -ContentType "application/json"
$token = $tokenResponse.access_token

if (-not $token) {
    Write-Host "Error: No se pudo obtener el token"
    exit
}

Write-Host "Token obtenido correctamente"

# 2. Probar el endpoint dashboard-detallado/animales-detallado
$endpointUrl = "http://localhost:8000/api/v1/dashboard-detallado/animales-detallado"
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`nConsultando endpoint: $endpointUrl"
try {
    $response = Invoke-RestMethod -Uri $endpointUrl -Method Get -Headers $headers
    
    # Mostrar resultados formateados
    Write-Host "`n📊 ESTADÍSTICAS DETALLADAS DE ANIMALES"
    Write-Host "======================================"
    Write-Host "Total animales: $($response.total)"
    
    Write-Host "`n📌 ESTADÍSTICAS GENERALES"
    Write-Host "Machos: $($response.general.machos)"
    Write-Host "Hembras: $($response.general.hembras)"
    Write-Host "Activos: $($response.general.activos)"
    Write-Host "Fallecidos: $($response.general.fallecidos)"
    
    Write-Host "`n📌 ESTADÍSTICAS POR GÉNERO Y ESTADO"
    Write-Host "Machos totales: $($response.por_genero.machos.total)"
    Write-Host "  ✓ Activos: $($response.por_genero.machos.activos)"
    Write-Host "  ✗ Fallecidos: $($response.por_genero.machos.fallecidos)"
    Write-Host "Hembras totales: $($response.por_genero.hembras.total)"
    Write-Host "  ✓ Activas: $($response.por_genero.hembras.activas)"
    Write-Host "  ✗ Fallecidas: $($response.por_genero.hembras.fallecidas)"
    
    Write-Host "`n📌 ESTADÍSTICAS DE AMAMANTAMIENTO (HEMBRAS)"
    Write-Host "Estado 0: $($response.por_alletar.'0') vacas"
    Write-Host "Estado 1: $($response.por_alletar.'1') vacas"
    Write-Host "Estado 2: $($response.por_alletar.'2') vacas"
    
    # Guardar los datos en un archivo JSON
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $outputFile = "new_tests/complementos/datos_detallados_$timestamp.json"
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile
    Write-Host "`nDatos guardados en: $outputFile"
    
} catch {
    Write-Host "Error al consultar el endpoint: $_"
}
