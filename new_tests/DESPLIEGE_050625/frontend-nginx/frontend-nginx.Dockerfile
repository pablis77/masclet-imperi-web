FROM nginx:alpine

# Copiar archivos de frontend compilados - manteniendo la estructura de Astro
COPY ./client/ /usr/share/nginx/html/client/
COPY ./server/ /usr/share/nginx/html/server/

# Copiar el archivo index.html de redirección
COPY ./index.html /usr/share/nginx/html/index.html

# Copiar configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno
ENV NGINX_HOST=0.0.0.0
ENV NGINX_PORT=80

# Exponer puerto 80
EXPOSE 80

# Configuración de salud
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1

# El comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
