# 📚 GUÍA DE MIGRACIÓN A AWS AMPLIFY

## Masclet Imperi Web - Junio 2025

# 📋 ÍNDICE GENERAL

1. [Entorno de desarrollo local](#1-entorno-de-desarrollo-local)
2. [Módulos funcionales de la aplicación](#2-módulos-funcionales-de-la-aplicación)
3. [Estado actual de la infraestructura en producción](#3-estado-actual-de-la-infraestructura-en-producción)
4. [Proceso de migración a AWS Amplify](#4-proceso-de-migración-a-aws-amplify)
5. [Configuración para AWS Amplify](#5-configuración-para-aws-amplify)
6. [Pruebas y verificación post-migración](#6-pruebas-y-verificación-post-migración)
7. [Plan de contingencia](#7-plan-de-contingencia)
8. [Anexos y recursos adicionales](#8-anexos-y-recursos-adicionales)

# 1. ENTORNO DE DESARROLLO LOCAL

## 1.1 Configuración técnica del entorno local

### 1.1.1 Tecnologías principales

| Componente | Tecnología | Versión |
|------------|------------|--------|
| **Frontend** | Astro | 4.16.18 |
| **Frameworks UI** | React | 19.0.0 |
| | TailwindCSS | 3.4.1 |
| | Bootstrap | 5.3.3 |
| **Backend** | FastAPI | 0.105.0 |
| **Base de datos** | PostgreSQL | 15.4 |
| **Sistema de autenticación** | OAuth2 + JWT | - |
| **Charts** | Chart.js | 4.4.1 |
| **Estilos** | TailwindCSS | 3.4.1 |
| **SSR** | Node.js | 20.5.0 |

### 1.1.2 Estructura de directorios

```
masclet-imperi-web/
├── frontend/                 # Frontend Astro + React
│   ├── src/
│   │   ├── components/       # Componentes React modulares
│   │   ├── layouts/          # Layouts de Astro 
│   │   ├── pages/            # Rutas y páginas
│   │   ├── services/         # Servicios para API
│   │   └── utils/            # Utilidades y helpers
│   ├── public/               # Activos estáticos
│   ├── astro.config.mjs      # Configuración de Astro
│   └── package.json          # Dependencias de frontend
├── backend/                  # Backend FastAPI
│   ├── app/
│   │   ├── api/              # Endpoints de API
│   │   ├── core/             # Configuración principal
│   │   ├── crud/             # Operaciones de base de datos
│   │   ├── db/               # Modelos y esquemas
│   │   └── main.py           # Punto de entrada
│   └── requirements.txt      # Dependencias de Python
└── docker/                   # Configuración de Docker
    ├── frontend/             # Dockerfiles para frontend
    └── backend/              # Dockerfiles para backend
```

### 1.1.3 Comandos de inicio locales

```bash
# Frontend (Astro + React) - Puerto 3000
npm run dev -- --host

# Backend (FastAPI) - Puerto 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Base de datos local (PostgreSQL) - Puerto 5433
# Iniciado automáticamente o mediante Docker
```

### 1.1.4 Variables de entorno locales

**Frontend (.env)**
```
PUBLIC_API_URL=http://localhost:8000
PUBLIC_BACKEND_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
```

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=masclet_imperi
SECRET_KEY=supersecretkey
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

# 2. MÓDULOS FUNCIONALES DE LA APLICACIÓN

## 2.1 Dashboard

### 2.1.1 Funcionalidades

- Resumen estadístico general de la explotación
- Gráficos de distribución de animales por género
- Gráficos de distribución por estados
- Histórico de partos 
- Estadísticas por periodos
- Cards de resumen con conteo rápido

### 2.1.2 Tecnologías específicas

- Chart.js para visualizaciones
- React Hooks para gestión de estado
- API de observación para detección de tema oscuro/claro
- Carga asíncrona de datos

### 2.1.3 Endpoints utilizados

```plaintext
GET /api/v1/dashboard/combined               # Estadísticas combinadas para dashboard
GET /api/v1/dashboard/partos                 # Estadísticas de partos
GET /api/v1/dashboard/resumen/               # Datos de resumen general
GET /api/v1/dashboard/resumen-card           # Datos para tarjetas de resumen
GET /api/v1/dashboard-periodo/periodo-dinamico # Estadísticas por periodo seleccionado
```

## 2.2 Explotaciones

### 2.2.1 Funcionalidades

- Listado de explotaciones activas
- Visualización detallada de explotación
- Estadísticas específicas por explotación
- Filtrado y búsqueda por código

### 2.2.2 Tecnologías específicas

- Componentes de tabla con ordenación
- Búsqueda en tiempo real
- Modal para visualización detallada

### 2.2.3 Endpoints utilizados

```plaintext
# Solo estos endpoints son activos y se utilizan actualmente
GET /api/v1/dashboard/explotacions           # Listar explotaciones actuales
GET /api/v1/dashboard/explotacions/{explotacio_value} # Detalles de una explotación
GET /api/v1/dashboard/explotacions/{explotacio_value}/stats # Estadísticas de explotación

# NOTA: Los endpoints directos de explotaciones han sido reemplazados por los endpoints de dashboard
```

## 2.3 Animales

### 2.3.1 Funcionalidades

- Listado completo de animales
- Filtrado por múltiples criterios
- Vista detallada de animal
- Historial de partos del animal
- Gestión de partos (crear, editar, eliminar)
- Edición de información del animal

### 2.3.2 Tecnologías específicas

- Formularios dinámicos con validación
- Tablas avanzadas con ordenación y filtros
- Componentes modales para operaciones CRUD
- Sistema de notificaciones toast

### 2.3.3 Endpoints utilizados

```plaintext
GET    /api/v1/animals/                      # Listado de animales
GET    /api/v1/animals/{animal_id}           # Obtener un animal específico
PATCH  /api/v1/animals/{animal_id}           # Actualizar animal parcialmente
PUT    /api/v1/animals/{animal_id}           # Actualizar animal completo
DELETE /api/v1/animals/{animal_id}           # Eliminar animal
GET    /api/v1/animals/{animal_id}/history   # Historial completo del animal
GET    /api/v1/animals/{animal_id}/parts     # Partos del animal
POST   /api/v1/animals/{animal_id}/partos    # Crear nuevo parto
GET    /api/v1/animals/{animal_id}/partos    # Obtener partos del animal
```

## 2.4 Usuarios y Autenticación

### 2.4.1 Funcionalidades

- Login OAuth2 con JWT
- Gestión de permisos por rol
- Registro de usuarios (administrador)
- Perfil de usuario configurable
- Cierre de sesión

### 2.4.2 Tecnologías específicas

- Sistema de autenticación OAuth2
- JWT para tokens de sesión
- Almacenamiento seguro en localStorage
- Control de acceso basado en roles (RBAC)

### 2.4.3 Endpoints utilizados

```plaintext
POST   /api/v1/auth/login                    # Login para obtener token
GET    /api/v1/auth/me                       # Información del usuario actual
POST   /api/v1/auth/refresh                  # Refrescar token de acceso
GET    /api/v1/users/                        # Listar usuarios (admin)
POST   /api/v1/users/                        # Crear usuario (admin)
GET    /api/v1/users/{user_id}               # Obtener usuario específico
PUT    /api/v1/users/{user_id}               # Actualizar usuario
DELETE /api/v1/users/{user_id}               # Eliminar usuario
```

## 2.5 Importaciones CSV

### 2.5.1 Funcionalidades

- Carga masiva de datos desde archivos CSV
- Validación previa de datos
- Informe de errores detallado
- Seguimiento de estado de importación
- Descarga de plantilla

### 2.5.2 Tecnologías específicas

- Carga de archivos con validación
- Procesamiento asíncrono
- Notificaciones en tiempo real
- Informes de error descargables

### 2.5.3 Endpoints utilizados

```plaintext
GET    /api/v1/imports/                      # Listar importaciones realizadas
POST   /api/v1/imports/csv                   # Importar nuevo archivo CSV
GET    /api/v1/imports/template              # Descargar plantilla CSV
GET    /api/v1/imports/{import_id}           # Estado de una importación
GET    /api/v1/imports/{import_id}/errors    # Errores de una importación
```

## 2.6 Copias de Seguridad

### 2.6.1 Funcionalidades

- Creación manual de backups
- Programación de backups automáticos
- Descarga de copias de seguridad
- Restauración de backups
- Gestión de retención de copias

### 2.6.2 Tecnologías específicas

- Sistema de programación de tareas
- Compresión y optimización de backups
- Validación de integridad
- Gestión de almacenamiento

### 2.6.3 Endpoints utilizados

```plaintext
POST   /api/v1/backup/create                 # Crear backup manual
DELETE /api/v1/backup/delete/{filename}      # Eliminar backup existente
GET    /api/v1/backup/download/{filename}    # Descargar backup
GET    /api/v1/backup/list                   # Listar backups disponibles
POST   /api/v1/backup/restore/{filename}     # Restaurar desde backup
POST   /api/v1/scheduled-backup/trigger/daily # Ejecutar backup programado
```

## 2.7 Listados

### 2.7.1 Funcionalidades

- Creación de listados personalizados
- Agrupación de animales por criterios
- Exportación a PDF
- Gestión de listados guardados

### 2.7.2 Tecnologías específicas

- Generación de PDF con jsPDF
- Selector dinámico de animales
- Sistema de guardado de configuraciones

### 2.7.3 Endpoints utilizados

```plaintext
POST   /api/v1/listados                      # Crear listado
GET    /api/v1/listados                      # Obtener listados guardados
GET    /api/v1/listados/{listado_id}         # Ver listado específico
PUT    /api/v1/listados/{listado_id}         # Actualizar listado
DELETE /api/v1/listados/{listado_id}         # Eliminar listado
GET    /api/v1/listados/{listado_id}/export-pdf # Exportar listado a PDF
```

## 2.8 Notificaciones

### 2.8.1 Funcionalidades

- Notificaciones en tiempo real
- Centro de notificaciones
- Marcado como leído
- Categorización por tipo

### 2.8.2 Tecnologías específicas

- Sistema de polling para actualizaciones
- Toasts para notificaciones emergentes
- Contador de no leídos

### 2.8.3 Endpoints utilizados

```plaintext
GET    /api/v1/notifications/                # Obtener notificaciones
DELETE /api/v1/notifications/                # Borrar todas las notificaciones
POST   /api/v1/notifications/mark-all-read   # Marcar todas como leídas
POST   /api/v1/notifications/mark-read/{id}  # Marcar una como leída
DELETE /api/v1/notifications/{id}            # Eliminar notificación específica
```

# 3. ESTADO ACTUAL DE LA INFRAESTRUCTURA EN PRODUCCIÓN

El entorno actual de Masclet Imperi Web está desplegado en una instancia EC2 con la siguiente estructura de contenedores Docker:

```bash
CONTAINER ID   IMAGE                      COMMAND                CREATED    STATUS                  PORTS                                     NAMES   
2d9355086e97   masclet-api-imagen-completa "uvicorn app.main:ap…" 3 days ago Up 2 hours (healthy)    0.0.0.0:8000->8000/tcp                   masclet-api
99ca16e63432   masclet-db-imagen-completa  "docker-entrypoint.s…" 3 days ago Up 3 days               0.0.0.0:5432->5432/tcp                   masclet-db
```

### 🔄 Componentes a conservar

En la nueva arquitectura con AWS Amplify, mantendremos:

- **Backend (masclet-api)**: Contenedor FastAPI existente
- **Base de datos (masclet-db)**: Contenedor PostgreSQL existente
- **Red Docker (masclet-network)**: Red que comunica los contenedores

### 🚫 Componentes a reemplazar

Reemplazaremos los siguientes componentes:

- ~~masclet-frontend-node~~: Será reemplazado por AWS Amplify
- ~~masclet-frontend~~: Será reemplazado por AWS Amplify

## 🏗️ ARQUITECTURA DE AWS AMPLIFY

### Conexión con servicios existentes

```
┌────────────────────────┐           ┌────────────────────────┐
│                        │           │                        │
│    AWS AMPLIFY         │◄─────────►│   INSTANCIA EC2        │
│    (Frontend)          │   API     │   (Backend + DB)       │
│                        │  Calls    │                        │
└────────────────────────┘           └────────────────────────┘
```

## 🛠️ CONFIGURACIÓN DEL BACKEND EXISTENTE

### Detalles del contenedor masclet-api

**Imagen**: `masclet-api-imagen-completa`
**nombre**: masclet-api

**Puerto**: 8000
**IP**: 34.253.203.194
**Comando**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
SWAGGER: http://34.253.203.194:8000/api/v1/docs

**Estado**: Healthy

### Detalles del contenedor masclet-db

**Imagen**: `masclet-db-imagen-completa`
**nombre**: masclet-db

**Puerto**: 5432
**Estado**: Up
**Volúmenes**: Persistentes para datos

### Configuración de Red

**Nombre**: `masclet-network`
**Tipo**: bridge
**Driver**: docker

### Configuración CORS necesaria

Para permitir que AWS Amplify se comunique con el backend, debemos modificar la configuración CORS en FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mascletimperi.com",                # Dominio personalizado
        "https://*.amplifyapp.com",                 # Dominio de Amplify
        "http://localhost:3000"                     # Desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 PROCESO DE MIGRACIÓN PASO A PASO

### 1️⃣ Preparación del entorno actual

1. **Realizar backup completo**

```bash
# Backup de la base de datos
docker exec masclet-db pg_dump -U postgres -d mascletimperi > mascletimperi_backup_$(date +%Y%m%d).sql

# Backup de volúmenes Docker (opcional)
docker run --rm --volumes-from masclet-db -v $(pwd):/backup ubuntu tar cvf /backup/volumes_backup_$(date +%Y%m%d).tar /var/lib/postgresql/data
```

2. **Verificar estado de los servicios de backend**

```bash
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker inspect masclet-api"
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker inspect masclet-db"
```

### 2️⃣ Configuración de AWS Amplify

1. **Crear archivo `amplify.yml` en la raíz del proyecto**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - cd frontend
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

2. **Crear `frontend/.env.production`**

```
PUBLIC_API_URL=http://34.253.203.194:8000
PUBLIC_BACKEND_URL=http://34.253.203.194:8000
```

3. **Configurar variables de entorno en Astro**

Modificar `frontend/astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), tailwind()],
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL),
      'import.meta.env.PUBLIC_BACKEND_URL': JSON.stringify(process.env.PUBLIC_BACKEND_URL)
    },
    ssr: {
      noExternal: ['chart.js', '@tremor/*'] // Evita errores de hidratación
    }
  }
});
```

### 3️⃣ Ajustes específicos para Chart.js

1. **Modificar inicialización en DashboardV2.tsx**

Asegurar que la inicialización de Chart.js ocurre de forma asíncrona dentro de un useEffect:

```typescript
// En DashboardV2.tsx
import { useEffect } from 'react';

// ...

useEffect(() => {
  // Inicialización de Chart.js
  const initChartJs = async () => {
    try {
      const ChartModule = await import('chart.js');
      const { 
        Chart, 
        CategoryScale, 
        LinearScale, 
        PointElement, 
        LineElement, 
        BarElement, 
        ArcElement, 
        DoughnutController, 
        PieController,
        BarController,
        LineController,
        ScatterController,
        RadarController,
        TimeScale,
        Tooltip,
        Legend 
      } = ChartModule;
  
      Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        DoughnutController,
        PieController,
        BarController,
        LineController,
        ScatterController,
        RadarController,
        TimeScale,
        Tooltip,
        Legend
      );
  
      console.log('Chart.js registrado correctamente');
  
      // Continuar con la carga de datos y renderizado de gráficos
      loadDashboardData();
    } catch (error) {
      console.error('Error inicializando Chart.js:', error);
    }
  };
  
  initChartJs();
  
  // Resto del código del useEffect...
}, []);
```

### 4️⃣ Configuración en AWS Console

1. **Crear la aplicación en AWS Amplify**

   - Nombre: MascletImperiWeb
   - Repositorio: GitHub - pablis77/masclet-imperi-web
   - Rama: production
2. **Configurar variables de entorno en la consola de Amplify**

| Variable                 | Valor                      |
| ------------------------ | -------------------------- |
| PUBLIC_API_URL           | http://34.253.203.194:8000 |
| PUBLIC_BACKEND_URL       | http://34.253.203.194:8000 |
| NODE_VERSION             | 18                         |
| ASTRO_TELEMETRY_DISABLED | 1                          |
| NODE_OPTIONS             | --max-old-space-size=4096  |

3. **Configurar dominio personalizado**
   - Dominio: mascletimperi.com
   - Subdominio: www

## 🔌 CONEXIÓN SEGURA CON BACKEND

### Configuración de seguridad

Debido a que nuestro backend estará expuesto públicamente, se recomienda:

1. **Agregar capa de seguridad adicional**

```bash
# Actualizar reglas de seguridad en EC2
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "sudo yum install -y fail2ban"
```

2. **Configurar limitación de tasa en FastAPI**

```python
# En backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# Limitación de tasa simple
@app.middleware("http")
async def add_rate_limit(request: Request, call_next):
    # Implementar limitación por IP
    client_ip = request.client.host
    # Lógica de limitación...
  
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
  
    return response
```

## 🧪 VALIDACIÓN Y PRUEBAS

### Lista de verificación post-migración

1. **✅ Login funcional**

   - OAuth2 funciona correctamente
   - Tokens JWT son validados
2. **✅ Dashboard sin errores de hidratación**

   - Los gráficos cargan correctamente
   - No hay errores en la consola
3. **✅ Operaciones CRUD**

   - Explotaciones: Crear, editar, eliminar
   - Animales: Crear, editar, eliminar
   - Partos: Registrar nuevos
4. **✅ Importaciones CSV**

   - Funcionalidad de carga de archivos
   - Procesamiento correcto
5. **✅ Configuración de usuario**

   - Cambio de contraseña
   - Actualización de perfil

## 💰 ANÁLISIS DE COSTES

| Servicio               | Coste mensual estimado |
| ---------------------- | ---------------------- |
| AWS Amplify            | $8 - $20               |
| EC2 (existente)        | Mantiene coste actual  |
| Transferencia de datos | ~$5 - $10              |
| **Total**        | **~$15 - $30**   |

## 🚨 PLAN DE CONTINGENCIA

En caso de problemas durante la migración:

1. **Reversión rápida**

   - Usar DNS para redireccionar el tráfico de nuevo a la solución anterior
   - Los contenedores de frontend están respaldados y pueden reactivarse
2. **Depuración de problemas comunes**

   - Errores CORS: Verificar configuración en backend
   - Errores de hidratación: Revisar inicialización de componentes
   - Fallos de conexión: Comprobar reglas de seguridad en EC2

## 🗓️ CRONOGRAMA RECOMENDADO

| Fase            | Duración         | Descripción                         |
| --------------- | ----------------- | ------------------------------------ |
| Preparación    | 1 día            | Configuración inicial, respaldos    |
| Desarrollo      | 2 días           | Ajustes de código, pruebas locales  |
| Despliegue      | 1 día            | Configuración de Amplify, pruebas   |
| Validación     | 1 día            | Pruebas exhaustivas, ajustes finales |
| **Total** | **5 días** |                                      |

## 📋 COMANDOS ÚTILES PARA MANTENIMIENTO

```bash
# Verificar estado del backend
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker ps"

# Ver logs del backend
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker logs masclet-api"

# Reiniciar backend si es necesario
ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker restart masclet-api"

# Limpiar caché de Amplify
aws amplify delete-cache --app-id APP_ID --branch-name production
```

---

*Este documento de migración fue preparado por Cascade para Masclet Imperi Web - 11 de junio de 2025*
