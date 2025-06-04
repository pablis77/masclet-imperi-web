# Script para transferir y ejecutar el arreglo DNS
$AWS_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_IP = "108.129.139.119"
$REMOTE_DIR = "/home/ec2-user/masclet-imperio-fix"

Write-Host "🔧 Transfiriendo y ejecutando arreglo DNS definitivo..." -ForegroundColor Cyan

# Transferir archivo
Write-Host "📤 Transfiriendo script de arreglo..." -ForegroundColor Yellow
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "mkdir -p $REMOTE_DIR"
scp -i $AWS_KEY ".\arreglo-final-dns.sh" "ec2-user@${EC2_IP}:$REMOTE_DIR/"

# Ejecutar remotamente
Write-Host "🚀 Ejecutando arreglo DNS en servidor remoto..." -ForegroundColor Green
ssh -i $AWS_KEY "ec2-user@$EC2_IP" "cd $REMOTE_DIR && chmod +x arreglo-final-dns.sh && sudo ./arreglo-final-dns.sh"

Write-Host "✅ Operación completada. Verificando web en http://${EC2_IP}/" -ForegroundColor Cyan
