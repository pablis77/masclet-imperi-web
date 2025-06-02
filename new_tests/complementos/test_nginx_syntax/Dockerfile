FROM nginx:alpine

COPY nginx_correct.conf /correct.conf
COPY nginx_incorrect.conf /incorrect.conf

# Script para probar ambas configuraciones
COPY test_syntax.sh /test_syntax.sh
RUN chmod +x /test_syntax.sh

CMD ["sh", "/test_syntax.sh"]
