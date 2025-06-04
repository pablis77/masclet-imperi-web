FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copia archivos de configuración
COPY package.json ./

# Instala dependencias
RUN npm install

# Copia archivos de aplicación
COPY dist/ ./dist/
COPY fix-server-definitivo.js ./
COPY ./client-hydration-fix.js ./

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV BACKEND_URL=http://masclet-api:8000

# Puerto expuesto
EXPOSE 80

# Comando de inicio
CMD ["node", "fix-server-definitivo.js"]
