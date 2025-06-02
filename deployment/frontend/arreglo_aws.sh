#!/bin/bash
echo "==== REPARACIÓN DE FRONTEND EN AWS ===="

# 1. Verificar que la red existe
if ! docker network inspect masclet-network >/dev/null 2>&1; then
    echo "Creando red masclet-network..."
    docker network create masclet-network
else
    echo "Red masclet-network ya existe."
fi

# 2. Verificar que masclet-api está en la red
if ! docker network inspect masclet-network | grep -q \"masclet-api\"; then
    echo "Conectando masclet-api a la red..."
    docker network connect masclet-network masclet-api 2>/dev/null || echo "No se pudo conectar API, quizás no existe"
else
    echo "masclet-api ya está conectado a la red."
fi

# 3. Eliminar solo los contenedores frontend
echo "Deteniendo contenedores frontend anteriores..."
docker stop masclet-frontend masclet-frontend-node 2>/dev/null || true
docker rm masclet-frontend masclet-frontend-node 2>/dev/null || true

# 4. Crear contenedor frontend-node
echo "Creando contenedor Node.js..."
docker run -d --name masclet-frontend-node \\
    --network masclet-network \\
    -v /home/ec2-user/frontend/dist:/app \\
    -e PORT=10000 \\
    -e BACKEND_URL=http://masclet-api:8000 \\
    -e API_PREFIX=\"\" \\
    -e NODE_ENV=production \\
    --restart unless-stopped \\
    node:18-alpine sh -c \"cd /app && npx serve -s -l 10000\"

# 5. Crear configuración Nginx sencilla
echo "Creando configuración Nginx..."
cat > /home/ec2-user/frontend/nginx-simple.conf << \"EOF\"
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos
    root /usr/share/nginx/html;

    # Proxy para la aplicación Node.js
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_cache_bypass \;
    }

    # Proxy para la API
    location /api/ {
        proxy_pass http://masclet-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_cache_bypass \;
    }
}
EOF

# 6. Crear contenedor Nginx
echo "Creando contenedor Nginx..."
docker run -d --name masclet-frontend \\
    --network masclet-network \\
    -p 80:80 \\
    -v /home/ec2-user/frontend/nginx-simple.conf:/etc/nginx/conf.d/default.conf \\
    -v /home/ec2-user/frontend/dist:/usr/share/nginx/html \\
    --restart unless-stopped \\
    nginx:alpine

# 7. Verificar estado
echo "Estado final de los contenedores:"
docker ps -a | grep masclet

# 8. Verificar conectividad
echo "Verificando conectividad con la API:"
curl -s http://localhost/api/v1/health || echo "Error de conectividad con la API"

echo "==== REPARACIÓN COMPLETA ===="
echo "Accede al frontend en: http://108.129.139.119"
