# Script de prueba exhaustiva del despliegue Docker para detectar todos los posibles errores
# Simulamos exactamente el entorno AWS con todas sus variables y configuraciones

# Definición de constantes y directorios
$TEST_DIR = ".\new_tests\complementos\test_docker_full"
$FRONTEND_SRC = ".\frontend"
$NGINX_LOG_FILE = "$TEST_DIR\nginx_error.log"
$NODE_LOG_FILE = "$TEST_DIR\node_error.log"
$DOCKER_LOG_FILE = "$TEST_DIR\docker_error.log"

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Limpieza previa si existe el directorio
if (Test-Path $TEST_DIR) {
    Write-ColorText "Limpiando prueba anterior..." "Yellow"
    Remove-Item -Recurse -Force $TEST_DIR
}

# Crear estructura de directorios para la prueba
Write-ColorText "Creando estructura de directorios para prueba..." "Cyan"
New-Item -ItemType Directory -Path $TEST_DIR | Out-Null
New-Item -ItemType Directory -Path "$TEST_DIR\dist\client" | Out-Null
New-Item -ItemType Directory -Path "$TEST_DIR\dist\server" | Out-Null
New-Item -ItemType Directory -Path "$TEST_DIR\node_modules" | Out-Null

# Copiar archivos del frontend (simulando compilación)
Write-ColorText "Copiando archivos compilados..." "Cyan"
Copy-Item -Path "$FRONTEND_SRC\dist\client\*" -Destination "$TEST_DIR\dist\client\" -Recurse
Copy-Item -Path "$FRONTEND_SRC\dist\server\*" -Destination "$TEST_DIR\dist\server\" -Recurse
Copy-Item -Path "$FRONTEND_SRC\fix-server.js" -Destination "$TEST_DIR\" 
Copy-Item -Path "$FRONTEND_SRC\fix-api-urls-enhanced.cjs" -Destination "$TEST_DIR\"

# Crear package.json mínimo
Write-ColorText "Creando package.json para prueba..." "Cyan"
@'
{
  "name": "masclet-imperi-frontend-test",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node fix-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "node-fetch": "^3.3.1",
    "cookie": "^0.5.0", 
    "express-session": "^1.17.3",
    "@astrojs/internal-helpers": "^0.1.1"
  }
}
'@ | Out-File -FilePath "$TEST_DIR\package.json" -Encoding utf8

