# Plan de Despliegue en AWS para Masclet Imperi Web - Parte 2

*Pasos detallados de implementación - Versión 1.0 - Mayo 2025*

## Índice
1. [Diagnóstico de Problemas](#diagnóstico-de-problemas)
2. [Corrección de Contenedores Docker](#corrección-de-contenedores-docker)
3. [Verificación de Funcionamiento](#verificación-de-funcionamiento)
4. [Lecciones Aprendidas](#lecciones-aprendidas)
5. [Plan de Contingencia](#plan-de-contingencia)
6. [Despliegue del Frontend](#despliegue-del-frontend)

## Diagnóstico de Problemas

### Problemas Identificados 

1. **Contenedor API en reinicio constante**
   - El contenedor `masclet-api` se reiniciaba continuamente debido a errores internos
   - Logs mostraban error de permisos al intentar escribir en `/app/logs/masclet_imperi.log`
   - No se encontraba el archivo `.env` dentro del contenedor

2. **Problemas de configuración Docker**
   - Volúmenes montados sobrescribiendo directorios con permisos adecuados
   - Comando `docker-compose` no disponible o mal configurado en EC2
   - Redes de Docker mal configuradas, impidiendo comunicación entre contenedores

3. **Conectividad de red**
   - IP pública incorrecta en intentos iniciales de acceso
   - Grupo de seguridad mal configurado (puertos no abiertos)
   - Regla SSH con IP incorrecta

4. **Espacio en disco**
   - Servidor EC2 con espacio limitado (10GB) casi completamente ocupado

## Corrección de Contenedores Docker

### Verificación del Estado Inicial 

```bash
ssh -i "ruta-a-clave.pem" ec2-user@108.129.139.119 "sudo docker ps -a"
```

- Contenedor `masclet-db` corriendo y saludable
- Contenedor `masclet-api` en estado de reinicio constante

### Inspección de Redes Docker 

```bash
ssh -i "ruta-a-clave.pem" ec2-user@108.129.139.119 "sudo docker network ls && sudo docker inspect masclet-db -f '{{.NetworkSettings.Networks}}'"
```

- Base de datos en red `masclet-imperi_default`
- API intentando conectarse a la red por defecto

### Reconstrucción del Contenedor API 

```bash
ssh -i "ruta-a-clave.pem" ec2-user@108.129.139.119 "cd /home/ec2-user/masclet-imperi && sudo docker stop masclet-api && sudo docker rm masclet-api && sudo docker build -t masclet-imperi-api ./backend && sudo docker run -d --name masclet-api --restart unless-stopped -p 8000:8000 -v /home/ec2-user/masclet-imperi/backend:/app -v /home/ec2-user/masclet-imperi/logs:/app/logs --env-file /home/ec2-user/masclet-imperi/.env --network masclet-imperi_default masclet-imperi-api"
```

## Verificación de Funcionamiento

### Comprobación de Estado de Contenedores 

```bash
ssh -i "ruta-a-clave.pem" ec2-user@108.129.139.119 "sudo docker ps"
```

- Ambos contenedores `masclet-db` y `masclet-api` corriendo correctamente

### Prueba de Endpoints API 

```bash
curl -v http://108.129.139.119:8000/api/v1/animals/
```

- Respuesta exitosa del endpoint, confirmando funcionamiento correcto
- Conexión a base de datos verificada (datos recuperados correctamente)

### Respaldo de Imagen Funcional 

```bash
ssh -i "ruta-a-clave.pem" ec2-user@108.129.139.119 "sudo docker commit masclet-api masclet-imperi-api:production && sudo docker images"
```

- Imagen de producción guardada como `masclet-imperi-api:production`

## Despliegue del Frontend

### Problemas de Compilación Encontrados 

Durante el proceso de preparación para el despliegue del frontend, hemos identificado y corregido varios problemas de compilación:

1. **Importaciones incorrectas en componentes clave**
   - En `Sidebar.astro`: Importación de `getCurrentUserRole` que no existía (corregido para usar `getUserRole`).
   - En `animals/edit/[id].astro`: Importación directa de `getAnimalById` que solo está disponible a través del objeto `animalService`.

2. **Componentes faltantes referenciados en el código**
   - Componente `Dashboard2` referenciado pero inexistente (creado como componente provisional).
   - Componente `DashboardNew` referenciado pero inexistente (creado como componente provisional).

3. **Problemas en listados**
   - Warning sobre `updateListado` en archivos de listados, pero no impide la compilación exitosa.

### Estrategia de Corrección 

```javascript
// 1. Corregir importaciones (ejemplo Sidebar.astro)
// Antes:
import { getCurrentUserRole as getUserRole } from '../../services/authService';
// Después:
import { getUserRole } from '../../services/authService';

// 2. Corregir importaciones (ejemplo animals/edit/[id].astro)
// Antes:
import { getAnimalById } from '../../../services/animalService';
// Después:
import animalService from '../../../services/animalService';

// 3. Actualizar llamadas a funciones
// Antes:
animal = await getAnimalById(parseInt(id));
// Después:
animal = await animalService.getAnimalById(parseInt(id));
```

### Compilación Exitosa 

Tras las correcciones, hemos logrado una compilación exitosa que genera los siguientes artefactos:

```text
/dist
  /client - Contiene todos los archivos estáticos para el despliegue en Nginx
    /_astro - JavaScript, CSS y otros assets compilados
    /assets - Imágenes y otros recursos
    /icons - Iconos de la aplicación
    /images - Imágenes adicionales
    /scripts - Scripts de cliente
    /styles - Hojas de estilo
  /server - Archivos del servidor Node.js (si se usara ese enfoque)
  health-check.txt - Archivo para verificación de estado
```

### Preparación para Despliegue con Nginx 

Hemos preparado un script simplificado (`deploy-nginx.ps1`) que automatiza el despliegue en EC2 mediante los siguientes pasos:

```powershell
# Ejemplo de uso:
.\deployment\frontend\deploy-nginx.ps1 -EC2_IP "108.129.139.119" -PEM_PATH "C:\Users\Usuario\Downloads\masclet-imperi-key.pem"
```

El script realiza las siguientes acciones:

1. Verifica la compilación exitosa y existencia de archivos estáticos
2. Transfiere los archivos del directorio `dist/client` al servidor EC2
3. Configura Nginx para servir los archivos estáticos y proxy al backend API
4. Crea un contenedor Docker con la configuración adecuada
5. Verifica la correcta ejecución del contenedor

## Lecciones Aprendidas

1. **Importancia de seguir una metodología estricta**
   - Documentar cada paso antes de ejecutarlo
   - Realizar commits frecuentes en puntos estables
   - Distinguir claramente entre entornos (local vs EC2)

2. **Gestión de permisos en Docker**
   - Los volúmenes montados sobrescriben los permisos establecidos en el Dockerfile
   - Necesidad de crear directorios con permisos adecuados en el host

3. **Configuración de redes en Docker**
   - Asegurar que los contenedores estén en la misma red para comunicarse
   - Usar `--network` en lugar de `--link` para mayor flexibilidad

4. **Manejo de archivos de configuración**
   - Asegurar que el archivo `.env` esté en la ubicación correcta
   - Verificar que los volúmenes montados no sobrescriban archivos esenciales

## Plan de Contingencia

### Para problemas de permisos de archivos

1. Crear directorios con permisos adecuados en el host
   
```bash
mkdir -p /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads
chmod -R 777 /home/ec2-user/masclet-imperi/logs /home/ec2-user/masclet-imperi/uploads
```

### Para problemas de conectividad

1. Verificar reglas de grupo de seguridad
   
```bash
aws ec2 describe-security-groups --group-ids sg-xxxxxxxx
```

2. Actualizar reglas según sea necesario
   
```bash
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxx --protocol tcp --port 8000 --cidr 0.0.0.0/0
```

### Para problemas de espacio en disco

1. Limpiar imágenes y contenedores no utilizados
   
```bash
docker system prune -a
```

2. Considerar ampliar el volumen EBS si es necesario

## Próximos Pasos

1. ✅ Solucionar el error en el endpoint de salud (`/api/v1/health`)
2. ✅ Implementar monitoreo de la API y base de datos
3. ✅ Configurar respaldos automáticos
4. ✅ Documentar proceso completo para futuras referencias




### 5. Logs y Monitorización

- Mantener logs detallados de cada operación
- Configurar monitorización básica para alertas tempranas


## Preparación del Entorno Local (COMPLETADO)

### 1. Preparación del Código para Producción

#### 1.1. Configuración de Versiones ✅

```bash
# Crear una rama específica para producción
git checkout -b production

# Etiquetar versión
git tag -a v1.0.0 -m "Primera versión de producción"
```

#### 1.2. Verificar Optimizaciones ✅

```bash
# Revisar archivos del frontend
cd frontend

# Asegurar que la configuración de producción está correcta
cat vite.config.js

# Comprobar que las dependencias están actualizadas
npm outdated

# Actualizar dependencias si es necesario
npm update
```

#### 1.3. Ejecutar Tests ✅

```bash
# Ejecutar tests del backend
cd backend
python -m pytest

# Ejecutar tests de integración
python new_tests/complementos/integration_tests.py
```

### 2. Preparación de Archivos de Despliegue ✅

#### 2.1. Archivos de Configuración para EC2

Creamos los siguientes archivos en la carpeta `docs/aws_deployment/`:

- `env.production`: Variables de entorno para producción
- `nginx.conf`: Configuración del servidor web
- `start-backend.sh`: Script de inicio del backend
- `deploy.sh`: Script de despliegue automatizado
- `masclet-imperi.service`: Configuración de systemd

## Despliegue en EC2 (Amazon Linux 2)

### 1. Verificación del Entorno EC2 ✅

```bash
# Verificar versión de Python
python3 --version
# Python 3.7.16

# Verificar pip
pip3 --version
# pip 20.2.2

# Verificar instalación de PostgreSQL (no instalado inicialmente)
postgres --version || echo 'Postgres no instalado'
# Postgres no instalado

# Verificar instalación de Nginx (no instalado inicialmente)
nginx -v || echo 'Nginx no instalado'
# Nginx no instalado
```

### 2. Instalación de Dependencias

```bash
# Actualizar el sistema
sudo yum update -y

# Instalar dependencias necesarias
sudo yum install -y git nginx postgresql-devel gcc python3-devel

# Instalar pip si no está instalado
if ! command -v pip3 &> /dev/null; then
    curl -O https://bootstrap.pypa.io/get-pip.py
    python3 get-pip.py --user
    echo 'export PATH=~/.local/bin:$PATH' >> ~/.bashrc
    source ~/.bashrc
fi

# Instalar virtualenv
pip3 install --user virtualenv
```

### 3. Configuración de PostgreSQL

```bash
# Instalar PostgreSQL
sudo amazon-linux-extras install postgresql13 -y

# Inicializar PostgreSQL
sudo postgresql-setup --initdb

# Iniciar y habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y base de datos
sudo -u postgres psql -c "CREATE USER masclet_admin WITH PASSWORD 'tu_contraseña_segura';"
sudo -u postgres psql -c "CREATE DATABASE masclet_imperi OWNER masclet_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE masclet_imperi TO masclet_admin;"
```

### 4. Clonar Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /home/ec2-user/masclet-imperi
sudo chown ec2-user:ec2-user /home/ec2-user/masclet-imperi

# Clonar repositorio
cd /home/ec2-user/masclet-imperi
git clone https://github.com/usuario/masclet-imperi-web.git .
git checkout production

# Crear directorios necesarios
mkdir -p logs backups
```

## Despliegue con Docker en EC2 (Estrategia recomendada)

### 5. Instalación de Docker en EC2

```bash
# Instalar Docker en Amazon Linux 2
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Cerrar sesión y volver a conectar para aplicar los cambios de grupo
exit
# Reconectar por SSH
```

> ✅ **Verificación**: Ejecutar `docker --version` para confirmar que Docker está instalado correctamente.

### 6. Instalación de Docker Compose

```bash
# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

### 7. Clonar Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /home/ec2-user/masclet-imperi
sudo chown ec2-user:ec2-user /home/ec2-user/masclet-imperi

# Clonar repositorio
cd /home/ec2-user/masclet-imperi
git clone https://github.com/usuario/masclet-imperi-web.git .
git checkout production

# Crear directorios necesarios
mkdir -p logs backups
```

> ✅ **Punto de control**: Ejecutar `git log -1 --oneline` para verificar que estamos en la última versión de la rama production.

### 8. Configuración del Entorno Docker

```bash
# Crear archivo docker-compose.yml para producción
cat > docker-compose.yml << EOL
version: '3.8'

services:
  db:
    image: postgres:14
    container_name: masclet-db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=tu_contraseña_segura
      - POSTGRES_USER=masclet_admin
      - POSTGRES_DB=masclet_imperi
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U masclet_admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: masclet-backend
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
      - ./backups:/app/backups
    environment:
      - DATABASE_URL=postgresql://masclet_admin:tu_contraseña_segura@db:5432/masclet_imperi
      - SECRET_KEY=tu_clave_secreta_para_jwt
      - ENVIRONMENT=production
      - CORS_ORIGINS=*
    depends_on:
      - db
    restart: always
    command: sh -c "cd /app && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

  frontend:
    build: ./frontend
    container_name: masclet-frontend
    volumes:
      - ./frontend:/app
    ports:
      - "80:3000"
    environment:
      - PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: always
    command: sh -c "cd /app && npm run dev -- --host 0.0.0.0 --port 3000"

volumes:
  postgres_data:
EOL

# Crear archivo .dockerignore
cat > .dockerignore << EOL
**/node_modules
**/__pycache__
**/*.pyc
**/.git
**/.DS_Store
backups/*
logs/*
EOL
```

### 9. Crear Dockerfiles

```bash
# Dockerfile para el backend
cat > backend/Dockerfile << EOL
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn uvicorn

COPY . .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOL

# Dockerfile para el frontend
cat > frontend/Dockerfile << EOL
FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
EOL
```

> ✅ **Punto de control**: Guardar este progreso con `git add .` y `git commit -m "Añadir configuración Docker para producción"`

### 10. Iniciar Aplicación con Docker

```bash
# Construir e iniciar los contenedores
docker-compose up -d --build

# Verificar que los contenedores están funcionando
docker-compose ps
```

> ✅ **Verificación**: Comprobar que los tres contenedores (db, backend, frontend) están en estado "Up".

### 11. Configuración de Reinicio Automático

```bash
# Crear script para inicio automático
cat > start-masclet.sh << EOL
#!/bin/bash
cd /home/ec2-user/masclet-imperi
docker-compose up -d
EOL

# Dar permisos de ejecución
chmod +x start-masclet.sh

# Configurar crontab para ejecutar al reinicio
(crontab -l 2>/dev/null; echo "@reboot /home/ec2-user/masclet-imperi/start-masclet.sh") | crontab -
```

### 12. Verificar Despliegue

```bash
# Verificar que la aplicación está funcionando
curl http://localhost/api/v1/health

# Comprobar logs
docker-compose logs -f
```

```ini
# Configuración para entorno de producción
ENVIRONMENT=production

# La URL de la base de datos se configurará cuando creemos RDS
DATABASE_URL=postgresql://masclet_admin:[PASSWORD]@[RDS-ENDPOINT]:5432/masclet_imperi

# Generar una clave segura para producción
SECRET_KEY=[NUEVA-CLAVE-SEGURA-GENERADA]

# Configuración de seguridad
ALLOW_ORIGINS=https://masclet-imperi.com
CORS_ORIGINS=["https://masclet-imperi.com"]

# Configuración de logs
LOG_LEVEL=WARNING
```

> ⚠️ **Importante**: No subir `.env.production` al repositorio. Añadirlo a `.gitignore`.

#### 2.3. Actualizar Configuración de Frontend

- [X] Crear y configurar .env.production para el frontend

Crear `frontend/.env.production` con:

```ini
VITE_API_URL=https://api.masclet-imperi.com/api/v1
VITE_ENVIRONMENT=production
```

### 3. Realizar Backup Completo de la Base de Datos

#### 3.1. Ejecutar Script de Backup

- [X] Generar backup completo de la base de datos

```bash
# Ejecutar el script de backup completo
python backend/scripts/backup_database.py --complete
```

#### 3.2. Verificar el Backup

- [X] Comprobar que el backup se ha creado correctamente
- [X] Revisar contenido del backup

```bash
# Verificar que el backup se creó correctamente
ls -lh backend/backups/

# Analizar contenido del backup (opcional)
python backend/scripts/analyze_backup.py --summary --latest
```

#### 3.3. Hacer Copia de Seguridad Externa

- [X] Guardar copia del backup en ubicación externa segura

```bash
# Copiar el backup a una ubicación segura
cp backend/backups/backup_masclet_imperi_$(date +%Y%m%d)*.sql /ruta/externa/segura/
```

> ✅ **Verificación**: Comprobar que el backup contiene todos los datos esperados y está accesible.

### 4. Limpieza y Optimización Final

#### 4.1. Eliminar Archivos Temporales y Cachés

- [X] Limpiar archivos compilados de Python
- [X] Limpiar caché de npm

```bash
# Limpiar archivos temporales
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Limpiar caché de npm
cd frontend
npm cache clean --force
```

#### 4.2. Comprobar Espacio en Disco

- [X] Verificar espacio disponible en disco

```bash
# Verificar espacio disponible
df -h .
```

> ✅ **Verificación**: Revisar que hay suficiente espacio para operaciones de compilación.

## Preparación de la Infraestructura AWS

### 1. Configuración de la Cuenta AWS

#### 1.1. Crear Usuario IAM para Despliegue

- [ ] Instalar y configurar AWS CLI
- [ ] Verificar permisos de usuario

```bash
# Instalar AWS CLI si no está instalado
winget install -e --id Amazon.AWSCLI

# Configurar credenciales
aws configure
# Ingresar Access Key ID y Secret Access Key
# Seleccionar región: eu-west-1 (o la más cercana)
```

#### 1.2. Verificar Configuración

```bash
# Comprobar que la configuración es correcta
aws sts get-caller-identity
```

> ✅ **Verificación**: Deberías ver tu AWS Account ID, IAM User ARN y User ID.

### 2. Preparación del Código

#### 2.1. Crear Branch para Despliegue

```bash
# Crear rama específica para despliegue
git checkout -b aws-deployment
```

#### 2.2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp backend/.env.example backend/.env.production

# Editar variables para producción
# Nota: NO subir este archivo a git
```

Variables críticas a configurar:

- `DATABASE_URL`: Se generará después de crear RDS
- `SECRET_KEY`: Generar clave segura
- `CORS_ORIGINS`: Incluir dominio de producción
- `ENVIRONMENT`: Establecer como "production"

## Despliegue de Base de Datos (RDS)

### 1. Crear Grupo de Seguridad para Base de Datos

```bash
# Crear grupo de seguridad
aws ec2 create-security-group \
  --group-name masclet-imperi-db-sg \
  --description "Grupo de seguridad para RDS Masclet Imperi" \
  --vpc-id [ID-DE-TU-VPC]

# Permitir tráfico PostgreSQL desde la instancia de la aplicación
aws ec2 authorize-security-group-ingress \
  --group-id [SG-ID] \
  --protocol tcp \
  --port 5432 \
  --source-group [SG-APP-ID]
```

> ✅ **Verificación**: `aws ec2 describe-security-groups --group-ids [SG-ID]` debe mostrar la regla creada.

### 2. Crear Instancia RDS PostgreSQL

```bash
# Crear instancia RDS
aws rds create-db-instance \
  --db-instance-identifier masclet-imperi-db \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14 \
  --master-username masclet_admin \
  --master-user-password [CONTRASEÑA_SEGURA] \
  --allocated-storage 20 \
  --vpc-security-group-ids [SG-ID] \
  --db-name masclet_imperi \
  --backup-retention-period 7 \
  --preferred-backup-window 03:00-04:00 \
  --no-publicly-accessible
```

> ⚠️ **Importante**: Guarda la contraseña de forma segura, por ejemplo en AWS Secrets Manager.

> ✅ **Verificación**: `aws rds describe-db-instances --db-instance-identifier masclet-imperi-db` mostrará el estado `creating` y luego `available`.

### 3. Obtener Endpoint y Configurar Variables

```bash
# Obtener el endpoint de conexión
aws rds describe-db-instances \
  --db-instance-identifier masclet-imperi-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text
```

Actualizar `.env.production`:

```
DATABASE_URL=postgresql://masclet_admin:[CONTRASEÑA]@[ENDPOINT]:5432/masclet_imperi
```

### 4. Ejecutar Migraciones e Importar Datos Iniciales

Esto lo haremos después de desplegar la aplicación en Elastic Beanstalk.

## Despliegue de Backend (Elastic Beanstalk)

### 1. Crear Aplicación Elastic Beanstalk

```bash
# Crear aplicación
aws elasticbeanstalk create-application \
  --application-name masclet-imperi-api \
  --description "API Backend para Masclet Imperi Web"
```

> ✅ **Verificación**: `aws elasticbeanstalk describe-applications --application-names masclet-imperi-api` debe mostrar la aplicación creada.

### 2. Crear Configuración de Entorno

```bash
# Crear archivo de configuración
mkdir -p .ebextensions
```

Crear archivo `.ebextensions/01_packages.config`:

```yaml
packages:
  yum:
    git: []
    postgresql-devel: []
    python3-devel: []
```

Crear archivo `.ebextensions/02_python.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: backend/app/main.py
  aws:elasticbeanstalk:application:environment:
    PYTHONPATH: /var/app
    DATABASE_URL: postgresql://masclet_admin:[CONTRASEÑA]@[ENDPOINT]:5432/masclet_imperi
    SECRET_KEY: [TU_SECRET_KEY]
    ENVIRONMENT: production
    CORS_ORIGINS: https://[TU-DOMINIO]
```

### 3. Preparar Archivo de Despliegue

```bash
# Crear script para generar el paquete de despliegue
echo '#!/bin/bash
mkdir -p dist
zip -r dist/masclet-imperi-api.zip backend/ .ebextensions/ requirements.txt
echo "Paquete creado en dist/masclet-imperi-api.zip"
' > create_deployment_package.sh

# Dar permisos de ejecución
chmod +x create_deployment_package.sh

# Ejecutar script
./create_deployment_package.sh
```

### 4. Crear Entorno Elastic Beanstalk

```bash
# Crear entorno
aws elasticbeanstalk create-environment \
  --application-name masclet-imperi-api \
  --environment-name masclet-imperi-api-prod \
  --solution-stack-name "64bit Amazon Linux 2 v3.5.0 running Python 3.8" \
  --option-settings file://eb-options.json \
  --version-label initial-version \
  --description "Entorno de producción para Masclet Imperi API"
```

Contenido de `eb-options.json`:

```json
[
  {
    "Namespace": "aws:autoscaling:launchconfiguration",
    "OptionName": "InstanceType",
    "Value": "t3.small"
  },
  {
    "Namespace": "aws:autoscaling:launchconfiguration",
    "OptionName": "SecurityGroups",
    "Value": "[TU-SECURITY-GROUP]"
  },
  {
    "Namespace": "aws:elasticbeanstalk:environment",
    "OptionName": "EnvironmentType",
    "Value": "SingleInstance"
  }
]
```

> ✅ **Verificación**: `aws elasticbeanstalk describe-environments --environment-names masclet-imperi-api-prod` mostrará el estado del entorno.

### 5. Desplegar Aplicación

```bash
# Desplegar versión inicial
aws elasticbeanstalk create-application-version \
  --application-name masclet-imperi-api \
  --version-label initial-version \
  --source-bundle S3Bucket="[TU-BUCKET]",S3Key="masclet-imperi-api.zip" \
  --description "Versión inicial del backend"

# Actualizar entorno con la nueva versión
aws elasticbeanstalk update-environment \
  --environment-name masclet-imperi-api-prod \
  --version-label initial-version
```

> ✅ **Verificación**: `aws elasticbeanstalk describe-environments --environment-names masclet-imperi-api-prod` debe mostrar status "Ready" y health "Green".

### 6. Ejecutar Migraciones

```bash
# Conectar a la instancia EC2
aws ssm start-session --target [ID-INSTANCIA-EC2]

# Dentro de la instancia
cd /var/app
source /var/app/venv/bin/activate
cd backend
python -m scripts.prepare_db_migration
```

> ✅ **Verificación**: Comprobar en la consola que no hay errores y que las tablas se han creado correctamente.

## Despliegue de Frontend (AWS Amplify)

La aplicación Masclet Imperi Web está construida con Astro en modo híbrido (con rutas dinámicas e interactividad). **AWS Amplify** es la opción recomendada ya que proporciona soporte nativo para frameworks modernos como Astro con renderizado servidor (SSR).

### 1. Configurar AWS Amplify desde la Consola

1. Iniciar sesión en la consola AWS y navegar a AWS Amplify
2. Seleccionar "Host a web app"
3. Conectar con el repositorio de GitHub
4. Seleccionar la rama de despliegue (main)

### 2. Configurar Parámetros de Construcción

En el panel de configuración de Amplify, establecer:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 3. Configurar Variables de Entorno

En la consola de Amplify, en la sección "Environment variables":

- Clave: `VITE_API_URL`
- Valor: `https://api.masclet-imperi.com/api/v1`

> ✅ **Verificación**: Revisar que las variables estén correctamente establecidas en la consola.

### 4. Configurar Redirecciones para SPA

En la consola de Amplify, en la sección "Rewrites and redirects", añadir:

- Source address: `</^[^.]+$|\.((?!css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json).*$)>/`
- Target address: `/index.html`
- Type: `200 (Rewrite)`

> ✅ **Verificación**: Verificar que las rutas dinámicas como `/animals/123` funcionan correctamente.

### 5. Configurar Dominio Personalizado

En la consola de Amplify, en la sección "Domain management":

1. Seleccionar "Add domain"
2. Ingresar el dominio: `masclet-imperi.com`
3. Seguir el asistente para verificar el dominio
4. Amplify gestionará automáticamente los certificados SSL

> ✅ **Verificación**: Verificar que el sitio es accesible a través del dominio personalizado con HTTPS.

### 6. Configurar Despliegue Continuo

Amplify ya configura automáticamente el despliegue continuo desde el repositorio conectado. Cada push a la rama configurada activará un nuevo despliegue.

> ✅ **Verificación**: Realizar un pequeño cambio en el repositorio y verificar que el despliegue se activa automáticamente.

### Alternativa: Despliegue en S3 + CloudFront

Si por alguna razón preferimos usar S3 + CloudFront en lugar de Amplify, tendremos que asegurarnos de configurar correctamente las redirecciones para nuestra aplicación SPA:

```bash
# Crear bucket
aws s3 mb s3://masclet-imperi-frontend --region eu-west-1

# Configurar para sitio web
aws s3 website s3://masclet-imperi-frontend \
  --index-document index.html \
  --error-document index.html

# Aplicar política
aws s3api put-bucket-policy \
  --bucket masclet-imperi-frontend \
  --policy file://bucket-policy.json

# Compilar y subir archivos
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://masclet-imperi-frontend/ --delete

# Crear distribución CloudFront con configuración especial para SPA
```

Para CloudFront, debemos configurar manualmente:

- Comportamiento de caché para redireccionar todas las rutas no encontradas a index.html
- Function de CloudFront para manejar rutas dinámicas
- Políticas de caché adecuadas para archivos estáticos vs dinámicos

## Configuración de Dominio y DNS (Route 53)

### 1. Crear Zona Hospedada (si es necesario)

```bash
# Crear zona hospedada
aws route53 create-hosted-zone \
  --name masclet-imperi.com \
  --caller-reference $(date +%s)
```

### 2. Configurar Registros DNS

```bash
# Crear archivo con registros
echo '{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "masclet-imperi.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "[CLOUDFRONT-DOMAIN]",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.masclet-imperi.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "[EB-HOSTED-ZONE-ID]",
          "DNSName": "[EB-ENDPOINT]",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}' > dns-records.json

# Aplicar cambios
aws route53 change-resource-record-sets \
  --hosted-zone-id [HOSTED-ZONE-ID] \
  --change-batch file://dns-records.json
```

> ✅ **Verificación**: `dig masclet-imperi.com` y `dig api.masclet-imperi.com` deben resolver a las direcciones correctas.

## Configuración de Certificados SSL (AWS Certificate Manager)

### 1. Solicitar Certificado

```bash
# Solicitar certificado
aws acm request-certificate \
  --domain-names masclet-imperi.com,*.masclet-imperi.com \
  --validation-method DNS \
  --idempotency-token $(date +%s)
```

### 2. Configurar Validación por DNS

Sigue las instrucciones en la consola AWS para añadir los registros CNAME de validación a Route 53.

> ✅ **Verificación**: En la consola ACM, el estado del certificado debe cambiar a "Issued".

### 3. Asociar Certificado a CloudFront y Elastic Beanstalk

Configurar manualmente en la consola AWS:

- Para CloudFront: En la sección SSL Certificate
- Para Elastic Beanstalk: En la configuración del load balancer

## Configuración de Seguridad y Monitoreo

### 1. Configurar CloudWatch para Alertas

```bash
# Crear alarma para CPU alta en RDS
aws cloudwatch put-metric-alarm \
  --alarm-name masclet-imperi-db-cpu-high \
  --alarm-description "Alarma por CPU alta en RDS" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=masclet-imperi-db \
  --evaluation-periods 2 \
  --alarm-actions [SNS-TOPIC-ARN]
```

### 2. Configurar Respaldos Automáticos

```bash
# Verificar que los respaldos automáticos están habilitados en RDS
aws rds describe-db-instances \
  --db-instance-identifier masclet-imperi-db \
  --query "DBInstances[0].BackupRetentionPeriod"
```

### 3. Implementar Sistema de Logs Centralizado

```bash
# Configurar agente CloudWatch en instancias EC2
aws ssm send-command \
  --document-name "AWS-ConfigureAWSPackage" \
  --targets "Key=instanceids,Values=[INSTANCE-ID]" \
  --parameters '{"action":["Install"],"name":["AmazonCloudWatchAgent"]}'
```

## Pruebas Post-Despliegue

### 1. Verificar Conectividad de Componentes

- [ ] Verificar que el frontend puede conectarse a la API
- [ ] Verificar que el backend puede conectarse a la base de datos
- [ ] Verificar que las imágenes y assets se cargan correctamente

### 2. Prueba de Funcionalidades Críticas

- [ ] Inicio de sesión y autenticación
- [ ] CRUD de animales
- [ ] Registros de partos
- [ ] Importación de datos CSV
- [ ] Backups de base de datos
- [ ] Cambio de idioma (español/catalán)

### 3. Pruebas de Rendimiento

```bash
# Instalar herramienta de pruebas de carga
npm install -g autocannon

# Realizar prueba básica de carga
autocannon -c 100 -d 30 https://api.masclet-imperi.com/api/v1/auth/check
```

> ✅ **Verificación**: Revisar resultados de las pruebas de carga para identificar posibles cuellos de botella.

## Procedimiento de Migración Entre Cuentas AWS

### 1. Exportar Recursos de la Cuenta de Desarrollo

#### 1.1. Exportar Base de Datos

```bash
# Crear backup final de RDS
aws rds create-db-snapshot \
  --db-instance-identifier masclet-imperi-db \
  --db-snapshot-identifier masclet-imperi-final-snapshot

# Esperar a que se complete
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier masclet-imperi-final-snapshot

# Compartir snapshot con cuenta de destino
aws rds modify-db-snapshot-attribute \
  --db-snapshot-identifier masclet-imperi-final-snapshot \
  --attribute-name restore \
  --values-to-add "[ACCOUNT-ID-DESTINO]"
```

#### 1.2. Exportar Configuración de Elastic Beanstalk

```bash
# Guardar configuración actual
aws elasticbeanstalk describe-configuration-settings \
  --application-name masclet-imperi-api \
  --environment-name masclet-imperi-api-prod \
  > eb-config-export.json
```

#### 1.3. Crear AMI de la Instancia EC2 (opcional)

```bash
# Crear imagen AMI
aws ec2 create-image \
  --instance-id [INSTANCE-ID] \
  --name "masclet-imperi-api-image" \
  --description "Imagen de la instancia de Masclet Imperi API"

# Compartir AMI con cuenta de destino
aws ec2 modify-image-attribute \
  --image-id [AMI-ID] \
  --launch-permission "Add=[{UserId=[ACCOUNT-ID-DESTINO]}]"
```

### 2. Importar Recursos en la Cuenta de Destino

#### 2.1. Restaurar Base de Datos

```bash
# Restaurar desde snapshot compartido
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier masclet-imperi-db \
  --db-snapshot-identifier arn:aws:rds:[REGION]:[ACCOUNT-ID-ORIGEN]:snapshot:masclet-imperi-final-snapshot
```

#### 2.2. Desplegar Backend con la Misma Configuración

Usar el archivo `eb-config-export.json` como referencia para configurar el nuevo entorno.

#### 2.3. Desplegar Frontend

```bash
# Crear y configurar bucket en cuenta de destino
aws s3 mb s3://masclet-imperi-frontend --region eu-west-1

# Copiar archivos desde bucket de origen
aws s3 sync s3://masclet-imperi-frontend/ s3://masclet-imperi-frontend/ --source-region eu-west-1
```

### 3. Actualizar DNS para Apuntar a Nuevos Recursos

```bash
# Actualizar registros DNS para apuntar a los nuevos endpoints
# Esto puede hacerse gradualmente para minimizar el tiempo de inactividad
```

## Verificación Final del Sistema

- [ ] Verificar conectividad entre todos los componentes
- [ ] Realizar pruebas de todas las funcionalidades críticas
- [ ] Verificar que los datos se han migrado correctamente
- [ ] Comprobar que los backups automáticos están funcionando
- [ ] Revisar logs y métricas de rendimiento

---

## Notas Adicionales

### Optimización de Rendimiento

- Considerar la implementación de ElastiCache si la aplicación requiere caché de datos
- Configurar TTL óptimo en CloudFront para recursos estáticos
- Revisar y optimizar consultas a base de datos

### Seguridad

- Revisar y ajustar permisos IAM periódicamente
- Configurar AWS Shield para protección contra DDoS
- Implementar WAF para protección contra ataques web

### Costes

- Configurar AWS Budget para monitorizar gastos
- Evaluar posibilidad de usar instancias reservadas para reducir costes
- Configurar autoescalado para optimizar recursos según demanda

### Mantenimiento

- Programar ventanas de mantenimiento para actualizaciones
- Implementar strategy de backup y restauración
- Documentar procedimientos de operación y respuesta a incidentes
