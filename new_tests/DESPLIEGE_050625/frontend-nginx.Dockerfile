FROM nginx:stable-alpine

# Eliminar configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/* && rm /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY ./dist/ /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
