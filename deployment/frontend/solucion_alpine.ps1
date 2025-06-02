# Solución para contenedor Alpine
$EC2_IP = "108.129.139.119"
$PEM_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"

# 1. Ver qué archivos hay dentro del directorio de la aplicación
Write-Host "Verificando archivos en contenedor..." -ForegroundColor Cyan
$checkFilesCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node sh -c \"ls -la /app\"'"
Invoke-Expression $checkFilesCmd

# 2. Instalar la dependencia es-module-lexer
Write-Host "`nInstalando dependencia es-module-lexer..." -ForegroundColor Cyan
$installCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node sh -c \"cd /app && npm install es-module-lexer\"'"
Invoke-Expression $installCmd

# 3. Verificar si hay package.json para ver qué dependencias tenemos
Write-Host "`nVerificando package.json..." -ForegroundColor Cyan
$checkPackageCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node sh -c \"cat /app/package.json\"'"
Invoke-Expression $checkPackageCmd

# 4. Reiniciar el proceso Node.js (buscamos primero el proceso)
Write-Host "`nReiniciando proceso Node.js..." -ForegroundColor Yellow
$findProcessCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker exec masclet-frontend-node sh -c \"ps aux | grep node\"'"
Invoke-Expression $findProcessCmd

# 5. Reiniciar el contenedor completamente
Write-Host "`nReiniciando contenedor..." -ForegroundColor Yellow
$restartCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker restart masclet-frontend-node'"
Invoke-Expression $restartCmd

Write-Host "`nEsperando 15 segundos para que el contenedor se reinicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 6. Verificar logs para ver si sigue el error
Write-Host "`nVerificando logs después del reinicio..." -ForegroundColor Green
$checkLogsCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'sudo docker logs masclet-frontend-node --tail 20'"
Invoke-Expression $checkLogsCmd

# 7. Probar acceso al frontend
Write-Host "`nVerificando acceso al frontend..." -ForegroundColor Green
$testFrontendCmd = "ssh -i `"$PEM_PATH`" ec2-user@$EC2_IP 'curl -s http://localhost/'"
Invoke-Expression $testFrontendCmd
