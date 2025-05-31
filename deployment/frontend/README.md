# Guía de Despliegue del Frontend de Masclet Imperi en AWS EC2

## Contenidos del Directorio

Este directorio contiene los archivos necesarios para desplegar el Frontend de Masclet Imperi en un servidor AWS EC2:

- `docker-compose.prod.yml` - Configuración completa para desplegar frontend, API y base de datos
- `Dockerfile.prod` - Dockerfile optimizado para construir y servir el frontend
- `deploy.ps1` - Script de despliegue para Windows

## Prerrequisitos

- Acceso SSH al servidor EC2
- Archivo de clave PEM para autenticación
- Docker instalado en EC2
- Puerto 80 (HTTP) abierto en el grupo de seguridad
- El backend ya debe estar desplegado y funcionando

## Procedimiento de Despliegue

### Usando el script automatizado (recomendado)

Desde Windows:
```powershell
.\deploy.ps1 -EC2_IP <ip-publica-ec2> -PEM_PATH <ruta-clave-pem>
```

### Despliegue manual

1. Crear directorios para el frontend:
   ```bash
   mkdir -p /home/ec2-user/masclet-imperi/frontend
   ```

2. Copiar el código fuente del frontend:
   ```bash
   # Comprimir el código fuente localmente
   # Transferir a EC2
   scp -i <ruta-clave-pem> frontend-temp.zip ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/
   # Descomprimir en EC2
   ssh -i <ruta-clave-pem> ec2-user@<ip-publica-ec2> "cd /home/ec2-user/masclet-imperi && unzip -o frontend-temp.zip -d frontend-source"
   ```

3. Copiar archivos de configuración:
   ```bash
   scp -i <ruta-clave-pem> Dockerfile.prod ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/frontend/Dockerfile
   ```

4. Identificar la red Docker existente:
   ```bash
   DOCKER_NETWORK=$(sudo docker network ls | grep masclet-imperi | awk '{print $2}')
   ```

5. Construir y ejecutar el contenedor Frontend:
   ```bash
   cd /home/ec2-user/masclet-imperi
   sudo docker build -t masclet-imperi-frontend -f frontend/Dockerfile .
   sudo docker run -d --name masclet-frontend --restart unless-stopped -p 80:3000 -e API_URL=http://masclet-api:8000/api/v1 --network $DOCKER_NETWORK masclet-imperi-frontend
   ```

6. Verificar estado:
   ```bash
   sudo docker ps
   curl -v http://<ip-publica-ec2>/
   ```

## Solución de Problemas

### Error de conexión a la API
Verificar que el contenedor `masclet-api` esté en ejecución y que el contenedor `masclet-frontend` esté en la misma red Docker.

### Error 404 en el frontend
Verificar que las rutas de Astro estén correctamente configuradas para el modo de producción.

### Proxy no funciona
Verificar que la configuración de proxy en el servidor Node.js esté apuntando a la URL correcta de la API.

## Credenciales por Defecto

Para acceder a la aplicación, usar:
- Usuario: admin
- Contraseña: admin123

## Acceso a la Aplicación

Una vez desplegada, la aplicación estará disponible en:
- Frontend: `http://<ip-publica-ec2>/`
- API: `http://<ip-publica-ec2>:8000/api/v1/`
- Documentación API: `http://<ip-publica-ec2>:8000/docs`
