#!/bin/bash

echo "?? DESPLIEGUE DEFINITIVO MASCLET IMPERI"

# 1. Limpiar contenedor anterior
echo "?? Limpiando instalaci?n anterior..."
docker stop masclet-frontend > /dev/null 2>&1
docker rm masclet-frontend > /dev/null 2>&1
docker rmi masclet-frontend:definitivo > /dev/null 2>&1

# 2. Construir imagen Docker
echo "??? Construyendo imagen Docker..."
docker build -t masclet-frontend:definitivo .

# 3. Verificar red Docker
echo "?? Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "?? Creando red Docker masclet-network..."
    docker network create masclet-network
fi

# 4. Obtener IPs de contenedores (una por una para evitar concatenaci?n)
echo "?? Obteniendo IP de masclet-api..."
API_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" masclet-api | tr -d '\r\n')
echo "?? Obteniendo IP de masclet-db..."
DB_IP=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" masclet-db | tr -d '\r\n')

echo "?? IPs encontradas:"
echo "   - masclet-api: $API_IP"
echo "   - masclet-db: $DB_IP"

# 5. Conectar contenedores a la red
echo "?? Conectando contenedores a la red..."
for CONTAINER in masclet-api masclet-db; do
    if ! docker network inspect masclet-network | grep -q "$CONTAINER"; then
        echo "   - Conectando $CONTAINER a masclet-network..."
        docker network connect masclet-network $CONTAINER || echo "?? Error conectando $CONTAINER"
    else
        echo "   - $CONTAINER ya est? conectado"
    fi
done

# 6. Iniciar contenedor frontend
echo "?? Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
    -p 80:80 \
    -e NODE_ENV=production \
    -e PORT=80 \
    -e HOST=0.0.0.0 \
    -e BACKEND_URL=http://masclet-api:8000 \
    --add-host=masclet-api:$API_IP \
    --add-host=masclet-db:$DB_IP \
    --network masclet-network \
    --restart unless-stopped \
    masclet-frontend:definitivo

# 7. Verificar estado
echo "?? Estado de los contenedores:"
docker ps

# 8. Mostrar logs
echo "?? Logs del contenedor (primeros 5 segundos)..."
sleep 3
docker logs masclet-frontend

echo "? DESPLIEGUE COMPLETADO ?"
echo "?? Frontend: http://$(curl -s ifconfig.me):80"
echo "?? API: http://$(curl -s ifconfig.me):8000/docs"
