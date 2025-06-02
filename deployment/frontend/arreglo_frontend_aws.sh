#!/bin/bash
# Este script SOLO arregla el frontend y NO toca el backend ni la base de datos

echo "ARREGLANDO SOLO EL FRONTEND - NO SE TOCA API NI BASE DE DATOS"

# 1. Detener solo los contenedores del frontend
echo "Deteniendo solo contenedores del frontend..."
docker stop masclet-frontend masclet-frontend-node
docker rm masclet-frontend masclet-frontend-node

# 2. Iniciar el contenedor Node.js (frontal)
echo "Iniciando contenedor Node.js..."
docker run -d --name masclet-frontend-node \
  -v /home/ec2-user/frontend/dist:/app \
  -e PORT=10000 \
  -e BACKEND_URL=http://masclet-api:8000 \
  -e API_PREFIX="" \
  -e NODE_ENV=production \
  --restart unless-stopped \
  --network masclet-network \
  node:18-alpine sh -c "cd /app && npx serve -s -l 10000"

# 3. Iniciar el contenedor Nginx con la configuración corregida
echo "Iniciando contenedor Nginx..."
cat > /home/ec2-user/frontend/nginx-fixed.conf << 'EOL'
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos
    root /usr/share/nginx/html;

    # Proxy inverso a la aplicación Node.js
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy directo a la API
    location /api/ {
        proxy_pass http://masclet-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Iniciar Nginx con la configuración simplificada
docker run -d --name masclet-frontend \
  -p 80:80 \
  -v /home/ec2-user/frontend/nginx-fixed.conf:/etc/nginx/conf.d/default.conf \
  -v /home/ec2-user/frontend/dist:/usr/share/nginx/html \
  --restart unless-stopped \
  --network masclet-network \
  nginx:alpine

# 4. Verificar estado
echo "Estado de los contenedores:"
docker ps -a | grep masclet

echo "Verificando acceso a la API a través del frontend:"
curl -s http://localhost/api/v1/health

echo "FRONTEND ARREGLADO - ACCEDE A http://108.129.139.119"
