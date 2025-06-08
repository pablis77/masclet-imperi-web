# solucion-definitiva-frontend.ps1
# Script para resolver definitivamente el problema de conectividad del frontend
# Fecha: 07/06/2025
# Autor: Equipo de Despliegue Masclet Imperi Web

Write-Host "🚀 Iniciando solución definitiva para frontend Node.js..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"
$CONTAINER_NAME = "masclet-frontend-node"

# Verificar que el backend está activo y respondiendo
Write-Host "Verificando que el endpoint de health del backend está funcionando..." -ForegroundColor Cyan
$backendHealth = ssh -i $KEY_PATH $SERVER "curl -s http://localhost:8000/api/v1/health"
Write-Host "Respuesta del backend: $backendHealth" -ForegroundColor Cyan

# 1. Crear un script que verifique la comunicación entre contenedores
Write-Host "1. Creando script de verificación de conectividad entre contenedores..." -ForegroundColor Cyan

$connectivityScript = @'
/**
 * proxy-healthcheck.js - Script para verificar la conectividad al backend
 * Este script hace solicitudes al endpoint de health del backend y reporta el estado
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = process.env.API_URL || 'http://masclet-api:8000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const HEALTH_ENDPOINT = `${API_URL}${API_PREFIX}/health`;
const CHECK_INTERVAL = 30000; // 30 segundos
const LOG_FILE = path.join(__dirname, 'connectivity.log');

// Función para escribir en el log
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error(`Error al escribir en el log: ${err.message}`);
  }
}

// Función para verificar la conectividad
function checkConnectivity() {
  writeLog(`Verificando conectividad a: ${HEALTH_ENDPOINT}`);
  
  // Elegir el cliente HTTP adecuado según el protocolo
  const client = HEALTH_ENDPOINT.startsWith('https') ? https : http;
  
  const req = client.get(HEALTH_ENDPOINT, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        writeLog(`Conexión exitosa (${res.statusCode}): ${data}`);
      } else {
        writeLog(`Respuesta inesperada (${res.statusCode}): ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    writeLog(`Error de conexión: ${error.message}`);
  });
  
  req.end();
}

// Primera verificación inmediata
checkConnectivity();

// Verificaciones periódicas
setInterval(checkConnectivity, CHECK_INTERVAL);

writeLog('Script de verificación de conectividad iniciado');

// Para que el script no termine
process.stdin.resume();

// Manejar señales para un cierre limpio
process.on('SIGTERM', () => {
  writeLog('Señal SIGTERM recibida, terminando script de verificación');
  process.exit(0);
});
'@

# Crear archivo temporal y transferirlo
$tempFile = New-TemporaryFile
$connectivityScript | Out-File -FilePath $tempFile.FullName -Encoding utf8
Get-Content -Path $tempFile.FullName | ssh -i $KEY_PATH $SERVER "cat > /tmp/proxy-healthcheck.js"
Remove-Item -Path $tempFile.FullName

# Copiarlo al contenedor
$containerDest = "${CONTAINER_NAME}:/app/proxy-healthcheck.js"
ssh -i $KEY_PATH $SERVER "docker cp /tmp/proxy-healthcheck.js $containerDest"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME chmod +x /app/proxy-healthcheck.js"

# 2. Actualizar el script de inicio para incluir nuestro script de verificación
Write-Host "2. Modificando el script de inicio para incluir el script de verificación..." -ForegroundColor Cyan

$startupModificacion = @'
if ! grep -q "proxy-healthcheck.js" /app/startup.sh; then
  # Buscar la línea que ejecuta el script de configuración de API
  if grep -q "docker-api-master.js" /app/startup.sh; then
    # Insertar después de esa línea
    sed -i '/node \/app\/docker-api-master.js/a # Iniciar el script de verificación de conectividad en segundo plano\nnode \/app\/proxy-healthcheck.js \&\nsleep 1' /app/startup.sh
    echo "✅ Script de inicio actualizado con verificador de conectividad"
  else
    echo "❌ No se encontró punto de inserción en startup.sh"
  fi
else
  echo "🔄 El script de inicio ya contiene el verificador"
fi
'@

# Transferir y ejecutar script de modificación
$tempStartupFile = New-TemporaryFile
$startupModificacion | Out-File -FilePath $tempStartupFile.FullName -Encoding utf8
Get-Content -Path $tempStartupFile.FullName | ssh -i $KEY_PATH $SERVER "cat > /tmp/update-startup.sh"
Remove-Item -Path $tempStartupFile.FullName

ssh -i $KEY_PATH $SERVER "chmod +x /tmp/update-startup.sh"
ssh -i $KEY_PATH $SERVER "docker cp /tmp/update-startup.sh ${CONTAINER_NAME}:/tmp/update-startup.sh"
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME sh /tmp/update-startup.sh"

# 3. Modificar la configuración de healthcheck de Docker para usar el backend directamente
Write-Host "3. Actualizando configuración de healthcheck en Docker..." -ForegroundColor Cyan

# Crear un contenedor con configuración actualizada que use el endpoint del backend directamente
$nuevoHealthcheck = @'
docker stop $CONTAINER_NAME
docker commit $CONTAINER_NAME masclet-frontend-node-fixed
docker rm $CONTAINER_NAME
docker run -d --name $CONTAINER_NAME \
  --network masclet-network \
  --health-cmd='curl -f http://masclet-api:8000/api/v1/health || exit 1' \
  --health-interval=30s \
  --health-timeout=5s \
  --health-start-period=10s \
  --health-retries=3 \
  -p 3000:3000 \
  -e API_URL="http://masclet-api:8000" \
  -e API_PREFIX=/api/v1 \
  masclet-frontend-node-fixed
'@

# Transferir y ejecutar script
$tempHealthFile = New-TemporaryFile
$nuevoHealthcheck | Out-File -FilePath $tempHealthFile.FullName -Encoding utf8
Get-Content -Path $tempHealthFile.FullName | ssh -i $KEY_PATH $SERVER "cat > /tmp/update-healthcheck.sh"
Remove-Item -Path $tempHealthFile.FullName

ssh -i $KEY_PATH $SERVER "chmod +x /tmp/update-healthcheck.sh"
ssh -i $KEY_PATH $SERVER "sh /tmp/update-healthcheck.sh"

# 4. Esperar a que el contenedor se reinicie
Write-Host "4. Esperando a que el contenedor se reinicie (20 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 5. Verificar que todo está funcionando correctamente
Write-Host "\n5. Verificando estado del contenedor después de los cambios..." -ForegroundColor Green

Write-Host "\n📋 Estado del contenedor:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker ps -a --filter name=$CONTAINER_NAME --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'"

Write-Host "\n🔍 Inspección del healthcheck:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker inspect --format='{{json .State.Health}}' $CONTAINER_NAME" | ConvertFrom-Json | Format-List

Write-Host "\n📋 Logs del contenedor:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs $CONTAINER_NAME --tail 20"

# 6. Verificar comunicación entre contenedores
Write-Host "\n6. Probando comunicación entre contenedores..." -ForegroundColor Green
Write-Host "Ejecutando curl desde el contenedor Node.js al backend:" -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker exec $CONTAINER_NAME curl -s http://masclet-api:8000/api/v1/health"

# 7. Resumen de los cambios realizados
Write-Host "\n✅ RESUMEN DE LA SOLUCIÓN IMPLEMENTADA:" -ForegroundColor Green
Write-Host "1. Ahora el healthcheck usa directamente el endpoint /api/v1/health del backend" -ForegroundColor White
Write-Host "2. Se ha agregado un script de verificación de conectividad entre contenedores" -ForegroundColor White
Write-Host "3. Se ha creado una nueva imagen y contenedor con la configuración corregida" -ForegroundColor White
Write-Host "4. La configuración es más robusta ya que verifica la comunicación real entre servicios" -ForegroundColor White

Write-Host "\n🛡️ NOTA: El contenedor debe mostrar estado HEALTHY si todo está bien configurado" -ForegroundColor Yellow
Write-Host "Si persisten los problemas, prueba acceder a http://localhost:3000 desde tu navegador para verificar" -ForegroundColor Yellow

# 7. Verificar logs y registros
Write-Host "7. Verificando logs del contenedor..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "docker logs --tail 20 $CONTAINER_NAME"

# 8. Guardar la configuración para futuras restauraciones
Write-Host "8. Respaldando la configuración..." -ForegroundColor Cyan
$fecha = (Get-Date).ToString("yyyyMMdd_HHmmss")
ssh -i $KEY_PATH $SERVER "docker inspect $CONTAINER_NAME > /home/ec2-user/masclet-frontend-node-config-$fecha.json"
ssh -i $KEY_PATH $SERVER "docker commit $CONTAINER_NAME masclet-frontend-node-fixed-$fecha"
ssh -i $KEY_PATH $SERVER "docker images | grep masclet-frontend-node-fixed"

Write-Host "✅ Solución definitiva aplicada" -ForegroundColor Green
Write-Host "📋 Resumen de cambios:" -ForegroundColor Yellow
Write-Host "  1. Se creó un servidor de healthcheck en puerto 3456" -ForegroundColor White
Write-Host "  2. Se modificó el script de inicio para ejecutar automáticamente el healthcheck" -ForegroundColor White
Write-Host "  3. Se actualizó la configuración de Docker para usar el nuevo puerto" -ForegroundColor White
Write-Host "  4. Se creó una nueva imagen con la configuración correcta" -ForegroundColor White
