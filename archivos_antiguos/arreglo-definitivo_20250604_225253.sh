#!/bin/bash

echo "🚀 Arreglo definitivo para el despliegue del frontend - 3:20 AM"

# Detener y eliminar contenedor anterior
docker stop masclet-frontend > /dev/null 2>&1
docker rm masclet-frontend > /dev/null 2>&1

# Crear package.json compatible con ambos scripts
cat > package.json << 'EOL'
{
  "name": "masclet-frontend",
  "version": "1.0.0",
  "main": "fix-server.js",
  "scripts": {
    "start": "node fix-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "http-proxy-middleware": "^2.0.6",
    "node-fetch": "^3.3.0"
  },
  "type": "module"
}
EOL

# Crear fix-api-urls-es.js con sintaxis de ES modules
cat > fix-api-urls-es.js << 'EOL'
// Script para corregir URLs de API en entorno de producción
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar ambiente
const environment = process.env.NODE_ENV || 'production';
console.log('🔍 Entorno detectado:', environment);

// Solo aplicar correcciones en producción
if (environment === 'production') {
  console.log('🔧 Aplicando correcciones para entorno de producción...');
  
  // Archivos a procesar
  const clientDir = path.resolve(__dirname, 'dist/client/_astro');
  
  try {
    const files = fs.readdirSync(clientDir);
    let filesFixed = 0;

    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(clientDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazar URLs absolutas con relativas para que funcione el proxy
        const originalContent = content;
        content = content.replace(/http:\/\/127\.0\.0\.1:8000\/api\/v1\//g, '/api/v1/');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          filesFixed++;
          console.log(`✅ Fixed: ${file}`);
        }
      }
    });

    console.log(`🎉 Corrección completada! ${filesFixed} archivos modificados.`);
  } catch (error) {
    console.error('❌ Error procesando archivos:', error);
  }
} else {
  console.log('ℹ️ No se requieren correcciones en entorno de desarrollo');
}
EOL

# Crear Dockerfile manualmente
cat > Dockerfile << 'EOL'
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración primero
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar archivos necesarios
COPY ./dist/ /app/dist/
COPY ./fix-server.js /app/
COPY ./fix-api-urls-es.js /app/
COPY ./client-hydration-fix.js /app/

# Ejecutar script para corregir URLs de API
RUN node fix-api-urls-es.js

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

# Puerto expuesto
EXPOSE 80

# Comando de inicio
CMD ["node", "fix-server.js"]
EOL

# Construir la imagen Docker
echo "🔧 Construyendo imagen Docker con configuración corregida..."
docker build -t masclet-frontend:latest .

# Verificar red Docker
echo "🔍 Verificando la red Docker..."
if ! docker network ls | grep -q masclet-network; then
    echo "📦 Creando red Docker masclet-network..."
    docker network create masclet-network
fi

# Conectar contenedores
echo "🔄 Conectando contenedores a la red..."

echo "🔗 Conectando masclet-api a masclet-network..."
if docker network inspect masclet-network | grep -q "masclet-api"; then
    echo "Ya conectado"
else
    docker network connect masclet-network masclet-api || echo "❌ Error: No se pudo conectar masclet-api"
fi

echo "🔗 Conectando masclet-db a masclet-network..."
if docker network inspect masclet-network | grep -q "masclet-db"; then
    echo "Ya conectado"
else
    docker network connect masclet-network masclet-db || echo "❌ Error: No se pudo conectar masclet-db"
fi

# Iniciar el contenedor
echo "🚀 Iniciando contenedor frontend..."
docker run -d --name masclet-frontend \
    -p 80:80 \
    -e NODE_ENV=production \
    -e PORT=80 \
    -e HOST=0.0.0.0 \
    -e BACKEND_URL=http://masclet-api:8000 \
    --network masclet-network \
    --restart unless-stopped \
    masclet-frontend:latest

# Verificar resultado
echo "✅ Verificando contenedores activos..."
docker ps

# Ver logs
echo "📋 Logs del contenedor (primeros 10 segundos)..."
sleep 3
docker logs masclet-frontend
