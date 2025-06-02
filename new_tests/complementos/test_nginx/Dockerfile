FROM nginx:alpine

COPY nginx_correct.conf /etc/nginx/conf.d/correct.conf.disabled
COPY nginx_incorrect.conf /etc/nginx/conf.d/incorrect.conf.disabled

# Script para probar ambas configuraciones
COPY test_nginx.sh /test_nginx.sh
RUN chmod +x /test_nginx.sh

CMD ["sh", "/test_nginx.sh"]
