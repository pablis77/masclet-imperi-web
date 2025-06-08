# Script de recuperación de emergencia para el contenedor Nginx
# Estabiliza el contenedor Nginx y verifica la estructura de directorios

$sshKey = "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"
$serverIP = "34.253.203.194"
$serverUser = "ec2-user"

# Función para mostrar mensajes con formato
function Write-ColorOutput {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🚑 Iniciando recuperación de emergencia..." "Red"
Write-ColorOutput "=============================================" "Cyan"

# Crear script de recuperación
$recoveryScript = @'
#!/bin/bash
# Script de recuperación de emergencia para contenedores

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==================================================${NC}"
echo -e "${RED}🚑 RECUPERACIÓN DE EMERGENCIA DE CONTENEDORES${NC}"
echo -e "${BLUE}==================================================${NC}"

# Paso 1: Detener contenedores con problemas
echo -e "\n${YELLOW}Paso 1: Deteniendo contenedores con problemas...${NC}"

echo -e "${YELLOW}Deteniendo masclet-frontend...${NC}"
docker stop masclet-frontend
echo -e "${YELLOW}Deteniendo masclet-frontend-node...${NC}"
docker stop masclet-frontend-node

echo -e "${GREEN}✅ Contenedores detenidos${NC}"

# Paso 2: Verificar estado de los contenedores
echo -e "\n${YELLOW}Paso 2: Estado de los contenedores...${NC}"
docker ps -a | grep masclet

# Paso 3: Explorar estructura de directorios
echo -e "\n${YELLOW}Paso 3: Explorando estructura de directorios...${NC}"

echo -e "${YELLOW}Iniciando contenedor node para diagnóstico...${NC}"
docker start masclet-frontend-node
sleep 5

echo -e "${YELLOW}Verificando rutas en masclet-frontend-node...${NC}"
echo -e "${BLUE}Contenido de /app:${NC}"
docker exec masclet-frontend-node ls -la /app

echo -e "${BLUE}Contenido de /app/client:${NC}"
docker exec masclet-frontend-node ls -la /app/client

echo -e "${BLUE}Contenido de /app/client/_astro:${NC}"
docker exec masclet-frontend-node ls -la /app/client/_astro | grep authService

# Paso 4: Verificar archivo de autenticación
echo -e "\n${YELLOW}Paso 4: Verificando archivo de autenticación...${NC}"
# Buscar el archivo authService en diferentes ubicaciones
echo -e "${BLUE}Buscando archivo authService:${NC}"
docker exec masclet-frontend-node find /app -name "*authService*.js" 2>/dev/null

# Paso 5: Iniciar contenedores en orden correcto
echo -e "\n${YELLOW}Paso 5: Reiniciando contenedores en orden correcto...${NC}"

echo -e "${YELLOW}Iniciando contenedor masclet-frontend-node...${NC}"
docker start masclet-frontend-node
sleep 5

echo -e "${YELLOW}Iniciando contenedor masclet-frontend...${NC}"
docker start masclet-frontend
sleep 5

echo -e "${YELLOW}Verificando estado final...${NC}"
docker ps -a | grep masclet

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}✅ DIAGNÓSTICO DE RECUPERACIÓN COMPLETADO${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "\nPor favor, verifica el estado de los contenedores y si el sitio web está accesible."
'@

# PASO 2: Enviar el script al servidor
Write-ColorOutput "🚀 Enviando script al servidor AWS..." "Yellow"

# Crear archivo temporal
$recoveryScript | Out-File -FilePath "recuperacion.sh" -Encoding UTF8

# Copiar al servidor
scp -i $sshKey "recuperacion.sh" "$serverUser@$serverIP`:~/recuperacion.sh"
ssh -i $sshKey $serverUser@$serverIP "chmod +x ~/recuperacion.sh"
Remove-Item -Path "recuperacion.sh"

Write-ColorOutput "✅ Script enviado al servidor correctamente" "Green"

# PASO 3: Ejecutar el script en el servidor
Write-ColorOutput "🔧 Ejecutando script en el servidor..." "Yellow"

ssh -i $sshKey $serverUser@$serverIP "~/recuperacion.sh"

Write-ColorOutput "✅ Proceso completado" "Green"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput "📝 Próximos pasos:" "Yellow"
Write-ColorOutput "1. Revisar la información de diagnóstico obtenida" "White"
Write-ColorOutput "2. Preparar un nuevo script de corrección con las rutas correctas" "White"
Write-ColorOutput "3. Verificar si el sitio web ya está accesible" "White"
Write-ColorOutput "=============================================" "Cyan"
