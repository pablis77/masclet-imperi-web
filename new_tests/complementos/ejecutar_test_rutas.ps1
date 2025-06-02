# Script para ejecutar el test de rutas duplicadas
# Este script instala las dependencias necesarias y ejecuta el test

Write-Host "🧪 Iniciando test de rutas duplicadas..." -ForegroundColor Cyan

# Comprobar si existe package.json en el directorio actual
$testDir = "$PSScriptRoot"
$packageJsonPath = Join-Path -Path $testDir -ChildPath "package.json"

if (-not (Test-Path $packageJsonPath)) {
    Write-Host "📦 Creando package.json para el test..." -ForegroundColor Yellow
    
    # Crear un package.json básico
    $packageJson = @"
{
  "name": "test-rutas-duplicadas",
  "version": "1.0.0",
  "description": "Test para diagnosticar rutas API duplicadas",
  "main": "test_rutas_duplicadas.js",
  "scripts": {
    "test": "node test_rutas_duplicadas.js"
  },
  "dependencies": {
    "axios": "^1.4.0"
  }
}
"@
    
    Set-Content -Path $packageJsonPath -Value $packageJson
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install --prefix $testDir

# Ejecutar el test
Write-Host "`n🔍 Ejecutando test de rutas duplicadas...`n" -ForegroundColor Green
node "$testDir\test_rutas_duplicadas.js"

Write-Host "`n✅ Test completado. Revisa los resultados arriba y en el archivo test_rutas_resultados.log" -ForegroundColor Green
