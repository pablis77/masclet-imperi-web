#!/bin/sh

echo "==== PRUEBA DE SINTAXIS NGINX - VARIABLES ===="
echo ""

echo "1. Probando configuración CORRECTA (variables con comillas)..."
nginx -c /correct.conf -t 2>&1
RESULT_CORRECT=$?

echo ""
echo "2. Probando configuración INCORRECTA (variables sin comillas)..."
nginx -c /incorrect.conf -t 2>&1
RESULT_INCORRECT=$?

echo ""
echo "==== RESULTADOS DE LA PRUEBA ===="
echo "Configuración CORRECTA (con comillas): $([ $RESULT_CORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"
echo "Configuración INCORRECTA (sin comillas): $([ $RESULT_INCORRECT -eq 0 ] && echo 'VÁLIDA ✅' || echo 'INVÁLIDA ❌')"

echo ""
if [ $RESULT_CORRECT -eq 0 ] && [ $RESULT_INCORRECT -ne 0 ]; then
    echo "✅ CONFIRMADO: Las variables en nginx.conf DEBEN tener comillas"
    echo "✅ SOLUCIÓN VALIDADA: Este es exactamente el problema que teníamos en AWS"
elif [ $RESULT_CORRECT -ne 0 ] && [ $RESULT_INCORRECT -ne 0 ]; then
    echo "❌ Ambas configuraciones fallaron por otra razón"
elif [ $RESULT_CORRECT -eq 0 ] && [ $RESULT_INCORRECT -eq 0 ]; then
    echo "❓ Ambas configuraciones son válidas - Las comillas no afectan la sintaxis"
else
    echo "❓ Resultado inesperado - Revisar logs"
fi

# Mantener el contenedor ejecutándose para inspección
sleep infinity
