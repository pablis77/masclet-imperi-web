# NUEVA PROPUESTA DE DESPLIEGUE MASCLET IMPERI

Fecha: 04/06/2025
Hora: 23:32

## Objetivo

Crear un despliegue robusto en AWS para Masclet Imperi que incluya tres contenedores Docker:

- Base de datos PostgreSQL
- Backend FastAPI
- Frontend con Nginx

Este documento detalla el plan para garantizar un despliegue exitoso después de los problemas previos.

## PLANIFICACIÓN DETALLADA (LISTA DE VERIFICACIÓN)

### FASE 1: Preparación y verificación inicial

- [X] 1.1 Crear backup completo del sistema local
  ```
  python backend\scripts\backup_database.py
  ```
- [X] 1.2 Verificar acceso a la instancia EC2
  ```
  ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119
  ```
- [X] 1.3 Comprobar estado actual de contenedores en AWS
  ```
  docker ps -a
  ```
- [X] 1.4 Documentar cualquier contenedor existente antes de proceder
  ```
  # Estado inicial de contenedores en AWS (05/06/2025)
  CONTAINER ID   IMAGE                       COMMAND                  CREATED       STATUS                   PORTS                                       NAMES
  f483cf6b953c   masclet-imperi-api:latest   "uvicorn app.main:ap…"   4 hours ago   Exited (1) 4 hours ago                                               masclet-backend
  cedae60121f8   postgres:17                 "docker-entrypoint.s…"   5 hours ago   Up 5 hours               0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   masclet-db
  ```
- [X] 1.5 Crear estructura de carpetas para despliegue ordenado
  ```
  mkdir -p ~/masclet-imperi_20250604/{db,backend,frontend,config,logs,backups,exito}
  ```

### FASE 2: Despliegue de la base de datos PostgreSQL

- [X] 2.1 Crear archivo de configuración db.env
- [X] 2.2 Crear archivo docker-compose.yml
- [X] 2.3 Verificar estado del contenedor PostgreSQL existente
  ```bash
  # Se detectó un contenedor existente, no es necesario desplegar uno nuevo
  CONTAINER ID   IMAGE        COMMAND                  CREATED      STATUS     PORTS                                   NAMES
  cedae60121f8   postgres:17  "docker-entrypoint.s…"   5 hours ago  Up 5 hours  0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   masclet-db
  ```
- [X] 2.4 Verificar funcionamiento correcto de PostgreSQL

  ```bash
  # Verificación correcta, base de datos vacía
  docker exec masclet-db psql -U admin -d masclet_imperi -c '\dt'
  # Resultado: "Did not find any relations."
  ```

- [X] 2.5 Migrar datos desde local usando backup de Python

  ```bash
  # Transferencia del backup a AWS
  scp -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" \
      "C:\Proyectos\claude\masclet-imperi-web\backend\backups\backup_masclet_imperi_20250604_212844.sql" \
      ec2-user@108.129.139.119:/home/ec2-user/masclet_backup.sql
  
  # Restauración del backup en el contenedor PostgreSQL
  ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" \
      ec2-user@108.129.139.119 "cat /home/ec2-user/masclet_backup.sql | docker exec -i masclet-db psql -U admin -d masclet_imperi"
  
  # Verificación de la migración exitosa
  # Tablas: 9 tablas migradas correctamente
  # Animals: 83 registros
  # Part: 270 registros
  # Users: 4 registros
  ```

### FASE 3: Despliegue del backend FastAPI

- [X] 3.1 Crear archivo backend.env (usando .env.aws como referencia)
- [X] 3.2 Utilizar Dockerfile existente que tiene multi-stage build optimizado
- [X] 3.3 Configurar correctamente la conexión a PostgreSQL (localhost:5432 desde la perspectiva del contenedor)
- [X] 3.4 Resolver problemas de dependencias (documentado en [backend_aws_dependencias_20250605.md](backend_aws_dependencias_20250605.md))
- [X] 3.5 Desplegar contenedor Backend
  ```
  cd /home/ec2-user/masclet-backend && docker-compose build && docker-compose up -d
  ```
- [X] 3.6 Verificar funcionamiento del backend
  ```
  curl http://localhost:8000/api/v1/health
  # Respuesta: {"status":"ok","environment":"production","version":"1.0.0","timestamp":1749081951.6706903}
  ```
