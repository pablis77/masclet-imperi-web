FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de la build
COPY ./dist/ /app/

# Instalar servidor ligero (serve)
RUN npm install -g serve

# Variables de entorno para configuración
ENV PORT=80
ENV NODE_ENV=production
ENV BACKEND_URL=http://masclet-api:8000
ENV API_PREFIX=""

# Exponer puerto
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["serve", "-s", "-l", "80"]
