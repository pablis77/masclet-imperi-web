# Script para ejecutar el análisis del navegador v3
# Este script instala las dependencias necesarias y ejecuta el análisis

# Crear carpeta si no existe
if (-not (Test-Path -Path ".\navegador-analisis")) {
    Write-Host "📁 Creando carpeta navegador-analisis..."
    New-Item -ItemType Directory -Force -Path ".\navegador-analisis" | Out-Null
    New-Item -ItemType Directory -Force -Path ".\navegador-analisis\resultados" | Out-Null
}

# Verificar si Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js está instalado: $nodeVersion"
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor, instálalo desde https://nodejs.org/"
    exit 1
}

# Verificar si puppeteer está instalado
$puppeteerInstalled = npm list puppeteer -g
if ($puppeteerInstalled -match "empty") {
    Write-Host "📦 Instalando Puppeteer globalmente..."
    npm install -g puppeteer
} else {
    Write-Host "✅ Puppeteer ya está instalado"
}

# Verificar si node-fetch está instalado
$fetchInstalled = npm list node-fetch -g
if ($fetchInstalled -match "empty") {
    Write-Host "📦 Instalando node-fetch globalmente..."
    npm install -g node-fetch
} else {
    Write-Host "✅ node-fetch ya está instalado"
}

# Ejecutar el script de análisis
Write-Host "🚀 Ejecutando análisis de navegador v3..."
node .\AWS_AMPLIFY\SONARQUBE\analisis-navegador-v3.js

Write-Host "✅ Análisis completado."
