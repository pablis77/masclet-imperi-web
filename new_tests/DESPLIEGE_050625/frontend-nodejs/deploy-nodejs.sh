#!/bin/bash
set -e

echo "=== DESPLEGANDO FRONTEND MASCLET IMPERI CON NODE.JS ==="
echo "Fecha y hora: $(date)"

# Detener y eliminar contenedor frontend existente si existe
echo "Deteniendo contenedor frontend existente (si existe)..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true

# Crear directorio de trabajo
echo "Preparando directorio de trabajo..."
mkdir -p frontend-deploy
cd frontend-deploy

# Extraer archivos compilados
echo "Extrayendo archivos compilados..."
unzip -o ../frontend-compiled.zip

# Copiar el servidor Express
echo "Copiando servidor Express..."
cp ../server.js .

# Construir imagen Docker
echo "Construyendo imagen Docker con Node.js..."
docker build -t masclet-frontend:nodejs -f ../frontend-node.Dockerfile .

# Verificar si ya existe la red Docker
echo "Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "Creando red Docker masclet-network..."
    docker network create masclet-network
fi

# Iniciar contenedor
echo "Iniciando contenedor frontend con Node.js..."
docker run -d --name masclet-frontend \
  --restart always \
  --network masclet-network \
  -p 80:80 \
  masclet-frontend:nodejs

# Verificar estado
echo "Verificando estado del contenedor..."
docker ps | grep masclet-frontend

# Verificar logs (primeras 10 líneas)
echo "Primeras líneas de logs del contenedor:"
sleep 2
docker logs masclet-frontend --tail 10

echo "=== FRONTEND CON NODE.JS DESPLEGADO EXITOSAMENTE ==="
echo "Frontend accesible en: http://$(curl -s ifconfig.me 2>/dev/null || echo "IP-DEL-SERVIDOR")"
echo "Para ver los logs completos ejecutar: docker logs masclet-frontend"
