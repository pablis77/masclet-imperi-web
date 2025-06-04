# Script para corregir la configuración de Nginx en producción
# Corrige el problema de redirección de la API y la resolución de 'masclet-api'
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

# Verificar conexión SSH
Write-ColorText "🔑 Verificando conexión SSH..." "Yellow"
try {
    $sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexión SSH exitosa"
    Write-ColorText "✅ Conexión SSH verificada" "Green"
} catch {
    Write-ColorText "❌ Error en conexión SSH. Verifica IP y clave PEM." "Red"
    exit 1
}

# Crear una nueva configuración de Nginx que corrija el problema de redirección API
Write-ColorText "📝 Creando nueva configuración de Nginx..." "Yellow"

$nginxConfig = @"
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Redirect API calls to localhost:8000 instead of masclet-api
    location /api/ {
        # Use localhost:8000 instead of masclet-api
        proxy_pass http://localhost:8000/api/v1/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve frontend static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
"@

# Guardar config en archivo temporal
$tempFile = New-TemporaryFile
$nginxConfig | Out-File -FilePath $tempFile -Encoding utf8

# Transferir archivo al servidor
Write-ColorText "📤 Transfiriendo configuración Nginx al servidor..." "Yellow"
$scpCommand = "scp -i `"$PEM_PATH`" `"$tempFile`" ec2-user@${EC2_IP}:/tmp/nginx.conf"
Invoke-Expression $scpCommand

# Hacer backup de la configuración actual
Write-ColorText "💾 Haciendo backup de configuración actual..." "Yellow"
$backupCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak'"
Invoke-Expression $backupCommand

# Aplicar nueva configuración
Write-ColorText "🔧 Aplicando nueva configuración..." "Yellow"
$applyCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf'"
Invoke-Expression $applyCommand

# Eliminar archivo temporal local
Remove-Item -Path $tempFile

# Reiniciar Nginx
Write-ColorText "🔄 Reiniciando Nginx..." "Yellow"
$restartCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo systemctl restart nginx'"
Invoke-Expression $restartCommand

# Mostrar configuración aplicada
Write-ColorText "✅ Configuración actualizada. Verificando..." "Green"
$verifyCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo cat /etc/nginx/conf.d/default.conf'"
Invoke-Expression $verifyCommand

# Realizar prueba de verificación final de login
Write-ColorText "`n🔍 Ejecutando prueba de autenticación..." "Cyan"
$pythonTest = @"
import requests
import json

print('Prueba de autenticación API')
print('==========================')

# Configuración
TARGET_HOST = '$($EC2_IP)'
BASE_URL = f'http://{TARGET_HOST}'

# Datos de login
login_data = {
    'username': 'admin',
    'password': 'admin123',
    'grant_type': 'password'
}
headers = {'Content-Type': 'application/x-www-form-urlencoded'}

# Probar login con la ruta correcta
url = f'{BASE_URL}/api/auth/login'
print(f'Probando login en: {url}')

try:
    response = requests.post(url, data=login_data, headers=headers, timeout=10)
    if response.status_code == 200 and 'access_token' in response.text:
        print('✅ Login exitoso! La corrección funciona.')
        token = response.json().get('access_token', '')[:30]
        print(f'Token: {token}...')
    else:
        print(f'❌ Login fallido. Status: {response.status_code}')
        print(f'Respuesta: {response.text[:100]}...')
except Exception as e:
    print(f'❌ Error: {str(e)}')

print('Prueba completada.')
"@

# Guardar y ejecutar test
$testPath = "$env:TEMP\nginx_test.py"
$pythonTest | Out-File -FilePath $testPath -Encoding utf8
python $testPath

# Limpiar archivo temporal
Remove-Item $testPath -Force

Write-ColorText "`n✅ La corrección ha sido aplicada. Prueba ahora la aplicación en el navegador." "Green"
Write-ColorText "   Para acceder a la aplicación: http://$EC2_IP/" "Cyan"
