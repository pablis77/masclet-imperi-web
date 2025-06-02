# SOLUCIÓN DEFINITIVA Y REAL PARA EL FRONTEND
# Sin más vueltas, sin más teoría, directo a resolver

$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Crear el .dockerignore correcto
$dockerignore = @'
node_modules
dist
.git
.github
docs
'@

# Dockerfile optimizado que REALMENTE funciona
$dockerfile = @'
FROM node:18

WORKDIR /app

# Copiar solo los archivos necesarios
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Configurar variables entorno (con API_URL correcta)
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV API_URL=http://108.129.139.119:8000

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
'@

# Guardar en directorio frontend
$dockerignorePath = "C:\Proyectos\claude\masclet-imperi-web\frontend\.dockerignore"
$dockerfilePath = "C:\Proyectos\claude\masclet-imperi-web\frontend\Dockerfile"

$dockerignore | Out-File -FilePath $dockerignorePath -Encoding utf8
$dockerfile | Out-File -FilePath $dockerfilePath -Encoding utf8

Write-Host "Creando archivo 'deploy.sh' en el servidor..." -ForegroundColor Cyan

$deployScript = @'
#!/bin/bash
set -e

echo "=== DESPLEGANDO FRONTEND - SOLUCIÓN DEFINITIVA ==="

# Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
sudo docker stop masclet-frontend masclet-frontend-node 2>/dev/null || true
sudo docker rm masclet-frontend masclet-frontend-node 2>/dev/null || true

# Ir al directorio del frontend
cd ~/frontend

# Construir imagen
echo "Construyendo imagen Docker del frontend..."
sudo docker build -t masclet-frontend:latest .

# Ejecutar contenedor
echo "Ejecutando contenedor del frontend..."
sudo docker run -d --name masclet-frontend --network masclet-network -p 80:80 masclet-frontend

# Mostrar estado
echo "Estado del contenedor:"
sudo docker ps | grep masclet-frontend

echo "=== FRONTEND DESPLEGADO ==="
echo "Verificando acceso:"
curl -s http://localhost | head -10

echo "El frontend debe estar accesible en http://108.129.139.119"
'@

# Crear archivo temporal con el script de despliegue
$tempFile = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempFile -Encoding utf8

# Transferir el Dockerfile, .dockerignore y script de despliegue al servidor
Write-Host "Transfiriendo archivos de configuración al servidor..." -ForegroundColor Cyan
$scpDockerfile = "scp -i `"$PEM_PATH`" `"$dockerfilePath`" ec2-user@$EC2_IP`:~/frontend/Dockerfile"
$scpDockerignore = "scp -i `"$PEM_PATH`" `"$dockerignorePath`" ec2-user@$EC2_IP`:~/frontend/.dockerignore"
$scpDeploy = "scp -i `"$PEM_PATH`" `"$tempFile`" ec2-user@$EC2_IP`:~/deploy.sh"

Invoke-Expression $scpDockerfile
Invoke-Expression $scpDockerignore
Invoke-Expression $scpDeploy

# Verificar y crear directorio frontend si no existe
Write-Host "Verificando directorio frontend en el servidor..." -ForegroundColor Cyan
$sshMkdir = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'mkdir -p ~/frontend'"
Invoke-Expression $sshMkdir

# Comprimir directorio frontend para transferencia rápida
Write-Host "Comprimiendo directorio frontend para transferencia..." -ForegroundColor Cyan
$frontendDir = "C:\Proyectos\claude\masclet-imperi-web\frontend"
$frontendZip = "$env:TEMP\frontend.zip"
$compress = @{
    Path = "$frontendDir\*"
    CompressionLevel = "Fastest"
    DestinationPath = $frontendZip
    Exclude = "node_modules", "dist", ".git"
}
Compress-Archive @compress -Force

# Transferir archivo comprimido al servidor
Write-Host "Transfiriendo código frontend al servidor..." -ForegroundColor Cyan
$scpZip = "scp -i `"$PEM_PATH`" `"$frontendZip`" ec2-user@$EC2_IP`:~/frontend.zip"
Invoke-Expression $scpZip

# Descomprimir en el servidor y ejecutar despliegue
Write-Host "Descomprimiendo y desplegando en el servidor..." -ForegroundColor Green
$sshUnzip = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'unzip -o ~/frontend.zip -d ~/frontend && chmod +x ~/deploy.sh && ~/deploy.sh'"
Invoke-Expression $sshUnzip

# Limpiar archivos temporales
Remove-Item -Path $tempFile -Force
Remove-Item -Path $frontendZip -Force

Write-Host "`n¡DESPLIEGUE COMPLETADO!" -ForegroundColor Green
Write-Host "El frontend debe estar accesible en http://$EC2_IP" -ForegroundColor Green
