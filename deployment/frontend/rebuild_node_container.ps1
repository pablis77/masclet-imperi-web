# Script para reconstruir solo el contenedor Node.js con todas las dependencias
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# Conectar y ejecutar comandos en el servidor
Write-Host "Conectando al servidor para reconstruir el contenedor Node.js..." -ForegroundColor Cyan

$commands = @'
# Detener y eliminar el contenedor actual
sudo docker stop masclet-frontend-node || true
sudo docker rm masclet-frontend-node || true

# Actualizar y reconstruir el contenedor con nueva imagen
sudo docker pull node:18
sudo docker run -d --name masclet-frontend-node --restart unless-stopped \
  --network masclet-network -p 10000:10000 \
  -e NODE_ENV=production -e HOST=0.0.0.0 -e PORT=10000 \
  -v ~/frontend:/app \
  node:18 \
  /bin/bash -c "cd /app && npm install --legacy-peer-deps && npm install es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps && npm run build && node ./dist/server/entry.mjs"

# Verificar que el contenedor está ejecutándose
echo "Estado del nuevo contenedor:"
sudo docker ps | grep masclet-frontend-node

# Mostrar logs para verificar
echo "Logs del contenedor:"
sudo docker logs masclet-frontend-node --tail 20
'@

# Crear un archivo temporal con los comandos
$tempFile = [System.IO.Path]::GetTempFileName()
$commands | Out-File -FilePath $tempFile -Encoding utf8

# Transferir el archivo de comandos al servidor
$scpCommandsCmd = "scp -i `"$PEM_PATH`" `"$tempFile`" ec2-user@$EC2_IP`:~/rebuild_node.sh"
Write-Host "Transfiriendo script de comandos..." -ForegroundColor Yellow
Invoke-Expression $scpCommandsCmd

# Ejecutar los comandos en el servidor
$runCommandsCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'chmod +x ~/rebuild_node.sh && bash ~/rebuild_node.sh'"
Write-Host "Ejecutando comandos en el servidor..." -ForegroundColor Green
Invoke-Expression $runCommandsCmd

# Eliminar el archivo temporal
Remove-Item -Path $tempFile

Write-Host "`nReconstrucción del contenedor Node.js completada." -ForegroundColor Green
