#!/bin/bash
# Script para actualizar CORS_ORIGINS en el contenedor masclet-api

# Detener el contenedor actual
echo "Deteniendo el contenedor masclet-api..."
docker stop masclet-api

# Reiniciar el contenedor con la nueva variable de entorno
echo "Reiniciando el contenedor con CORS_ORIGINS actualizado..."
docker run -d --name masclet-api-new \
  --network bridge \
  -e CORS_ORIGINS="https://masclet-imperi.com,http://localhost:4321,https://production.d22i0xni7fl97z.amplifyapp.com" \
  -p 8000:8000 \
  --restart unless-stopped \
  masclet-api-imagen-completa

# Verificar que el nuevo contenedor está funcionando
echo "Verificando el nuevo contenedor..."
sleep 5
docker ps | grep masclet-api-new

# Si todo está bien, eliminar el contenedor antiguo y renombrar el nuevo
echo "Eliminando el contenedor antiguo y renombrando el nuevo..."
docker rm masclet-api
docker rename masclet-api-new masclet-api

# Mostrar la configuración CORS actualizada
echo "Configuración CORS actualizada:"
docker exec masclet-api env | grep CORS
