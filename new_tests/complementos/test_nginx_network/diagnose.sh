#!/bin/sh

echo "==== DIAGNÓSTICO DE RED NGINX ===="

echo "\n1. Comprobando estado de contenedores..."
docker ps

echo "\n2. Verificando sintaxis de Nginx..."
docker exec masclet-frontend nginx -t

echo "\n3. Verificando logs de error de Nginx..."
docker exec masclet-frontend cat /var/log/nginx/masclet_error.log

echo "\n4. Pruebas de conectividad interna..."
docker exec masclet-frontend ping -c 2 masclet-frontend-node
docker exec masclet-frontend ping -c 2 masclet-api

echo "\n5. Verificando contenido del proxy_pass..."
docker exec masclet-frontend cat /etc/nginx/conf.d/default.conf | grep proxy_pass

echo "\n6. Verificando estado del servicio Nginx..."
docker exec masclet-frontend service nginx status

echo "\nDiagnóstico completado."
