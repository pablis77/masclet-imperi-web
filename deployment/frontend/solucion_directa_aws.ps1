# Solución directa para el problema de conectividad en AWS
# Este script se enfoca solo en corregir la comunicación entre contenedores

# Configuración
$SSH_USER = "ec2-user"
$SSH_HOST = "108.129.139.119"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Crear el script que se ejecutará en AWS
$fixScript = @'
#!/bin/bash

# 1. Detener todos los contenedores actuales
echo "Deteniendo contenedores actuales..."
docker stop masclet-frontend masclet-frontend-node masclet-api
docker rm masclet-frontend masclet-frontend-node

# 2. Asegurar que existe la red correcta
echo "Configurando red Docker..."
docker network rm masclet-network 2>/dev/null
docker network create masclet-network

# 3. Asegurar que el contenedor de API está en la red
echo "Conectando API a la red..."
docker network connect masclet-network masclet-api 2>/dev/null || echo "No se pudo conectar masclet-api (posiblemente ya conectado)"

# 4. Iniciar el contenedor Node.js (frontal)
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

# 5. Iniciar el contenedor Nginx con la configuración corregida
echo "Iniciando contenedor Nginx..."
cat > /home/ec2-user/frontend/nginx-fixed.conf << 'EOL'
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos (favicon, etc)
    root /usr/share/nginx/html;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade "$http_upgrade";
        proxy_set_header Connection "upgrade";
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
        
        # Configurar tiempo de espera más largo para SSR
        proxy_read_timeout 120s;
    }

    # Acceso directo a archivos en _astro y assets
    location ~ ^/(_astro|assets)/ {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_cache_bypass "$http_upgrade";
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Proxy para todas las rutas API
    location /api/ {
        proxy_pass http://masclet-api:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }
    
    # Configuración específica para /api/v1
    location /api/v1/ {
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }
    
    # Configuración de logs
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log debug;
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

# 6. Verificar estado
echo "Esperando 5 segundos para que los servicios inicien..."
sleep 5

echo "Estado de los contenedores:"
docker ps -a | grep masclet

echo "Verificando Nginx:"
docker logs masclet-frontend --tail 10

echo "Verificando Node.js:"
docker logs masclet-frontend-node --tail 10

echo "Verificando conectividad entre contenedores:"
docker exec masclet-frontend ping -c 1 masclet-api
docker exec masclet-frontend ping -c 1 masclet-frontend-node

echo "Verificando acceso a la API:"
curl -s http://localhost/api/v1/health
'@

# Guardar el script localmente
$fixScript | Out-File -FilePath ".\deployment\frontend\fix_aws.sh" -Encoding utf8

# Mostrar instrucciones
Write-ColorText "`n==== SOLUCIÓN DIRECTA PARA CONEXIÓN CON BACKEND EC2 ====" "Cyan"
Write-ColorText "He creado un script para solucionar directamente el problema de conexión." "Yellow"

Write-ColorText "`nPara implementar la solución, necesitas:" "Magenta"
Write-ColorText "1. Transferir el script a la instancia AWS:" "White"
Write-ColorText "   scp -i tu_clave.pem .\deployment\frontend\fix_aws.sh $SSH_USER@$SSH_HOST:/home/ec2-user/" "Gray"

Write-ColorText "`n2. Conectarte por SSH y ejecutar el script:" "White"
Write-ColorText "   ssh -i tu_clave.pem $SSH_USER@$SSH_HOST 'chmod +x /home/ec2-user/fix_aws.sh && /home/ec2-user/fix_aws.sh'" "Gray"

Write-ColorText "`nEste script:" "Yellow"
Write-ColorText "✅ Detiene y elimina los contenedores problemáticos" "White"
Write-ColorText "✅ Reconfigura la red Docker correctamente" "White"
Write-ColorText "✅ Inicia el frontend Node.js con las variables correctas" "White"
Write-ColorText "✅ Crea una configuración simplificada de Nginx" "White"
Write-ColorText "✅ Verifica la conectividad entre contenedores" "White"
Write-ColorText "✅ Confirma el acceso a la API" "White"

Write-ColorText "`nUna vez implementado, verifica accediendo a:" "Green"
Write-ColorText "http://$SSH_HOST" "Cyan"
