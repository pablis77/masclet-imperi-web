FROM nginx:alpine

# Copiar archivos estáticos para que Nginx los sirva directamente
COPY ./client/ /usr/share/nginx/html/client/

# Copia de la configuración de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl -f http://localhost/ || exit 1
