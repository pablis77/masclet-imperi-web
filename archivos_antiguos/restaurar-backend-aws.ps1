# Script para restaurar el backend en AWS tras un fallo grave

# Configuración
$SSH_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_USER = "ec2-user"
$EC2_HOST = "108.129.139.119"
$LOCAL_BACKEND = "c:\Proyectos\claude\masclet-imperi-web\backend"
$REMOTE_DIR = "/home/ec2-user/masclet-imperi"

Write-Host "=== RESTAURACIÓN DE EMERGENCIA DEL BACKEND EN AWS ===" -ForegroundColor Green
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Green

# 1. Detener contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "docker stop masclet-api masclet-db 2>/dev/null || true"
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "docker rm masclet-api masclet-db 2>/dev/null || true"

# 2. Crear directorio temporal para el backend
Write-Host "Preparando directorio temporal..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "rm -rf $REMOTE_DIR/backend_temp 2>/dev/null || true"
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "mkdir -p $REMOTE_DIR/backend_temp"

# 3. Comprimir el backend local
Write-Host "Comprimiendo backend local..." -ForegroundColor Yellow
$tempZip = "c:\Proyectos\claude\masclet-imperi-web\backend_temp.zip"
Compress-Archive -Path $LOCAL_BACKEND -DestinationPath $tempZip -Force

# 4. Transferir el archivo comprimido
Write-Host "Transfiriendo backend al servidor AWS..." -ForegroundColor Yellow
scp -i $SSH_KEY $tempZip $EC2_USER@$EC2_HOST:$REMOTE_DIR/backend_temp.zip

# 5. Descomprimir en el servidor
Write-Host "Descomprimiendo backend en el servidor..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "cd $REMOTE_DIR && unzip -o backend_temp.zip && rm -f backend_temp.zip"

# 6. Configurar .env para producción
Write-Host "Configurando variables de entorno..." -ForegroundColor Yellow
$envContent = @"
# Configuración para Masclet Imperi en producción

# Configuración de la base de datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=masclet_imperi
DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi

# Configuración de seguridad
SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\\vG.A;.6o!r5uIRh4{Ch\\y\$[,RQh<F#"{GHXX/\$
ACCESS_TOKEN_EXPIRE_MINUTES=120
API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP

# Configuración del entorno
ENVIRONMENT=prod
ENABLE_RATE_LIMIT=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
"@

$envContent | Out-File -FilePath "c:\Proyectos\claude\masclet-imperi-web\env_temp" -Encoding utf8
scp -i $SSH_KEY "c:\Proyectos\claude\masclet-imperi-web\env_temp" $EC2_USER@$EC2_HOST:$REMOTE_DIR/.env
Remove-Item -Path "c:\Proyectos\claude\masclet-imperi-web\env_temp" -Force

# 7. Crear docker-compose.yml si no existe
Write-Host "Verificando docker-compose.yml..." -ForegroundColor Yellow
$dockerComposeContent = @"
version: '3.8'

services:
  db:
    container_name: masclet-db
    image: postgres:17
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin123
      - POSTGRES_DB=masclet_imperi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d masclet_imperi"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    container_name: masclet-api
    image: masclet-imperi-api
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - .env
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  masclet-network:
    name: masclet-network
    driver: bridge

volumes:
  postgres_data:
"@

$dockerComposeContent | Out-File -FilePath "c:\Proyectos\claude\masclet-imperi-web\docker_compose_temp.yml" -Encoding utf8
scp -i $SSH_KEY "c:\Proyectos\claude\masclet-imperi-web\docker_compose_temp.yml" $EC2_USER@$EC2_HOST:$REMOTE_DIR/docker-compose.yml
Remove-Item -Path "c:\Proyectos\claude\masclet-imperi-web\docker_compose_temp.yml" -Force

# 8. Construir y desplegar contenedores
Write-Host "Desplegando contenedores..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "cd $REMOTE_DIR && docker-compose up -d db api"

# 9. Verificar estado
Write-Host "Verificando estado de los contenedores..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "docker ps"

Write-Host "=== RESTAURACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "Verificando logs del backend..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_USER@$EC2_HOST "sleep 10 && docker logs masclet-api --tail 20"

# Limpiar archivos temporales
Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
