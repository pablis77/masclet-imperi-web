# Script para probar específicamente el error de sintaxis de variables en Nginx
# Esta prueba es más específica y se centra solo en la validación de sintaxis

$TEST_DIR = ".\new_tests\complementos\test_nginx_syntax"

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
Write-ColorText "Creando versiones de configuración Nginx para pruebas de sintaxis..." "Cyan"

# 1. Versión con variables escapadas correctamente (debería funcionar)
@'
# Configuración mínima con variables con comillas
events {}
http {
    server {
        listen 80;
        
        location / {
            # Solo probamos la sintaxis de variables
            # No necesitamos que el upstream exista
            proxy_set_header Upgrade "$http_upgrade";
            proxy_set_header Host "$host";
            proxy_set_header X-Real-IP "$remote_addr";
        }
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_correct.conf" -Encoding utf8

# 2. Versión con variables SIN escapar (la que causa el error)
@'
# Configuración mínima con variables sin comillas
events {}
http {
    server {
        listen 80;
        
        location / {
            # Solo probamos la sintaxis de variables
            # No necesitamos que el upstream exista
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
'@ | Out-File -FilePath "$TEST_DIR\nginx_incorrect.conf" -Encoding utf8

# Crear Dockerfile para prueba de Nginx
@'
FROM nginx:alpine

COPY nginx_correct.conf /correct.conf
COPY nginx_incorrect.conf /incorrect.conf

# Script para probar ambas configuraciones
COPY test_syntax.sh /test_syntax.sh
RUN chmod +x /test_syntax.sh

CMD ["sh", "/test_syntax.sh"]
'@ | Out-File -FilePath "$TEST_DIR\Dockerfile" -Encoding utf8

# Crear script de prueba dentro del contenedor
@'
#!/bin/sh

echo "==== PRUEBA DE SINTAXIS NGINX - VARIABLES ===="
echo ""

echo "1. Probando configuración CORRECTA (variables con comillas)..."
nginx -c /correct.conf -t 2>&1
RESULT_CORRECT=$?

echo ""
echo "2. Probando configuración INCORRECTA (variables sin comillas)..."
nginx -c /incorrect.conf -t 2>&1
RESULT_INCORRECT=$?

echo ""
echo "==== RESULTADOS DE LA PRUEBA ===="
echo "Configuración CORRECTA (con comillas): $([ $RESULT_CORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"
echo "Configuración INCORRECTA (sin comillas): $([ $RESULT_INCORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"

echo ""
if [ $RESULT_CORRECT -eq 0 ] && [ $RESULT_INCORRECT -ne 0 ]; then
    echo "✅ CONFIRMADO: Las variables en nginx.conf DEBEN tener comillas"
    echo "✅ SOLUCIÓN VALIDADA: Este es exactamente el problema que teníamos en AWS"
elif [ $RESULT_CORRECT -ne 0 ] && [ $RESULT_INCORRECT -ne 0 ]; then
    echo "❌ Ambas configuraciones fallaron por otra razón"
elif [ $RESULT_CORRECT -eq 0 ] && [ $RESULT_INCORRECT -eq 0 ]; then
    echo "❓ Ambas configuraciones son válidas - Las comillas no afectan la sintaxis"
else
    echo "❓ Resultado inesperado - Revisar logs"
fi

# Mantener el contenedor ejecutándose para inspección
sleep infinity
'@ | Out-File -FilePath "$TEST_DIR\test_syntax.sh" -Encoding utf8

# Construir y ejecutar el contenedor de prueba
Set-Location -Path $TEST_DIR

Write-ColorText "Construyendo contenedor de prueba Nginx..." "Green"
docker build -t nginx-syntax-test .

Write-ColorText "Ejecutando prueba de sintaxis Nginx..." "Green"
docker run --name nginx-syntax-test -d nginx-syntax-test

# Esperar a que la prueba se ejecute
Write-ColorText "Esperando resultados de la prueba..." "Yellow"
Start-Sleep -Seconds 3

# Mostrar resultados
Write-ColorText "Mostrando resultados de la prueba de sintaxis Nginx:" "Cyan"
docker logs nginx-syntax-test

# Instrucciones para limpiar
Write-ColorText "`n🧹 Para limpiar la prueba:" "Yellow"
Write-ColorText "docker rm -f nginx-syntax-test" "Gray"
Write-ColorText "docker rmi nginx-syntax-test" "Gray"
Write-ColorText "cd ../.." "Gray"
Write-ColorText "Remove-Item -Recurse -Force $TEST_DIR" "Gray"
