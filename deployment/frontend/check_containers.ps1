# Script para verificar los contenedores y rutas en el servidor AWS

# Parámetros de conexión
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

Write-Host "Verificando contenedores Docker en el servidor..." -ForegroundColor Cyan
$dockerPsCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo docker ps -a'"
Invoke-Expression $dockerPsCommand

Write-Host "`nVerificando estructura de directorios..." -ForegroundColor Cyan
$lsCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'ls -la /home/ec2-user/'"
Invoke-Expression $lsCommand

Write-Host "`nVerificando configuración de Nginx..." -ForegroundColor Cyan
$findNginxCommand = "ssh -i '$PEM_PATH' ec2-user@$EC2_IP 'sudo find / -name \"*.conf\" -type f -exec grep -l \"proxy_pass\" {} \; 2>/dev/null'"
Invoke-Expression $findNginxCommand