- [X] 3.7 Verificar endpoints críticos y acceso a base de datos
  ```
  # Verificación exitosa del endpoint de usuarios
  curl http://localhost:8000/api/v1/users/me -H 'Authorization: Bearer token.falso'
  # Respuesta con datos de usuario, confirmando conexión con base de datos
  ```

### FASE 4: Despliegue del frontend con Node.js

- [X] 4.1 Crear archivo `.env.production` para el frontend

```bash
# Variables de entorno para frontend en producción
VITE_API_URL=http://108.129.139.119:8000
PUBLIC_API_URL=http://108.129.139.119:8000
```

- [X] 4.2 Preparar `frontend.Dockerfile` usando Node.js sin Nginx

```dockerfile
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
COPY fix-api-urls-enhanced.cjs ./

# Instalar dependencias con flag para evitar problemas de compatibilidad
RUN npm install --legacy-peer-deps

# Copiar el resto de archivos
COPY . .

# Establecer variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80
ENV VITE_API_URL=http://108.129.139.119:8000
ENV PUBLIC_API_URL=http://108.129.139.119:8000

# Construir la aplicación
RUN npm run build

# Ejecutar script para corregir rutas de API duplicadas
RUN node fix-api-urls-enhanced.cjs

# Exponer puerto 80
EXPOSE 80

# Ejecutar la aplicación
CMD [ "node", "./dist/server/entry.mjs" ]
```

- [X] 4.3 Preparar script PowerShell para despliegue automático

```powershell
# desplegar_frontend_aws.ps1
# Script para desplegar frontend Masclet Imperi en AWS
# Incluye respaldo automático y verificación del despliegue
```

- [X] 4.4 Desplegar contenedor Frontend

```bash
# En AWS, a través del script de despliegue automático
docker build -t masclet-frontend:latest .
docker run -d --name masclet-frontend --restart always \
  --network masclet-network \
  -p 80:80 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=80 \
  -e VITE_API_URL=http://108.129.139.119:8000 \
  -e PUBLIC_API_URL=http://108.129.139.119:8000 \
  masclet-frontend:latest
```

- [X] 4.5 Verificar funcionamiento del frontend

```bash
# Verificación básica de respuesta HTTP
curl -s -I http://localhost | head -n 1
# Resultado: HTTP/1.1 200 OK

# Verificación de contenido
curl -s http://localhost/ | grep -i "masclet" && echo "Frontend accesible!"
# Resultado: Frontend accesible!
```

### FASE 5: Integración y verificación final

- [ ] 5.1 Crear docker-compose_completo_20250604.yml integrando los tres servicios
- [ ] 5.2 Verificar comunicación correcta entre servicios
- [ ] 5.3 Ejecutar script de verificación
  ```
  python verificar_despliegue_20250604.py
  ```
- [ ] 5.4 Documentar URLs y puertos finales
- [ ] 5.5 Preparar scripts de mantenimiento y recuperación
- [ ] 5.6 Mover scripts exitosos a carpeta "exito"

## NOTAS FUNDAMENTALES PARA EL DESPLIEGUE

### Problemas conocidos con Nginx y soluciones

1. **Problemas de configuración con Nginx**:

   - Es crítico configurar correctamente el archivo `default.conf` para el proxy inverso
   - Cada petición a rutas de API debe redirigirse correctamente al backend
   - La configuración de CORS debe ser consistente entre Nginx y FastAPI
2. **Problemas con rutas de assets estáticos**:

   - Los archivos estáticos (JS, CSS, imágenes) deben servirse con las cabeceras correctas
   - El problema anterior con el frontend probablemente estaba relacionado con rutas mal configuradas
3. **Comunicación entre contenedores**:

   - Usar la red de Docker para referencias entre contenedores (no localhost)
   - Ejemplo: En el backend, la BD es `postgres://postgres:1234@db:5432/masclet_imperi`
   - En el frontend, el backend es `http://backend:8000`

### Archivos críticos a mantener y revisar siempre

1. **Scripts de verificación**:

   - `new_tests/complementos/comprobar_despliegue.py` - Base para verificación
   - Crear `verificar_despliegue_20250604.py` basado en este
