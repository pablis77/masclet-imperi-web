# Guía de Despliegue de Masclet Imperi en AWS EC2

## Contenidos del Directorio

Este directorio contiene los archivos necesarios para desplegar Masclet Imperi en un servidor AWS EC2:

- `docker-compose.prod.yml` - Configuración de Docker Compose optimizada para producción
- `Dockerfile.prod` - Dockerfile con las configuraciones necesarias para el entorno de producción
- `.env.prod` - Variables de entorno para producción (no se incluye en Git por seguridad)
- `requirements.prod.txt` - Dependencias de Python específicas para producción
- `deploy.sh` - Script de despliegue para Linux/Mac
- `deploy.ps1` - Script de despliegue para Windows

## Prerrequisitos

- Acceso SSH al servidor EC2
- Archivo de clave PEM para autenticación
- Docker y Docker Compose instalados en EC2
- Puertos 8000 (API) y 5432 (PostgreSQL) abiertos en el grupo de seguridad

## Procedimiento de Despliegue

### Usando el script automatizado (recomendado)

Desde Windows:
```powershell
.\deploy.ps1 -EC2_IP <ip-publica-ec2> -PEM_PATH <ruta-clave-pem>
```

Desde Linux/Mac:
```bash
./deploy.sh <ip-publica-ec2> <ruta-clave-pem>
```

### Despliegue manual

1. Crear directorios para logs y uploads:
   ```bash
   mkdir -p /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads
   chmod -R 777 /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads
   ```

2. Copiar archivos de configuración:
   ```bash
   scp -i <ruta-clave-pem> docker-compose.prod.yml ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/docker-compose.yml
   scp -i <ruta-clave-pem> Dockerfile.prod ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/backend/Dockerfile
   scp -i <ruta-clave-pem> .env.prod ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/.env
   scp -i <ruta-clave-pem> requirements.prod.txt ec2-user@<ip-publica-ec2>:/home/ec2-user/masclet-imperi/backend/requirements.txt
   ```

3. Identificar la red Docker de la base de datos:
   ```bash
   DOCKER_NETWORK=$(sudo docker network ls | grep masclet-imperi | awk '{print $2}')
   ```

4. Detener y eliminar contenedor API existente si existe:
   ```bash
   sudo docker stop masclet-api || true && sudo docker rm masclet-api || true
   ```

5. Construir y ejecutar el contenedor API:
   ```bash
   cd /home/ec2-user/masclet-imperi
   sudo docker build -t masclet-imperi-api ./backend
   sudo docker run -d --name masclet-api --restart unless-stopped -p 8000:8000 -v /home/ec2-user/masclet-imperi/backend:/app -v /home/ec2-user/masclet-imperi/logs:/app/logs --env-file /home/ec2-user/masclet-imperi/.env --network <docker-network> masclet-imperi-api
   ```

6. Verificar estado:
   ```bash
   sudo docker ps
   curl -v http://<ip-publica-ec2>:8000/api/v1/animals/
   ```

7. Crear respaldo de imagen:
   ```bash
   sudo docker commit masclet-api masclet-imperi-api:production
   ```

## Solución de Problemas

### Error de permisos en logs
Verificar que los directorios `/app/logs` y `/app/uploads` existan y tengan permisos 777.

### Error de conexión a la base de datos
Verificar que el contenedor `masclet-db` esté en ejecución y que el contenedor `masclet-api` esté en la misma red Docker.

### Error en archivo .env
Verificar que el archivo `.env` exista y tenga la configuración correcta, especialmente la URL de la base de datos.

## Credenciales por Defecto

El sistema tiene un usuario administrador ya creado:
- Usuario: admin
- Contraseña: admin123

## Endpoints Importantes

- Autenticación: `/api/v1/auth/login` (sin barra diagonal final)
- Recursos: `/api/v1/animals/`, `/api/v1/explotacions/` (con barra diagonal final)
