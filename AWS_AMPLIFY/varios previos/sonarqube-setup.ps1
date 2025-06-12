# Script para configurar y ejecutar SonarQube para análisis completo de Masclet Imperi Web
# Ejecutar con PowerShell

# Crear directorios para datos de SonarQube
$SONAR_DATA_DIR = "C:\Proyectos\claude\masclet-imperi-web\AWS_AMPLIFY\sonarqube-data"
$SONAR_EXTENSIONS_DIR = "C:\Proyectos\claude\masclet-imperi-web\AWS_AMPLIFY\sonarqube-extensions"
$SONAR_LOGS_DIR = "C:\Proyectos\claude\masclet-imperi-web\AWS_AMPLIFY\sonarqube-logs"

# Crear los directorios si no existen
if (-not (Test-Path $SONAR_DATA_DIR)) {
    New-Item -Path $SONAR_DATA_DIR -ItemType Directory
    Write-Host "Creado directorio para datos de SonarQube"
}
if (-not (Test-Path $SONAR_EXTENSIONS_DIR)) {
    New-Item -Path $SONAR_EXTENSIONS_DIR -ItemType Directory
    Write-Host "Creado directorio para extensiones de SonarQube"
}
if (-not (Test-Path $SONAR_LOGS_DIR)) {
    New-Item -Path $SONAR_LOGS_DIR -ItemType Directory
    Write-Host "Creado directorio para logs de SonarQube"
}

# Detener y eliminar contenedor previo si existe
docker stop sonarqube-masclet 2>$null
docker rm sonarqube-masclet 2>$null

# Ejecutar SonarQube en Docker (Versión Developer)
Write-Host "Iniciando SonarQube en Docker..."
docker run -d --name sonarqube-masclet `
    -p 9000:9000 `
    -v ${SONAR_DATA_DIR}:/opt/sonarqube/data `
    -v ${SONAR_EXTENSIONS_DIR}:/opt/sonarqube/extensions `
    -v ${SONAR_LOGS_DIR}:/opt/sonarqube/logs `
    -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true `
    sonarqube:developer

Write-Host "SonarQube iniciando en http://localhost:9000"
Write-Host "Credenciales iniciales: admin / admin"
Write-Host "Espera aproximadamente 1-2 minutos para que el servicio esté disponible..."
Write-Host ""
Write-Host "IMPORTANTE: Al acceder por primera vez:"
Write-Host "1. Crea un proyecto nuevo llamado 'masclet-imperi'"
Write-Host "2. Selecciona análisis manual"
Write-Host "3. Genera un token y cópialo"
Write-Host "4. Ejecuta sonarqube-analyze.ps1 con el token generado"
