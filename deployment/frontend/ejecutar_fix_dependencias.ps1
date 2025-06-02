# Script PowerShell para transferir y ejecutar la solución de dependencias faltantes

# Parámetros de conexión
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

Write-Host "Transfiriendo script de solución al servidor AWS..." -ForegroundColor Cyan
$scpCommand = "scp -i '$PEM_PATH' '.\deployment\frontend\instalar_dependencia_faltante.sh' ec2-user@${EC2_IP}:/home/ec2-user/instalar_dependencia_faltante.sh"
Invoke-Expression $scpCommand

Write-Host "Dando permisos de ejecución y entrando al contenedor para instalar la dependencia..." -ForegroundColor Yellow
$sshCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'chmod +x /home/ec2-user/instalar_dependencia_faltante.sh && sudo docker exec -it masclet-frontend-node bash -c \"bash < /home/ec2-user/instalar_dependencia_faltante.sh\"'"
Invoke-Expression $sshCommand

Write-Host "Reiniciando el contenedor frontend para aplicar los cambios..." -ForegroundColor Cyan
$restartCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker restart masclet-frontend-node'"
Invoke-Expression $restartCommand

Write-Host "Esperando 15 segundos para que el contenedor se inicie completamente..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Verificando solución..." -ForegroundColor Green
$checkCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'curl -s http://localhost/'"
Invoke-Expression $checkCommand

Write-Host "`nEjecutando diagnóstico completo..." -ForegroundColor Green
python .\new_tests\complementos\comprobar_despliegue.py -u http://$EC2_IP -v