2. **Archivos de configuración Docker**:

   - Todos los Dockerfiles deben guardarse con fecha (ejemplo: `Dockerfile_backend_20250604`)
   - Los docker-compose deben tener versión y fecha
3. **Logs y monitorización**:

   - Configurar logs persistentes fuera de contenedores
   - Verificar continuamente los logs durante el despliegue

   ```
   docker logs -f masclet-backend-20250604
   ```

### Estrategia "nunca abandonar un script"

Debemos seguir una estrategia de persistencia en los scripts. En lugar de crear múltiples scripts cuando algo falla:

1. Documentar cada error en un archivo `errores_despliegue_20250604.md`
2. Corregir el error en el mismo script, agregando comentarios sobre la solución
3. Mantener versiones incrementales del mismo script (v1, v2) en lugar de crear archivos nuevos

## SCRIPTS DE BACKUP Y RESTAURACIÓN

Hemos creado scripts robustos para garantizar la seguridad de nuestros datos y la facilidad de migración. Los scripts están disponibles en la carpeta `new_tests/complementos/`.

### Script de backup completo de AWS

```powershell
new_tests\complementos\aws_backup_complete.ps1
```

Este script realiza una copia de seguridad completa del entorno AWS:

1. **Backup de la base de datos**: 
   - Exporta todos los datos de PostgreSQL a un archivo SQL usando pg_dump dentro del contenedor Docker
   - Formato: `masclet_imperi_backup_YYYYMMDD_HHMMSS.sql`
   - Incluye estructura y datos completos con codificación UTF-8

2. **Archivos de configuración**: 
   - `.env.aws`: Variables de entorno del backend
   - `requirements.txt`: Dependencias Python con versiones fijas
   - `docker-compose.yml`: Configuración de los contenedores
   - `backend.Dockerfile` y otras configuraciones relevantes

3. **Configuración de contenedores**: 
   - Metadata JSON de cada contenedor (postgres, backend)
   - Volúmenes y puertos mapeados
   - Historial de comandos ejecutados

4. **Documentación**: 
   - `README_RESTAURACION.md`: Instrucciones paso a paso para restaurar
   - Registro de log de backup con timestamp

### Ubicación de las copias de seguridad

**IMPORTANTE**: Las copias de seguridad se almacenan en DOS ubicaciones para redundancia:

1. **Ubicación primaria**: 
   ```
   C:\Proyectos\claude\masclet-imperi-web\backup_aws_20250605\
   ```
   - Contiene backup completo realizado el 05/06/2025 con estructura:
     - `/db/`: Backups de base de datos PostgreSQL
     - `/config/`: Archivos de configuración y .env
     - `/docker/`: Configuración de contenedores
     - `/docs/`: Documentación de restauración

2. **Ubicación secundaria** (copia de respaldo): 
   ```
   C:\Proyectos\AWS\contenedores despliegue RAMON\
   ```
   - Pendiente de completar la segunda copia de seguridad
   - Destinada como copia para Ramón con instrucciones simplificadas
   - Incluirá scripts de un solo clic para restauración

### Script de verificación de espacio

Para monitorear el espacio disponible en el servidor AWS:

```powershell
new_tests\complementos\check_aws_space.ps1
```

Este script se conecta por SSH al servidor AWS y muestra información detallada sobre:
- Espacio total disponible en disco
- Contenedores Docker activos y su tamaño
- Imágenes Docker almacenadas
- Volúmenes y tamaño de datos
- Espacio libre para nuevos despliegues

### Script de restauración rápida (3 contenedores)

```powershell
new_tests\complementos\restore_aws_3containers.ps1
```

Este script (en desarrollo) automatizará el despliegue completo con 3 contenedores:

1. **Base de datos PostgreSQL**:
   - Restauración automática del último backup
   - Configuración de volumen persistente

2. **Backend FastAPI**:
   - Configuración del `.env.aws` actualizado
   - Conexión automática con PostgreSQL

3. **Frontend con Nginx**:
   - Despliegue del frontend compilado
   - Proxy inverso al backend

Está diseñado para facilitar un rápido despliegue en servidores limpios, utilizando los backups como base.
