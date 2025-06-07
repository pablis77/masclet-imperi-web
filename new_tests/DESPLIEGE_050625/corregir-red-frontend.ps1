# Script para corregir la conexión a la red Docker de los contenedores frontend
# Fecha: 07/06/2025

# Comandos individuales para ejecutar directamente en el servidor AWS con la clave SSH
$comandos = @(
    "echo '=== Estado inicial de contenedores ==='"
    "docker ps -a"
    
    "echo ''"
    "echo '=== Deteniendo y eliminando contenedores de frontend antiguos ==='"
    "docker stop masclet-frontend-node masclet-frontend || true"
    "docker rm masclet-frontend-node masclet-frontend || true"
    
    "echo ''"
    "echo '=== Iniciando contenedor Node.js CON RED CORRECTA ==='"
    "docker run -d --name masclet-frontend-node --network masclet-network -e NODE_ENV=production -e API_URL=http://masclet-api:8000 masclet-imperi-web-deploy-masclet-frontend-node:latest"
    
    "echo ''"
    "echo '=== Verificando estado del contenedor Node.js ==='"
    "docker ps -a --filter name=masclet-frontend-node"
    
    "echo ''"
    "echo '=== Iniciando contenedor Nginx CON RED CORRECTA ==='"
    "docker run -d --name masclet-frontend --network masclet-network -p 80:80 -e NODE_SERVER=masclet-frontend-node:3000 masclet-imperi-web-deploy-masclet-frontend-nginx:latest"
    
    "echo ''"
    "echo '=== Estado final de contenedores ==='"
    "docker ps -a"
    
    "echo ''"
    "echo '=== Verificando conexión entre contenedores ==='"
    "docker exec masclet-frontend-node ping -c 2 masclet-api || echo 'No se puede hacer ping entre contenedores'"
    
    "echo ''"
    "echo '=== Logs del contenedor Node.js ==='"
    "docker logs masclet-frontend-node"
)

# Ejecutar los comandos
foreach ($comando in $comandos) {
    Write-Host "Ejecutando: $comando" -ForegroundColor Yellow
    ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 $comando
    Write-Host ""
}

Write-Host "Proceso completado. Verifica que los contenedores estén funcionando correctamente." -ForegroundColor Green
