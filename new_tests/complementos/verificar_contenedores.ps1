# Script para verificar contenedores Docker en el servidor
param (
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

Write-Host "🔍 Verificando contenedores Docker en $EC2_IP..." -ForegroundColor Cyan

# 1. Verificar conexión SSH
$sshTest = ssh -i "$PEM_PATH" ec2-user@$EC2_IP "echo Conexion SSH exitosa"
if (-not $?) {
    Write-Host "❌ Error en conexión SSH. Verifica IP y clave PEM." -ForegroundColor Red
    exit 1
}

# 2. Verificar si Docker está instalado y qué contenedores están corriendo
Write-Host "`n📋 Verificando instalación de Docker..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker --version"

Write-Host "`n📋 Listando contenedores activos..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker ps"

Write-Host "`n📋 Listando todos los contenedores (incluyendo detenidos)..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker ps -a"

# 3. Verificar configuración de red de Docker
Write-Host "`n📋 Verificando redes Docker..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker network ls"

# 4. Verificar docker-compose si existe
Write-Host "`n📋 Verificando Docker Compose..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "docker-compose --version || echo 'Docker Compose no instalado'"

# 5. Buscar archivos docker-compose.yml
Write-Host "`n📋 Buscando archivos docker-compose.yml..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "find /home/ec2-user -name 'docker-compose.yml' -type f 2>/dev/null || echo 'No se encontraron archivos docker-compose.yml'"

# 6. Verificar estado de Nginx (podría estar instalado directamente en el host)
Write-Host "`n📋 Verificando estado de Nginx (si está instalado en el host)..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "systemctl status nginx 2>/dev/null || echo 'Nginx no instalado como servicio del sistema'"

# 7. Examinar estructura de directorios importantes
Write-Host "`n📋 Estructura de directorios importantes..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$EC2_IP "ls -la /home/ec2-user/masclet-imperi 2>/dev/null || echo 'Directorio no encontrado'"

Write-Host "`n✅ Verificación completada." -ForegroundColor Green
