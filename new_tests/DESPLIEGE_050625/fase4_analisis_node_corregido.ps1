# Fase 4: Análisis del contenedor Node.js y lógica de autenticación
# Este script examina el contenedor Node.js para entender cómo se maneja la autenticación
# y localiza los archivos JS relevantes para el proceso de login

Write-Host "🔍 Fase 4: Analizando servidor Node.js y lógica de autenticación..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para analizar el contenedor Node.js y los archivos de autenticación
$analisisNode = @'
#!/bin/bash
set -e

echo "===== ANÁLISIS DEL SERVIDOR NODE.JS Y LÓGICA DE AUTENTICACIÓN ====="

echo -e "\n1. Identificando contenedor Node.js:"
NODE_CONTAINER=$(docker ps | grep masclet-frontend-node | head -1 | awk '{print $1}')
echo "Contenedor Node.js identificado: $NODE_CONTAINER"

echo -e "\n2. Estructura de directorios principal del contenedor Node.js:"
echo "Directorio raíz:"
docker exec $NODE_CONTAINER ls -la /
echo -e "\nDirectorio /app:"
docker exec $NODE_CONTAINER ls -la /app
echo -e "\nArchivos principales de la aplicación:"
docker exec $NODE_CONTAINER find /app -type f -name "*.js" | grep -E "index|server|app|main" | xargs -I {} docker exec $NODE_CONTAINER ls -la {}

echo -e "\n3. Logs recientes del contenedor Node.js:"
docker logs $NODE_CONTAINER --tail 50

echo -e "\n4. Analizando punto de entrada de la aplicación:"
ENTRY_POINT=$(docker exec $NODE_CONTAINER find /app -name "*.js" | grep -E "server|index|main" | head -1)
echo "Archivo punto de entrada: $ENTRY_POINT"
echo "Contenido:"
docker exec $NODE_CONTAINER cat $ENTRY_POINT

echo -e "\n5. Buscando archivos relacionados con autenticación:"
docker exec $NODE_CONTAINER find /app -type f -name "*.js" | grep -E "auth|login|user" | xargs -I {} echo "Archivo: {}"

echo -e "\n6. Extrayendo contenido del archivo authService.js:"
AUTH_SERVICE=$(docker exec $NODE_CONTAINER find /app -type f -name "authService*.js" | head -1)
if [ ! -z "$AUTH_SERVICE" ]; then
  echo "Contenido de $AUTH_SERVICE:"
  docker exec $NODE_CONTAINER cat $AUTH_SERVICE
else
  echo "Buscando archivos _astro/auth*.js:"
  ASTRO_AUTH=$(docker exec $NODE_CONTAINER find /app -type f -path "*/_astro/*" -name "auth*.js" | head -1)
  if [ ! -z "$ASTRO_AUTH" ]; then
    echo "Contenido de $ASTRO_AUTH:"
    docker exec $NODE_CONTAINER cat $ASTRO_AUTH
  else
    echo "No se encontró archivo de autenticación específico"
  fi
fi

echo -e "\n7. Extrayendo archivo de autenticación de Nginx:"
echo "Contenido de /usr/share/nginx/html/client/_astro/authService.CvC7CJU-.js:"
docker exec $(docker ps | grep masclet-frontend | grep -v node | head -1 | awk '{print $1}') cat /usr/share/nginx/html/client/_astro/authService.CvC7CJU-.js

echo -e "\n8. Revisando modificadores de login:"
echo "Contenido de login-direct-fix.js:"
docker exec $(docker ps | grep masclet-frontend | grep -v node | head -1 | awk '{print $1}') cat /usr/share/nginx/html/login-direct-fix.js

echo -e "\n9. Verificando configuración del Servidor Node.js:"
echo "Variables de entorno del contenedor Node.js:"
docker exec $NODE_CONTAINER env | sort

echo -e "\n10. Verificando rutas de Node.js:"
echo "Rutas disponibles en Express (si está usando Express):"
docker exec $NODE_CONTAINER find /app -type f -name "*.js" | xargs -I {} docker exec $NODE_CONTAINER grep -l "router\\.\\(get\\|post\\|put\\|delete\\)" {} | xargs -I {} echo "Archivo con rutas: {}"

echo -e "\n===== ANÁLISIS DE AUTENTICACIÓN COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - corregimos método de transferencia
$tempScriptPath = Join-Path -Path $env:TEMP -ChildPath "fase4_analisis_node.sh"
$analisisNode | Out-File -FilePath $tempScriptPath -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
$content = Get-Content -Path $tempScriptPath -Raw
$contentUnix = $content -replace "`r`n", "`n"
$contentUnix | Out-File -FilePath $tempScriptPath -Encoding utf8 -NoNewline

Write-Host "🔄 Transfiriendo script al servidor..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "rm -f /tmp/fase4_analisis_node.sh"
scp -i $KEY_PATH $tempScriptPath $SERVER":/tmp/fase4_analisis_node.sh"
Remove-Item -Path $tempScriptPath

Write-Host "🔎 Ejecutando análisis del servidor Node.js..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fase4_analisis_node.sh && bash /tmp/fase4_analisis_node.sh"

Write-Host @"
✅ Análisis del servidor Node.js completado.

Este análisis nos proporciona:
1. La estructura y punto de entrada del servidor Node.js
2. El código del servicio de autenticación
3. Los modificadores actuales de login
4. Las rutas y configuración del servidor

Con esta información podemos ahora crear una solución integral que funcione
tanto en el nivel de Nginx como en el nivel de Node.js.
"@ -ForegroundColor Green
