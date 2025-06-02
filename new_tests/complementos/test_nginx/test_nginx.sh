#!/bin/sh

echo "==== PRUEBA DE CONFIGURACIÓN NGINX ===="
echo ""

echo "1. Probando configuración CORRECTA (variables con comillas)..."
cp /etc/nginx/conf.d/correct.conf.disabled /etc/nginx/conf.d/default.conf
nginx -t 2>&1
RESULT_CORRECT=$?

echo ""
echo "2. Probando configuración INCORRECTA (variables sin comillas)..."
cp /etc/nginx/conf.d/incorrect.conf.disabled /etc/nginx/conf.d/default.conf
nginx -t 2>&1
RESULT_INCORRECT=$?

echo ""
echo "==== RESULTADOS DE LA PRUEBA ===="
echo "Configuración CORRECTA (con comillas): $([ $RESULT_CORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"
echo "Configuración INCORRECTA (sin comillas): $([ $RESULT_INCORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"

echo ""
echo "Esta prueba confirma que las variables en la configuración de Nginx DEBEN estar entre comillas"
echo "para que funcione correctamente en producción."

# Mantener el contenedor ejecutándose para inspección
sleep infinity
