# Script final para arreglar SOLO los contenedores frontend en AWS
# Sin tocar la API ni la base de datos

# Configuración
$SSH_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SSH_USER = "ec2-user"
$SSH_HOST = "108.129.139.119"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Crear el script que arreglará el frontend
$scriptAWS = @'
#!/bin/bash
echo "==== ARREGLANDO SOLO LOS CONTENEDORES FRONTEND ===="
echo "NO se tocarán los contenedores de API ni base de datos"

# 1. Detener y eliminar SOLO los contenedores del frontend
echo "Deteniendo contenedores frontend anteriores..."
docker stop masclet-frontend masclet-frontend-node 2>/dev/null || true
docker rm masclet-frontend masclet-frontend-node 2>/dev/null || true

# 2. Asegurar que los contenedores están en la red correcta
echo "Verificando red Docker..."
if ! docker network inspect masclet-network >/dev/null 2>&1; then
    echo "Creando red masclet-network..."
    docker network create masclet-network
else
    echo "Red masclet-network ya existe."
fi

# 3. Asegurar que el contenedor de API está en la red
echo "Asegurando que masclet-api está en la red..."
if docker ps | grep -q masclet-api; then
    echo "Conectando masclet-api a la red..."
    docker network connect masclet-network masclet-api 2>/dev/null || echo "API ya está conectada"
else
    echo "ADVERTENCIA: No se encontró el contenedor masclet-api en ejecución."
    echo "Esto puede causar problemas de conectividad."
fi

# 4. Crear configuración Nginx sencilla
echo "Creando configuración Nginx..."
cat > /home/ec2-user/frontend/nginx-simple.conf << "EOF"
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos
    root /usr/share/nginx/html;

    # Proxy para la aplicación Node.js
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

    # Proxy directo para la API (sin duplicar prefijos)
    location /api/ {
        proxy_pass http://masclet-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Acceso directo a archivos estáticos
    location ~ ^/(_astro|assets)/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
EOF

# 5. Crear contenedor Node.js frontend
echo "Creando contenedor Node.js..."
docker run -d --name masclet-frontend-node \
    --network masclet-network \
    -v /home/ec2-user/frontend/dist:/app \
    -e PORT=10000 \
    -e BACKEND_URL=http://masclet-api:8000 \
    -e API_PREFIX="" \
    -e NODE_ENV=production \
    --restart unless-stopped \
    node:18-alpine sh -c "cd /app && npx serve -s -l 10000"

# 6. Crear contenedor Nginx
echo "Creando contenedor Nginx..."
docker run -d --name masclet-frontend \
    --network masclet-network \
    -p 80:80 \
    -v /home/ec2-user/frontend/nginx-simple.conf:/etc/nginx/conf.d/default.conf \
    -v /home/ec2-user/frontend/dist:/usr/share/nginx/html \
    --restart unless-stopped \
    nginx:alpine

# 7. Verificar estado final
echo "Estado final de los contenedores:"
docker ps -a | grep masclet

echo "Verificando logs de Nginx:"
docker logs masclet-frontend --tail 5

echo "Verificando logs de Node.js:"
docker logs masclet-frontend-node --tail 5

echo "Verificando acceso al API:"
curl -s http://localhost/api/v1/health || echo "Error conectando con la API"

echo "==== ARREGLO COMPLETADO ===="
echo "Ahora deberías poder acceder al frontend en: http://108.129.139.119"
'@

# Guardar el script bash localmente
Set-Content -Path .\deployment\frontend\arreglo_aws_final.sh -Value $scriptAWS -Encoding utf8

# Crear comandos para transferir y ejecutar
$comandoScp = "scp -i `"$SSH_KEY`" .\deployment\frontend\arreglo_aws_final.sh $SSH_USER@$SSH_HOST:/home/ec2-user/"
$comandoSsh = "ssh -i `"$SSH_KEY`" $SSH_USER@$SSH_HOST 'chmod +x /home/ec2-user/arreglo_aws_final.sh && /home/ec2-user/arreglo_aws_final.sh'"

# Ejecutar comandos
Write-ColorText "Transfiriendo script a AWS..." "Cyan"
Write-ColorText $comandoScp "Gray"
Invoke-Expression $comandoScp

Write-ColorText "`nEjecutando script en AWS..." "Green"
Write-ColorText $comandoSsh "Gray"
Invoke-Expression $comandoSsh

Write-ColorText "`n==== DESPLIEGUE COMPLETADO ====" "Magenta"
Write-ColorText "Si todo ha ido bien, el frontend debería estar disponible en:" "Yellow"
Write-ColorText "http://$SSH_HOST" "Cyan"
