# Despliegue unificado para AWS - Masclet Imperi
# Fecha: 07/06/2025

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# PARTE 1: BASE DE DATOS Y API
Write-Host "=== CONFIGURANDO BASE DE DATOS Y API ===" -ForegroundColor Green

# Crear usuario PostgreSQL 'admin'
Write-Host "1. Creando usuario PostgreSQL admin..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "echo 'DROP USER IF EXISTS admin; CREATE USER admin WITH PASSWORD ''admin123'' SUPERUSER; GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;' > ~/create_admin.sql"
ssh -i $key ec2-user@$host_ip "docker cp ~/create_admin.sql masclet-db:/tmp/ && docker exec masclet-db psql -U postgres -f /tmp/create_admin.sql"

# Reiniciar API
Write-Host "2. Reiniciando contenedor API..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-api || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-api || true"
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-api --network masclet-network -p 8000:8000 masclet-api-imagen-completa"

# PARTE 2: FRONTEND
Write-Host "=== CONFIGURANDO FRONTEND ===" -ForegroundColor Green

# Limpiar contenedores anteriores
Write-Host "3. Limpiando contenedores frontend anteriores..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-frontend masclet-frontend-node || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-frontend masclet-frontend-node || true"

# Crear Node.js primero
Write-Host "4. Creando contenedor Node.js..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-frontend-node --network masclet-network -e NODE_ENV=production -e API_URL=http://masclet-api:8000 masclet-imperi-web-deploy-masclet-frontend-node:latest"

# Esperar un momento
Start-Sleep -Seconds 5

# Crear Nginx
Write-Host "5. Creando contenedor Nginx..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-frontend --network masclet-network -p 80:80 -e NODE_SERVER=masclet-frontend-node:3000 masclet-imperi-web-deploy-masclet-frontend-nginx:latest"

# PARTE 3: VERIFICACIÓN
Write-Host "=== VERIFICANDO DESPLIEGUE ===" -ForegroundColor Green

# Mostrar contenedores
Write-Host "6. Lista de contenedores:" -ForegroundColor Cyan
ssh -i $key ec2-user@$host_ip "docker ps -a"

# FINALIZACIÓN
Write-Host "=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host "API: http://$host_ip:8000" -ForegroundColor Green
Write-Host "Frontend: http://$host_ip" -ForegroundColor Green
