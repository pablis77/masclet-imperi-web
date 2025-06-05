# Script para verificar espacio disponible en el servidor AWS
# Fecha de creación: 05/06/2025
# Este script analiza el espacio disponible en el servidor AWS y muestra información
# detallada sobre el uso de disco, contenedores Docker y archivos

# Configuración
$AWSKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2User = "ec2-user"
$EC2Address = "108.129.139.119"

# Funciones de ayuda
function Write-Header {
    param (
        [string]$Title
    )
    Write-Host "" 
    Write-Host "$Title" -ForegroundColor Green
    Write-Host "-------------------------------------------" -ForegroundColor DarkGray
}

# Mostrar cabecera
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   ANÁLISIS DE ESPACIO EN SERVIDOR AWS" -ForegroundColor Cyan  
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Host "Servidor: $EC2Address"
Write-Host "Usuario: $EC2User"

# 1. Espacio total del sistema
Write-Header "1. ESPACIO TOTAL DEL SISTEMA"
$diskSpace = ssh -i $AWSKey $EC2User@$EC2Address "df -h /"
Write-Host $diskSpace

# 2. Información de contenedores Docker
Write-Header "2. INFORMACIÓN DE CONTENEDORES DOCKER"
$dockerInfo = ssh -i $AWSKey $EC2User@$EC2Address "docker ps -a"
Write-Host $dockerInfo

# 3. Espacio usado por imágenes Docker
Write-Header "3. ESPACIO USADO POR IMÁGENES DOCKER"
$dockerImages = ssh -i $AWSKey $EC2User@$EC2Address "docker images"
Write-Host $dockerImages

# 4. Espacio usado por volúmenes Docker
Write-Header "4. ESPACIO USADO POR VOLÚMENES DOCKER"
$dockerVolumes = ssh -i $AWSKey $EC2User@$EC2Address "docker volume ls"
Write-Host $dockerVolumes

# 5. Directorio home
Write-Header "5. ESPACIO USADO EN HOME"
$homeSpace = ssh -i $AWSKey $EC2User@$EC2Address "du -sh /home/ec2-user"
Write-Host $homeSpace

# 6. Espacio disponible para despliegue
Write-Header "6. ESPACIO DISPONIBLE PARA DESPLIEGUE"
$availableSpace = ssh -i $AWSKey $EC2User@$EC2Address "df -h / | tail -n 1 | awk '{print \$4}'"
Write-Host "Espacio disponible: $availableSpace"
Write-Host "Recomendación: Un despliegue completo de 3 contenedores necesita 1-2GB libres mínimo" -ForegroundColor Yellow

# 7. Sistema operativo y uptime
Write-Header "7. INFORMACIÓN DEL SISTEMA"
$sysInfo = ssh -i $AWSKey $EC2User@$EC2Address "cat /etc/os-release | grep PRETTY_NAME; uptime"
Write-Host $sysInfo

# Conclusión
Write-Host "" 
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   ANÁLISIS COMPLETADO" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
