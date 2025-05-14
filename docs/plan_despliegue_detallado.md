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
  - ✅ Configurar lazy loading de componentes grandes
    > **Estado**: Completado. Implementado `LazyComponents.tsx` con carga perezosa para Dashboard, AnimalTable, AnimalForm, gráficos y secciones pesadas, junto con utilidad `lazyLoad.ts`.
    >
  - ✅ Optimizar archivos CSS
    > **Estado**: Completado. Creado script `optimize-css.js` que elimina reglas duplicadas, minimiza y combina archivos CSS para mejorar rendimiento y tiempo de carga.
    >
  - ✅ Reorganizar imágenes y recursos estáticos
    > **Estado**: Completado. Realizamos un análisis exhaustivo de las imágenes existentes, identificando su propósito y estandarizando su nomenclatura:
    >
    > - Eliminamos espacios en los nombres de archivos (ej: `vaca azul.png` → `vaca_azul.png`)
    > - Categorizamos imágenes según su función:
    >   - `toro.png`: Icono para animales machos en tablas y formularios
    >   - `vaca_azul.png`: Icono para vacas activas/productivas
    >   - `vaca_blanca.png`: Icono para vacas inactivas/en reposo
    >   - `no_password.png`: Icono para indicar errores de autenticación
    > - Reorganizamos los directorios en estructura lógica: `/assets/icons/animals/`, `/assets/images/auth/`, `/assets/logos/`, etc.
    > - Implementamos un registro central de assets `asset-manifest.json` para facilitar referencias
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

- ✅ Eliminar cualquier credencial hardcodeada
  > **Estado**: Completado. Creado script `security_audit.py` para detectar credenciales hardcodeadas y reemplazadas con placeholders seguras. Todas las credenciales ahora se cargan desde variables de entorno.
  >
- ✅ Revisar tokens o claves expuestas en el código
  > **Estado**: Completado. Script `generate_secure_keys.py` implementado para generar claves seguras aleatorias para el entorno de producción, con archivo `.env.example` para documentación sin valores reales.
  >
- ✅ Asegurar que no hay rutas de depuración habilitadas
  > **Estado**: Completado. Se ha implementado el script `secure_production.py` que identifica y deshabilita automáticamente páginas de depuración (`login-debug.astro` y `dashboard-debug.astro`) en producción mediante renombrado con extensión `.disabled`.
  >
- ✅ Configurar rate limiting para APIs sensibles
  > **Estado**: Completado. Implementado middleware `RateLimitMiddleware` en módulo `security.py` para limitar peticiones a endpoints sensibles, con configuración de diferentes límites según la ruta y protección contra ataques de fuerza bruta.
  >
- ✅ Verificar headers de seguridad (HSTS, CSP, etc.)
  > **Estado**: Completado. Implementado `SecurityHeadersMiddleware` que añade automáticamente cabeceras de seguridad como X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Content-Security-Policy, HSTS y Permissions-Policy.
  >

### 1.4. Conectividad y Acceso Remoto

- ✅ Habilitar túneles seguros para desarrollo y testing
  > **Estado**: Completado. Implementada solución para uso de LocalTunnel con autenticación manual optimizada y mensajes visuales informativos.
  > **Detalles**: El sistema detecta automáticamente cuando se accede desde un túnel y muestra un mensaje claro al usuario para autenticar manualmente ambos túneles, evitando errores 511.
  > **Comandos**: 
  > - Frontend: `lt --port 3000 --subdomain masclet-imperi-web-frontend-2025 --allow-invalid-cert --local-host 0.0.0.0 --allow-public-access --print-requests`
  > - Backend: `lt --port 8000 --subdomain api-masclet-imperi --allow-invalid-cert --local-host 0.0.0.0 --allow-public-access --print-requests`
  >
- ✅ Resolver problemas de CORS en entornos mixtos
  > **Estado**: Completado. Implementada solución que gestiona correctamente los prefijos de URL en túneles para evitar duplicaciones de `/api/v1`, resolviendo problemas de autenticación y CORS.
  >
- ✅ Configurar acceso seguro a APIs desde redes externas
  > **Estado**: Completado. Sistema implementado en `apiService.ts` para manejar diferentes entornos (local, desarrollo, túnel, producción) con enrutamiento inteligente.
  >
