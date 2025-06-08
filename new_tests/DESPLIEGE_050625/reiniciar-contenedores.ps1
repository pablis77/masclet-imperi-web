# Reinicio ordenado de contenedores para resolver problemas de conectividad
# Autor: Equipo Masclet Imperi

Write-Host "🔄 Reiniciando contenedores para resolver problemas de conectividad..." -ForegroundColor Green

# Variables y configuración
$KEY_PATH = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$SERVER = "ec2-user@34.253.203.194"

# 1. Crear script de reinicio
$restartScript = @'
#!/bin/sh
set -e

echo "===== REINICIO ORDENADO DE CONTENEDORES ====="
echo "* Este proceso reiniciará todos los contenedores en orden"
echo "* para asegurar que la comunicación entre ellos sea correcta."

echo -e "\n1. Guardando estado actual de los contenedores..."
docker ps -a

echo -e "\n2. Deteniendo contenedores en orden inverso..."
echo "   - Deteniendo frontend Nginx..."
docker stop masclet-frontend || true
echo "   - Deteniendo frontend Node.js..."
docker stop masclet-frontend-node || true
echo "   - Deteniendo API backend..."
docker stop masclet-api || true
echo "   - Base de datos se mantiene en ejecución..."

echo -e "\n3. Reiniciando contenedores en orden correcto..."
echo "   - Iniciando API backend..."
docker start masclet-api 
echo "   - Esperando 10 segundos para que el API esté listo..."
sleep 10
echo "   - Iniciando frontend Node.js..."
docker start masclet-frontend-node
echo "   - Esperando 5 segundos para que el Node.js esté listo..."
sleep 5
echo "   - Iniciando frontend Nginx..."
docker start masclet-frontend

echo -e "\n4. Verificando estado final de los contenedores..."
sleep 5
docker ps -a

echo -e "\n5. Verificando conectividad entre contenedores..."
echo "   - Verificando que Nginx puede comunicarse con Node.js..."
docker exec masclet-frontend curl -s -I http://masclet-frontend-node:3000/ || echo "Error de comunicación con Node.js"
echo "   - Verificando que Node.js puede comunicarse con API..."
docker exec masclet-frontend-node curl -s http://masclet-api:8000/api/v1/health || echo "Error de comunicación con API"

echo -e "\n===== REINICIO COMPLETADO ====="
'@

# 2. Transferir y ejecutar el script - con tratamiento para finales de línea
$tempFile = New-TemporaryFile
$restartScript | Out-File -FilePath $tempFile.FullName -Encoding utf8

# Convertir finales de línea Windows (CRLF) a Unix (LF)
Get-Content -Path $tempFile.FullName -Raw | 
    ForEach-Object { $_ -replace "`r`n", "`n" } |
    ssh -i $KEY_PATH $SERVER "cat > /tmp/restart-containers.sh"

Remove-Item -Path $tempFile.FullName

Write-Host "Configurando permisos y ejecutando script de reinicio..." -ForegroundColor Cyan
ssh -i $KEY_PATH $SERVER "chmod +x /tmp/restart-containers.sh && sh /tmp/restart-containers.sh"

Write-Host "✅ Proceso completado. Prueba a acceder a la web nuevamente." -ForegroundColor Green
