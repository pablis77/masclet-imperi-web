# Plan de Despliegue Detallado para Masclet Imperi Web

> NOTA: Este documento representa el plan original. El progreso real ha sido afectado por problemas técnicos y parte del trabajo se ha perdido. Se usará como guía para el despliegue.

## 1. Preparación del Proyecto para Producción

### 1.1. Configuración de Variables de Entorno
- **Backend (FastAPI)**:

  - ✅ Crear archivo `.env.example` con todas las variables necesarias (sin valores reales)
    > **Estado**: Completado. Archivo creado en `backend/.env.example` con todas las variables necesarias
    >
  - ✅ Configurar manejo de archivo `.env` para desarrollo
    > **Estado**: Completado. Sistema de carga de variables implementado en config.py
    >
  - ✅ Implementar carga de variables desde entorno para producción
    > **Estado**: Completado. Configuración preparada para detección de entorno con fallback a valores por defecto
    >
  - Variables críticas a configurar:
    - ✅ `DATABASE_URL`: Conexión a la base de datos
      > **Estado**: Completado. Configurada en `.env`con variable `POSTGRES_DB`, `POSTGRES_USER`, etc.
      >
    - ✅ `SECRET_KEY`: Clave para firmar tokens JWT
      > **Estado**: Completado. Configurada en `.env`
      >
    - ✅ `ALLOWED_ORIGINS`: Dominios permitidos para CORS
      > **Estado**: Completado. Implementado como `CORS_ORIGINS` en config.py y `.env`
      >
    - ✅ `LOG_LEVEL`: Nivel de logging en producción
      > **Estado**: Completado. Se controla mediante variable `DEBUG` en `.env`
      >
    - ✅ `BACKUP_DIR`: Directorio para backups automáticos
      > **Estado**: Completado. Configurado en config.py y `.env`
      >

- **Frontend (React/Astro)**:

  - ✅ Configurar `.env.production` y `.env.development`
    > **Estado**: Completado. Archivos creados en `frontend/` con configuración para cada entorno
    >
  - Variables esenciales:
    - ✅ `VITE_API_URL`: URL de la API en producción
      > **Estado**: Completado. URL configurada según el entorno para conexión a la API
      >
    - ✅ `VITE_ENVIRONMENT`: Entorno actual (prod/dev)
      > **Estado**: Completado. Variable implementada para ajustar comportamiento de la aplicación según entorno
      >

### 1.2. Optimización de Código
- **Frontend**:

  - ✅ Ejecutar build de producción con optimizaciones
    > **Estado**: Completado. Configurado `astro.config.mjs` con opciones de optimización (minify, cssMinify, manualChunks, etc.)
    >
  - ✅ Verificar bundle size y reducir si es necesario
    > **Estado**: Completado. Configurada fragmentación de chunks por paquetes (react, charts, vendor) para optimizar carga
    >
  - ✅ Eliminar código de depuración
    > **Estado**: Completado. Implementado sistema de logs (`logger.ts`) que elimina console.log en producción. Páginas debug redirigen en producción
    >
  - ⭕ Configurar lazy loading de componentes grandes
    > **Estado**: Pendiente (Lazy loading para componentes pesados como ImportForm.tsx y el dashboard completo)
    >
  - ⭕ Optimizar archivos CSS
    > **Estado**: Pendiente (Optimización de lemon-squeezy.css, global.css y main.css eliminando clases redundantes)
    >
  - ⭕ Reorganizar imágenes y recursos estáticos
    > **Estado**: Pendiente (Estructura clara para assets: /assets/icons/animals/, /assets/images/logos/, etc.)
    >
  
- **Backend**:

  - ✅ Optimizar consultas SQL críticas
    > **Estado**: Completado. Script `backend/scripts/optimize_db_queries.py` implementado para crear índices en tablas principales con índices compuestos para el dashboard
    >
  - ✅ Configurar caché para endpoints frecuentes
    > **Estado**: Completado. Módulo `backend/app/core/cache.py` con decorador `@cached_endpoint` e TTL=300s (5 minutos) para dashboard
    >
  - ✅ Ajustar configuración de workers/threads
    > **Estado**: Completado. Script `backend/scripts/optimize_server.py` que calcula automáticamente configuración óptima para Uvicorn
    >
  - ✅ Eliminar endpoints de desarrollo/test
    > **Estado**: Completado. Módulo `backend/app/core/environment.py` con decoradores `@development_only`, `@testing_only` y `@production_only`
    >
  - ✅ Corregir errores en endpoints del dashboard
    > **Estado**: Completado. Implementado `dashboard_stats.py` con endpoint faltante `/api/v1/dashboard/explotacions/{explotacio}/stats`
    >

### 1.3. Seguridad Previa al Despliegue

- ⭕ Eliminar cualquier credencial hardcodeada
  > **Estado**: Pendiente (Revisar y eliminar todas las credenciales del código fuente)
  >
- ⭕ Revisar tokens o claves expuestas en el código
  > **Estado**: Pendiente (Verificar que no hay tokens o claves en el código fuente)
  >
- ⭕ Asegurar que no hay rutas de depuración habilitadas
  > **Estado**: Pendiente (Usar módulo disable_dev_endpoints.py para desactivar endpoints de desarrollo en producción)
  >
- ⭕ Configurar rate limiting para APIs sensibles
  > **Estado**: Pendiente (Implementar middleware de rate limiting para endpoints sensibles como login, admin e imports)
  >
- ⭕ Verificar headers de seguridad (HSTS, CSP, etc.)
  > **Estado**: Pendiente (Añadir middleware security_headers.py con cabeceras HSTS, CSP, X-Frame-Options, etc.)
  >

## 2. Selección de Plataforma de Hosting

