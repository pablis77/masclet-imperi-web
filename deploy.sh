#!/bin/bash
set -e

echo "Deteniendo contenedores antiguos si existen..."
sudo docker stop masclet-frontend || true
sudo docker rm masclet-frontend || true

echo "Iniciando nuevo contenedor Frontend..."
sudo docker run -d \
  --name masclet-frontend \
  --network masclet-imperi_default \
  -p 80:80 \
  -v /home/ec2-user/masclet-imperi-frontend/dist:/usr/share/nginx/html \
  -v /home/ec2-user/masclet-imperi-frontend/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine

echo "Contenedor iniciado correctamente"
