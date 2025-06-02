# SOLUCIÓN DEFINITIVA PARA EL FRONTEND
# Script optimizado para resolver todos los problemas de una vez

$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Comandos a ejecutar en el servidor para arreglar todo de una vez
$comandos = @'
#!/bin/bash
set -e

echo "=== SOLUCIÓN DEFINITIVA PARA EL FRONTEND ==="

# 1. Detener contenedores actuales
echo "Deteniendo contenedores actuales..."
sudo docker stop masclet-frontend masclet-frontend-node || true
sudo docker rm masclet-frontend masclet-frontend-node || true

# 2. Crear un único contenedor Node.js completo
echo "Creando nuevo contenedor Node.js..."
cat > Dockerfile.frontend << 'EOF'
FROM node:18

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV API_URL=http://masclet-api:8000

RUN npm run build

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
EOF

# 3. Construir y ejecutar el contenedor
echo "Construyendo y ejecutando el nuevo contenedor..."
sudo docker build -f Dockerfile.frontend -t masclet-frontend:latest .
sudo docker run -d --name masclet-frontend --network masclet-network -p 80:80 masclet-frontend:latest

# 4. Verificar estado
echo "Verificando estado del nuevo contenedor..."
sudo docker ps | grep masclet-frontend
sudo docker logs masclet-frontend --tail 20

echo "=== SOLUCIÓN IMPLEMENTADA ==="
echo "El frontend debería estar accesible en http://$HOSTNAME"
'@

# Crear un archivo temporal con los comandos
$tempFile = [System.IO.Path]::GetTempFileName() + ".sh"
$comandos | Out-File -FilePath $tempFile -Encoding utf8

# Transferir el archivo de comandos al servidor
Write-Host "Transfiriendo script de solución al servidor..." -ForegroundColor Cyan
$scpCommand = "scp -i `"$PEM_PATH`" `"$tempFile`" ec2-user@$EC2_IP`:~/solucion_final.sh"
Invoke-Expression $scpCommand

# Ejecutar los comandos en el servidor
Write-Host "Ejecutando solución definitiva..." -ForegroundColor Green
$sshCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'chmod +x ~/solucion_final.sh && bash ~/solucion_final.sh'"
Invoke-Expression $sshCommand

# Eliminar el archivo temporal
Remove-Item -Path $tempFile

Write-Host "`nVerificando acceso al frontend..." -ForegroundColor Yellow
$curlCommand = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'curl -s http://localhost/ | head -10'"
Invoke-Expression $curlCommand

Write-Host "`nLa solución ha sido implementada." -ForegroundColor Green
Write-Host "El frontend debe estar accesible en http://$EC2_IP" -ForegroundColor Green
Write-Host "Por favor, verifica en tu navegador." -ForegroundColor Green
