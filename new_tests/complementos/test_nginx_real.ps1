# Script para probar la configuración REAL de Nginx que causa problemas en AWS
# Esta prueba replica exactamente la configuración problemática

$TEST_DIR = ".\new_tests\complementos\test_nginx_real"

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
Write-ColorText "Creando directorio para prueba..." "Cyan"
New-Item -ItemType Directory -Path $TEST_DIR | Out-Null

# Crear configuración Nginx exactamente igual a la de AWS
Write-ColorText "Creando configuración Nginx exacta para prueba..." "Cyan"

# Configuración exacta de nginx-linux.conf
@'
server {
    listen 80;
    server_name localhost;
    
    # Root para archivos estáticos (favicon, etc)
    root /usr/share/nginx/html;

    # Proxy inverso a la aplicación Node.js (Astro SSR)
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
        
        # Configurar tiempo de espera más largo para SSR
        proxy_read_timeout 120s;
    }

    # Acceso directo a archivos en _astro y assets
    location ~ ^/(_astro|assets)/ {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
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
        proxy_pass http://masclet-api:8000/api/v1/$1;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Ruta de respaldo para compatibilidad con posibles rutas sin versión
    location /api/ {
        # Proxy a la API sin duplicar el prefijo /api/
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # RESPALDO para rutas de autenticación sin prefijo correcto
    location = /auth/login {
        # Redirigir a la ruta oficial
        proxy_pass http://masclet-api:8000/api/v1/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Configuración de logs
    access_log /var/log/nginx/masclet_access.log;
    error_log /var/log/nginx/masclet_error.log debug;
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_aws.conf" -Encoding utf8

# Crear Dockerfile para prueba de Nginx
@'
FROM nginx:alpine

COPY nginx_aws.conf /etc/nginx/conf.d/default.conf

# Script para obtener errores de sintaxis
RUN nginx -t 2>/nginx_error.log || echo "Error detectado"

# Crear comando simple para mostrar logs y mantener el contenedor
CMD ["sh", "-c", "cat /nginx_error.log && echo 'Manteniendo contenedor vivo para inspección' && sleep infinity"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile" -Encoding utf8

# Construir y ejecutar el contenedor de prueba
Set-Location -Path $TEST_DIR

Write-ColorText "Construyendo contenedor con configuración AWS exacta..." "Green"
docker build -t nginx-aws-test .

Write-ColorText "Ejecutando prueba con configuración AWS exacta..." "Green"
docker run --name nginx-aws-test -d nginx-aws-test

# Esperar a que la prueba se ejecute
Write-ColorText "Esperando resultados de la prueba..." "Yellow"
Start-Sleep -Seconds 3

# Mostrar resultados
Write-ColorText "Mostrando resultados de la prueba de configuración AWS:" "Cyan"
docker logs nginx-aws-test

# Probar qué línea específica causa el error - eliminar líneas para aislar el problema
Write-ColorText "`nPrueba detallada - identificando línea problemática:" "Magenta"

# Iniciar un contenedor interactivo para debugging manual
Write-ColorText "Iniciando contenedor para debugging interactivo..." "Yellow"
Write-ColorText "Para acceder: docker exec -it nginx-aws-debug sh" "Gray"
docker run --name nginx-aws-debug -d nginx:alpine
docker exec nginx-aws-debug mkdir -p /etc/nginx/conf.d/test
docker cp "$TEST_DIR\nginx_aws.conf" nginx-aws-debug:/etc/nginx/conf.d/test/

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker rm -f nginx-aws-test nginx-aws-debug" "Gray"
Write-ColorText "docker rmi nginx-aws-test" "Gray"
Write-ColorText "cd ../.." "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"
