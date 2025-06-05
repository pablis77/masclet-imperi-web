#!/bin/bash
# Script para crear la base de datos masclet_imperi dentro del contenedor masclet-db
echo "Creando base de datos masclet_imperi dentro del contenedor masclet-db..."
docker exec masclet-db psql -U postgres -c "CREATE DATABASE masclet_imperi;"

echo "Creando usuario admin..."
docker exec masclet-db psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;"

echo "Asignando permisos al usuario admin sobre la base de datos..."
docker exec masclet-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;"
