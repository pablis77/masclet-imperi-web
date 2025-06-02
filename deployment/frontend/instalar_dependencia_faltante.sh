#!/bin/bash
# Solución para instalar la dependencia faltante es-module-lexer en el contenedor frontend

# Entrar al contenedor y ejecutar npm para instalar la dependencia faltante
echo "Instalando dependencia faltante es-module-lexer..."
cd /app
npm install es-module-lexer --save

# Verificar que se ha instalado correctamente
echo "Verificando instalación..."
npm list es-module-lexer

# Reiniciar el servidor Node.js
echo "Reiniciando servidor Node.js..."
pm2 restart all || node server/entry.mjs

echo "Dependencia instalada y servidor reiniciado"
