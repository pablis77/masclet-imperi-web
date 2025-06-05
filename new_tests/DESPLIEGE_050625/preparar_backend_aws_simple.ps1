# Script simplificado para preparar el backend para AWS
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$dirBase = "C:\Proyectos\claude\masclet-imperi-web"
$tempDir = "$dirBase\new_tests\DESPLIEGE_050625\backend_temp_$fecha"
$zipFile = "$dirBase\new_tests\DESPLIEGE_050625\backend_$fecha.zip"
$awsKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$awsHost = "ec2-user@108.129.139.119"
$awsDir = "/home/ec2-user/masclet-backend"

Write-Host "Preparando directorio temporal..." -ForegroundColor Cyan
if (!(Test-Path -Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

if (!(Test-Path -Path "$tempDir\app")) {
    New-Item -ItemType Directory -Path "$tempDir\app" -Force | Out-Null
}

# Copiar los archivos necesarios
Write-Host "Copiando Dockerfile..." -ForegroundColor Cyan
Copy-Item "$dirBase\backend\Dockerfile" -Destination $tempDir

Write-Host "Copiando requirements.txt..." -ForegroundColor Cyan
Copy-Item "$dirBase\backend\requirements.txt" -Destination $tempDir

Write-Host "Copiando directorio app..." -ForegroundColor Cyan
Copy-Item "$dirBase\backend\app\*" -Destination "$tempDir\app\" -Recurse

# Crear un docker-compose.yml temporal
$dockerComposeContent = @"
version: '3.8'

services:
  masclet-api:
    container_name: masclet-api
    build:
      context: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    networks:
      - masclet-network
    restart: unless-stopped

networks:
  masclet-network:
    external: true
"@

Write-Host "Creando docker-compose.yml..." -ForegroundColor Cyan
Set-Content -Path "$tempDir\docker-compose.yml" -Value $dockerComposeContent

# Comprimir todo en un archivo ZIP
Write-Host "Comprimiendo archivos..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Transferir a AWS
Write-Host "Transfiriendo a AWS..." -ForegroundColor Cyan
scp -i "$awsKey" "$zipFile" ${awsHost}:$awsDir/

# Conectar y descomprimir en AWS
Write-Host "Descomprimiendo en AWS..." -ForegroundColor Cyan
ssh -i "$awsKey" $awsHost "cd $awsDir && unzip -o $(Split-Path $zipFile -Leaf) && rm $(Split-Path $zipFile -Leaf)"

# Limpiar
Write-Host "Limpiando archivos temporales..." -ForegroundColor Cyan
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "¡Listo! El backend está preparado en AWS." -ForegroundColor Green
