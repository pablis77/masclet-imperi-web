# Parte 3: Verificación del login
# Este script verifica que la solución implementada esté funcionando correctamente

Write-Host "🔍 Iniciando verificación del login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para verificación del login
$verificarLoginScript = @'
#!/bin/bash
set -e

echo "===== VERIFICACIÓN DEL LOGIN ====="

# 1. Instalar herramientas si no están disponibles
echo -e "\n1. Preparando herramientas de verificación..."
docker exec masclet-frontend sh -c "command -v curl || apk add --no-cache curl"

# 2. Verificar la configuración de Nginx
echo -e "\n2. Verificando configuración de Nginx..."
docker exec masclet-frontend sh -c "cat /etc/nginx/conf.d/default.conf | grep -A 10 'api'"
docker exec masclet-frontend sh -c "ls -la /etc/nginx/conf.d/ | grep auth"

# 3. Probar autenticación directamente contra el backend
echo -e "\n3. Probando autenticación directamente contra el backend..."

echo -e "\n3.1 Prueba con formato x-www-form-urlencoded (OAuth2):"
docker exec masclet-frontend sh -c "curl -s -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=admin&password=admin123' http://masclet-api:8000/api/v1/auth/login" | grep -E 'access_token|user|role|error|detail'

echo -e "\n3.2 Prueba con formato JSON:"
docker exec masclet-frontend sh -c "curl -s -X POST -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}' http://masclet-api:8000/api/v1/auth/login" | grep -E 'access_token|user|role|error|detail'

# 4. Verificar la inyección del script de corrección
echo -e "\n4. Verificando la inyección del script de corrección..."
docker exec masclet-frontend sh -c "grep -r 'login-direct-fix.js' /usr/share/nginx/html/ | wc -l"

# 5. Verificar los archivos HTML relevantes para el login
echo -e "\n5. Verificando archivos HTML relevantes..."
docker exec masclet-frontend sh -c "find /usr/share/nginx/html -type f -name 'index.html' -o -name '*login*.html' | xargs grep -l '<form'"

echo -e "\n===== VERIFICACIÓN COMPLETADA ====="
echo "Revise los resultados anteriores para confirmar que la solución está funcionando."
echo "Para probar el login, acceda a: http://34.253.203.194/login"
echo "Use las credenciales: admin / admin123"
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$verificarLoginScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/parte3_verificar_login.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔎 Ejecutando verificación del login..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/parte3_verificar_login.sh && sh /tmp/parte3_verificar_login.sh"

Write-Host @"
✅ Verificación del login completada.

Para probar la solución:

1. Accede a http://34.253.203.194/login
2. Utiliza las credenciales:
   - Usuario: admin
   - Contraseña: admin123
3. Verifica que:
   - El login funciona correctamente
   - Se redirige al dashboard
   - Los datos se cargan correctamente
   - El logout también funciona sin quedarse colgado

Si existiera algún problema, podemos realizar ajustes adicionales según los resultados de la verificación.
"@ -ForegroundColor Green