## 2. Selección de Plataforma de Hosting

### 2.1. Análisis de Opciones para Backend

| Plataforma             | Ventajas                                         | Desventajas                          | Coste Mensual Aprox. |
| ---------------------- | ------------------------------------------------ | ------------------------------------ | -------------------- |
| **Railway**      | Fácil configuración, buen free tier            | Limitaciones en el plan gratuito     | 5-20€               |
| **Render**       | Buena integración con GitHub, fácil despliegue | Performance variable en tier básico | 7-25€               |
| **DigitalOcean** | Mayor control, Droplets estables                 | Requiere más configuración manual  | 5-40€               |
| **Heroku**       | Simple, integración con GitHub                  | Precios más altos, despertar lento  | 7-25€               |

### 2.2. Análisis de Opciones para Frontend

| Plataforma                | Ventajas                               | Desventajas                      | Coste Mensual Aprox. |
| ------------------------- | -------------------------------------- | -------------------------------- | -------------------- |
| **Vercel**          | Optimizado para Next.js/React, rápido | Limitaciones en build minutes    | 0-20€               |
| **Netlify**         | Fácil de usar, buen CDN               | Límites en funciones serverless | 0-19€               |
| **Servidor Único** | Todo en un lugar, más simple          | Punto único de fallo            | Incluido con backend |

### 2.3. Análisis de Opciones para Base de Datos

| Servicio                               | Ventajas                            | Desventajas               | Coste Mensual Aprox. |
| -------------------------------------- | ----------------------------------- | ------------------------- | -------------------- |
| **PostgreSQL en mismo servidor** | Simple, sin coste adicional         | Menos redundancia         | Incluido en hosting  |
| **Railway PostgreSQL**           | Fácil configuración, backups      | Limitado en plan gratuito | 5-20€               |
| **Supabase**                     | API adicional, backups automáticos | Curva de aprendizaje      | 0-25€               |
| **ElephantSQL**                  | Sencillo, buen tier gratuito        | Menos opciones avanzadas  | 0-19€               |

### 2.4. Recomendación según Presupuesto

- **Presupuesto Mínimo**:

  - Backend + DB: Railway (plan inicial)
  - Frontend: Vercel (plan gratuito)
  - Coste total aproximado: 5-10€/mes
- **Presupuesto Medio**:

  - Backend: Render (plan estándar)
  - DB: Supabase (plan inicial)t
  - Frontend: Vercel (plan hobby)
  - Coste total aproximado: 25-35€/mes
- **Presupuesto Óptimo**:

  - Backend: DigitalOcean (Droplet 2GB)
  - DB: DigitalOcean Managed PostgreSQL
  - Frontend: Vercel (plan pro)
  - Coste total aproximado: 45-60€/mes

## 3. Proceso de Despliegue Paso a Paso

### 3.1. Preparación del Repositorio

- ✅ Crear ramas específicas (`production`, `staging`)

  > **Estado**: Completado. Creadas dos ramas adicionales para gestionar el flujo de despliegue:
  >
  > - `staging`: Rama para pruebas previas a despliegue en producción
  > - `production`: Rama para el código final que se despliega en producción
  >
  > **Propósito**: La separación en ramas permite un flujo de trabajo seguro donde podemos desarrollar en `main`, probar en `staging` y desplegar solo código verificado a `production`. Esto garantiza que nunca se despliegue código no probado y reduce el riesgo de errores en producción.
  >
  > **Proceso de trabajo**:
  >
  > 1. Desarrollo diario en rama `main`
  > 2. Cuando una funcionalidad está lista, se hace merge a `staging` y se prueba completamente
  > 3. Solo cuando todo funciona en `staging` se hace merge a `production` para el despliegue final
  >
- ✅ Crear archivo `Dockerfile` para el backend

  > **Estado**: Completado. El archivo ya existía y lo hemos actualizado para usar el nuevo endpoint de health check en `/api/v1/health`.
  >
- ✅ Optimizar `.gitignore` para producción

  > **Estado**: Completado. Ampliado el archivo `.gitignore` para:
  >
  > - Excluir múltiples tipos de archivos `.env` pero mantener `.env.example` como referencia
  > - Añadir patrones para logs detallados y directorios de logs
  > - Excluir archivos de seguridad, certificados y claves
  > - Ignorar backups, volcados SQL y archivos temporales de producción
  > - Evitar el rastreo de archivos de configuración específicos para producción
  >
