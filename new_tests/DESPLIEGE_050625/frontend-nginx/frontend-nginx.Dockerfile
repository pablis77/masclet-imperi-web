FROM nginx:alpine

# Copiar archivos de frontend compilados
COPY ./dist/ /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno
ENV NGINX_HOST=0.0.0.0
ENV NGINX_PORT=80

# Exponer puerto
EXPOSE 80

# Comando por defecto de la imagen base
# CMD ["nginx", "-g", "daemon off;"]
