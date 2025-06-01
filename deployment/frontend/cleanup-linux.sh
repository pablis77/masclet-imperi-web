#!/bin/bash

echo "🧹 Limpiando entorno previo..."

# Detener y eliminar contenedores anteriores si existen
if docker ps -a | grep -q masclet-frontend; then
    echo "Deteniendo contenedor Nginx anterior..."
    docker stop masclet-frontend
    docker rm masclet-frontend
fi

if docker ps -a | grep -q masclet-frontend-node; then
    echo "Deteniendo contenedor Node.js anterior..."
    docker stop masclet-frontend-node
    docker rm masclet-frontend-node
fi

# Limpiar directorio de frontend de forma segura
echo "Limpiando directorio de frontend de forma segura..."

# Eliminar todo excepto node_modules
find /home/ec2-user/masclet-imperi-frontend -maxdepth 1 -not -path "/home/ec2-user/masclet-imperi-frontend" -not -path "/home/ec2-user/masclet-imperi-frontend/node_modules" -exec rm -rf {} \;

# Para node_modules, en lugar de borrar el directorio entero, lo movemos temporalmente y creamos uno nuevo
if [ -d "/home/ec2-user/masclet-imperi-frontend/node_modules" ]; then
  echo "Moviendo node_modules antiguo para evitar problemas de permisos..."
  mv /home/ec2-user/masclet-imperi-frontend/node_modules /home/ec2-user/masclet-imperi-frontend-node_modules-old
  mkdir -p /home/ec2-user/masclet-imperi-frontend/node_modules
  
  # Programamos eliminación del directorio antiguo después del reinicio
  echo "Programando limpieza futura de node_modules antiguo..."
  (crontab -l 2>/dev/null; echo "@reboot rm -rf /home/ec2-user/masclet-imperi-frontend-node_modules-old") | crontab -
fi

# Crear directorio si no existe
mkdir -p /home/ec2-user/masclet-imperi-frontend
mkdir -p /home/ec2-user/masclet-imperi-frontend/server

echo "✅ Limpieza completada"