### 2.1. Análisis de Opciones para Backend
| Plataforma | Ventajas | Desventajas | Coste Mensual Aprox. |
|------------|----------|-------------|----------------------|
| **Railway** | Fácil configuración, buen free tier | Limitaciones en el plan gratuito | 5-20€ |
| **Render** | Buena integración con GitHub, fácil despliegue | Performance variable en tier básico | 7-25€ |
| **DigitalOcean** | Mayor control, Droplets estables | Requiere más configuración manual | 5-40€ |
| **Heroku** | Simple, integración con GitHub | Precios más altos, despertar lento | 7-25€ |

### 2.2. Análisis de Opciones para Frontend
| Plataforma | Ventajas | Desventajas | Coste Mensual Aprox. |
|------------|----------|-------------|----------------------|
| **Vercel** | Optimizado para Next.js/React, rápido | Limitaciones en build minutes | 0-20€ |
| **Netlify** | Fácil de usar, buen CDN | Límites en funciones serverless | 0-19€ |
| **Servidor Único** | Todo en un lugar, más simple | Punto único de fallo | Incluido con backend |

### 2.3. Análisis de Opciones para Base de Datos
| Servicio | Ventajas | Desventajas | Coste Mensual Aprox. |
|----------|----------|-------------|----------------------|
| **PostgreSQL en mismo servidor** | Simple, sin coste adicional | Menos redundancia | Incluido en hosting |
| **Railway PostgreSQL** | Fácil configuración, backups | Limitado en plan gratuito | 5-20€ |
| **Supabase** | API adicional, backups automáticos | Curva de aprendizaje | 0-25€ |
| **ElephantSQL** | Sencillo, buen tier gratuito | Menos opciones avanzadas | 0-19€ |

### 2.4. Recomendación según Presupuesto
- **Presupuesto Mínimo**: 
  - Backend + DB: Railway (plan inicial)
  - Frontend: Vercel (plan gratuito)
  - Coste total aproximado: 5-10€/mes

- **Presupuesto Medio**:
  - Backend: Render (plan estándar)
  - DB: Supabase (plan inicial)
  - Frontend: Vercel (plan hobby)
  - Coste total aproximado: 25-35€/mes

- **Presupuesto Óptimo**:
  - Backend: DigitalOcean (Droplet 2GB)
  - DB: DigitalOcean Managed PostgreSQL
  - Frontend: Vercel (plan pro)
  - Coste total aproximado: 45-60€/mes

## 3. Proceso de Despliegue Paso a Paso

### 3.1. Preparación del Repositorio
1. Crear ramas específicas (`production`, `staging`)
2. Configurar GitHub Actions o similar para CI/CD
3. Crear archivo `Dockerfile` para el backend
4. Optimizar `.gitignore` para producción

### 3.2. Configuración de la Base de Datos en Producción
1. Crear instancia de base de datos en la plataforma elegida
2. Configurar usuarios, contraseñas y accesos
3. Implementar script de migración inicial
4. Configurar backups automáticos
5. Crear procedimiento de respaldo y recuperación

### 3.3. Despliegue del Backend
1. Configurar variables de entorno en la plataforma
2. Desplegar aplicación desde repositorio
3. Configurar dominios y certificados SSL
4. Implementar healthchecks y monitorización
5. Realizar pruebas de carga y rendimiento

### 3.4. Despliegue del Frontend
1. Configurar variables de entorno de producción
2. Ejecutar build optimizado
3. Desplegar a la plataforma seleccionada
4. Configurar dominios y certificados SSL
5. Configurar CDN si es necesario
6. Verificar funcionamiento con backend en producción

### 3.5. Configuración de Dominio y DNS
1. Registrar dominio si no se tiene (p.ej.: mascletimperi.com)
2. Configurar registros DNS:
   - A/CNAME para frontend
   - A/CNAME para backend/API
   - Registros MX si se necesita correo
3. Configurar SSL en todos los dominios
4. Establecer redirecciones www/no-www

### 3.6. Implementación de Monitorización
1. Configurar sistema de logs centralizado
2. Implementar alertas para errores críticos
3. Configurar monitorización de uptime
4. Establecer alertas de uso de recursos

## 4. Procedimientos Post-Despliegue

### 4.1. Pruebas de Verificación
1. Verificar todos los flujos críticos:
   - Registro de animales
   - Gestión de explotaciones
   - Dashboard y estadísticas
   - Importación de datos
2. Comprobar funcionamiento en distintos navegadores
3. Verificar experiencia en dispositivos móviles
4. Pruebas de seguridad básicas (inyección, XSS)

### 4.2. Documentación del Entorno
1. Crear documento con accesos y credenciales (seguro)
2. Documentar proceso de despliegue para futuras versiones
3. Crear guía de troubleshooting para problemas comunes
4. Establecer protocolo de actualizaciones

### 4.3. Plan de Mantenimiento
1. Establecer ventanas de mantenimiento
2. Crear proceso de despliegue de hotfixes
3. Definir política de respaldos y retención
4. Establecer procedimiento de rollback

## 5. Consideraciones Adicionales

### 5.1. Escalabilidad
- Evaluar puntos de posible crecimiento (usuarios, datos)
- Planificar estrategia de escalado (vertical vs horizontal)
- Identificar posibles cuellos de botella

### 5.2. Costes Operativos
- Estimar costes mensuales y anuales
- Identificar opciones de reducción de costes
- Planificar para incrementos futuros (tráfico, almacenamiento)

### 5.3. Cumplimiento Legal
- Verificar cumplimiento RGPD/LOPD
- Implementar política de privacidad
- Configurar avisos de cookies si es necesario

### 5.4. Estrategia de Migración
- Plan para migrar datos de desarrollo a producción
- Estrategia para futuras migraciones de plataforma
- Proceso de respaldo antes de cambios mayores
