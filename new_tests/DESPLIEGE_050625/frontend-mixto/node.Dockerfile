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

# Copiar archivos de configuración de la API para Docker
COPY ./docker-api-master.js /app/docker-api-master.js
COPY ./docker-api-detector.js /app/docker-api-detector.js
COPY ./docker-api-config.js /app/docker-api-config.js
COPY ./docker-api-injector.js /app/docker-api-injector.js

# Copiar script de diagnóstico
COPY ./docker-diagnose.js /app/docker-diagnose.js

# Instalar herramientas de diagnóstico para Alpine Linux
RUN apk update && apk add --no-cache \
    iputils \
    busybox-extras \
    iproute2 \
    bind-tools \
    curl

# Verificar estructura antes de la ejecución
RUN mkdir -p /app/logs \
    && touch /app/logs/node-startup.log \
    && echo "Contenido de /app:" > /app/logs/node-startup.log \
    && ls -la /app >> /app/logs/node-startup.log \
    && echo "\nContenido de /app/server (si existe):" >> /app/logs/node-startup.log \
    && ls -la /app/server >> /app/logs/node-startup.log 2>&1 || echo "No existe /app/server todavía"

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

# Crear script de arranque para ejecutar diagnóstico y configuración
RUN echo '#!/bin/sh\n\n# Verificar archivos clave\necho "Verificando archivos necesarios..."\nls -la /app\nls -la /app/server\nfind /app -name "entry.mjs" || echo "ERROR: No se encuentra entry.mjs"\n\n# Iniciar diagnóstico en segundo plano\necho "Iniciando diagnóstico en segundo plano..."\nnode /app/docker-diagnose.js > /app/diagnostico.log 2>&1 &\n\n# Ejecutar el script de configuración API\necho "Iniciando script de configuración API..."\nnode /app/docker-api-master.js\n\n# Ejecutar la aplicación\necho "Iniciando la aplicación..."\ncd /app && node server/entry.mjs\n\n# Mantener el contenedor ejecutándose en caso de error\necho "La aplicación ha terminado, manteniendo contenedor activo..."\ntail -f /app/diagnostico.log\n' > /app/startup.sh \
    && chmod +x /app/startup.sh && cat /app/startup.sh

# Comando para ejecutar
CMD ["/bin/sh", "/app/startup.sh"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
