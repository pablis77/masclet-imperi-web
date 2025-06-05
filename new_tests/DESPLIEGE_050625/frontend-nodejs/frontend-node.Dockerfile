FROM node:18-alpine

WORKDIR /app

# Crear directorios de la aplicación
RUN mkdir -p /app/dist

# Copiar archivos compilados
COPY ./dist /app/dist

# Instalar dependencias mínimas necesarias
RUN npm init -y && \
    npm install express compression

# Copiar el servidor Express
COPY ./server.js /app/server.js

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=80
ENV NODE_ENV=production

# Exponer puerto
EXPOSE 80

# Comando para iniciar el servidor
CMD ["node", "server.js"]
