# =============================================================================
# DESPLIEGUE COMPLETO MASCLET IMPERI WEB - CONFIGURACIÓN VERIFICADA
# Fecha: 07/06/2025
# =============================================================================
# Este script implementa la configuración VERIFICADA que funciona correctamente
# para todos los componentes del sistema en AWS.
# =============================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

Write-Host "=== DESPLIEGUE COMPLETO MASCLET IMPERI WEB ===" -ForegroundColor Green
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

# PARTE 1: Verificar que la API y DB están funcionando
Write-Host "1. Verificando servicios existentes..." -ForegroundColor Yellow
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"docker ps | grep -E 'masclet-db|masclet-api'`""
Invoke-Expression $comando

Write-Host "`nVerificando respuesta de la API..." -ForegroundColor Yellow
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"curl -s http://localhost:8000/api/v1/health`""
Invoke-Expression $comando

# PARTE 2: Configuración de Frontend
Write-Host "`n2. Configurando Frontend Node.js..." -ForegroundColor Green

# Detener y eliminar contenedores anteriores
Write-Host "   Deteniendo contenedores anteriores..." -ForegroundColor Yellow
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"docker stop masclet-frontend-node masclet-frontend || echo 'No existen contenedores previos'`""
Invoke-Expression $comando
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"docker rm masclet-frontend-node masclet-frontend || echo 'No existen contenedores previos'`""
Invoke-Expression $comando

# Iniciar contenedor Node.js
Write-Host "   Iniciando contenedor Node.js optimizado..." -ForegroundColor Yellow
$comando_node = 'docker run -d --name masclet-frontend-node --network masclet-network -e NODE_ENV=production -e API_URL=http://masclet-api:8000 --restart unless-stopped masclet-imperi-web-deploy-masclet-frontend-node:latest node /app/server/entry.mjs'
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"$comando_node`""
Invoke-Expression $comando

# Esperar a que Node.js se inicialice
Write-Host "   Esperando inicialización de Node.js (10 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Iniciar contenedor Nginx
Write-Host "`n3. Configurando Frontend Nginx..." -ForegroundColor Green
$comando_nginx = 'docker run -d --name masclet-frontend --network masclet-network -p 80:80 --link masclet-api:masclet-backend --link masclet-frontend-node:masclet-frontend-node --restart unless-stopped masclet-imperi-web-deploy-masclet-frontend-nginx:latest'
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"$comando_nginx`""
Invoke-Expression $comando

# PARTE 3: Verificación final
Write-Host "`n4. Verificación final del sistema completo..." -ForegroundColor Green
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"docker ps -a`""
Invoke-Expression $comando

Write-Host "`nVerificando respuesta del Frontend..." -ForegroundColor Yellow
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"curl -s -I http://localhost | grep -E 'HTTP|Server'`""
Invoke-Expression $comando

Write-Host "`nVerificando API a través del Frontend..." -ForegroundColor Yellow
$comando = "ssh -i `"$key`" ec2-user@$host_ip `"curl -s http://localhost/api/v1/health`""
Invoke-Expression $comando

# FINALIZACIÓN
Write-Host "`n=== DESPLIEGUE COMPLETADO EXITOSAMENTE ===" -ForegroundColor Green
Write-Host "Frontend: http://$host_ip" -ForegroundColor Cyan
Write-Host "API: http://$host_ip/api/v1" -ForegroundColor Cyan
Write-Host "`nDocumentación de la API: http://$host_ip/api/v1/docs" -ForegroundColor Cyan
