# Parte 1: Diagnóstico específico del login
# Este script examina el problema de login en detalle

Write-Host "🔍 Iniciando diagnóstico específico del login..." -ForegroundColor Cyan

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script para diagnóstico del login
$diagnosticoLoginScript = @'
#!/bin/bash
set -e

echo "===== DIAGNÓSTICO ESPECÍFICO DEL LOGIN ====="

# 1. Encontrar archivos de login y autenticación
echo -e "\n1. Buscando archivos relacionados con login y autenticación..."
echo "En el contenedor frontend-nginx:"
docker exec masclet-frontend find /usr/share/nginx/html -type f -name "*.js" | grep -E 'login|auth|usuario'
docker exec masclet-frontend find /usr/share/nginx/html -type f -name "*.html" | grep -E 'login|auth|usuario'

echo -e "\nEn el contenedor frontend-node:"
docker exec masclet-frontend-node find /app -type f -name "*.js" | grep -E 'login|auth|usuario'

# 2. Examinar configuración de Nginx para rutas de autenticación
echo -e "\n2. Examinando configuración de Nginx para rutas de autenticación..."
docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "/api/"

# 3. Probar autenticación directamente contra el API
echo -e "\n3. Probando autenticación directamente contra el API..."
echo "Instalando curl en contenedor frontend si no existe..."
docker exec masclet-frontend sh -c "command -v curl || apk add --no-cache curl"

echo -e "\nProbando login con usuario admin y password correcta..."
docker exec masclet-frontend curl -v -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  http://masclet-api:8000/api/v1/auth/login 2>&1

echo -e "\nProbando formato JSON alternativo..."
docker exec masclet-frontend curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  http://masclet-api:8000/api/v1/auth/login 2>&1

# 4. Verificar usuarios en la base de datos
echo -e "\n4. Verificando usuarios en la base de datos..."
docker exec masclet-api python -c "
import os, sys, asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from databases import Database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Intentar usar variables de entorno si están disponibles
db_user = os.getenv('POSTGRES_USER', 'postgres')
db_pass = os.getenv('POSTGRES_PASSWORD', 'postgres')
db_name = os.getenv('POSTGRES_DB', 'masclet_db')
db_host = os.getenv('POSTGRES_HOST', 'masclet-db')
db_port = os.getenv('POSTGRES_PORT', '5432')

connection_str = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

try:
    # Crear motor de base de datos síncrono para consulta rápida
    engine = create_engine(connection_str)
    
    # Ejecutar consulta para obtener usuarios
    with engine.connect() as conn:
        result = conn.execute(text('SELECT id, username, role, is_active, hashed_password FROM users'))
        users = result.fetchall()
        
        print(f'\nUsuarios en la base de datos:')
        print('-' * 70)
        print(f'{"ID":3} | {"Username":15} | {"Role":10} | {"Active":6} | {"Password Hash"}')
        print('-' * 70)
        for user in users:
            # Mostrar solo primeros 20 caracteres del hash para mayor legibilidad
            pw_hash = str(user[4])[:20] + '...' if user[4] and len(str(user[4])) > 20 else user[4]
            print(f'{user[0]:<3} | {user[1]:<15} | {user[2]:<10} | {str(user[3]):<6} | {pw_hash}')
    
except Exception as e:
    print(f'Error al conectar a la base de datos: {e}')
    sys.exit(1)
"

# 5. Examinar archivos JavaScript específicos del frontend para el login
echo -e "\n5. Examinando comportamiento del login en el frontend..."
AUTH_FILE=$(docker exec masclet-frontend find /usr/share/nginx/html -type f -name "*.js" | grep -E 'auth|login' | head -1)

if [ ! -z "$AUTH_FILE" ]; then
    echo "Encontrado archivo potencial de autenticación: $AUTH_FILE"
    echo "Examinando contenido relevante..."
    docker exec masclet-frontend grep -A 10 -B 5 "login\|auth\|/api/v1/auth" "$AUTH_FILE" || echo "No se encontraron patrones de autenticación relevantes"
else
    echo "No se encontraron archivos específicos de autenticación"
fi

# 6. Verificar logs específicos del backend para errores de autenticación
echo -e "\n6. Verificando logs del backend para errores de autenticación..."
docker logs masclet-api 2>&1 | grep -E "auth|login|ERROR|usuario|password" | tail -20

echo -e "\n===== DIAGNÓSTICO COMPLETADO ====="
echo "Revise la información anterior para entender el problema de autenticación."
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$diagnosticoLoginScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/parte1_diagnostico_login.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "🔎 Ejecutando diagnóstico específico del login..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/parte1_diagnostico_login.sh && sh /tmp/parte1_diagnostico_login.sh"

Write-Host @"
✅ Diagnóstico del login completado.

Este diagnóstico nos ha proporcionado:
1. Identificación de archivos relacionados con la autenticación
2. Verificación de la configuración de Nginx para las rutas de autenticación
3. Pruebas directas contra el API para diferentes formatos de login
4. Verificación de usuarios existentes en la base de datos
5. Análisis del código JavaScript del frontend para el login
6. Revisión de logs del backend para errores de autenticación

Con esta información, ahora podemos crear la solución específica para el problema de login.
"@ -ForegroundColor Green
