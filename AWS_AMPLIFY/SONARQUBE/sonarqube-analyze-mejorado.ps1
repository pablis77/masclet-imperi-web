# Script mejorado para ejecutar análisis de SonarQube en el proyecto Masclet Imperi Web
# Ejecutar con PowerShell

param(
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Directorio raíz del proyecto
$PROJECT_DIR = "C:\Proyectos\claude\masclet-imperi-web"
$RESULTS_DIR = "$PROJECT_DIR\AWS_AMPLIFY\sonarqube-results"

# Mostrar banner de inicio
Write-Host "
===============================================
🔍 ANÁLISIS SONARQUBE - MASCLET IMPERI WEB 🔍
===============================================
" -ForegroundColor Cyan

# Verificar que SonarQube está corriendo
Write-Host "✔️ Verificando que SonarQube esté ejecutándose..." -ForegroundColor Yellow
$sonarqubeRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $sonarqubeRunning = $true
        Write-Host "  SonarQube está ejecutándose correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ SonarQube no está ejecutándose. Por favor, ejecuta primero sonarqube-setup.ps1" -ForegroundColor Red
    Write-Host "  👉 Comando: .\AWS_AMPLIFY\SONARQUBE\sonarqube-setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Crear directorio para resultados si no existe
if (-not (Test-Path $RESULTS_DIR)) {
    New-Item -Path $RESULTS_DIR -ItemType Directory | Out-Null
    Write-Host "📁 Creado directorio para resultados de análisis" -ForegroundColor Green
}

# Paso 1: Generar informe de endpoints usando nuestro nuevo script
Write-Host "`n📊 Generando informe de endpoints en producción..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportPathProduccion = "$RESULTS_DIR\endpoints-produccion-$timestamp.md"

# Ejecutar nuestro nuevo script de detección de endpoints
Write-Host "  Ejecutando detectar-endpoints-produccion.ps1..." -ForegroundColor Blue
$scriptPath = "$PROJECT_DIR\AWS_AMPLIFY\SONARQUBE\detectar-endpoints-produccion.ps1"
$endpointsResult = & $scriptPath

# Verificar si el script se ejecutó correctamente
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Error al generar informe de endpoints" -ForegroundColor Red
    exit 1
} else {
    # Buscar el archivo generado más reciente
    $endpointFile = Get-ChildItem -Path "$PROJECT_DIR\AWS_AMPLIFY\SONARQUBE\endpoints-detectados" -Filter "endpoints-produccion-*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($endpointFile) {
        # Copiar el archivo al directorio de resultados
        Copy-Item -Path $endpointFile.FullName -Destination $reportPathProduccion
        Write-Host "  ✓ Informe de endpoints copiado a: $reportPathProduccion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ No se encontró el archivo de informe de endpoints generado" -ForegroundColor Yellow
        # Continuar con el análisis de todas formas
    }
}

# Paso 2: Crear archivo de propiedades para el análisis
Write-Host "`n📝 Generando configuración de análisis..." -ForegroundColor Yellow

$sonarProperties = @"
sonar.projectKey=masclet-imperi
sonar.projectName=Masclet Imperi Web
sonar.projectVersion=1.0
sonar.projectDescription=Sistema de gestión para Masclet Imperi

# Rutas de análisis
sonar.sources=$PROJECT_DIR
sonar.exclusions=**/*.pyc,**/__pycache__/**,**/node_modules/**,**/*.spec.ts,**/*.test.js,**/*.stories.tsx,**/htmlcov/**,**/coverage/**,**/.git/**,**/venv/**,**/__snapshots__/**,**/migrations/**

# Configuración específica para Python
sonar.python.version=3.9, 3.10, 3.11, 3.12
sonar.python.coverage.reportPaths=$PROJECT_DIR/backend/coverage.xml
sonar.python.xunit.reportPath=$PROJECT_DIR/backend/test-results.xml

# Configuración específica para JavaScript/TypeScript
sonar.javascript.lcov.reportPaths=$PROJECT_DIR/frontend/coverage/lcov.info
sonar.typescript.tsconfigPath=$PROJECT_DIR/frontend/tsconfig.json

# Analizadores adicionales
sonar.python.pylint.reportPath=$RESULTS_DIR/pylint-report.txt
sonar.javascript.eslint.reportPaths=$RESULTS_DIR/eslint-report.json

# API endpoints especiales a analizar con mayor profundidad
sonar.inclusions=**/api/endpoints/**/*.py,**/components/**/*.tsx,**/pages/**/*.tsx,**/routes/**/*.tsx,**/services/**/*.ts

# Configuración adicional para AWS Amplify
sonar.aws.amplify.enabled=true
sonar.sourceEncoding=UTF-8
sonar.scm.disabled=false
"@

$propertiesPath = "$PROJECT_DIR\AWS_AMPLIFY\sonar-project.properties"
$sonarProperties | Out-File -FilePath $propertiesPath -Encoding utf8
Write-Host "  ✓ Archivo de propiedades generado en: $propertiesPath" -ForegroundColor Green

# Paso 3: Generar análisis de rutas API usadas en frontend
Write-Host "`n📱 Analizando llamadas API en frontend..." -ForegroundColor Yellow
$frontendApiCallsPath = "$RESULTS_DIR\frontend-api-calls-$timestamp.txt"

# Extraer llamadas a API desde archivos de frontend
Get-ChildItem -Path "$PROJECT_DIR\frontend\src" -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
    Select-String -Pattern '(get|post|put|delete|patch)\(\s*[''"]([^''"]+)[''"]' -AllMatches | 
    ForEach-Object { 
        foreach ($match in $_.Matches) {
            $endpoint = $match.Groups[2].Value
            $method = $match.Groups[1].Value.ToUpper()
            "$method $endpoint (archivo: $($_.Path))" 
        }
    } | Out-File -FilePath $frontendApiCallsPath -Encoding utf8

Write-Host "  ✓ Análisis de llamadas API frontend guardado en: $frontendApiCallsPath" -ForegroundColor Green

# Paso 4: Ejecutar el análisis de SonarQube
Write-Host "`n🚀 Ejecutando análisis de SonarQube..." -ForegroundColor Yellow
Write-Host "  Este proceso puede tomar varios minutos, por favor espere..." -ForegroundColor Blue

# Ejecutar el scanner de SonarQube
docker run --rm `
    -e SONAR_HOST_URL="http://host.docker.internal:9000" `
    -e SONAR_LOGIN="$token" `
    -v "${PROJECT_DIR}:/usr/src" `
    -w /usr/src `
    sonarsource/sonar-scanner-cli:4.8.0 `
    -Dsonar.projectBaseDir=/usr/src

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Análisis de SonarQube completado correctamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error durante el análisis de SonarQube. Revisa los mensajes anteriores." -ForegroundColor Red
}

Write-Host "`n📊 Resultados del análisis disponibles en: http://localhost:9000/dashboard?id=masclet-imperi" -ForegroundColor Cyan
Write-Host "📁 Los archivos de análisis se encuentran en: $RESULTS_DIR" -ForegroundColor Cyan
Write-Host "`n===============================================" -ForegroundColor Cyan
