# Script para probar específicamente la configuración de Nginx
# Este script se centra en validar la sintaxis de la configuración de Nginx

$TEST_DIR = ".\new_tests\complementos\test_nginx"

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

# Crear configuración Nginx con distintas versiones para probar
Write-ColorText "Creando versiones de configuración Nginx para pruebas..." "Cyan"

# 1. Versión con variables escapadas correctamente (debería funcionar)
@'
server {
    listen 80;
    
    # Proxy inverso básico
    location / {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade "$http_upgrade";
        proxy_set_header Connection "upgrade";
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_cache_bypass "$http_upgrade";
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_correct.conf" -Encoding utf8

# 2. Versión con variables SIN escapar (la que causa el error)
@'
server {
    listen 80;
    
    # Proxy inverso básico
    location / {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_incorrect.conf" -Encoding utf8

# Crear Dockerfile para prueba de Nginx
@'
FROM nginx:alpine

COPY nginx_correct.conf /etc/nginx/conf.d/correct.conf.disabled
COPY nginx_incorrect.conf /etc/nginx/conf.d/incorrect.conf.disabled

# Script para probar ambas configuraciones
COPY test_nginx.sh /test_nginx.sh
RUN chmod +x /test_nginx.sh

CMD ["sh", "/test_nginx.sh"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile" -Encoding utf8

# Crear script de prueba dentro del contenedor
@'
#!/bin/sh

echo "==== PRUEBA DE CONFIGURACIÓN NGINX ===="
echo ""

echo "1. Probando configuración CORRECTA (variables con comillas)..."
cp /etc/nginx/conf.d/correct.conf.disabled /etc/nginx/conf.d/default.conf
nginx -t 2>&1
RESULT_CORRECT=$?

echo ""
echo "2. Probando configuración INCORRECTA (variables sin comillas)..."
cp /etc/nginx/conf.d/incorrect.conf.disabled /etc/nginx/conf.d/default.conf
nginx -t 2>&1
RESULT_INCORRECT=$?

echo ""
echo "==== RESULTADOS DE LA PRUEBA ===="
echo "Configuración CORRECTA (con comillas): $([ $RESULT_CORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"
echo "Configuración INCORRECTA (sin comillas): $([ $RESULT_INCORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"

echo ""
echo "Esta prueba confirma que las variables en la configuración de Nginx DEBEN estar entre comillas"
echo "para que funcione correctamente en producción."

# Mantener el contenedor ejecutándose para inspección
sleep infinity
'@ | Out-File -FilePath "$TEST_DIR\test_nginx.sh" -Encoding utf8

# Construir y ejecutar el contenedor de prueba
Set-Location -Path $TEST_DIR

Write-ColorText "Construyendo contenedor de prueba Nginx..." "Green"
docker build -t nginx-config-test .

Write-ColorText "Ejecutando prueba de configuración Nginx..." "Green"
docker run --name nginx-test -d nginx-config-test

# Esperar a que la prueba se ejecute
Write-ColorText "Esperando resultados de la prueba..." "Yellow"
Start-Sleep -Seconds 3

# Mostrar resultados
Write-ColorText "Mostrando resultados de la prueba de configuración Nginx:" "Cyan"
docker logs nginx-test

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker rm -f nginx-test" "Gray"
Write-ColorText "docker rmi nginx-config-test" "Gray"
Write-ColorText "cd ../.." "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"