- ⭕ Configurar GitHub Actions o similar para CI/CD

  > **Estado**: Pendiente. Se implementará después de configurar los entornos en Render.
  >

### 3.2. Configuración de la Base de Datos en Producción

- ✅ Configurar sistema de migraciones

  > **Estado**: Completado. Creado script `prepare_db_migration.py` que:
  >
  > - Inicializa el sistema de migraciones usando Aerich
  > - Genera la migración inicial para crear todas las tablas en producción
  > - Configura la estructura completa de la base de datos para el primer despliegue
  >
- ✅ Establecer esquema de backups automáticos

  > **Estado**: Completado. Implementado sistema completo de backups mediante script `backup_database.py`:
  >
  > - Realiza backups completos de PostgreSQL comprimidos (gzip)
  > - Implementa política de retención configurable (30 días por defecto)
  > - Nombra los archivos con timestamps para fácil identificación
  > - Limpia automáticamente backups antiguos para optimizar espacio
  >
- ✅ Implementar sistema de restauración

  > **Estado**: Completado. Creado script `restore_database.py` para recuperación de emergencia:
  >
  > - Permite restaurar cualquier backup existente
  > - Ofrece opción para recrear la base de datos desde cero
  > - Incluye interfaz interactiva para elegir el backup a usar
  > - Implementa confirmaciones para prevenir restauraciones accidentales
  >
- ⭕ Crear instancia de base de datos en la plataforma elegida

  > **Estado**: Pendiente. Se implementará durante la configuración final en Render.
  >
- ⭕ Configurar seguridad (firewall, acceso restringido)

  > **Estado**: Pendiente. Se implementará junto con la creación de la instancia en Render.
  >

### 3.3. Despliegue del Backend

- ⭕ Configurar variables de entorno en la plataforma

  > **Estado**: Pendiente. Se implementará durante la configuración final en Render.
  >
- ⭕ Desplegar servicio web API

  > **Estado**: Pendiente. Se ejecutará una vez finalizadas todas las preparaciones.
  >
- ⭕ Verificar estado y logs

  > **Estado**: Pendiente. Se verificará después del despliegue inicial.
  >
- ⭕ Configurar dominios y HTTPS

  > **Estado**: Pendiente. Se configurará tras el despliegue exitoso del backend.
  >

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

### 5.5. Modernización del Frontend

#### 5.5.1. Migración Progresiva de Astro a React

Siguiendo el éxito de la migración de Explotaciones a React, se identifican las siguientes secciones como candidatas para migrar de Astro a React en el futuro:

1. **Ficha de Animales** (`animals\[id].astro`)
   - Sección compleja con pestañas y estados múltiples
   - Problemas de traducción identificados
   - Manejo de datos dinámicos (partos, historial de cambios)
   - Beneficio: mejor gestión de estado y experiencia de usuario con React
2. **Listado de Animales** (`animals\index.astro`)
   - Similar a Explotaciones ya migrada exitosamente
   - Incluye tablas, filtros y acciones CRUD
   - Beneficio: componentización y reutilización de código
3. **Dashboard** (`dashboard.astro` y variantes)
   - Pantalla principal de la aplicación (alto impacto)
   - Gráficos y visualizaciones interactivas
   - Beneficio: mejor renderizado de gráficos interactivos con React
4. **Importaciones** (`imports\index.astro`)
   - Manejo de carga de archivos y procesos asíncronos
   - Beneficio: mejor gestión de estados de carga y errores
5. **Gestión de Usuarios** (`users\index.astro`)
   - Formularios y validaciones complejas
   - Beneficio: hooks de React para validación de formularios
6. **Gestión de Partos** (`partos\index.astro`)
   - Sección con tablas y acciones CRUD
   - Beneficio: consistencia con otras secciones ya migradas

#### 5.5.2. Priorización de la Migración

1. Dashboard (alta prioridad) - Mayor visibilidad e impacto para el usuario
2. Ficha de Animales (alta prioridad) - Problemas actuales con traducciones
3. Listado de Animales (media prioridad) - Continuidad con migración de Explotaciones
4. Resto de secciones (baja prioridad) - Según necesidades y recursos disponibles
