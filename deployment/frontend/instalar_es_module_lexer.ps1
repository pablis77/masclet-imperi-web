# Conexión SSH y ejecución de comandos para instalar es-module-lexer
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Comando directo para instalar la dependencia faltante
$sshCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node bash -c \"cd /app && npm install es-module-lexer --save\"'"

Write-Host "Ejecutando comando para instalar es-module-lexer..." -ForegroundColor Cyan
Invoke-Expression $sshCommand

# Reiniciamos el contenedor
$restartCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker restart masclet-frontend-node'"
Write-Host "Reiniciando el contenedor frontend..." -ForegroundColor Yellow
Invoke-Expression $restartCommand

Write-Host "Esperando 10 segundos para que el contenedor se reinicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Comprobamos que funciona
Write-Host "Verificando el estado del frontend..." -ForegroundColor Green
$verifyCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'curl -s http://localhost/'"
Invoke-Expression $verifyCommand
