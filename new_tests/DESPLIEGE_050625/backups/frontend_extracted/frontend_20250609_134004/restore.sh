#!/bin/bash
# Script de restauración generado automáticamente

echo "🔄 Iniciando restauración de contenedores frontend desde backup"

# Cargar imágenes
if [ -f nginx_image.tar ]; then
  echo "Cargando imagen de Nginx..."
  docker load -i nginx_image.tar
fi

if [ -f nodejs_image.tar ]; then
  echo "Cargando imagen de Node.js..."
  docker load -i nodejs_image.tar
fi

echo "✅ Restauración completa. Verifique las imágenes Docker disponibles con 'docker images'."
echo "Para recrear los contenedores, use los comandos docker run correspondientes."
