$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# Detener el contenedor actual de la API primero
Write-Host "Deteniendo el contenedor actual de la API..."
ssh -i $key ec2-user@$host_ip "docker stop masclet-api || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-api || true"

# Ejecutar comandos SQL directamente en PostgreSQL
Write-Host "Creando el usuario admin en PostgreSQL..."

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
Write-Host "Iniciando el contenedor de la API..."
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-api --network masclet-network -p 8000:8000 masclet-api-imagen-completa"

# Verificamos los contenedores
Write-Host "Verificando contenedores..."
ssh -i $key ec2-user@$host_ip "docker ps -a"

# Esperamos un momento y revisamos los logs
Write-Host "Esperando a que la API se inicie..."
Start-Sleep -Seconds 5
ssh -i $key ec2-user@$host_ip "docker logs masclet-api | tail -n 20"
