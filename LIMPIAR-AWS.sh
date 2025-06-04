#!/bin/bash
# Script para limpiar a fondo el servidor AWS
# Mantiene SOLO lo necesario para backend, DB y frontend

echo "=== INICIANDO LIMPIEZA PROFUNDA DEL SERVIDOR AWS ==="
echo "Fecha: $(date)"

# 1. Parar todos los contenedores excepto masclet-api y masclet-db
echo ">>> Parando contenedores innecesarios..."
CONTENEDORES_ACTIVOS=$(docker ps -q --filter "name=masclet-frontend")
if [ ! -z "$CONTENEDORES_ACTIVOS" ]; then
  docker stop $CONTENEDORES_ACTIVOS
  docker rm $CONTENEDORES_ACTIVOS
  echo ">>> Contenedores frontend antiguos eliminados"
fi

# 2. Eliminar todas las imágenes excepto las de masclet-api y masclet-db
echo ">>> Eliminando imágenes innecesarias..."
# Guardar IDs de imágenes que queremos mantener
API_IMAGE=$(docker images -q masclet-imperi-api:latest)
DB_IMAGE=$(docker images -q postgres:17)

# Eliminar todas las demás imágenes
docker images | grep -v "masclet-imperi-api\|postgres:17" | awk '{if(NR>1) print $3}' | xargs -r docker rmi -f

echo ">>> Imágenes innecesarias eliminadas"

# 3. Limpiar caché de construcción de Docker
echo ">>> Limpiando caché de construcción de Docker..."
docker builder prune -af
echo ">>> Caché de construcción eliminada"

# 4. Limpiar volúmenes no utilizados
echo ">>> Limpiando volúmenes no utilizados..."
docker volume prune -f
echo ">>> Volúmenes no utilizados eliminados"

# 5. Limpiar redes no utilizadas
echo ">>> Limpiando redes no utilizadas (excepto masclet-network)..."
docker network prune -f
echo ">>> Redes no utilizadas eliminadas"

# 6. Limpiar archivos temporales
echo ">>> Limpiando archivos temporales..."
rm -rf /tmp/temp_*
rm -rf /tmp/despliegue_*
echo ">>> Archivos temporales eliminados"

# 7. Limpiar caché del sistema
echo ">>> Limpiando caché del sistema..."
yum clean all
rm -rf /var/cache/yum
echo ">>> Caché del sistema eliminada"

# 8. Verificar espacio disponible
echo ">>> Espacio disponible después de la limpieza:"
df -h /

echo "=== LIMPIEZA COMPLETA ==="
echo "El servidor está listo para el despliegue del frontend"
