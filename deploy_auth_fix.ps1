# Script para desplegar corrección de autenticación en AWS
# Uso: .\deploy_auth_fix.ps1 -EC2_IP <ip-publica-ec2> -PEM_PATH <ruta-clave-pem>

param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🚀 Iniciando despliegue de correcciones de autenticación en $EC2_IP..." -ForegroundColor Cyan

# 1. Verificar conexión SSH
Write-Host "🔑 Verificando conexión SSH..." -ForegroundColor Yellow
$sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexion SSH exitosa"
if (-not $?) {
    Write-Host "❌ Error en conexión SSH. Verifica IP y clave PEM." -ForegroundColor Red
    exit 1
}

# 2. Crear directorio temporal para los archivos a transferir
Write-Host "📁 Creando directorios temporales..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "mkdir -p /home/ec2-user/temp_fix/frontend/src/services/ /home/ec2-user/temp_fix/backend/app/core/"

# 3. Copiar archivos corregidos
Write-Host "📦 Copiando archivos corregidos..." -ForegroundColor Yellow
scp -i "$PEM_PATH" "$(Get-Location)\frontend\src\services\authService.ts" ec2-user@$EC2_IP:/home/ec2-user/temp_fix/frontend/src/services/
scp -i "$PEM_PATH" "$(Get-Location)\backend\app\core\auth.py" ec2-user@$EC2_IP:/home/ec2-user/temp_fix/backend/app/core/

# 4. Aplicar los cambios en el entorno de producción
Write-Host "🔄 Aplicando correcciones en producción..." -ForegroundColor Yellow

# Detener contenedores si existen
Write-Host "⏸️ Deteniendo servicios..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker stop masclet-api 2>/dev/null || true"

# Copiar archivos corregidos a las ubicaciones correctas en el contenedor
Write-Host "📋 Actualizando archivos en producción..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP @"
sudo cp /home/ec2-user/temp_fix/frontend/src/services/authService.ts /home/ec2-user/masclet-imperi/frontend/src/services/
sudo cp /home/ec2-user/temp_fix/backend/app/core/auth.py /home/ec2-user/masclet-imperi/backend/app/core/
"@

# 5. Reiniciar los servicios
Write-Host "▶️ Reiniciando servicios..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker start masclet-api"

# 6. Verificar el estado de los servicios
Write-Host "✅ Verificando estado de servicios..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "sudo docker ps -a | grep masclet"

# 7. Ejecutar el script de diagnóstico
Write-Host "🔍 Ejecutando diagnóstico..." -ForegroundColor Yellow
$pythonScript = @"
import requests
import json
from datetime import datetime
import sys
import os

print('\n\033[94m==========================================\033[0m')
print('\033[94mDIAGNÓSTICO RÁPIDO DE AUTENTICACIÓN\033[0m')
print('\033[94m==========================================\033[0m')

# Configuración
TARGET_HOST = '$($EC2_IP)' 
BASE_URL = f'http://{TARGET_HOST}'
API_URL = f'{BASE_URL}/api/v1'
USERNAME = 'admin'
PASSWORD = 'admin123'

# Intentar login con OAuth2 estándar
login_data_form = {
    'username': USERNAME,
    'password': PASSWORD,
    'grant_type': 'password'
}
headers_form = {'Content-Type': 'application/x-www-form-urlencoded'}

# Verificar primera ruta de login que debe funcionar después de la corrección
print('\n\033[96mVerificando ruta de login con OAuth2 estándar...\033[0m')
try:
    login_url = f'{API_URL}/auth/login'
    print(f'URL: {login_url}')
    response = requests.post(login_url, data=login_data_form, headers=headers_form, timeout=5)
    if response.status_code == 200:
        print('\033[92m✓ Login exitoso! La autenticación funciona correctamente\033[0m')
        print(f'Respuesta: {response.json()}')
        token = response.json().get('access_token')
        if token:
            print(f'Token: {token[:20]}...')
    else:
        print(f'\033[93m⚠ Respuesta inesperada: {response.status_code}\033[0m')
        print(f'Contenido: {response.text[:200]}')
except Exception as e:
    print(f'\033[91m✗ Error: {str(e)}\033[0m')

print('\n\033[96mDiagnóstico completado.\033[0m')
"@

# Guardar el script temporalmente y ejecutarlo
$scriptPath = "$env:TEMP\auth_test.py"
$pythonScript | Out-File -FilePath $scriptPath -Encoding utf8
python $scriptPath

# Limpiar archivos temporales
Remove-Item $scriptPath -Force

Write-Host "🎉 Despliegue de corrección completado!" -ForegroundColor Green
Write-Host "   API disponible en: http://$EC2_IP:8000/api/v1/" -ForegroundColor Cyan
