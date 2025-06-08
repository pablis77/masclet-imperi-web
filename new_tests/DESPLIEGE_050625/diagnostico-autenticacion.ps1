# Script para diagnosticar problemas de autenticación en Masclet Imperi
# Este script realiza pruebas específicas para entender por qué falla la autenticación

Write-Host "🔍 Iniciando diagnóstico avanzado de autenticación..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script de diagnóstico de autenticación
$diagnosticScript = @'
#!/bin/bash
set -e

echo "===== DIAGNÓSTICO AVANZADO DE AUTENTICACIÓN ====="
echo "* Este proceso comprobará específicamente el proceso de autenticación"

echo -e "\n1. Verificando endpoint de autenticación desde backend (Curl con depuración)..."
echo "   - Instalando curl en el contenedor API..."
docker exec masclet-api apt-get update -y
docker exec masclet-api apt-get install -y curl

echo -e "\n2. Probando autenticación directamente desde el backend..."
echo "   - Realizando prueba de login con formato JSON:"
docker exec masclet-api curl -v -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

echo -e "\n3. Probando autenticación con formato de formulario..."
docker exec masclet-api curl -v -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin&password=admin123'

echo -e "\n4. Verificando configuración CORS del backend..."
docker exec masclet-api curl -v -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H 'Origin: http://34.253.203.194' \
  -H 'Access-Control-Request-Method: POST'

echo -e "\n5. Verificando el endpoint desde el contenedor Node.js..."
docker exec masclet-frontend-node curl -v -X POST http://masclet-api:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

echo -e "\n6. Verificando rutas en el proxy Nginx..."
docker exec masclet-frontend curl -v -X POST http://localhost/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

echo -e "\n7. Verificando cabeceras de respuesta del backend..."
docker exec masclet-frontend-node curl -I http://masclet-api:8000/api/v1/auth/login

echo -e "\n8. Comprobando logs recientes relacionados con autenticación..."
echo "   - Logs del backend (API):"
docker logs masclet-api --tail 50 | grep -i "auth\|login\|error\|token" | tail -n 20

echo -e "\n9. Comprobando las variables de entorno del backend..."
docker exec masclet-api env | grep -i "SECRET\|TOKEN\|JWT\|AUTH"

echo -e "\n===== DIAGNÓSTICO COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/diagnostico-autenticacion.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🧪 Ejecutando diagnóstico avanzado de autenticación..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/diagnostico-autenticacion.sh && sh /tmp/diagnostico-autenticacion.sh"

Write-Host @"
✅ Proceso de diagnóstico completado.

Basado en los resultados, vamos a:
1. Verificar si el formato de la petición de login es correcto
2. Comprobar si hay problemas de CORS
3. Analizar si hay alguna incompatibilidad entre frontend y backend

Una vez identificado el problema exacto, crearemos un script para corregirlo.
"@ -ForegroundColor Green
