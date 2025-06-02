#!/bin/bash

echo "🔍 Validando configuración de Nginx..."
docker exec masclet-frontend-test nginx -t

echo "📋 Verificando logs de Node.js..."
docker logs masclet-frontend-node-test

echo "🧪 Probando rutas de API (verificación de corrección de URLs)..."
# Prueba 1: API correcta
echo "Prueba 1: /api/v1/ (debe funcionar)"
curl -s http://localhost:8080/api/v1/

# Prueba 2: API con doble prefijo (debe redirigir)
echo "Prueba 2: /api/api/v1/ (debe redirigir)"
curl -s -v http://localhost:8080/api/api/v1/

# Prueba 3: API con patrón problemático (debe redirigir)
echo "Prueba 3: /api/v1/api/v1/ (debe redirigir)"
curl -s -v http://localhost:8080/api/v1/api/v1/

echo "✅ Validación completada"
