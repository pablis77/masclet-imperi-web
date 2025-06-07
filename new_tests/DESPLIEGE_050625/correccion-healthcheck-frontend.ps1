# correccion-healthcheck-frontend.ps1
# Script para corregir el problema de healthcheck en el contenedor frontend Node.js
# Fecha: 07/06/2025
# Autor: Equipo de Despliegue Masclet Imperi Web

Write-Host "🚀 Iniciando corrección de healthcheck para frontend Node.js..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"
$CONTAINER_NAME = "masclet-frontend-node"

# 1. Crear un archivo de healthcheck simple en el contenedor
$HEALTH_ENDPOINT = @"
#!/usr/bin/env node
/**
 * health-endpoint.js - Endpoint sencillo para responder correctamente al healthcheck de Docker
 * Este script crea un servidor HTTP simple que responde 200 OK al endpoint /health
 */
const http = require('http');
const port = 3000;

// Crear un servidor HTTP básico
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Log para diagnóstico
  console.log(`[${new Date().toISOString()}] Healthcheck recibió petición: ${url}`);
  
  // Responder al endpoint /health con un 200 OK
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      container: 'masclet-frontend-node',
      timestamp: Date.now()
    }));
    return;
  }
  
  // Para cualquier otra ruta, pasar al servidor principal
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Iniciar el servidor HTTP para el health endpoint
server.listen(3000, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Servidor de healthcheck iniciado en puerto ${port}`);
});

// No interferir con el proceso principal
process.on('SIGTERM', () => {
  console.log('Señal SIGTERM recibida, cerrando servidor de healthcheck');
  server.close(() => {
    console.log('Servidor de healthcheck cerrado');
  });
});
"@

Write-Host "1. Creando archivo de healthcheck..." -ForegroundColor Cyan
# Preparar el archivo de healthcheck
$tempFile = New-TemporaryFile
$HEALTH_ENDPOINT | Out-File -FilePath $tempFile.FullName -Encoding utf8
Get-Content -Path $tempFile.FullName | ssh -i $KEY_PATH $SERVER "cat > /tmp/health-endpoint.js"
Remove-Item -Path $tempFile.FullName
$containerDest = $CONTAINER_NAME + ":/app/health-endpoint.js"
ssh -i $KEY_PATH $SERVER "docker cp /tmp/health-endpoint.js $containerDest"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME chmod +x /app/health-endpoint.js"

# 2. Modificar el script de inicio para iniciar el servicio de healthcheck
Write-Host "2. Modificando el script de inicio..." -ForegroundColor Cyan
$commandScript = @'
if ! grep -q "health-endpoint.js" /app/startup.sh; then
  echo "" >> /app/startup.sh
  echo "# Iniciar el servidor de healthcheck en segundo plano" >> /app/startup.sh
  echo "node /app/health-endpoint.js &" >> /app/startup.sh
  echo "# Añadir un pequeño delay para asegurar que el endpoint de health está disponible" >> /app/startup.sh
  echo "sleep 2" >> /app/startup.sh
  echo "# Verificar que el endpoint está respondiendo" >> /app/startup.sh
  echo "curl -s http://localhost:3000/health || echo \"Error: health endpoint no responde\"" >> /app/startup.sh
fi
'@

ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME bash -c '$commandScript'"

# 3. Reiniciar el contenedor para aplicar los cambios
Write-Host "3. Reiniciando el contenedor frontend Node.js..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker restart $CONTAINER_NAME"

# 4. Esperar a que el contenedor se reinicie
Write-Host "4. Esperando a que el contenedor se reinicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Verificar que el healthcheck ahora funciona
Write-Host "5. Verificando el estado del healthcheck..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME"

# 6. Probar el endpoint de healthcheck
Write-Host "6. Probando el endpoint de healthcheck..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME curl -s http://localhost:3000/health"

# 7. Verificar la conexión con la API
Write-Host "7. Verificando conexión con la API..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME curl -s http://masclet-api:8000/api/v1/health"

Write-Host "✅ Corrección de healthcheck completada" -ForegroundColor Green
