# Script simplificado para instalar es-module-lexer
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Comando para instalar la dependencia
$installCommand = 'sudo docker exec masclet-frontend-node bash -c "cd /app && npm install es-module-lexer --save"'
$sshInstallCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP $installCommand"

Write-Host "Instalando es-module-lexer..." -ForegroundColor Cyan
Invoke-Expression $sshInstallCmd

# Reiniciar el contenedor
$restartCommand = 'sudo docker restart masclet-frontend-node'
$sshRestartCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP $restartCommand"

Write-Host "Reiniciando contenedor frontend..." -ForegroundColor Yellow
Invoke-Expression $sshRestartCmd

Write-Host "Esperando 10 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar funcionamiento
Write-Host "Verificando estado..." -ForegroundColor Green
$checkCommand = 'curl -s http://localhost/'
$sshCheckCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP $checkCommand"
Invoke-Expression $sshCheckCmd
