FROM node:18

WORKDIR /app

# Copiar solo los archivos de configuración primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias con cache
RUN npm ci --only=production

# Instalar explícitamente las dependencias problemáticas
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Variables de entorno cruciales
ENV HOST=0.0.0.0
ENV PORT=80
# IMPORTANTE: No incluir /api/v1 aquí para evitar duplicación de rutas
ENV VITE_API_URL=http://54.217.31.124:8000
ENV PUBLIC_API_URL=http://54.217.31.124:8000

# Copiar configuración de Vite optimizada para producción
COPY new_tests/DESPLIEGE_050625/vite.config.production.js ./vite.config.js

# Establecer variables para optimizar la compilación
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Compilar la aplicación con optimizaciones y tiempo de espera extendido
RUN node --max-old-space-size=2048 ./node_modules/.bin/astro build --config ./vite.config.js

# Aplicar scripts de corrección
# 1. Corregir URLs de API duplicadas
RUN if [ -f fix-api-urls-enhanced.cjs ]; then node fix-api-urls-enhanced.cjs; fi

# 2. Aplicar correcciones de hidratación del cliente
RUN if [ -f client-hydration-fix.cjs ]; then node client-hydration-fix.cjs; fi

# 3. Aplicar correcciones al servidor si existe
RUN if [ -f fix-server.cjs ]; then node fix-server.cjs; fi

# Exponer puerto HTTP
EXPOSE 80

# Ejecutar en modo producción
CMD ["node", "./dist/server/entry.mjs"]
