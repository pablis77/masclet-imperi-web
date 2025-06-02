FROM node:18

WORKDIR /app

# Copiar solo los archivos de configuración primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias con --legacy-peer-deps para resolver conflictos
RUN npm install --legacy-peer-deps

# Instalar explícitamente las dependencias problemáticas
RUN npm install mrmime es-module-lexer kleur @astrojs/node sharp --legacy-peer-deps

# Variables de entorno cruciales
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
# IMPORTANTE: No incluir /api/v1 aquí para evitar duplicación de rutas
ENV VITE_API_URL=http://108.129.139.119:8000
ENV PUBLIC_API_URL=http://108.129.139.119:8000

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto HTTP
EXPOSE 80

# Ejecutar en modo producción
CMD ["node", "./dist/server/entry.mjs"]
