#!/bin/bash
# Script para restaurar el backend en AWS tras un fallo grave

# Configuración
SSH_KEY="C:\\Proyectos\\primeros proyectos\\AWS\\masclet-imperi-key.pem"
EC2_USER="ec2-user"
EC2_HOST="108.129.139.119"
LOCAL_BACKEND="c:\\Proyectos\\claude\\masclet-imperi-web\\backend"
REMOTE_DIR="/home/ec2-user/masclet-imperi"

echo "=== RESTAURACIÓN DE EMERGENCIA DEL BACKEND EN AWS ==="
echo "Fecha: $(date)"

# 1. Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "docker stop masclet-api masclet-db 2>/dev/null || true"
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "docker rm masclet-api masclet-db 2>/dev/null || true"

# 2. Crear directorio temporal para el backend
echo "Preparando directorio temporal..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "rm -rf $REMOTE_DIR/backend_temp 2>/dev/null || true"
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "mkdir -p $REMOTE_DIR/backend_temp"

# 3. Comprimir el backend local
echo "Comprimiendo backend local..."
cd "$LOCAL_BACKEND/.."
tar -czf backend.tar.gz backend

# 4. Transferir el archivo comprimido
echo "Transfiriendo backend al servidor AWS..."
scp -i "$SSH_KEY" backend.tar.gz $EC2_USER@$EC2_HOST:$REMOTE_DIR/

# 5. Descomprimir en el servidor
echo "Descomprimiendo backend en el servidor..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "cd $REMOTE_DIR && tar -xzf backend.tar.gz && rm -f backend.tar.gz"

# 6. Configurar .env para producción
echo "Configurando variables de entorno..."
cat > env_temp << EOL
# Configuración para Masclet Imperi en producción

# Configuración de la base de datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=masclet_imperi
DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi

# Configuración de seguridad
SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\\vG.A;.6o!r5uIRh4{Ch\\y$[,RQh<F#"{GHXX/$
ACCESS_TOKEN_EXPIRE_MINUTES=120
API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP

# Configuración del entorno
ENVIRONMENT=prod
ENABLE_RATE_LIMIT=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
EOL

scp -i "$SSH_KEY" env_temp $EC2_USER@$EC2_HOST:$REMOTE_DIR/.env
rm -f env_temp

# 7. Crear docker-compose.yml si no existe
echo "Verificando docker-compose.yml..."
cat > docker_compose_temp.yml << EOL
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
EOL

scp -i "$SSH_KEY" docker_compose_temp.yml $EC2_USER@$EC2_HOST:$REMOTE_DIR/docker-compose.yml
rm -f docker_compose_temp.yml

# 8. Construir y desplegar contenedores
echo "Desplegando contenedores..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "cd $REMOTE_DIR && docker-compose up -d db api"

# 9. Verificar estado
echo "Verificando estado de los contenedores..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "docker ps"

echo "=== RESTAURACIÓN COMPLETADA ==="
echo "Verificando logs del backend..."
ssh -i "$SSH_KEY" $EC2_USER@$EC2_HOST "sleep 10 && docker logs masclet-api --tail 20"
