# Script simple para diagnosticar el problema del frontend
# Fecha: 07/06/2025

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

Write-Host "=== DIAGNOSTICO CONTENEDORES FRONTEND ===" -ForegroundColor Cyan

# 1. Ver estado actual de los contenedores
Write-Host "1. Estado actual de contenedores:"
$cmd = "ssh -i `"$key`" ec2-user@$host_ip docker ps -a"
Invoke-Expression $cmd

# 2. Ver logs del contenedor Node
Write-Host "`n2. Intentando ver logs del contenedor Node.js:" -ForegroundColor Yellow
$cmd = "ssh -i `"$key`" ec2-user@$host_ip docker logs masclet-frontend-node 2>&1"
Invoke-Expression $cmd

# 3. Ver detalles de la imagen Node.js
Write-Host "`n3. Detalles de la imagen del frontend Node:" -ForegroundColor Yellow
$cmd = "ssh -i `"$key`" ec2-user@$host_ip docker image inspect masclet-imperi-web-deploy-masclet-frontend-node:latest --format='{{.Config.Cmd}}'"
Invoke-Expression $cmd

# 4. Probar contenedor básico con comando directo
Write-Host "`n4. Probando contenedor Node.js con comando de prueba:" -ForegroundColor Green
$cmd = "ssh -i `"$key`" ec2-user@$host_ip `"docker run --rm masclet-imperi-web-deploy-masclet-frontend-node:latest ls -la /app/server`""
Invoke-Expression $cmd

# 5. Intentar ejecutar con entrypoint modificado para ver el error
Write-Host "`n5. Ejecutando con punto de entrada modificado para ver el error:" -ForegroundColor Green
$cmd = "ssh -i `"$key`" ec2-user@$host_ip `"docker run --rm --entrypoint=node masclet-imperi-web-deploy-masclet-frontend-node:latest /app/server/entry.mjs`""
Invoke-Expression $cmd

Write-Host "`n=== DIAGNÓSTICO FINALIZADO ===" -ForegroundColor Cyan
