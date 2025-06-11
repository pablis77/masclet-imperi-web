# Script para ejecutar análisis de SonarQube en el proyecto Masclet Imperi Web
# Ejecutar con PowerShell

param(
    [Parameter(Mandatory=$true)]
    [string]$token
)

# Directorio raíz del proyecto
$PROJECT_DIR = "C:\Proyectos\claude\masclet-imperi-web"
$RESULTS_DIR = "C:\Proyectos\claude\masclet-imperi-web\AWS_AMPLIFY\sonarqube-results"

# Crear directorio para resultados si no existe
if (-not (Test-Path $RESULTS_DIR)) {
    New-Item -Path $RESULTS_DIR -ItemType Directory
    Write-Host "Creado directorio para resultados de análisis"
}

# Crear archivo de propiedades para el análisis
$sonarProperties = @"
sonar.projectKey=masclet-imperi
sonar.projectName=Masclet Imperi Web
sonar.projectVersion=1.0
sonar.projectDescription=Sistema de gestión para Masclet Imperi

# Rutas de análisis
sonar.sources=$PROJECT_DIR
sonar.exclusions=**/*.pyc,**/__pycache__/**,**/node_modules/**,**/*.spec.ts,**/*.test.js,**/*.stories.tsx,**/htmlcov/**,**/coverage/**

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

# API endpoints especiales a analizar
sonar.inclusions=**/api/endpoints/**/*.py,**/components/**/*.tsx,**/pages/**/*.tsx,**/routes/**/*.tsx
"@

$sonarProperties | Out-File -FilePath "$PROJECT_DIR\AWS_AMPLIFY\sonar-project.properties" -Encoding utf8

Write-Host "Generando análisis para endpoints de backend..."
# Extraer endpoints de archivos Python
Get-ChildItem -Path "$PROJECT_DIR\backend" -Recurse -Filter "*.py" | 
    Select-String -Pattern '@.*router\.(get|post|put|delete|patch)\("(.*?)"' | 
    ForEach-Object { 
        $endpoint = $_.Matches.Groups[2].Value
        $method = $_.Matches.Groups[1].Value.ToUpper()
        "$method $endpoint (archivo: $($_.Path))" 
    } | Out-File -FilePath "$RESULTS_DIR\endpoints-backend.txt" -Encoding utf8

Write-Host "Generando análisis para llamadas API en frontend..."
# Extraer llamadas a API desde archivos de frontend
Get-ChildItem -Path "$PROJECT_DIR\frontend\src" -Recurse -Include "*.tsx","*.jsx","*.ts","*.js" | 
    Select-String -Pattern '(get|post|put|delete|patch)\("(\/api[^"]+)"' | 
    ForEach-Object { 
        $endpoint = $_.Matches.Groups[2].Value
        $method = $_.Matches.Groups[1].Value.ToUpper()
        "$method $endpoint (archivo: $($_.Path))" 
    } | Out-File -FilePath "$RESULTS_DIR\endpoints-frontend.txt" -Encoding utf8

Write-Host "Ejecutando análisis de SonarQube..."
# Ejecutar el scanner de SonarQube
docker run --rm `
    -e SONAR_HOST_URL="http://host.docker.internal:9000" `
    -e SONAR_LOGIN="$token" `
    -v "${PROJECT_DIR}:/usr/src" `
    -w /usr/src `
    sonarsource/sonar-scanner-cli:4.8.0 `
    -Dsonar.projectBaseDir=/usr/src

Write-Host "Análisis completado. Verifica los resultados en http://localhost:9000"
Write-Host "Los archivos de análisis de endpoints se encuentran en: $RESULTS_DIR"