# Crear archivo de configuración de Nginx para pruebas
Write-ColorText "Creando configuración de Nginx para prueba..." "Cyan"
@'
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos (favicon, etc)
    root /usr/share/nginx/html;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
    location / {
        proxy_pass http://masclet-frontend-node-test:10000;
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
        
        # Añadimos debug para ver todos los errores
        proxy_intercept_errors on;
        error_log /var/log/nginx/masclet_error.log debug;
    }

    # Acceso directo a archivos en _astro y assets
    location ~ ^/(_astro|assets)/ {
        proxy_pass http://masclet-frontend-node-test:10000;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_cache_bypass "$http_upgrade";
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Configuración para favicon
    location = /favicon.ico {
        try_files /favicon.ico =404;
        access_log off;
        log_not_found off;
        expires 30d;
    }

    # COMPATIBILIDAD TEMPORAL: Soporte para rutas con doble prefijo 
    # Redirige /api/api/v1/* a /api/v1/* para manejar posibles URLs antiguas durante la transición
    location ~ ^/api/api/v1/(.*)$ {
        # Redireccionamos permanentemente a la URL correcta
        return 301 /api/v1/$1;
    }
    
    # SOLUCIÓN CRÍTICA: Corregir el patrón problemático /api/v1/api/v1
    # Este es el patrón específico que está causando los errores 500
    location ~ ^/api/v1/api/v1/(.*)$ {
        # Redireccionamos permanentemente a la URL correcta
        return 301 /api/v1/$1;
    }

    # SOLUCIÓN PRINCIPAL: Proxy directo para rutas /api/v1
    # Esto permite usar las rutas correctas sin doble prefijo
    location ~ ^/api/v1/(.*)$ {
        # SOLUCIÓN CORRECTA: Mantener el prefijo original sin duplicarlo
        # Si enviamos solo /$1, el backend no lo reconoce porque espera /api/v1/
        proxy_pass http://masclet-api-test:8000/api/v1/$1;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }

    # Ruta de respaldo para compatibilidad con posibles rutas sin versión
    location /api/ {
        # Proxy a la API sin duplicar el prefijo /api/
        proxy_pass http://masclet-api-test:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade "$http_upgrade";
        proxy_set_header Connection "upgrade";
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }

    # RESPALDO para rutas de autenticación sin prefijo correcto
    location = /auth/login {
        # Redirigir a la ruta oficial
        proxy_pass http://masclet-api-test:8000/api/v1/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }
    
    # Configuración de logs exhaustiva
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log debug;
}
'@ | Out-File -FilePath "$TEST_DIR\nginx.conf" -Encoding utf8

# Crear Dockerfile para Node.js
Write-ColorText "Creando Dockerfile para Node.js..." "Cyan"
@'
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias y package.json
COPY package.json .
COPY fix-server.js .
COPY fix-api-urls-enhanced.cjs .

# Crear estructura para código compilado
COPY dist/ dist/

# Instalar dependencias (incluyendo las críticas)
RUN npm install

# Aplicar corrección de URLs
RUN node fix-api-urls-enhanced.cjs

# Variables de entorno
ENV NODE_ENV=production
ENV BACKEND_URL=http://masclet-api-test:8000
ENV API_PREFIX=""
ENV PORT=10000

# Exponer puerto
EXPOSE 10000

# Comando para iniciar el servidor con monitoreo de errores
CMD ["sh", "-c", "node fix-server.js 2>&1 | tee /app/server.log"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile.node" -Encoding utf8

# Crear simulador de API para pruebas
Write-ColorText "Creando simulador de API para pruebas..." "Cyan"
@'
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Crear estructura de directorios para API
RUN mkdir -p api/v1/auth

# Crear respuestas de API simuladas
RUN echo '{"status":"success","message":"API simulada funcionando"}' > /usr/share/nginx/html/api/v1/index.html
RUN echo '{"status":"success","token":"test-token"}' > /usr/share/nginx/html/api/v1/auth/login

# Configurar nginx para simular API
RUN echo 'server { \
    listen 8000; \
    location /api/v1/ { \
        root /usr/share/nginx/html; \
        add_header Content-Type application/json; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile.api" -Encoding utf8

# Crear docker-compose.yml
Write-ColorText "Creando docker-compose para prueba completa..." "Cyan"
@'
version: '3.8'

services:
  masclet-api-test:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: masclet-api-test
    ports:
      - "8000:8000"
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/api/v1/"]
      interval: 5s
      timeout: 3s
      retries: 5

  masclet-frontend-node-test:
    build:
      context: .
      dockerfile: Dockerfile.node
    container_name: masclet-frontend-node-test
    environment:
      - NODE_ENV=production
      - BACKEND_URL=http://masclet-api-test:8000
      - API_PREFIX=
      - PORT=10000
    ports:
      - "10000:10000"
    depends_on:
      masclet-api-test:
        condition: service_healthy
    networks:
      - masclet-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:10000/"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - node_logs:/app/logs

  masclet-frontend-test:
    image: nginx:alpine
    container_name: masclet-frontend-test
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - nginx_logs:/var/log/nginx
    depends_on:
      masclet-frontend-node-test:
        condition: service_healthy
    networks:
      - masclet-network

networks:
  masclet-network:
    driver: bridge

volumes:
  nginx_logs:
  node_logs:
'@ | Out-File -FilePath "$TEST_DIR\docker-compose.yml" -Encoding utf8

# Crear script de validación
Write-ColorText "Creando script de validación..." "Cyan"
@'
#!/bin/bash

echo "🔍 Validando configuración de Nginx..."
docker exec masclet-frontend-test nginx -t

echo "📋 Verificando logs de Node.js..."
docker logs masclet-frontend-node-test

echo "🧪 Probando rutas de API (verificación de corrección de URLs)..."
# Prueba 1: API correcta
echo "Prueba 1: /api/v1/ (debe funcionar)"
curl -s http://localhost:8080/api/v1/

# Prueba 2: API con doble prefijo (debe redirigir)
echo "Prueba 2: /api/api/v1/ (debe redirigir)"
curl -s -v http://localhost:8080/api/api/v1/

# Prueba 3: API con patrón problemático (debe redirigir)
echo "Prueba 3: /api/v1/api/v1/ (debe redirigir)"
curl -s -v http://localhost:8080/api/v1/api/v1/

echo "✅ Validación completada"
'@ | Out-File -FilePath "$TEST_DIR\validate.sh" -Encoding utf8

# Moverse al directorio de prueba y ejecutar Docker
Write-ColorText "Iniciando prueba Docker completa..." "Green"
Set-Location -Path $TEST_DIR

# Ejecutar prueba
docker-compose up -d

# Validar el despliegue
Write-ColorText "⏳ Esperando 15 segundos para asegurar que los contenedores estén listos..." "Yellow"
Start-Sleep -Seconds 15

# Verificar el estado de los contenedores
Write-ColorText "🔍 Verificando estado de los contenedores..." "Cyan"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Validar configuración de Nginx
Write-ColorText "🔍 Validando configuración de Nginx..." "Cyan"
docker exec masclet-frontend-test nginx -t 2>&1 | Tee-Object -FilePath $NGINX_LOG_FILE

# Verificar logs de Node.js
Write-ColorText "📋 Verificando logs de Node.js..." "Cyan"
docker logs masclet-frontend-node-test 2>&1 | Tee-Object -FilePath $NODE_LOG_FILE

# Pruebas de conexión
Write-ColorText "🧪 Probando conexión a la web..." "Cyan"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/" -UseBasicParsing -ErrorAction Stop
    Write-ColorText "✅ Conexión exitosa a http://localhost:8080/ - Código: $($response.StatusCode)" "Green"
} catch {
    Write-ColorText "❌ Error al conectar a http://localhost:8080/ - $($_.Exception.Message)" "Red"
}

# Pruebas de API
Write-ColorText "🧪 Probando rutas de API (verificación de corrección de URLs)..." "Cyan"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/" -UseBasicParsing -ErrorAction Stop
    Write-ColorText "✅ API correcta funciona - /api/v1/ - Código: $($response.StatusCode)" "Green"
    Write-ColorText "   Respuesta: $($response.Content)" "Gray"
} catch {
    Write-ColorText "❌ Error en API correcta - /api/v1/ - $($_.Exception.Message)" "Red"
}

# Prueba API con doble prefijo (debe redirigir)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/api/v1/" -UseBasicParsing -ErrorAction Stop -MaximumRedirection 0
    Write-ColorText "❓ No se recibió redirección esperada en /api/api/v1/ - Código: $($response.StatusCode)" "Yellow"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 301) {
        Write-ColorText "✅ Redirección correcta en /api/api/v1/ - Código: 301" "Green"
    } else {
        Write-ColorText "❌ Error en API doble prefijo - /api/api/v1/ - $($_.Exception.Message)" "Red"
    }
}

