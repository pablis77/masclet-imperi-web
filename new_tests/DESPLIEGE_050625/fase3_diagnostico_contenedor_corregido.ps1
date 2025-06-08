# Fase 3 (Corregida): Diagnóstico profundo del contenedor Nginx frontend
# Este script analiza la estructura interna del contenedor Nginx frontend
# para identificar dónde se encuentran los archivos HTML y JS

Write-Host "🔍 Fase 3 (Corregida): Analizando estructura interna del contenedor Nginx frontend..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para diagnosticar el contenedor
$diagnosticoContenedor = @'
#!/bin/bash
set -e

echo "===== DIAGNÓSTICO PROFUNDO DEL CONTENEDOR NGINX FRONTEND ====="

echo -e "\n1. Identificando el contenedor Nginx frontend:"
NGINX_CONTAINER=$(docker ps | grep masclet-frontend | grep -v node | head -1 | awk '{print $1}')
if [ -z "$NGINX_CONTAINER" ]; then
  echo "No se encontró el contenedor Nginx frontend. Buscando alternativas..."
  NGINX_CONTAINER=$(docker ps | grep nginx | head -1 | awk '{print $1}')
fi
echo "Contenedor Nginx frontend identificado: $NGINX_CONTAINER"

echo -e "\n2. Explorando estructura de directorios del contenedor Nginx:"
echo "Directorio raíz:"
docker exec $NGINX_CONTAINER ls -la /
echo -e "\nDirectorio /usr:"
docker exec $NGINX_CONTAINER ls -la /usr || echo "No se puede acceder a /usr"
echo -e "\nDirectorio /usr/share:"
docker exec $NGINX_CONTAINER ls -la /usr/share || echo "No se puede acceder a /usr/share"
echo -e "\nDirectorio /usr/share/nginx:"
docker exec $NGINX_CONTAINER ls -la /usr/share/nginx || echo "No se puede acceder a /usr/share/nginx"
echo -e "\nDirectorio /usr/share/nginx/html:"
docker exec $NGINX_CONTAINER ls -la /usr/share/nginx/html || echo "No se puede acceder a /usr/share/nginx/html"
echo -e "\nDirectorio /var/www:"
docker exec $NGINX_CONTAINER ls -la /var/www || echo "No se puede acceder a /var/www"

echo -e "\n3. Buscando ubicación de archivos HTML:"
docker exec $NGINX_CONTAINER find / -type f -name "*.html" | grep -v "node_modules" | head -20

echo -e "\n4. Inspeccionando configuración de Nginx:"
echo "Archivos en /etc/nginx:"
docker exec $NGINX_CONTAINER ls -la /etc/nginx || echo "No se puede acceder a /etc/nginx"
echo -e "\nArchivos de configuración de Nginx:"
docker exec $NGINX_CONTAINER ls -la /etc/nginx/conf.d || echo "No se puede acceder a /etc/nginx/conf.d"
echo -e "\nContenido del archivo de configuración principal:"
docker exec $NGINX_CONTAINER cat /etc/nginx/conf.d/default.conf || echo "No se puede acceder al archivo de configuración"

echo -e "\n5. Buscando la ubicación real de la raíz web:"
docker exec $NGINX_CONTAINER grep -r "root" /etc/nginx/conf.d/ || echo "No se encontró la directiva 'root' en la configuración"

echo -e "\n6. Verificando archivos específicos de login:"
echo "Buscando archivos HTML de login:"
docker exec $NGINX_CONTAINER find / -type f -name "*login*.html" | grep -v "node_modules" || echo "No se encontraron archivos HTML de login"

echo -e "\n7. Buscando archivos JavaScript relevantes:"
docker exec $NGINX_CONTAINER find / -type f -name "*.js" | grep -E "hoisted|auth|login" | grep -v "node_modules" | head -10 || echo "No se encontraron archivos JavaScript relevantes"

echo -e "\n8. Inspeccionando página de login:"
LOGIN_PAGE=$(docker exec $NGINX_CONTAINER find / -type f -name "*login*.html" | grep -v "node_modules" | head -1)
if [ ! -z "$LOGIN_PAGE" ]; then
  echo "Contenido de la página de login (primeras 20 líneas):"
  docker exec $NGINX_CONTAINER head -20 "$LOGIN_PAGE"
else
  echo "Buscando página index.html:"
  INDEX_PAGE=$(docker exec $NGINX_CONTAINER find / -type f -name "index.html" | grep -v "node_modules" | head -1)
  if [ ! -z "$INDEX_PAGE" ]; then
    echo "Contenido de index.html (primeras 20 líneas):"
    docker exec $NGINX_CONTAINER head -20 "$INDEX_PAGE"
  else
    echo "No se encontró página index.html"
  fi
fi

echo -e "\n9. Verificando los archivos de cliente (client):"
echo "Directorio /client (si existe):"
docker exec $NGINX_CONTAINER ls -la /usr/share/nginx/html/client 2>/dev/null || echo "No se puede acceder al directorio /client"

echo -e "\n===== DIAGNÓSTICO DEL CONTENEDOR NGINX COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticoContenedor | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/fase3_diagnostico_contenedor_corregido.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔎 Ejecutando diagnóstico del contenedor Nginx..." -ForegroundColor Yellow
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/fase3_diagnostico_contenedor_corregido.sh && sh /tmp/fase3_diagnostico_contenedor_corregido.sh"

Write-Host @"
✅ Diagnóstico del contenedor Nginx completado.

Este análisis nos muestra:
1. La estructura interna del contenedor Nginx frontend
2. La ubicación real de los archivos HTML y JS
3. La configuración de Nginx y la raíz del servidor web
4. El contenido y estructura de los archivos de login

Con esta información podemos crear una solución adaptada a la estructura real del contenedor.
"@ -ForegroundColor Green
