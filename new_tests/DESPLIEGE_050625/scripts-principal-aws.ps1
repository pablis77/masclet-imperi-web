# =============================================================================
# SCRIPT PRINCIPAL: Recuperación y Despliegue AWS - Masclet Imperi Web
# Fecha: 07/06/2025
# =============================================================================
# Este script UNIFICADO realiza todas las tareas necesarias para restaurar
# y configurar correctamente el entorno AWS. Incluye:
#   1. Crear usuario PostgreSQL admin para conexión de la API
#   2. Iniciar el contenedor de la API correctamente
#   3. Iniciar los contenedores del Frontend (Node.js y Nginx)
# =============================================================================

$key = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$host_ip = "34.253.203.194"

# Función útil para mostrar estados
function Show-Status {
    param (
        [string]$Message,
        [string]$Color = "Cyan"
    )
    Write-Host ""
    Write-Host "== $Message ==" -ForegroundColor $Color
    Write-Host ""
}

# ===== SECCIÓN 1: CONFIGURACIÓN DE BASE DE DATOS Y API =====
Show-Status "PARTE 1: CONFIGURANDO POSTGRESQL Y API" "Green"

# 1.1. Verificar contenedores actuales
Show-Status "Verificando estado actual de contenedores" 
ssh -i $key ec2-user@$host_ip "docker ps -a"

# 1.2. Detener contenedores anteriores de la API si existen
Show-Status "Deteniendo contenedor actual de la API (si existe)" "Yellow"
ssh -i $key ec2-user@$host_ip "docker stop masclet-api || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-api || true"

# 1.3. Crear usuario admin en PostgreSQL
Show-Status "Creando el usuario admin en PostgreSQL" "Yellow"
ssh -i $key ec2-user@$host_ip @'
cat > create_admin.sql << 'EOF'
DROP USER IF EXISTS admin;
CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;
EOF
'@

ssh -i $key ec2-user@$host_ip "docker cp create_admin.sql masclet-db:/tmp/ && docker exec masclet-db psql -U postgres -f /tmp/create_admin.sql"

# 1.4. Iniciar el contenedor de la API
Show-Status "Iniciando el contenedor de la API" "Green"
ssh -i $key ec2-user@$host_ip "docker run -d --name masclet-api --network masclet-network -p 8000:8000 masclet-api-imagen-completa"

# 1.5. Verificar que la API se ha iniciado correctamente
Show-Status "Esperando a que la API se inicie" "Yellow"
Start-Sleep -Seconds 5
ssh -i $key ec2-user@$host_ip "docker logs masclet-api | tail -n 15"


# ===== SECCIÓN 2: CONFIGURACIÓN DE FRONTEND =====
Show-Status "PARTE 2: CONFIGURANDO FRONTEND" "Green"

# 2.1. Detener contenedores anteriores del frontend
Show-Status "Deteniendo contenedores anteriores del frontend" "Yellow"
ssh -i $key ec2-user@$host_ip "docker stop masclet-frontend masclet-frontend-node || true"
ssh -i $key ec2-user@$host_ip "docker rm masclet-frontend masclet-frontend-node || true"

# 2.2. Verificar imágenes disponibles
Show-Status "Verificando imágenes disponibles" "Yellow"
ssh -i $key ec2-user@$host_ip "docker images | grep -E 'masclet|REPOSITORY'"

# 2.3. Crear contenedor Node.js (PRIMERO)
Show-Status "Creando contenedor Node.js (SSR)" "Green"
# IMPORTANTE: Variables de entorno correctas para Node.js
ssh -i $key ec2-user@$host_ip @'
docker run -d --name masclet-frontend-node \
  --network masclet-network \
  -e NODE_ENV=production \
  -e API_URL=http://masclet-api:8000 \
  --restart unless-stopped \
  masclet-imperi-web-deploy-masclet-frontend-node:latest
'@

# 2.4. Esperar a que Node.js esté listo antes de iniciar Nginx
Show-Status "Esperando a que Node.js se inicialice" "Yellow"
Start-Sleep -Seconds 10
ssh -i $key ec2-user@$host_ip "docker logs masclet-frontend-node | tail -n 10"

# 2.5. Crear contenedor Nginx (SEGUNDO, depende de Node)
Show-Status "Creando contenedor Nginx" "Green"
ssh -i $key ec2-user@$host_ip @'
docker run -d --name masclet-frontend \
  --network masclet-network \
  -p 80:80 \
  -e NODE_SERVER=masclet-frontend-node:3000 \
  --restart unless-stopped \
  masclet-imperi-web-deploy-masclet-frontend-nginx:latest
'@

# ===== SECCIÓN 3: VERIFICACIÓN FINAL =====
Show-Status "PARTE 3: VERIFICACIÓN FINAL" "Green"

# 3.1. Verificar todos los contenedores
Show-Status "Verificando estado de todos los contenedores" "Cyan"
ssh -i $key ec2-user@$host_ip "docker ps -a"

# 3.2. Verificar si los contenedores del frontend están saludables
Show-Status "Verificando estado de salud del frontend" "Yellow"
ssh -i $key ec2-user@$host_ip "docker inspect masclet-frontend-node --format='{{.State.Status}}'"
ssh -i $key ec2-user@$host_ip "docker inspect masclet-frontend --format='{{.State.Status}}'"

# 3.3. Si todo está bien, mostrar URLs de acceso
Show-Status "DESPLIEGUE COMPLETADO" "Green"
Write-Host "API disponible en: http://$host_ip:8000/docs" -ForegroundColor Green
Write-Host "Frontend disponible en: http://$host_ip" -ForegroundColor Green
Write-Host ""
Write-Host "Si los contenedores del frontend están reiniciándose continuamente," -ForegroundColor Yellow
Write-Host "por favor ejecuta el siguiente comando para ver los logs detallados:" -ForegroundColor Yellow
$cmd = "ssh -i '$key' ec2-user@$host_ip 'docker logs masclet-frontend-node'"
Write-Host $cmd -ForegroundColor Yellow
