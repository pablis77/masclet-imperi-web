FROM node:18-alpine

# Instalar dependencias necesarias
RUN npm install -g serve

# Copiar archivos de la aplicación
WORKDIR /app
COPY ./frontend-files/ ./

# Configuración
ENV NODE_ENV=production
ENV PORT=80

# Exponer puerto
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["serve", "-s", "./", "-l", "80"]
