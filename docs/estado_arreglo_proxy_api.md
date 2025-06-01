# Estado actual de la corrección del proxy API (2025-06-01)

## Problema identificado
- En producción, el proxy Nginx está configurado incorrectamente
- Intenta resolver el hostname Docker interno `masclet-api` desde el host, causando errores DNS
- Hay rutas duplicadas `/api/api/v1` porque el frontend añade `/api` y el backend está montado en `/api/v1`
- El contenedor Nginx `masclet-frontend` no tiene configurada correctamente la ruta `/api/`

## Diagnóstico realizado
- Nginx está corriendo dentro del contenedor `masclet-frontend`, no en el host
- La ruta funcional es `/api/api/v1/auth/login` (tiene duplicación)
- El problema está en la configuración del Nginx dentro del contenedor

## Solución pendiente de aplicar
El siguiente comando SSH ejecutado directamente en el servidor solucionará el problema:

```bash
echo 'server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://masclet-frontend-node:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API - NUEVO
    location /api/ {
        proxy_pass http://masclet-api:8000/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}' > /tmp/nginx.conf

sudo docker cp /tmp/nginx.conf masclet-frontend:/etc/nginx/conf.d/default.conf
sudo docker exec masclet-frontend nginx -t
sudo docker exec masclet-frontend nginx -s reload
```

## Próximos pasos
1. Conectar por SSH al servidor: `ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119`
2. Ejecutar los comandos anteriores para corregir la configuración
3. Verificar que la ruta `/api/auth/login` funciona correctamente (sin duplicación)
4. Probar el login completo desde el frontend

## Información importante
- IP del servidor: 108.129.139.119
- Ubicación PEM: C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem
- Usuario SSH: ec2-user
- Contenedores involucrados:
  - masclet-frontend (Nginx)
  - masclet-frontend-node (Node.js)
  - masclet-api (FastAPI backend)
  - masclet-db (PostgreSQL)
