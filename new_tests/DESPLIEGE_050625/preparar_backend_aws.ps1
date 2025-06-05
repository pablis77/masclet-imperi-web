# Script para preparar el backend para AWS
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$dirBase = "C:\Proyectos\claude\masclet-imperi-web"
$tempDir = "$dirBase\new_tests\DESPLIEGE_050625\backend_temp_$fecha"
$zipFile = "$dirBase\new_tests\DESPLIEGE_050625\backend_$fecha.zip"
$awsKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$awsHost = "ec2-user@108.129.139.119"
$awsDir = "/home/ec2-user/masclet-backend"

Write-Host "Preparando directorio temporal..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\app" -Force | Out-Null

# Copiar los archivos necesarios
Write-Host "Copiando archivos del backend..." -ForegroundColor Cyan
Copy-Item "$dirBase\backend\Dockerfile" -Destination $tempDir
Copy-Item "$dirBase\backend\requirements.txt" -Destination $tempDir
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
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin123
      - POSTGRES_DB=masclet_imperi
      - DB_HOST=masclet-db
    networks:
      - masclet-network
    restart: unless-stopped
    depends_on:
      - masclet-db

networks:
  masclet-network:
    external: true
"@

Set-Content -Path "$tempDir\docker-compose.yml" -Value $dockerComposeContent

# Comprimir todo en un archivo ZIP
Write-Host "Comprimiendo archivos..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Transferir a AWS
Write-Host "Transfiriendo a AWS..." -ForegroundColor Cyan
$scp_command = "scp -i `"$awsKey`" `"$zipFile`" $awsHost`:$awsDir/"
Write-Host "Ejecutando: $scp_command" -ForegroundColor Yellow
Invoke-Expression $scp_command

# Conectar y descomprimir en AWS
Write-Host "Descomprimiendo en AWS..." -ForegroundColor Cyan
$ssh_command = "ssh -i `"$awsKey`" $awsHost `"cd $awsDir && unzip -o backend_$fecha.zip && rm backend_$fecha.zip`""
Write-Host "Ejecutando: $ssh_command" -ForegroundColor Yellow
Invoke-Expression $ssh_command

# Limpiar
Write-Host "Limpiando archivos temporales..." -ForegroundColor Cyan
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "¡Listo! El backend está preparado en AWS." -ForegroundColor Green
Write-Host "Para construir la imagen Docker en AWS, ejecuta:" -ForegroundColor Yellow
Write-Host "ssh -i `"$awsKey`" $awsHost `"cd $awsDir && docker compose build && docker compose up -d`"" -ForegroundColor White
