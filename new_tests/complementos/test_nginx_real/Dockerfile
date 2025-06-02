FROM nginx:alpine

COPY nginx_aws.conf /etc/nginx/conf.d/default.conf

# Script para obtener errores de sintaxis
RUN nginx -t 2>/nginx_error.log || echo "Error detectado"

# Crear comando simple para mostrar logs y mantener el contenedor
CMD ["sh", "-c", "cat /nginx_error.log && echo 'Manteniendo contenedor vivo para inspección' && sleep infinity"]
