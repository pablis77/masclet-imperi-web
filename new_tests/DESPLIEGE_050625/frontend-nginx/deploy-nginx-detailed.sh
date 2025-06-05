#!/bin/bash
# ==============================================================
# SCRIPT DE DESPLIEGUE DETALLADO FRONTEND MASCLET IMPERI (NGINX)
# Fecha: 05/06/2025
# ==============================================================
set -e

# Colores para mejor legibilidad
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con formato y timestamp
log_message() {
  local timestamp=$(date +"%H:%M:%S")
  local type=$1
  local message=$2
  
  case $type in
    "INFO")
      echo -e "${BLUE}[INFO]${NC} [$timestamp] $message"
      ;;
    "SUCCESS")
      echo -e "${GREEN}[✓]${NC} [$timestamp] $message"
      ;;
    "WARNING")
      echo -e "${YELLOW}[⚠]${NC} [$timestamp] $message"
      ;;
    "ERROR")
      echo -e "${RED}[✗]${NC} [$timestamp] $message"
      ;;
    "HEADER")
      echo -e "${YELLOW}\n=== $message ===${NC}"
      ;;
    "SUBHEADER")
      echo -e "\n${BLUE}--- $message ---${NC}"
      ;;
  esac
  
  # Guardar también en archivo de log
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] [$type] $message" >> deploy-frontend-nginx.log
}

# Iniciar log y cabecera
echo "" > deploy-frontend-nginx.log
log_message "HEADER" "DESPLEGANDO FRONTEND MASCLET IMPERI CON NGINX"
log_message "INFO" "Fecha y hora de inicio: $(date)"

# Verificar requisitos
log_message "SUBHEADER" "VERIFICACIÓN DE REQUISITOS"

# Verificar Docker
if command -v docker &> /dev/null; then
  log_message "SUCCESS" "Docker está instalado: $(docker --version)"
else
  log_message "ERROR" "Docker no está instalado. Abortando."
  exit 1
fi

# Verificar archivo de compilación
if [ -f "../frontend-compiled.zip" ]; then
  zip_size=$(du -h ../frontend-compiled.zip | cut -f1)
  log_message "SUCCESS" "Archivo de compilación encontrado (Tamaño: $zip_size)"
else
  log_message "ERROR" "No se encontró el archivo frontend-compiled.zip en el directorio superior"
  exit 1
fi

# Verificar archivos de configuración
if [ -f "nginx.conf" ]; then
  log_message "SUCCESS" "Archivo de configuración nginx.conf encontrado"
else
  log_message "ERROR" "No se encontró el archivo nginx.conf"
  exit 1
fi

if [ -f "frontend-nginx.Dockerfile" ]; then
  log_message "SUCCESS" "Dockerfile para Nginx encontrado"
else
  log_message "ERROR" "No se encontró el archivo frontend-nginx.Dockerfile"
  exit 1
fi

# Preparar entorno
log_message "SUBHEADER" "PREPARANDO ENTORNO"

# Detener y eliminar contenedor frontend existente si existe
log_message "INFO" "Deteniendo contenedor frontend existente (si existe)..."
if docker ps -a | grep -q masclet-frontend; then
  docker stop masclet-frontend 2>/dev/null || true
  docker rm masclet-frontend 2>/dev/null || true
  log_message "SUCCESS" "Contenedor anterior detenido y eliminado"
else
  log_message "INFO" "No había contenedor previo en ejecución"
fi

# Crear directorio de trabajo
log_message "INFO" "Preparando directorio de trabajo..."
rm -rf frontend-deploy 2>/dev/null || true
mkdir -p frontend-deploy
cd frontend-deploy

# Extraer archivos compilados
log_message "SUBHEADER" "DESPLEGANDO ARCHIVOS"
log_message "INFO" "Extrayendo archivos compilados..."
unzip -o ../frontend-compiled.zip
if [ $? -eq 0 ]; then
  log_message "SUCCESS" "Archivos extraídos correctamente"
else
  log_message "ERROR" "Error al extraer archivos de frontend-compiled.zip"
  exit 1
fi

# Verificar contenido de la compilación
log_message "SUBHEADER" "VERIFICANDO ESTRUCTURA DE ARCHIVOS"
total_files=$(find . -type f | wc -l)
total_dirs=$(find . -type d | wc -l)
log_message "INFO" "Archivos totales: $total_files, Directorios: $total_dirs"

# Verificar archivos críticos
if [ -f "index.html" ]; then
  log_message "SUCCESS" "Archivo index.html presente"
else
  log_message "WARNING" "No se encontró index.html en el directorio raíz!"
  # Buscar si existe en algún subdirectorio
  index_path=$(find . -name "index.html" | head -1)
  if [ -n "$index_path" ]; then
    log_message "INFO" "index.html encontrado en: $index_path"
  fi
fi

# Verificar directorio de assets
if [ -d "assets" ]; then
  assets_count=$(find ./assets -type f | wc -l)
  log_message "SUCCESS" "Directorio assets encontrado con $assets_count archivos"
else
  log_message "WARNING" "No se encontró el directorio assets!"
fi

