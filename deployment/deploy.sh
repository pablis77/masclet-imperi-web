#!/bin/bash
# Script de despliegue para Masclet Imperi en EC2
# Uso: ./deploy.sh <ip-publica-ec2> <ruta-clave-pem>

# Verificar argumentos
if [ $# -lt 2 ]; then
    echo "Uso: ./deploy.sh <ip-publica-ec2> <ruta-clave-pem>"
    exit 1
fi

EC2_IP=$1
PEM_PATH=$2

echo "🚀 Iniciando despliegue en $EC2_IP..."

# 1. Verificar conexión SSH
echo "🔑 Verificando conexión SSH..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexión SSH exitosa" || {
    echo "❌ Error en conexión SSH. Verifica IP y clave PEM."
    exit 1
}

# 2. Crear directorios necesarios en EC2
echo "📁 Creando directorios para logs y uploads..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "mkdir -p /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads && chmod -R 777 /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads"

# 3. Copiar archivos de configuración
echo "📦 Copiando archivos de configuración..."
scp -i "$PEM_PATH" docker-compose.prod.yml ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/docker-compose.yml
scp -i "$PEM_PATH" Dockerfile.prod ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/backend/Dockerfile
scp -i "$PEM_PATH" .env.prod ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/.env
scp -i "$PEM_PATH" requirements.prod.txt ec2-user@$EC2_IP:/home/ec2-user/masclet-imperi/backend/requirements.txt

# 4. Identificar la red Docker de la base de datos
echo "🔍 Identificando red Docker..."
DOCKER_NETWORK=$(ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker network ls | grep masclet-imperi | awk '{print \$2}'")
echo "   Red Docker detectada: $DOCKER_NETWORK"

# 5. Detener y eliminar contenedor API existente si existe
echo "🛑 Deteniendo contenedor API existente..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker stop masclet-api || true && sudo docker rm masclet-api || true"

# 6. Construir y ejecutar el contenedor API
echo "🏗️ Construyendo nueva imagen API..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && sudo docker build -t masclet-imperi-api ./backend"

echo "▶️ Iniciando contenedor API..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "cd /home/ec2-user/masclet-imperi && sudo docker run -d --name masclet-api --restart unless-stopped -p 8000:8000 -v /home/ec2-user/masclet-imperi/backend:/app -v /home/ec2-user/masclet-imperi/logs:/app/logs --env-file /home/ec2-user/masclet-imperi/.env --network $DOCKER_NETWORK masclet-imperi-api"

# 7. Verificar estado de contenedores
echo "✅ Verificando estado de contenedores..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker ps"

# 8. Probar endpoint de animales
echo "🧪 Probando endpoint de animales..."
RESPONSE=$(curl -s http://$EC2_IP:8000/api/v1/animals/)
if [[ $RESPONSE == *"success"* ]]; then
    echo "✅ API funcionando correctamente!"
else
    echo "⚠️ Advertencia: Respuesta inesperada del endpoint de animales."
    echo "   Respuesta: $RESPONSE"
fi

# 9. Crear respaldo de la imagen funcional
echo "💾 Creando respaldo de imagen funcional..."
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker commit masclet-api masclet-imperi-api:production && sudo docker images"

echo "🎉 Despliegue completado!"
echo "   API disponible en: http://$EC2_IP:8000/api/v1/"
