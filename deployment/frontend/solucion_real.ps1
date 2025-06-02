# SOLUCIÓN REAL Y DEFINITIVA PARA EL FRONTEND
# Sin tonterías, sin complejidad, directo al grano

$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Primero creamos localmente un archivo .dockerignore y Dockerfile optimizados
$dockerignore = @'
node_modules
dist
.git
.github
docs
'@

$dockerfile = @'
FROM node:18

WORKDIR /app

# Copiar solo los archivos de configuración primero
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV API_URL=http://masclet-api:8000

# Ahora copiar el código fuente (más ligero sin node_modules)
COPY src ./src
COPY public ./public
COPY astro.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Construir la aplicación
RUN npm run build

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
'@

# Guardar localmente
$dockerignore | Out-File -FilePath "C:\Proyectos\claude\masclet-imperi-web\.dockerignore" -Encoding utf8
$dockerfile | Out-File -FilePath "C:\Proyectos\claude\masclet-imperi-web\Dockerfile.frontend" -Encoding utf8

# Comandos a ejecutar en el servidor
$comandos = @'
#!/bin/bash
set -e

echo "=== SOLUCIÓN REAL Y DEFINITIVA PARA EL FRONTEND ==="

# 1. Detener contenedores actuales
echo "Deteniendo contenedores actuales..."
sudo docker stop masclet-frontend masclet-frontend-node || true
sudo docker rm masclet-frontend masclet-frontend-node || true

# 2. Crear directorio limpio para la construcción
echo "Preparando directorio limpio..."
mkdir -p ~/frontend-clean
cd ~/frontend-clean

# 3. Crear los archivos necesarios
cat > .dockerignore << 'EOF'
node_modules
dist
.git
.github
docs
EOF

cat > Dockerfile.frontend << 'EOF'
FROM node:18

WORKDIR /app

# Copiar solo los archivos de configuración primero
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV API_URL=http://masclet-api:8000

# Ahora copiar el código fuente (más ligero sin node_modules)
COPY src ./src
COPY public ./public
COPY astro.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Construir la aplicación
RUN npm run build

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
EOF

# 4. Construir y ejecutar el contenedor
echo "Construyendo y ejecutando el nuevo contenedor..."
sudo docker build -f Dockerfile.frontend -t masclet-frontend:latest .
sudo docker run -d --name masclet-frontend --network masclet-network -p 80:80 masclet-frontend:latest

echo "=== SOLUCIÓN IMPLEMENTADA ==="
echo "El frontend debería estar accesible en http://$HOSTNAME"
'@

# Crear un archivo temporal con los comandos
$tempFile = [System.IO.Path]::GetTempFileName() + ".sh"
$comandos | Out-File -FilePath $tempFile -Encoding utf8

# AÑADIMOS PASO CLAVE: Transferir los archivos necesarios al servidor
Write-Host "Preparando archivos para transferencia..." -ForegroundColor Cyan

# Crear directorio temporal para los archivos necesarios
$tempDir = Join-Path $env:TEMP "masclet-frontend-deploy"
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar solo los archivos necesarios
$sourceDir = "C:\Proyectos\claude\masclet-imperi-web"
Copy-Item -Path "$sourceDir\package*.json" -Destination $tempDir
Copy-Item -Path "$sourceDir\src" -Destination $tempDir\src -Recurse
Copy-Item -Path "$sourceDir\public" -Destination $tempDir\public -Recurse
Copy-Item -Path "$sourceDir\astro.config.mjs" -Destination $tempDir
Copy-Item -Path "$sourceDir\tsconfig.json" -Destination $tempDir
Copy-Item -Path "$sourceDir\tailwind.config.js" -Destination $tempDir
Copy-Item -Path "$sourceDir\postcss.config.js" -Destination $tempDir -ErrorAction SilentlyContinue

# Transferir archivos al servidor
Write-Host "Transfiriendo archivos al servidor..." -ForegroundColor Cyan
$scpDirCommand = "scp -r -i `"$PEM_PATH`" `"$tempDir\*`" ec2-user@$EC2_IP`:~/frontend-clean/"
Invoke-Expression $scpDirCommand

# Transferir el script de despliegue
Write-Host "Transfiriendo script de solución al servidor..." -ForegroundColor Cyan
$scpCommand = "scp -i `"$PEM_PATH`" `"$tempFile`" ec2-user@$EC2_IP`:~/solucion_real.sh"
Invoke-Expression $scpCommand

# Ejecutar los comandos en el servidor
Write-Host "Ejecutando solución definitiva..." -ForegroundColor Green
$sshCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'chmod +x ~/solucion_real.sh && bash ~/solucion_real.sh'"
Invoke-Expression $sshCommand

# Eliminar archivos temporales
Remove-Item -Path $tempFile
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "`nVerificando acceso al frontend..." -ForegroundColor Yellow
$curlCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'curl -s http://localhost/ | head -10'"
Invoke-Expression $curlCommand

Write-Host "`nLa solución REAL ha sido implementada." -ForegroundColor Green
Write-Host "El frontend debe estar accesible en http://$EC2_IP" -ForegroundColor Green
Write-Host "Por favor, verifica en tu navegador." -ForegroundColor Green
