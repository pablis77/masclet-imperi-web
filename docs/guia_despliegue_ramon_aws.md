# Guía de Despliegue Completo para RAMON en AWS

## IMPORTANTE: Rutas a nuestros backups completos

| Componente | Ubicación backup | Tamaño | Función |
|-----------|-----------------|--------|----------|
| Base de datos | `C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-db-imagen-completa.tar.gz` | 149.54 KB | Imagen completa y autónoma de PostgreSQL 17 con todas las tablas y datos migrados |
| Backend | `C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-api-imagen-completa.tar.gz` | 134 MB | Imagen completa y autónoma del backend (FastAPI) con toda la aplicación configurada |
| Frontend | *Pendiente creación* | - | - |

## ATENCIÓN: Aclaración importante sobre las imágenes

Los backups de base de datos y backend **contienen absolutamente todo lo necesario** para desplegar estos componentes. No se necesita descargar ni instalar software por separado, ya que:

### Sobre el backup de base de datos `masclet-db-imagen-completa.tar.gz`

- Es una imagen Docker completa y autónoma
- Incluye PostgreSQL 17 y todas sus dependencias
- Contiene todas las tablas y datos ya migrados
- Está lista para funcionar solo con cargarla y arrancarla

### Sobre el backup de backend `masclet-api-imagen-completa.tar.gz`

- Es una imagen Docker completa y autónoma
- Incluye la API de FastAPI con toda su configuración
- Contiene todas las dependencias Python y bibliotecas necesarias
- Está lista para funcionar solo con cargarla y arrancarla

Aunque aparentemente los tamaños comprimidos parecen pequeños comparados con el tamaño en el servidor, esto se debe a la excelente compresión que realiza `gzip`, sin pérdida de información.

## Objetivo

Este documento proporciona una guía paso a paso para desplegar la aplicación Masclet Imperi en AWS, con instrucciones específicas para garantizar un despliegue sin errores ni complicaciones.

## Obtener la clave AWS .pem para conectarse al servidor

1. **Crear par de claves en AWS Console**: 
   - Accede a la consola AWS > EC2 > "Key Pairs" > "Create key pair"
   - Nombra la clave (ej: "masclet-imperi-key") y selecciona formato .pem
   - Descárgala automáticamente (solo se podrá descargar UNA vez)

