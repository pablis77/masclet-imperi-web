# =========================================================================
# Script de recuperación de acceso para API y DB - Masclet Imperi Web
# Fecha: 07/06/2025
# =========================================================================
# Este script repara el acceso cuando se rompen los contenedores y necesitamos
# restaurar las imágenes de DB y API. El problema principal ocurre cuando
# la API intenta conectarse con usuario admin/admin123 a PostgreSQL pero
# ese usuario no existe en el contenedor DB recreado.
#
# IMPORTANTE: Este script asume que:
# 1. Las imágenes masclet-api-imagen-completa y masclet-db-imagen-completa existen
# 2. Ya se ha restaurado la base de datos masclet_imperi con los datos necesarios
# 3. La red Docker masclet-network ya existe
# =========================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# Detener el contenedor actual de la API primero
Write-Host "Deteniendo el contenedor actual de la API..." -ForegroundColor Yellow
ssh -i $key ec2-user@$host_ip "docker stop masclet-api || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-api || true"

# Ejecutar comandos SQL directamente en PostgreSQL
Write-Host "Creando el usuario admin en PostgreSQL..." -ForegroundColor Yellow

# Usamos echo para crear un script SQL simple en el servidor
ssh -i $key ec2-user@$host_ip @'
cat > create_admin.sql << 'EOF'
CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;
EOF
'@

# Copiamos el script al contenedor y lo ejecutamos
ssh -i $key ec2-user@$host_ip "docker cp create_admin.sql masclet-db:/tmp/ && docker exec masclet-db psql -U postgres -f /tmp/create_admin.sql"

# Iniciamos el contenedor de la API
Write-Host "Iniciando el contenedor de la API..." -ForegroundColor Green
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-api --network masclet-network -p 8000:8000 masclet-api-imagen-completa"

# Verificamos los contenedores
Write-Host "Verificando contenedores..." -ForegroundColor Cyan
ssh -i $key ec2-user@$host_ip "docker ps -a"

# Esperamos un momento y revisamos los logs
Write-Host "Esperando a que la API se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
ssh -i $key ec2-user@$host_ip "docker logs masclet-api | tail -n 20"

Write-Host "============================================================" -ForegroundColor Green
Write-Host "REPARACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "Si ves 'Application startup complete' en los logs, la API está funcionando correctamente." -ForegroundColor Green
Write-Host "Puedes acceder a la API en: http://$host_ip:8000/docs" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
