param (
    [Parameter(Mandatory=$true)]
    [string]$SourceEC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$TargetEC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEM_PATH
)

# Mensajes informativos
Write-Host "Iniciando despliegue de EC2 ($SourceEC2_IP) a EC2 ($TargetEC2_IP)..." -ForegroundColor Cyan

# 1. Verificamos conexión con ambas instancias
Write-Host "Verificando conexiones SSH..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" -o "StrictHostKeyChecking=no" ec2-user@$SourceEC2_IP "echo 'Conexión con origen establecida'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo conectar con la instancia de origen" -ForegroundColor Red
    exit 1
}

ssh -i "$PEM_PATH" -o "StrictHostKeyChecking=no" ec2-user@$TargetEC2_IP "echo 'Conexión con destino establecida'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se pudo conectar con la instancia de destino" -ForegroundColor Red
    exit 1
}

# 2. Respaldamos y empaquetamos la aplicación en el origen
Write-Host "Deteniendo servicios en origen y creando respaldo..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$SourceEC2_IP @"
    cd /home/ec2-user/masclet-imperi
    sudo docker-compose -f docker-compose.yml down
    sudo tar -czf /tmp/masclet-backup.tar.gz ./*
    echo 'Respaldo creado en /tmp/masclet-backup.tar.gz'
"@

# 3. Configuramos autenticación entre las instancias EC2
Write-Host "Configurando autenticación entre instancias..." -ForegroundColor Yellow
# Copiamos la clave PEM al servidor origen
scp -i "$PEM_PATH" "$PEM_PATH" ec2-user@$SourceEC2_IP:/home/ec2-user/ec2-key.pem
ssh -i "$PEM_PATH" ec2-user@$SourceEC2_IP "chmod 400 /home/ec2-user/ec2-key.pem"

# 4. Transferimos el backup del origen al destino
Write-Host "Transfiriendo backup de origen a destino..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$SourceEC2_IP @"
    scp -i /home/ec2-user/ec2-key.pem -o StrictHostKeyChecking=no /tmp/masclet-backup.tar.gz ec2-user@$TargetEC2_IP:/tmp/
    echo 'Transferencia completada'
"@

# 5. Desplegamos en el destino
Write-Host "Desplegando en la instancia destino..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$TargetEC2_IP @"
    sudo mkdir -p /home/ec2-user/masclet-imperi
    sudo tar -xzf /tmp/masclet-backup.tar.gz -C /home/ec2-user/masclet-imperi
    cd /home/ec2-user/masclet-imperi
    sudo docker-compose -f docker-compose.yml up -d
    echo 'Despliegue completado'
"@

# 6. Limpieza
Write-Host "Limpiando archivos temporales..." -ForegroundColor Yellow
ssh -i "$PEM_PATH" ec2-user@$SourceEC2_IP "rm -f /tmp/masclet-backup.tar.gz /home/ec2-user/ec2-key.pem"
ssh -i "$PEM_PATH" ec2-user@$TargetEC2_IP "rm -f /tmp/masclet-backup.tar.gz"

Write-Host "¡Despliegue EC2 a EC2 completado con éxito!" -ForegroundColor Green
