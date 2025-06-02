# SOLUCIÓN DEFINITIVA PARA EL FRONTEND EN AWS
# Este script:
# 1. Identifica exactamente los contenedores en AWS
# 2. Obtiene logs del frontend para diagnosticar
# 3. Corrige las rutas API duplicadas en la raíz del problema
# 4. Soluciona los errores 500 de las páginas

$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

Write-Host "INICIANDO SOLUCIÓN DEFINITIVA PARA FRONTEND AWS" -ForegroundColor Green -BackgroundColor Black

# 1. Identificar los contenedores y la estructura real
Write-Host "`n[1/5] Verificando contenedores Docker existentes..." -ForegroundColor Cyan
$sshCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker ps -a'"
Invoke-Expression $sshCommand

# 2. Obtener logs del contenedor frontend para diagnosticar el problema
Write-Host "`n[2/5] Obteniendo logs del contenedor frontend..." -ForegroundColor Cyan
$sshCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker logs masclet-frontend-node 2>&1 | tail -n 100'"
Invoke-Expression $sshCommand

# 3. Respaldar los archivos JS actuales antes de modificarlos
Write-Host "`n[3/5] Creando respaldo y corrigiendo rutas duplicadas en archivos frontend..." -ForegroundColor Cyan
$sshBackupCommand = @'
ssh -i "$PEM_PATH" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node bash -c "
mkdir -p /backup
cp -r /app/dist /backup/dist_$(date +%Y%m%d%H%M%S)
cd /app/dist
find . -type f -name "*.js" -exec grep -l \"/api/v1/api/v1/\" {} \; | xargs -I{} sed -i \"s|/api/v1/api/v1/|/api/v1/|g\" {}
"'
'@
$sshBackupCommand = $sshBackupCommand.Replace('$PEM_PATH', $PEM_PATH).Replace('$EC2_IP', $EC2_IP)
Invoke-Expression $sshBackupCommand

# 4. Verificar la configuración de NODE_ENV en el frontend
Write-Host "`n[4/5] Estableciendo NODE_ENV=production para el contenedor frontend..." -ForegroundColor Cyan
$sshNodeEnvCommand = @'
ssh -i "$PEM_PATH" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node bash -c "
echo \"export NODE_ENV=production\" >> /etc/environment
echo \"Current NODE_ENV: \$NODE_ENV\"
"'
'@
$sshNodeEnvCommand = $sshNodeEnvCommand.Replace('$PEM_PATH', $PEM_PATH).Replace('$EC2_IP', $EC2_IP)
Invoke-Expression $sshNodeEnvCommand

# 5. Reiniciar el contenedor frontend para aplicar cambios
Write-Host "`n[5/5] Reiniciando contenedor frontend para aplicar cambios..." -ForegroundColor Cyan
$sshRestartCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker restart masclet-frontend-node'"
Invoke-Expression $sshRestartCommand

Write-Host "`nEsperando 10 segundos para que los servicios se inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar si el problema se ha resuelto
Write-Host "`nVerificando corrección..." -ForegroundColor Green
$verifyCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'curl -s http://localhost/api/v1/health'"
Invoke-Expression $verifyCommand

Write-Host "`nDiagnosticando la solución:" -ForegroundColor Green
python .\new_tests\complementos\comprobar_despliegue.py -u http://$EC2_IP -v
