# Script para enviar y ejecutar la solución de rutas duplicadas en AWS

# Parámetros de conexión
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

Write-Host "Enviando script de corrección a $EC2_IP..." -ForegroundColor Cyan

# Enviar el script de corrección al servidor
$scpCommand = "scp -i '$PEM_PATH' '.\deployment\frontend\fix_api_duplication.sh' ec2-user@${EC2_IP}:/home/ec2-user/fix_api_duplication.sh"
Invoke-Expression $scpCommand

# Dar permisos de ejecución y ejecutar el script
$sshCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/fix_api_duplication.sh && sudo /home/ec2-user/fix_api_duplication.sh'"
Write-Host "Ejecutando script de corrección en el servidor..." -ForegroundColor Yellow
Invoke-Expression $sshCommand

Write-Host "Esperando 10 segundos para que los cambios se apliquen..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Verificar que el problema se ha resuelto
Write-Host "Verificando corrección..." -ForegroundColor Green
$verifyCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'curl -s http://localhost/api/v1/health'"
Invoke-Expression $verifyCommand

Write-Host "`nEjecutando diagnóstico completo..." -ForegroundColor Green
python .\new_tests\complementos\comprobar_despliegue.py -u http://$EC2_IP -v

Write-Host "`n¡Proceso completado!" -ForegroundColor Green
