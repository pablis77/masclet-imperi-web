# Multi-stage build para reducir problemas de dependencias

# Primera etapa: Instalación de dependencias
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar todas las dependencias sin restricciones de producción
# para asegurar que todo se instale correctamente
RUN npm install --legacy-peer-deps

# Instalar manualmente cookie y otras dependencias que podrían faltar
RUN npm install cookie express compression --legacy-peer-deps

# Asegurarnos de tener una versión compatible de React para @tremor/react
RUN npm install react@18 react-dom@18 --legacy-peer-deps

# Segunda etapa: Construcción de la aplicación final
FROM node:18-alpine

WORKDIR /app

# Copiar solo los módulos node necesarios de la etapa anterior
COPY --from=dependencies /app/node_modules /app/node_modules

# Copiar package.json también (aunque ya instalamos sus dependencias)
COPY package*.json ./

# Copiar archivos de la aplicación compilada
COPY ./client/ /app/client/
COPY ./server/ /app/server/

# Copiar el script corrector de API para Docker
COPY ./docker-api-fix.js /app/docker-api-fix.js

# Asegurarse de que el punto de entrada existe
RUN ls -la /app/server/entry.mjs || echo "ADVERTENCIA: No se encuentra el punto de entrada!"

# Asegurar que tenemos todos los módulos necesarios
RUN echo "Listado de dependencias principales instaladas:" && \
    ls -la /app/node_modules | grep -E "cookie|express|compression"

# Configurar variables de entorno
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production
ENV API_URL=http://masclet-backend:8000
ENV API_PREFIX=/api/v1
ENV DOCKER_CONTAINER=true

# Exponer el puerto donde correrá la aplicación
EXPOSE 3000

# Ejecutar el script de configuración de API y luego la aplicación
CMD ["sh", "-c", "node /app/docker-api-fix.js && node ./server/entry.mjs"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