# Mostrar logs detallados de Nginx
Write-ColorText "📋 Logs detallados de Nginx..." "Cyan"
docker exec masclet-frontend-test cat /var/log/nginx/masclet_error.log

# Resumen final
Write-ColorText "`n📋 RESUMEN DE LA PRUEBA:" "Green"
Write-ColorText "=======================================" "Green"

# Verificar archivos de log para errores
$nginxErrors = Select-String -Path $NGINX_LOG_FILE -Pattern "error", "fail", "invalid"
$nodeErrors = Select-String -Path $NODE_LOG_FILE -Pattern "error", "fail", "cannot", "exception"

if ($nginxErrors) {
    Write-ColorText "❌ NGINX: Errores detectados:" "Red"
    foreach ($error in $nginxErrors) {
        Write-ColorText "   - $error" "Red"
    }
} else {
    Write-ColorText "✅ NGINX: Sin errores detectados" "Green"
}

if ($nodeErrors) {
    Write-ColorText "❌ NODE: Errores detectados:" "Red"
    foreach ($error in $nodeErrors) {
        Write-ColorText "   - $error" "Red"
    }
} else {
    Write-ColorText "✅ NODE: Sin errores detectados" "Green"
}

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker-compose down -v" "Gray"
Write-ColorText "cd ../.." "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"

# Instrucciones para acceder a la aplicación
Write-ColorText "`n🌐 La aplicación está disponible en: http://localhost:8080/" "Cyan"
Write-ColorText "   API simulada disponible en: http://localhost:8080/api/v1/" "Cyan"