# Copiar configuración de Nginx
log_message "INFO" "Copiando configuración de Nginx..."
cp ../nginx.conf .
if [ $? -eq 0 ]; then
  log_message "SUCCESS" "Configuración de Nginx copiada"
else
  log_message "ERROR" "Error al copiar nginx.conf"
  exit 1
fi

# Construir imagen Docker
log_message "SUBHEADER" "CONSTRUYENDO IMAGEN DOCKER"
log_message "INFO" "Construyendo imagen Docker con Nginx..."

# Guardar detalles de los archivos incluidos en el Dockerfile
log_message "INFO" "Registrando archivos incluidos en la imagen..."
find . -type f -not -path "*/\.*" | sort > ./files-included.txt
log_message "SUCCESS" "Lista de archivos guardada en files-included.txt"

docker build -t masclet-frontend:nginx -f ../frontend-nginx.Dockerfile . 2>&1 | tee docker-build.log
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_message "SUCCESS" "Imagen Docker construida correctamente"
else
  log_message "ERROR" "Error al construir imagen Docker. Consulta docker-build.log"
  exit 1
fi

# Verificar si ya existe la red Docker
log_message "SUBHEADER" "CONFIGURANDO RED"
log_message "INFO" "Verificando red Docker..."
if ! docker network ls | grep -q masclet-network; then
  log_message "INFO" "Creando red Docker masclet-network..."
  docker network create masclet-network
  log_message "SUCCESS" "Red Docker masclet-network creada"
else
  log_message "SUCCESS" "Red Docker masclet-network ya existe"
fi

# Iniciar contenedor
log_message "SUBHEADER" "INICIANDO SERVICIO"
log_message "INFO" "Iniciando contenedor frontend con Nginx..."
docker run -d --name masclet-frontend \
  --restart always \
  --network masclet-network \
  -p 80:80 \
  masclet-frontend:nginx

# Verificar que el contenedor esté en ejecución
sleep 3
if docker ps | grep -q masclet-frontend; then
  container_id=$(docker ps | grep masclet-frontend | awk '{print $1}')
  log_message "SUCCESS" "Contenedor frontend iniciado correctamente (ID: $container_id)"
else
  log_message "ERROR" "El contenedor no está ejecutándose después de 3 segundos"
  log_message "INFO" "Últimas líneas del log del contenedor:"
  docker logs masclet-frontend --tail 20
  exit 1
fi

# Verificar accesibilidad del servicio
log_message "SUBHEADER" "VERIFICANDO SERVICIO"
log_message "INFO" "Comprobando respuesta HTTP del servidor Nginx..."

sleep 2
# Probar acceso al servidor Nginx
if curl -s --head http://localhost:80 | grep -q "200 OK\|302 Found\|HTTP/1.1"; then
  log_message "SUCCESS" "El servidor responde correctamente a peticiones HTTP"
else
  log_message "WARNING" "El servidor no respondió correctamente a la petición HTTP"
  log_message "INFO" "Verificando logs del contenedor:"
  docker logs masclet-frontend --tail 20
fi

# Verificar logs (primeras 10 líneas)
log_message "INFO" "Primeras líneas de logs del contenedor:"
docker logs masclet-frontend --tail 10

# Verificación final del espacio en disco
log_message "SUBHEADER" "INFORMACIÓN DEL SISTEMA"
log_message "INFO" "Uso de disco después del despliegue:"
df -h / | grep -v "Filesystem"

log_message "INFO" "Tamaños de las imágenes Docker:"
docker images | grep masclet-frontend

log_message "INFO" "Contenedores en ejecución:"
docker ps | grep masclet

# Resumen final
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "IP-DEL-SERVIDOR")
log_message "HEADER" "FRONTEND CON NGINX DESPLEGADO EXITOSAMENTE"
log_message "SUCCESS" "Fecha y hora de finalización: $(date)"
log_message "INFO" "Frontend accesible en: http://$SERVER_IP"
log_message "INFO" "Para ver los logs completos ejecutar: docker logs masclet-frontend"
log_message "INFO" "Para detalles del despliegue consultar: deploy-frontend-nginx.log"

# Crear un resumen separado
log_message "SUBHEADER" "INSTRUCCIONES POST-DESPLIEGUE"
cat << EOF > instrucciones-post-despliegue.txt
INSTRUCCIONES POST-DESPLIEGUE MASCLET IMPERI FRONTEND (NGINX)
=============================================================
Fecha de despliegue: $(date)

ACCESO:
- Frontend accesible en: http://$SERVER_IP
- URL local: http://localhost

MANTENIMIENTO:
- Ver logs: docker logs masclet-frontend
- Reiniciar servicio: docker restart masclet-frontend
- Detener servicio: docker stop masclet-frontend
- Iniciar servicio detenido: docker start masclet-frontend
- Reconstruir desde cero: ./deploy-nginx-detailed.sh

SOLUCIÓN DE PROBLEMAS:
- Si hay problemas de acceso, verificar:
  1. docker ps | grep masclet-frontend (debe estar en ejecución)
  2. docker logs masclet-frontend (buscar errores)
  3. curl -v http://localhost:80 (probar respuesta HTTP)

EOF

log_message "SUCCESS" "Instrucciones post-despliegue guardadas en: instrucciones-post-despliegue.txt"
