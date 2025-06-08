# Fase 3: Diagnóstico profundo del contenedor frontend
# Este script analiza la estructura interna del contenedor para identificar
# dónde se encuentran realmente los archivos HTML y JS

Write-Host "🔍 Fase 3: Analizando estructura interna del contenedor frontend..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para diagnosticar el contenedor
$diagnosticoContenedor = @'
#!/bin/bash
set -e

echo "===== DIAGNÓSTICO PROFUNDO DEL CONTENEDOR FRONTEND ====="

echo -e "\n1. Listando todos los contenedores activos:"
docker ps -a

echo -e "\n2. Identificando contenedor frontend principal:"
FRONTEND_CONTAINER=$(docker ps | grep masclet-frontend | head -1 | awk '{print $1}')
if [ -z "$FRONTEND_CONTAINER" ]; then
  echo "No se encontró el contenedor frontend. Buscando alternativas..."
  FRONTEND_CONTAINER=$(docker ps | grep frontend | head -1 | awk '{print $1}')
fi
echo "Contenedor frontend identificado: $FRONTEND_CONTAINER"

echo -e "\n3. Explorando estructura de directorios del contenedor:"
echo "Directorio raíz:"
docker exec $FRONTEND_CONTAINER ls -la /
echo -e "\nDirectorio /usr:"
docker exec $FRONTEND_CONTAINER ls -la /usr || echo "No se puede acceder a /usr"
echo -e "\nDirectorio /usr/share:"
docker exec $FRONTEND_CONTAINER ls -la /usr/share || echo "No se puede acceder a /usr/share"
echo -e "\nDirectorio /usr/share/nginx:"
docker exec $FRONTEND_CONTAINER ls -la /usr/share/nginx || echo "No se puede acceder a /usr/share/nginx"
echo -e "\nDirectorio /var/www:"
docker exec $FRONTEND_CONTAINER ls -la /var/www || echo "No se puede acceder a /var/www"

echo -e "\n4. Buscando ubicación de archivos HTML:"
docker exec $FRONTEND_CONTAINER find / -type f -name "*.html" 2>/dev/null | head -20

echo -e "\n5. Inspeccionando configuración de Nginx:"
echo "Archivos en /etc/nginx:"
docker exec $FRONTEND_CONTAINER ls -la /etc/nginx || echo "No se puede acceder a /etc/nginx"
echo -e "\nArchivos de configuración de Nginx:"
docker exec $FRONTEND_CONTAINER ls -la /etc/nginx/conf.d || echo "No se puede acceder a /etc/nginx/conf.d"
echo -e "\nContenido del archivo de configuración principal:"
docker exec $FRONTEND_CONTAINER cat /etc/nginx/conf.d/default.conf || echo "No se puede acceder al archivo de configuración"

echo -e "\n6. Buscando la ubicación real de la raíz web:"
docker exec $FRONTEND_CONTAINER grep -r "root" /etc/nginx/conf.d/ || echo "No se encontró la directiva 'root' en la configuración"

echo -e "\n7. Identificando el contenedor Node.js frontend:"
FRONTEND_NODE_CONTAINER=$(docker ps | grep node | grep masclet | head -1 | awk '{print $1}')
echo "Contenedor Node.js frontend identificado: $FRONTEND_NODE_CONTAINER"

if [ ! -z "$FRONTEND_NODE_CONTAINER" ]; then
  echo -e "\n8. Explorando estructura del contenedor Node.js:"
  echo "Directorio raíz:"
  docker exec $FRONTEND_NODE_CONTAINER ls -la / || echo "No se puede acceder al contenedor Node.js"
  echo -e "\nDirectorio /app:"
  docker exec $FRONTEND_NODE_CONTAINER ls -la /app || echo "No se puede acceder a /app"
  echo -e "\nDirectorio /src (si existe):"
  docker exec $FRONTEND_NODE_CONTAINER ls -la /src 2>/dev/null || echo "No se puede acceder a /src"
  
  echo -e "\n9. Verificando scripts de inicio Node.js:"
  docker exec $FRONTEND_NODE_CONTAINER find /app -name "*.js" | grep -E "index|server|app|main" | xargs -I {} docker exec $FRONTEND_NODE_CONTAINER ls -la {} 2>/dev/null || echo "No se encontraron scripts principales"
  
  echo -e "\n10. Verificando archivos de startup y configuración:"
  docker exec $FRONTEND_NODE_CONTAINER find /app -name "startup.sh" | xargs -I {} docker exec $FRONTEND_NODE_CONTAINER cat {} 2>/dev/null || echo "No se encontró startup.sh"
fi

echo -e "\n===== DIAGNÓSTICO DE CONTENEDOR COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticoContenedor | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fase3_diagnostico_contenedor.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔎 Ejecutando diagnóstico del contenedor..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fase3_diagnostico_contenedor.sh && sh /tmp/fase3_diagnostico_contenedor.sh"

Write-Host @"
✅ Diagnóstico del contenedor completado.

Este análisis nos muestra:
1. La estructura interna del contenedor frontend
2. La ubicación real de los archivos HTML y JS
3. La configuración de Nginx y la raíz del servidor web
4. La relación entre los contenedores frontend y Node.js

Con esta información podemos crear una solución específica para la estructura real.
"@ -ForegroundColor Green
