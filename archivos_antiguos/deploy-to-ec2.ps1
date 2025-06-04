#!/usr/bin/env pwsh
# Script para desplegar Masclet Imperi en EC2
# Mayo 2025

# Parámetros
$EC2_KEY = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$EC2_USER = "ec2-user"
$EC2_IP = "108.129.139.119"
$LOCAL_PATH = "C:\Proyectos\claude\masclet-imperi-web"
$REMOTE_PATH = "/home/ec2-user/masclet-imperi"

# Crear un archivo ZIP temporal
Write-Host "✅ Creando archivo ZIP del repositorio..." -ForegroundColor Green
$tempZip = "$env:TEMP\masclet-imperi-deploy.zip"
if (Test-Path $tempZip) {
    Remove-Item $tempZip -Force
}

# Excluir directorios y archivos que no necesitamos en producción
$excludeList = @(
    ".git",
    "node_modules",
    "__pycache__",
    "*.pyc",
    "venv",
    ".vscode",
    ".idea"
)
$excludeParams = $excludeList | ForEach-Object { "-x", "*$_*" }

# Comprimir el repositorio (excluyendo directorios innecesarios)
$compressionArgs = @(
    "a",
    $tempZip,
    "$LOCAL_PATH\*"
) + $excludeParams

try {
    & 7z $compressionArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Error al crear archivo ZIP. Asegúrate de tener 7-Zip instalado."
    }
    Write-Host "✅ Archivo ZIP creado: $tempZip" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error al crear ZIP: $_" -ForegroundColor Red
    exit 1
}

# Crear directorios remotos
Write-Host "✅ Creando directorios en EC2..." -ForegroundColor Green
ssh -i $EC2_KEY $EC2_USER@$EC2_IP "sudo mkdir -p $REMOTE_PATH && sudo chown ec2-user:ec2-user $REMOTE_PATH"

# Transferir ZIP a EC2
Write-Host "✅ Transfiriendo archivo ZIP a EC2..." -ForegroundColor Green
& scp -i $EC2_KEY $tempZip "$EC2_USER@$EC2_IP:/tmp/masclet-deploy.zip"

# Descomprimir en EC2 y configurar
Write-Host "✅ Descomprimiendo y configurando en EC2..." -ForegroundColor Green
$command1 = @"
cd $REMOTE_PATH
rm -rf * || true
unzip -o /tmp/masclet-deploy.zip -d $REMOTE_PATH
rm -f /tmp/masclet-deploy.zip
mkdir -p logs backups
echo 'Contenido desplegado correctamente en $REMOTE_PATH'
"@
& ssh -i $EC2_KEY "$EC2_USER@$EC2_IP" $command1

Write-Host "✅ Preparando Docker en EC2..." -ForegroundColor Green
$command2 = @"
cd $REMOTE_PATH
# Verificar que los archivos de Docker existen
if [[ -f docker-compose.yml && -f backend/Dockerfile ]]; then
    echo '✅ Archivos Docker encontrados'
else
    echo '❌ Error: Faltan archivos Docker'
    exit 1
fi

# Crear archivo .env para Docker
cat > .env << EOL
POSTGRES_DB=masclet_imperi
POSTGRES_USER=masclet_admin
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
EOL

# Iniciar Docker
docker-compose up -d --build

# Verificar estado
docker-compose ps
"@
& ssh -i $EC2_KEY "$EC2_USER@$EC2_IP" $command2

# Limpiar
Remove-Item $tempZip -Force
Write-Host "✅ Despliegue completado. Verificar en EC2." -ForegroundColor Green
