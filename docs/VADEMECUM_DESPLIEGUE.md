# VADEMÉCUM DESPLIEGUE MASCLET IMPERI

**Fecha de creación:** 04/06/2025 - 17:16
**Última actualización:** 04/06/2025 - 17:16
**Estado:** En desarrollo

## ÍNDICE
1. [Credenciales y Accesos](#credenciales-y-accesos)
2. [Endpoints de Sistema](#endpoints-del-sistema)
3. [Configuración de Infraestructura](#configuración-de-infraestructura)
4. [Comandos de Despliegue](#comandos-de-despliegue)
5. [Scripts de Diagnóstico](#scripts-de-diagnóstico)
6. [Procedimientos de Backup y Restauración](#procedimientos-de-backup-y-restauración)
7. [Gestión de Base de Datos](#gestión-de-base-de-datos)

---

## Credenciales y Accesos

### AWS EC2
- **IP pública:** 108.129.139.119
- **Usuario:** ec2-user
- **Clave privada:** `C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem`
- **Comando SSH:** `ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119`

### Base de Datos PostgreSQL
#### Entorno Local
- **Contenedor:** masclet-db-new
- **Usuario:** admin    
- **Contraseña:** admin123
- **Puerto:** 5433 (mapeado a 5432 interno)
- **Base de datos:** masclet_imperi
- **Cadena de conexión:** `postgres://postgres:1234@localhost:5433/masclet_imperi`

#### Entorno Producción (AWS)
- **Contenedor:** masclet-db
- **Usuario:** admin
- **Contraseña:** admin123
- **Puerto:** 5432
- **Base de datos:** masclet_imperi
- **Cadena de conexión:** `postgres://admin:admin123@db:5432/masclet_imperi`

### Aplicación
- **Usuario admin:** admin
- **Contraseña:** admin123

---

## Endpoints del Sistema

### Verificación Completa de Endpoints
```bash
python new_tests\complementos\list_endpoints.py -v
```

### Endpoints Backend Principales
- **Autenticación:** `/api/v1/auth/login`
- **Salud del sistema:** `/api/v1/health`
- **Dashboard:** `/api/v1/dashboard/stats`
- **Explotaciones:** `/api/v1/dashboard/explotacions/`
- **Animales:** `/api/v1/animals/`
- **Partos:** `/api/v1/partos/`
- **Usuarios:** `/api/v1/users/`
- **Importaciones:** `/api/v1/imports/`

### Endpoints de Backup
- **Historial:** `/api/v1/scheduled-backup/history`
- **Disparar backup diario:** `/api/v1/scheduled-backup/trigger/daily`
- **Configuración:** `/api/v1/scheduled-backup/configure`
- **Limpieza:** `/api/v1/scheduled-backup/cleanup`

---

## Configuración de Infraestructura

### Docker en AWS EC2

#### Contenedores del Sistema
- **Frontend:** masclet-frontend (puerto 80)
- **Frontend Node (SSR):** masclet-frontend-node (puerto 10000)
- **Backend:** masclet-api (puerto 8000)
- **Base de Datos:** masclet-db (puerto 5432)

#### Red Docker
- **Nombre:** masclet-network
- **Tipo:** bridge
- **Contenedores conectados:** todos los anteriores deben usar esta red

### Archivos de Configuración en AWS

#### Backend
- **Directorio principal:** `/home/ec2-user/masclet-imperi`
- **Docker Compose:** `/home/ec2-user/masclet-imperi/docker-compose.yml`
- **Variables de entorno:** `/home/ec2-user/masclet-imperi/.env`
- **Dockerfile:** `/home/ec2-user/masclet-imperi/backend/Dockerfile`

#### Frontend
- **Directorio principal:** `/home/ec2-user/masclet-imperi-frontend`
- **Docker Compose:** `/home/ec2-user/masclet-imperi-frontend/docker-compose.yml`
- **Variables de entorno:** `/home/ec2-user/masclet-imperi-frontend/.env`

### Grupo de Seguridad AWS
- **Puerto 22:** SSH (desde IPs autorizadas)
- **Puerto 80:** HTTP (abierto a internet)
- **Puerto 443:** HTTPS (abierto a internet)
- **Puerto 8000:** Backend API (abierto a internet para pruebas - debe cerrarse en producción final)

---

## Comandos de Despliegue

### Backend en AWS
```bash
# Desplegar backend y base de datos
cd /home/ec2-user/masclet-imperi
docker-compose up -d
```

### Frontend en AWS
```bash
# Desplegar frontend
cd /home/ec2-user/masclet-imperi-frontend
docker-compose up -d
```

### Reinicio de Servicios
```bash
# Reiniciar backend
docker restart masclet-api

# Reiniciar base de datos
docker restart masclet-db

# Reiniciar frontend
docker restart masclet-frontend
docker restart masclet-frontend-node
```

### Comandos de Entorno Local
```bash
# Iniciar backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Iniciar frontend
npm run dev -- --host

# Iniciar base de datos local
docker start masclet-db-new
```

---

## Scripts de Diagnóstico

### Diagnóstico Completo (SCRIPT VERIFICADO)
```bash
python .\new_tests\complementos\comprobar_despliegue.py -u http://108.129.139.119 -v
```

### Verificación de Nginx y Problemas de Proxy
```bash
python .\new_tests\complementos\diagnostico_nginx.py
```

### Verificación de Login en Producción
```bash
python .\new_tests\complementos\verificar_login_produccion.py
```

### Verificación de Contenedores Docker
```bash
python .\new_tests\complementos\verificar_contenedores.py
```

---

## Procedimientos de Backup y Restauración

### Creación de Backups de Base de Datos
```bash
python new_tests\complementos\backup_database.py
```

### Restauración de Base de Datos (PRECAUCIÓN - SOLO EJECUTAR BAJO SUPERVISIÓN)
```bash
python new_tests\complementos\restore_database.py [--list] [--latest] [--recreate]
```

### Análisis de Contenido de Backups
```bash
python new_tests\complementos\analyze_backup.py [--list] [--summary] [--table nombre_tabla] [--records N]
```

---

## Gestión de Base de Datos

### Estructura de Base de Datos
```bash
python new_tests\complementos\show_db_structure.py -v
```

### Resetear Base de Datos (PRECAUCIÓN - SOLO EJECUTAR BAJO SUPERVISIÓN)
```bash
python new_tests\complementos\reset_database.py
```

### Preparar Migraciones
```bash
python backend\scripts\prepare_db_migration.py
```

---

## Archivos Docker Críticos

### Backend Docker Compose (AWS)
```yaml
version: '3.8'

services:
  db:
    container_name: masclet-db
    image: postgres:17
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin123
      - POSTGRES_DB=masclet_imperi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d masclet_imperi"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    container_name: masclet-api
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi
      - SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\\vG.A;.6o!r5uIRh4{Ch\\y$[,RQh<F#\"{GHXX/$
      - ACCESS_TOKEN_EXPIRE_MINUTES=120
      - API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP
      - ENVIRONMENT=prod
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./logs:/app/logs

volumes:
  postgres_data:
```

### Backend Dockerfile (AWS)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Archivos .env (AWS)
```
# Configuración para Masclet Imperi en producción

# Configuración de la base de datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=masclet_imperi
DATABASE_URL=postgres://admin:admin123@db:5432/masclet_imperi

# Configuración de seguridad
SECRET_KEY=cxuqwApocCz0iLeW>3Kz2\vG.A;.6o!r5uIRh4{Ch\y$[,RQh<F#"{GHXX/$
ACCESS_TOKEN_EXPIRE_MINUTES=120
API_KEY=y*^+BGmz|yRzy#}V#>i]9VGBKSM2nzOP

# Configuración del entorno
ENVIRONMENT=prod
ENABLE_RATE_LIMIT=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

---

## NOTAS IMPORTANTES

### Problema de Red Docker (04/06/2025)
La red `masclet-network` debe ser creada manualmente y marcada como externa en docker-compose.yml. Cualquier intento de gestionar esta red desde docker-compose causa conflictos si ya existe y tiene contenedores conectados.

### Problema de Proxy Nginx (02/06/2025)
Cuando el frontend solicita `/api/auth/login`, Nginx añade incorrectamente otro prefijo resultando en `/api/api/v1/auth/login`. Esto causa errores de conexión entre frontend y backend.
