# Script para preparar paquete de despliegue completo para Ramón
# Este script crea una copia completa del backend y todos los componentes
# necesarios para un despliegue rápido en el servidor de Ramón
# Fecha: 05/06/2025

# Configuración
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2User = "ec2-user"
$EC2Address = "108.129.139.119"
$BackupSource = "C:\Proyectos\claude\masclet-imperi-web\backup_aws_20250605"
$TargetFolder = "C:\Proyectos\AWS\contenedores despliegue RAMON"
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"

# Crear carpetas necesarias si no existen
Write-Host "Creando estructura de carpetas para el despliegue de Ramón..." -ForegroundColor Cyan
New-Item -Path $TargetFolder -ItemType Directory -Force | Out-Null
$folders = @(
    "db",
    "backend",
    "frontend",
    "docker",
    "scripts"
)

foreach ($folder in $folders) {
    New-Item -Path "$TargetFolder\$folder" -ItemType Directory -Force | Out-Null
}

# 1. Copiar backup de base de datos existente
Write-Host "Copiando el backup de la base de datos..." -ForegroundColor Green
$dbBackup = Get-ChildItem -Path "$BackupSource" -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($dbBackup) {
    Copy-Item -Path $dbBackup.FullName -Destination "$TargetFolder\db\" -Force
    Write-Host "  → Backup de base de datos copiado: $($dbBackup.Name)" -ForegroundColor White
} else {
    Write-Host "  ✕ No se encontró archivo de backup de base de datos" -ForegroundColor Red
}

# 2. Copiar archivos de configuración AWS
Write-Host "Copiando archivos de configuración..." -ForegroundColor Green
$configFiles = Get-ChildItem -Path "$BackupSource" -Filter "*.yml" -Recurse
foreach ($file in $configFiles) {
    Copy-Item -Path $file.FullName -Destination "$TargetFolder\docker\" -Force
    Write-Host "  → Archivo de configuración copiado: $($file.Name)" -ForegroundColor White
}

# Copiar archivos .env para backend
$envFiles = Get-ChildItem -Path "$BackupSource" -Filter "*.env" -Recurse
foreach ($file in $envFiles) {
    Copy-Item -Path $file.FullName -Destination "$TargetFolder\backend\" -Force
    Write-Host "  → Archivo de entorno copiado: $($file.Name)" -ForegroundColor White
}

# 3. Obtener Dockerfile actualizado directamente del backend AWS (si está disponible)
Write-Host "Descargando Dockerfile actual del backend..." -ForegroundColor Green
try {
    ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/backend.Dockerfile" | Out-File -FilePath "$TargetFolder\docker\backend.Dockerfile" -Encoding utf8 -Force
    Write-Host "  → Dockerfile del backend descargado" -ForegroundColor White
}
catch {
    Write-Host "  ✕ No se pudo descargar el Dockerfile desde AWS. Revisa la conexión." -ForegroundColor Red
}

# 4. Obtener requirements.txt actualizado
Write-Host "Descargando requirements.txt con dependencias actualizadas..." -ForegroundColor Green
try {
    ssh -i $AWSKey $EC2User@$EC2Address "cat /home/ec2-user/requirements.txt" | Out-File -FilePath "$TargetFolder\backend\requirements.txt" -Encoding utf8 -Force
    Write-Host "  → Archivo requirements.txt descargado" -ForegroundColor White
}
catch {
    Write-Host "  ✕ No se pudo descargar el requirements.txt desde AWS. Revisa la conexión." -ForegroundColor Red
}

# 5. Crear README básico con instrucciones
$readme = "# DESPLIEGUE RÁPIDO MASCLET IMPERI - BACKEND`r`n"
$readme += "**Fecha de preparación: $(Get-Date -Format 'dd/MM/yyyy')**`r`n`r`n"
$readme += "## INSTRUCCIONES PARA RAMÓN`r`n`r`n"
$readme += "### Requisitos previos`r`n"
$readme += "- Docker y Docker Compose instalados`r`n"
$readme += "- Acceso a internet para descargar las imágenes base`r`n`r`n"
$readme += "### Acceso al sistema`r`n`r`n"
$readme += "- **Backend API**: http://localhost:8000`r`n"
$readme += "- **Swagger API Docs**: http://localhost:8000/docs`r`n"
$readme += "- **Credenciales por defecto**:`r`n"
$readme += "  - Usuario: admin@mascletimperi.com`r`n"
$readme += "  - Contraseña: admin123`r`n"

# Guardar README
$readme | Out-File -FilePath "$TargetFolder\README.md" -Encoding utf8 -Force
Write-Host "README con instrucciones generado" -ForegroundColor White

# Comprimir todo para facilitar la transferencia
Write-Host "Comprimiendo todo el paquete para facilitar la transferencia..." -ForegroundColor Green
Compress-Archive -Path "$TargetFolder\*" -DestinationPath "$TargetFolder\masclet_backend_despliegue_ramon_$fecha.zip" -Force
Write-Host "Paquete comprimido: masclet_backend_despliegue_ramon_$fecha.zip" -ForegroundColor White

Write-Host "PAQUETE DE DESPLIEGUE PARA RAMÓN COMPLETADO" -ForegroundColor Cyan
Write-Host "Ubicación: $TargetFolder" -ForegroundColor Yellow
