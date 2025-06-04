#!/bin/bash
# Script para limpiar a fondo Docker en AWS
# SOLO mantiene los contenedores masclet-api y masclet-db activos

echo "=== INICIANDO LIMPIEZA PROFUNDA DE DOCKER EN AWS ==="
echo "Fecha: $(date)"

# 1. Verificar contenedores que queremos mantener
echo ">>> Verificando contenedores activos..."
docker ps

# 2. Detener y eliminar contenedor frontend si existe
echo ">>> Eliminando contenedor frontend anterior..."
docker stop masclet-frontend 2>/dev/null || true
docker rm masclet-frontend 2>/dev/null || true
echo ">>> Contenedor frontend eliminado"

# 3. Eliminar todas las imágenes excepto las que están en uso
echo ">>> Eliminando imágenes no utilizadas..."
docker image prune -af
echo ">>> Imágenes no utilizadas eliminadas"

# 4. Limpiar sistema de archivos de Docker
echo ">>> Limpiando sistema de archivos de Docker..."
docker system prune -af --volumes
echo ">>> Sistema de archivos de Docker limpiado"

# 5. Limpiar archivos temporales
echo ">>> Limpiando archivos temporales..."
rm -rf /tmp/temp_*
rm -rf /tmp/despliegue_*
echo ">>> Archivos temporales eliminados"

# 6. Limpiar caché del sistema
echo ">>> Limpiando caché del sistema..."
yum clean all
rm -rf /var/cache/yum
echo ">>> Caché del sistema eliminada"

# 7. Verificar espacio disponible
echo ">>> Espacio disponible después de la limpieza:"
df -h /

echo "=== LIMPIEZA COMPLETA ==="
echo "El servidor está listo para el despliegue del frontend"
