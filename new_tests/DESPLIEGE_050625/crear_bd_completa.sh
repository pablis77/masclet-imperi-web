#!/bin/bash
# Script para crear la base de datos completa con el usuario correcto
echo "Creando base de datos masclet_imperi..."
docker exec masclet-db psql -U postgres -c "CREATE DATABASE masclet_imperi;"

echo "Asegurando que el usuario admin existe con permisos correctos..."
docker exec masclet-db psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;" 2>/dev/null || echo "Usuario ya existe"

echo "Asignando permisos al usuario admin sobre la base de datos..."
docker exec masclet-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;"

echo "Configurando el usuario admin como dueño de la base de datos..."
docker exec masclet-db psql -U postgres -c "ALTER DATABASE masclet_imperi OWNER TO admin;"

echo "Verificando usuarios y bases de datos..."
echo "Usuarios:"
docker exec masclet-db psql -U postgres -c '\du'
echo "Bases de datos:"
docker exec masclet-db psql -U postgres -c '\l'
