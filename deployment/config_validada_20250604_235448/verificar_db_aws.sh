#!/bin/bash
# Comandos para verificar el estado de la base de datos en AWS
echo '=== ESTADO DEL CONTENEDOR DE LA BASE DE DATOS ==='
docker ps -a | grep masclet-db

echo '=== LOGS RECIENTES DE LA BASE DE DATOS ==='
docker logs --tail 20 masclet-db

echo '=== REINICIAR BASE DE DATOS SI ESTÁ DETENIDA ==='
docker start masclet-db

echo '=== COMPROBAR CONECTIVIDAD ==='
docker exec -it masclet-db pg_isready -U postgres
