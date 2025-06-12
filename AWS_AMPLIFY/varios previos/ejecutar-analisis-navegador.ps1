# Script para ejecutar el análisis del navegador
param (
    [string]$BaseUrl = "http://172.20.160.1:3000",
    [string]$OutputDir = "./navegador-analisis/resultados"
)

Write-Host "🔍 Verificando dependencias..." -ForegroundColor Cyan

# Verificar si existe node
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ No se detectó Node.js. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Crear directorio para el análisis si no existe
if (-not (Test-Path -Path "./navegador-analisis")) {
    New-Item -ItemType Directory -Path "./navegador-analisis" | Out-Null
    Write-Host "📁 Directorio de análisis creado" -ForegroundColor Green
}

# Verificar si existe package.json, si no, crearlo
if (-not (Test-Path -Path "./navegador-analisis/package.json")) {
    Write-Host "📦 Creando package.json..." -ForegroundColor Yellow
    Set-Location -Path "./navegador-analisis"
    npm init -y | Out-Null
    Set-Location -Path ".."
}

# Verificar si puppeteer está instalado
Write-Host "🔍 Verificando si puppeteer está instalado..." -ForegroundColor Cyan
Set-Location -Path "./navegador-analisis"
$puppeteerInstalled = npm list puppeteer 2>$null
if ($puppeteerInstalled -match "empty") {
    Write-Host "📥 Instalando puppeteer..." -ForegroundColor Yellow
    npm install puppeteer --save | Out-Null
    Write-Host "✅ Puppeteer instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "✅ Puppeteer ya está instalado" -ForegroundColor Green
}
Set-Location -Path ".."

# Crear directorio para los resultados
if (-not (Test-Path -Path "$OutputDir")) {
    New-Item -ItemType Directory -Path "$OutputDir" -Force | Out-Null
    Write-Host "📁 Directorio de resultados creado: $OutputDir" -ForegroundColor Green
}

# Copiar el script de análisis
Copy-Item -Path "./AWS_AMPLIFY/SONARQUBE/analisis-navegador.js" -Destination "./navegador-analisis/analisis-navegador.js" -Force
Write-Host "📝 Script copiado a la carpeta de trabajo" -ForegroundColor Green

# Ejecutar el script
Write-Host "🚀 Ejecutando análisis de navegador..." -ForegroundColor Cyan
Set-Location -Path "./navegador-analisis"
node analisis-navegador.js
Set-Location -Path ".."

Write-Host "✅ Análisis completado. Comprueba los resultados en $OutputDir" -ForegroundColor Green
