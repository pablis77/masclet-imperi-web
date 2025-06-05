#!/bin/bash
# Script para crear el usuario admin en la base de datos
docker exec masclet-db psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123' SUPERUSER;"
docker exec masclet-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO admin;"