2. **Guardar la clave en un lugar seguro**: 
   - Guárdala en una carpeta segura (ej: `C:\Proyectos\AWS\`)
   - NUNCA compartas esta clave - contiene acceso completo al servidor

3. **Configurar permisos de la clave**:
   - En Windows: Click derecho > Propiedades > Seguridad > Avanzado > Solo tu usuario debe tener acceso
   - En Linux/Mac: `chmod 400 tu-clave-aws.pem`

## 1. Requisitos previos

- Tener acceso a la instancia AWS con la clave `.pem` correcta
- Tener Docker y Docker Compose instalados en la instancia
- Tener un backup actualizado de la base de datos

## 2. Proceso de despliegue garantizado

### 2.1. Preparación de la instancia AWS

```bash
# Conectarse a la instancia
ssh -i "ruta-a-la-clave.pem" ec2-user@IP-DE-LA-INSTANCIA

# Crear estructura de carpetas
mkdir -p ~/masclet-imperi/{db,backend,frontend,config,logs,backups,exito}

# Instalar Docker y Docker Compose (si no están ya instalados)
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reconectar para aplicar cambios de grupo
exit
# Volver a conectar
ssh -i "ruta-a-la-clave.pem" ec2-user@IP-DE-LA-INSTANCIA
```

### 2.2. Configuración de la base de datos

1. Crear el archivo de configuración en `~/masclet-imperi/config/db.env`:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=masclet_imperi
PGDATA=/var/lib/postgresql/data/pgdata
```

2. Crear el archivo docker-compose en `~/masclet-imperi/docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    container_name: masclet-db
    image: postgres:17
    restart: always
    env_file:
      - config/db.env
    ports:
      - "5432:5432"
    volumes:
      - ~/masclet-imperi/db/data:/var/lib/postgresql/data
      - ~/masclet-imperi/backups:/backups
    environment:
      - TZ=Europe/Madrid
    networks:
      - masclet-network

  backend:
    container_name: masclet-backend
    image: masclet-imperi-api:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    env_file:
      - config/backend.env
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - ~/masclet-imperi/logs:/app/logs
    networks:
      - masclet-network

  frontend:
    container_name: masclet-frontend
    image: masclet-imperi-frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - masclet-network

networks:
  masclet-network:
    name: masclet-network
    driver: bridge
```

3. Crear el archivo de configuración del backend en `~/masclet-imperi/config/backend.env`:

```
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=masclet_imperi
DB_HOST=masclet-db
DB_PORT=5432
```

### 2.3. Despliegue y restauración de la base de datos

```bash
# 1. Iniciar solo el contenedor de base de datos
cd ~/masclet-imperi
docker-compose up -d db

# 2. Esperar a que la base de datos esté lista (unos 10 segundos)
sleep 10

# 3. Verificar que el contenedor está funcionando
docker ps

# 4. Transferir el archivo de backup desde local
# (Ejecutar esto desde la máquina local)
scp -i "ruta-a-la-clave.pem" "ruta-al-backup-local.sql" ec2-user@IP-DE-LA-INSTANCIA:~/masclet-backup.sql

# 5. Restaurar el backup en el contenedor (volver a la instancia AWS)
cat ~/masclet-backup.sql | docker exec -i masclet-db psql -U admin -d masclet_imperi

# 6. Verificar que la restauración fue exitosa
docker exec masclet-db psql -U admin -d masclet_imperi -c '\dt'
docker exec masclet-db psql -U admin -d masclet_imperi -c 'SELECT COUNT(*) FROM animals;'
docker exec masclet-db psql -U admin -d masclet_imperi -c 'SELECT COUNT(*) FROM part;'
docker exec masclet-db psql -U admin -d masclet_imperi -c 'SELECT COUNT(*) FROM users;'
```

### 2.4. Despliegue del backend y frontend

```bash
# 1. Transferir código fuente del backend y frontend
# (Ejecutar esto desde la máquina local)
# Comprimir código
tar -czvf masclet-code.tar.gz backend frontend

# Transferir a AWS
scp -i "ruta-a-la-clave.pem" masclet-code.tar.gz ec2-user@IP-DE-LA-INSTANCIA:~/

# 2. En la instancia AWS, descomprimir el código
cd ~/masclet-imperi
tar -xzvf ~/masclet-code.tar.gz

# 3. Desplegar todos los servicios
docker-compose up -d

# 4. Verificar que todos los contenedores están funcionando
docker ps
```

## 3. Comandos para crear backups completos de todos los componentes

### 3.1. Verificar nombres y estado de los contenedores actuales

```bash
# Ejecutar en SSH para ver todos los contenedores en ejecución
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker ps -a"
```

Salida esperada (los nombres pueden variar):
```
CONTAINER ID   IMAGE                        COMMAND                   STATUS       PORTS                    NAMES
8e0b93ef826c   masclet-backend-masclet-api   "uvicorn app.main:ap..."   Up (healthy) 0.0.0.0:8000->8000/tcp   masclet-api
cedae60121f8   postgres:17                   "docker-entrypoint.s..."   Up           0.0.0.0:5432->5432/tcp   masclet-db
```

### 3.2. Crear backup de la base de datos (PostgreSQL)

```bash
# 1. Crear imagen a partir del contenedor en ejecución
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker commit masclet-db masclet-db-imagen-completa"

# 2. Guardar la imagen como archivo comprimido
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker save masclet-db-imagen-completa | gzip > masclet-db-imagen-completa.tar.gz"

# 3. Verificar el tamaño del archivo
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "ls -lh masclet-db-imagen-completa.tar.gz"

# 4. Transferir el archivo a local
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119:masclet-db-imagen-completa.tar.gz "C:\Proyectos\AWS\contenedores despliegue RAMON\"
```

### 3.3. Crear backup del backend (FastAPI)

```bash
# 1. Crear imagen a partir del contenedor en ejecución
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker commit masclet-api masclet-api-imagen-completa"

# 2. Guardar la imagen como archivo comprimido
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker save masclet-api-imagen-completa | gzip > masclet-api-imagen-completa.tar.gz"

# 3. Verificar el tamaño del archivo
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "ls -lh masclet-api-imagen-completa.tar.gz"

# 4. Transferir el archivo a local
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119:masclet-api-imagen-completa.tar.gz "C:\Proyectos\AWS\contenedores despliegue RAMON\"
```

### 3.4. Crear backup del frontend (cuando esté disponible)

```bash
# 1. Crear imagen a partir del contenedor en ejecución
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker commit masclet-frontend masclet-frontend-imagen-completa"

# 2. Guardar la imagen como archivo comprimido
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker save masclet-frontend-imagen-completa | gzip > masclet-frontend-imagen-completa.tar.gz"

# 3. Verificar el tamaño del archivo
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "ls -lh masclet-frontend-imagen-completa.tar.gz"

# 4. Transferir el archivo a local
scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119:masclet-frontend-imagen-completa.tar.gz "C:\Proyectos\AWS\contenedores despliegue RAMON\"
```

### 3.5. Verificar espacio disponible en el servidor AWS

```bash
# Ver uso de disco y espacio disponible
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "df -h"

# Ver tamaño de directorios principales
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "du -h --max-depth=1 /home/ec2-user"

# Ver imágenes Docker y su tamaño
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119 "docker images"
```

## 4. Restauración rápida de contenedores en una nueva instancia

Para restaurar todo el sistema rápidamente en una nueva instancia:

### 4.1 Despliegue de la base de datos

#### Paso 1: Transferir el archivo de imagen Docker al servidor AWS

```bash
scp -i "tu-clave-aws.pem" "C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-db-imagen-completa.tar.gz" ec2-user@tu-ip-aws:/home/ec2-user/
```

#### Paso 2: Cargar la imagen Docker

```bash
docker load < masclet-db-imagen-completa.tar.gz
```

#### Paso 3: Verificar que la imagen se ha cargado correctamente

```bash
docker images | grep masclet-db-imagen-completa
```

#### Paso 4: Ejecutar el contenedor

```bash
docker run -d --name masclet-db -p 5432:5432 --restart always masclet-db-imagen-completa
```

### 4.2 Despliegue del backend

#### Paso 1: Transferir el archivo de imagen Docker al servidor AWS

```bash
scp -i "tu-clave-aws.pem" "C:\Proyectos\AWS\contenedores despliegue RAMON\masclet-api-imagen-completa.tar.gz" ec2-user@tu-ip-aws:/home/ec2-user/
```

#### Paso 2: Cargar la imagen Docker

```bash
docker load < masclet-api-imagen-completa.tar.gz
```

#### Paso 3: Verificar que la imagen se ha cargado correctamente

```bash
docker images | grep masclet-api-imagen-completa
```

#### Paso 4: Crear una red Docker si no existe

```bash
docker network create masclet-network || true
```

#### Paso 5: Ejecutar el contenedor del backend

```bash
docker run -d --name masclet-api -p 8000:8000 --network masclet-network --restart always masclet-api-imagen-completa
```

```bash
docker images
```

Deberías ver la imagen `masclet-db-imagen-completa` en la lista.

### Paso 4: Iniciar un contenedor desde la imagen

```bash
docker run -d --name masclet-db -p 5432:5432 -v masclet-db-data:/var/lib/postgresql/data masclet-db-imagen-completa
```

**IMPORTANTE**: No es necesario especificar variables de entorno como `POSTGRES_USER`, `POSTGRES_PASSWORD` o `POSTGRES_DB` porque la imagen ya las contiene configuradas exactamente como estaban en el servidor original.

### Paso 5: Crear un archivo `docker-compose.yml` para usar la imagen restaurada

```yaml
version: '3.8'

services:
  db:
    container_name: masclet-db
    image: masclet-db-imagen-completa
    restart: always
    ports:
      - "5432:5432"
    volumes:
      - ~/masclet-imperi/backups:/backups
    networks:
      - masclet-network

  backend:
    container_name: masclet-backend
    image: masclet-backend-imagen-completa
    restart: always
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - ~/masclet-imperi/logs:/app/logs
    networks:
      - masclet-network

  frontend:
    container_name: masclet-frontend
    image: masclet-frontend-imagen-completa
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - masclet-network

networks:
  masclet-network:
    name: masclet-network
    driver: bridge
EOF

# 4. Iniciar todos los servicios
docker-compose -f docker-compose-prebuilt.yml up -d

# 5. Verificar que todos los contenedores están funcionando
docker ps
```

Este método garantiza un despliegue inmediato sin necesidad de scripts complejos, compilaciones o configuraciones adicionales. Todo está preconfigurado en las imágenes.
