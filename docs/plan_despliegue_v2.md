# Plan de Despliegue Detallado (v2) - Masclet Imperi Web

*Documento actualizado a: 29 de Mayo de 2025*

## Introducción

Este documento actualiza el plan de despliegue original, reflejando el estado actual del proyecto Masclet Imperi Web en su versión 1.1.0. Se han revisado todos los puntos críticos del despliegue, incorporando las mejoras implementadas y los nuevos requisitos identificados.

## Tabla de Contenidos

1. [Preparación para Producción](#1-preparación-para-producción)
   1. [Seguridad](#11-seguridad)
   2. [Optimización y Rendimiento](#12-optimización-y-rendimiento)
   3. [Gestión de Errores](#13-gestión-de-errores)
   4. [Conectividad y Acceso Remoto](#14-conectividad-y-acceso-remoto)
   5. [Traducción e Internacionalización](#15-traducción-e-internacionalización)
2. [Selección de Plataforma de Hosting](#2-selección-de-plataforma-de-hosting)
   1. [Análisis de Opciones para Backend](#21-análisis-de-opciones-para-backend)
   2. [Análisis de Opciones para Frontend](#22-análisis-de-opciones-para-frontend)
   3. [Selección Final y Justificación](#23-selección-final-y-justificación)
3. [Proceso de Despliegue](#3-proceso-de-despliegue)
   1. [Entorno de Producción](#31-entorno-de-producción)
   2. [Configuración de CI/CD](#32-configuración-de-cicd)
   3. [Estrategia de Versionado](#33-estrategia-de-versionado)
4. [Pruebas Pre-Despliegue](#4-pruebas-pre-despliegue)
   1. [Plan de Pruebas](#41-plan-de-pruebas)
   2. [Verificación de Seguridad](#42-verificación-de-seguridad)
5. [Mantenimiento Post-Despliegue](#5-mantenimiento-post-despliegue)
   1. [Monitoreo](#51-monitoreo)
   2. [Respaldo y Recuperación](#52-respaldo-y-recuperación)
   3. [Actualizaciones](#53-actualizaciones)
6. [Plan de Contingencia](#6-plan-de-contingencia)
   1. [Procedimiento de Rollback](#61-procedimiento-de-rollback)
   2. [Gestión de Incidentes](#62-gestión-de-incidentes)

## 1. Preparación para Producción

### 1.1. Seguridad

- ✅ Revisión de manejo de credenciales y configuración de secretos
  > **Estado**: Completado. Script `generate_secure_keys.py` implementado para generar claves seguras aleatorias para el entorno de producción, con archivo `.env.example` para documentación sin valores reales.
  > **Evolución**: Se ha mejorado el sistema para separar completamente las credenciales entre entornos de desarrollo y producción, usando archivos `.env.development` y `.env.production`.
  >
- ✅ Asegurar que no hay rutas de depuración habilitadas
  > **Estado**: Completado. Se ha implementado el script `secure_production.py` que identifica y deshabilita automáticamente páginas de depuración en producción mediante renombrado con extensión `.disabled`.
  > **Evolución**: Se ha añadido un sistema que verifica todas las rutas y endpoints del sistema para detectar cualquier ruta de depuración o prueba no documentada.
  >
- ✅ Configurar rate limiting para APIs sensibles
  > **Estado**: Completado. Implementado middleware `RateLimitMiddleware` en módulo `security.py` para limitar peticiones a endpoints sensibles, con configuración de diferentes límites según la ruta y protección contra ataques de fuerza bruta.
  > **Evolución**: Se ha mejorado el sistema para utilizar una caché distribuida que permite el rate limiting cuando se despliega en múltiples instancias.
  >
- ✅ Verificar headers de seguridad (HSTS, CSP, etc.)
  > **Estado**: Completado. Implementado `SecurityHeadersMiddleware` que añade automáticamente cabeceras de seguridad como X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Content-Security-Policy, HSTS y Permissions-Policy.
  > **Evolución**: Se ha ajustado la política CSP para permitir el funcionamiento correcto de todos los componentes dinámicos mientras se mantiene una seguridad óptima.
  >
- ✅ Implementar protección contra CSRF en todos los formularios
  > **Estado**: Completado. Se ha implementado protección CSRF en todos los formularios del sistema, utilizando tokens generados por el backend y verificados en cada petición POST/PUT/DELETE.
  > **Evolución**: Se ha mejorado el sistema para regenerar tokens automáticamente cuando expiran, evitando errores de validación.
  >
- ✅ Auditar permisos y roles de usuarios
  > **Estado**: Completado. El sistema implementa cuatro roles distintos (Administrador, Gerente, Editor, Lector) con permisos granulares para cada funcionalidad.
  > **Evolución**: Se ha añadido un sistema de auditoría que registra todos los cambios realizados por usuarios, incluyendo quién, cuándo y qué se modificó.
  >
- ✅ Implementar sistema de backup automático
  > **Estado**: Completado. Se ha implementado un sistema de backups automáticos diarios de la base de datos, con rotación de archivos y compresión.
  > **Evolución**: El sistema ahora realiza backups antes de operaciones críticas (importaciones masivas, cambios estructurales) y permite restauración selectiva.
  >

### 1.2. Optimización y Rendimiento

- ✅ Minificación y bundling de assets (JS, CSS)
  > **Estado**: Completado. Configurado en la build de Astro para optimizar automáticamente todos los activos.
  > **Evolución**: Se ha implementado lazy-loading para componentes pesados y carga condicional de recursos según la ruta.
  >
- ✅ Implementar estrategia de caché para datos estáticos
  > **Estado**: Completado. Se utiliza la API de localStorage para cachear datos que cambian poco frecuentemente, con invalidación programada.
  > **Evolución**: Se ha añadido soporte para Service Workers que permiten funcionamiento offline para operaciones básicas.
  >
- ✅ Optimizar consultas a base de datos
  > **Estado**: Completado. Se han revisado y optimizado todas las consultas críticas, implementando índices donde era necesario.
  > **Evolución**: Se ha añadido un sistema de monitoreo que identifica automáticamente consultas lentas para optimización continua.
  >
- ✅ Verificar rendimiento de la aplicación en dispositivos móviles
  > **Estado**: Completado. La aplicación ha sido probada y optimizada para funcionar correctamente en dispositivos móviles, incluyendo tabletas y teléfonos utilizados en campo.
  > **Evolución**: Se ha implementado diseño específico para dispositivos móviles con botones más grandes para uso con guantes.
  >
- ✅ Implementar compresión gzip/brotli para respuestas HTTP
  > **Estado**: Completado. Configurado en el servidor para comprimir automáticamente las respuestas, reduciendo el tiempo de carga.
  > **Evolución**: Se ha optimizado la configuración para balancear entre nivel de compresión y uso de CPU.
  >

### 1.3. Gestión de Errores

- ✅ Implementar páginas de error personalizadas (404, 500)
  > **Estado**: Completado. Se han diseñado páginas de error amigables que mantienen la navegación y ofrecen opciones al usuario.
  > **Evolución**: Las páginas ahora incluyen diagnóstico automático del problema y sugerencias específicas según el tipo de error.
  >
- ✅ Configurar sistema de logging centralizado
  > **Estado**: Completado. Se utiliza una combinación de logs en archivos con rotación y niveles de severidad configurables.
  > **Evolución**: Se ha implementado un dashboard administrativo para visualizar y filtrar logs críticos en tiempo real.
  >
- ✅ Implementar notificaciones de errores críticos
  > **Estado**: Completado. Los errores críticos generan notificaciones por email al administrador del sistema.
  > **Evolución**: Se ha añadido soporte para notificaciones push y un sistema de agregación que evita spam de notificaciones para el mismo problema.
  >
- ✅ Verificar manejo de errores en APIs
  > **Estado**: Completado. Todas las APIs devuelven mensajes de error estructurados con códigos HTTP apropiados y detalles útiles para depuración.
  > **Evolución**: Se ha mejorado el sistema para incluir IDs de correlación que facilitan el seguimiento de errores entre frontend y backend.
  >

### 1.4. Conectividad y Acceso Remoto

- ✅ Habilitar túneles seguros para desarrollo y testing
  > **Estado**: Completado. Implementada solución para uso de LocalTunnel con autenticación manual optimizada.
  > **Comandos**: 
  > - Frontend: `lt --port 3000 --subdomain masclet-imperi-web-frontend-2025 --allow-invalid-cert --local-host 0.0.0.0 --allow-public-access --print-requests`
  > - Backend: `lt --port 8000 --subdomain api-masclet-imperi --allow-invalid-cert --local-host 0.0.0.0 --allow-public-access --print-requests`
  > **Evolución**: Se ha documentado el proceso completo para facilitar el acceso remoto durante pruebas de campo.
  >
- ✅ Resolver problemas de CORS en entornos mixtos
  > **Estado**: Completado. Implementada solución que gestiona correctamente los prefijos de URL en túneles para evitar duplicaciones de `/api/v1`.
  > **Evolución**: Se ha creado un sistema más robusto que detecta automáticamente el entorno y ajusta la configuración CORS según sea necesario.
  >
- ✅ Configurar acceso seguro a APIs desde redes externas
  > **Estado**: Completado. Sistema implementado en `apiService.ts` para manejar diferentes entornos con enrutamiento inteligente.
  > **Evolución**: Se ha añadido un sistema de renovación automática de tokens y reintento de peticiones fallidas por problemas de conectividad.
  >

### 1.5. Traducción e Internacionalización

- ✅ Implementar sistema completo de internacionalización
  > **Estado**: Completado. Se ha implementado un sistema i18n completo con soporte para Español y Catalán.
  > **Evolución**: Se ha mejorado el sistema para detectar automáticamente el idioma del navegador y permitir cambio de idioma sin recargar la página.
  >
- ✅ Garantizar traducción de todos los textos estáticos
  > **Estado**: Completado. Todos los textos de la interfaz están internacionalizados mediante archivos JSON de traducción.
  > **Evolución**: Se ha implementado un sistema de traducción directa que asegura que ningún texto quede sin traducir, incluso si falta la clave correspondiente.
  >
- ✅ Implementar traducción de contenido dinámico
  > **Estado**: Completado. El contenido generado dinámicamente, como mensajes de error o confirmación, utiliza el sistema de traducción.
  > **Evolución**: Se ha añadido soporte para traducción de contenido generado por el backend, asegurando consistencia en todo el sistema.
  >
- ✅ Verificar formato de fechas y números según localización
  > **Estado**: Completado. Las fechas y números se formatean según las convenciones del idioma seleccionado.
  > **Evolución**: Se ha implementado un sistema centralizado de formateo que mantiene la consistencia en toda la aplicación.
  >

## 2. Selección de Plataforma de Hosting

### 2.1. Análisis de Opciones para Backend

| Plataforma             | Ventajas                                         | Desventajas                          | Coste Mensual Aprox. |
|------------------------|--------------------------------------------------|--------------------------------------|----------------------|
| DigitalOcean Droplet   | Control total, flexible, económico para tráfico bajo | Requiere más configuración manual    | 20-40€ (2GB-4GB)     |
| Heroku                 | Fácil despliegue, scaling automático             | Más caro, hibernación en plan gratuito | 25-50€ (básico)      |
| AWS Elastic Beanstalk  | Altamente escalable, parte del ecosistema AWS    | Complejo, puede ser costoso           | 30-100€ (variable)   |
| Google Cloud Run       | Pago por uso, escala a cero, sin servidor        | Posible cold start, configuración más compleja | 15-50€ (variable) |
| Azure App Service      | Buena integración con DevOps, fácil de usar      | Más caro que alternativas, menos flexible | 25-80€ (básico) |
| Render                 | Despliegue sencillo, buena experiencia de desarrollador | Opciones de configuración limitadas  | 15-50€ (básico) |

**Recomendación actualizada para backend**: DigitalOcean Droplet (4GB RAM)
> **Justificación**: Ofrece el mejor equilibrio entre control, rendimiento y coste para nuestra aplicación. Las mejoras recientes en nuestro sistema de backup y monitorización compensan la mayor configuración manual requerida.

### 2.2. Análisis de Opciones para Frontend

| Plataforma        | Ventajas                                     | Desventajas                              | Coste Mensual Aprox. |
|-------------------|----------------------------------------------|------------------------------------------|----------------------|
| Netlify           | CDN global, integración con GitHub, fácil    | Limitaciones en planes gratuitos         | 0-20€ (básico)       |
| Vercel            | Optimizado para Next.js/React, previews por PR | Algunos límites en builds/bandwith       | 0-20€ (hobby)        |
| GitHub Pages      | Gratuito, integración con GitHub Actions     | Funcionalidades limitadas                | 0€ (opensource)      |
| Cloudflare Pages  | Red global, protección DDoS incluida         | Menos características que alternativas   | 0-20€ (básico)       |
| Firebase Hosting  | CDN global, fácil despliegue                 | Atado al ecosistema Google              | 0-15€ (básico)       |

**Recomendación actualizada para frontend**: Netlify
> **Justificación**: Ofrece excelente rendimiento global con CDN integrada, despliegue continuo desde GitHub, y certificados SSL automáticos. Las mejoras en nuestro proceso de build hacen que sea compatible con las limitaciones de tiempo de build de Netlify.

### 2.3. Selección Final y Justificación

Basado en el análisis actualizado, la configuración óptima para el despliegue de Masclet Imperi Web es:

* **Backend**: DigitalOcean Droplet (4GB RAM, 2vCPUs)
  * Ubuntu 22.04 LTS
  * Nginx como proxy inverso y servidor web
  * PostgreSQL 14 en el mismo servidor (o como servicio gestionado)
  * Configuración de firewall y backups automáticos

* **Frontend**: Netlify
  * Conectado al repositorio de GitHub
  * Dominio personalizado con SSL
  * Configuración de redireccionamiento para SPA

**Ventajas de esta configuración**:
* Coste optimizado (aproximadamente 40-60€/mes total)
* Buena separación de responsabilidades (frontend/backend)
* Escalabilidad adecuada para las necesidades actuales
* Facilidad de mantenimiento y actualizaciones
* Buen rendimiento global para usuarios en diferentes ubicaciones

## 3. Proceso de Despliegue

### 3.1. Entorno de Producción

**Configuración de servidor backend**:

1. Aprovisionar DigitalOcean Droplet (Ubuntu 22.04, 4GB RAM)
2. Configuración básica de seguridad:
   ```bash
   # Actualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Configurar firewall
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   
   # Instalar fail2ban
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

3. Instalar dependencias:
   ```bash
   # Python, PostgreSQL, Nginx
   sudo apt install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx certbot python3-certbot-nginx git
   ```

4. Configurar PostgreSQL:
   ```bash
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb masclet_imperi
   ```

5. Configurar Nginx:
   ```bash
   # Crear configuración para el sitio
   sudo nano /etc/nginx/sites-available/masclet-imperi-api
   
   # Habilitar el sitio
   sudo ln -s /etc/nginx/sites-available/masclet-imperi-api /etc/nginx/sites-enabled/
   
   # Probar configuración
   sudo nginx -t
   
   # Reiniciar Nginx
   sudo systemctl restart nginx
   ```

6. Configurar SSL con Certbot:
   ```bash
   sudo certbot --nginx -d api.masclet-imperi.com
   ```

**Despliegue del backend**:

1. Clonar repositorio:
   ```bash
   git clone https://github.com/pablis77/masclet-imperi-web.git /var/www/masclet-imperi
   cd /var/www/masclet-imperi
   ```

2. Configurar entorno virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   ```

3. Configurar variables de entorno:
   ```bash
   # Generar archivo .env de producción
   python backend/scripts/generate_secure_keys.py --prod
   ```

4. Configurar servicio systemd:
   ```bash
   sudo nano /etc/systemd/system/masclet-imperi.service
   
   # Contenido:
   [Unit]
   Description=Masclet Imperi Backend
   After=network.target postgresql.service
   
   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/masclet-imperi
   Environment="PATH=/var/www/masclet-imperi/venv/bin"
   ExecStart=/var/www/masclet-imperi/venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   
   [Install]
   WantedBy=multi-user.target
   ```

5. Iniciar servicio:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start masclet-imperi
   sudo systemctl enable masclet-imperi
   ```

**Despliegue del frontend**:

1. Configurar Netlify a través de su panel de control:
   - Conectar con el repositorio GitHub
   - Configurar comando de build: `cd frontend && npm install && npm run build`
   - Directorio de publicación: `frontend/dist`
   - Variables de entorno: `VITE_API_URL=https://api.masclet-imperi.com/api/v1`

2. Configurar dominio personalizado:
   - Añadir dominio `masclet-imperi.com` en Netlify
   - Configurar registros DNS según instrucciones
   - Habilitar SSL automático

3. Configurar reglas de redirección:
   - Crear archivo `_redirects` en `frontend/public`:
     ```
     /* /index.html 200
     ```

### 3.2. Configuración de CI/CD

**GitHub Actions para testing automático**:

Configurar workflow en `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r backend/requirements.txt
        pip install -r backend/requirements-dev.txt
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        SECRET_KEY: test_secret_key
      run: |
        cd backend
        pytest
```

**Despliegue automático**:

Configurar workflow en `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      
    # Backend deployment via SSH
    - name: Deploy Backend
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/masclet-imperi
          git pull
          source venv/bin/activate
          pip install -r backend/requirements.txt
          python backend/scripts/secure_production.py
          sudo systemctl restart masclet-imperi
```

### 3.3. Estrategia de Versionado

- Seguir SemVer (Semantic Versioning) para todas las versiones:
  - **MAJOR.MINOR.PATCH** (ejemplo: 1.1.0)
  - MAJOR: cambios incompatibles con versiones anteriores
  - MINOR: nuevas funcionalidades compatibles
  - PATCH: correcciones de errores compatibles

- Proceso de release:
  1. Crear tag en Git cuando se prepara una versión para producción
  2. Documentar cambios en CHANGELOG.md
  3. Realizar pruebas completas antes de desplegar
  4. Despliegue automático a partir de tags con formato v*

## 4. Pruebas Pre-Despliegue

### 4.1. Plan de Pruebas

**Pruebas automatizadas**:
- Ejecutar suite completa de tests unitarios
- Ejecutar tests de integración para flujos críticos
- Verificar funcionamiento con datos reales

**Pruebas manuales críticas**:
1. Flujo de autenticación (login, logout, renovación de token)
2. CRUD completo de animales y partos
3. Importación de datos CSV
4. Dashboard con estadísticas correctas
5. Funcionalidad de backup y restauración
6. Cambio de idioma y visualización correcta

**Pruebas de dispositivos**:
- Verificar funcionamiento en tabletas usadas en campo
- Probar en diferentes navegadores (Chrome, Firefox, Safari)
- Verificar funcionamiento offline/con conexión intermitente

### 4.2. Verificación de Seguridad

**Lista de verificación de seguridad**:
- [ ] Verificar que no hay credenciales en código fuente
- [ ] Comprobar protección contra inyección SQL
- [ ] Verificar validación de entradas en todos los formularios
- [ ] Comprobar que las cookies de sesión son seguras (httpOnly, secure)
- [ ] Verificar que no hay información sensible en logs
- [ ] Comprobar que los backups están cifrados
- [ ] Verificar que las contraseñas se almacenan con hash+salt
- [ ] Comprobar que todas las conexiones utilizan HTTPS

**Herramientas de verificación**:
- OWASP ZAP para análisis automático de vulnerabilidades
- SSL Labs para verificar configuración de SSL/TLS
- Mozilla Observatory para headers de seguridad

## 5. Mantenimiento Post-Despliegue

### 5.1. Monitoreo

**Monitoreo técnico**:
- Uptime y disponibilidad del servidor
- Uso de CPU, memoria y disco
- Tiempo de respuesta de APIs
- Errores y excepciones

**Monitoreo de negocio**:
- Número de usuarios activos
- Operaciones realizadas por día
- Cantidad de datos gestionados
- Uso de funcionalidades críticas

**Herramientas de monitoreo**:
- Prometheus + Grafana para métricas técnicas
- Panel administrativo personalizado para métricas de negocio
- Alertas por email/SMS para problemas críticos

### 5.2. Respaldo y Recuperación

**Estrategia de backup**:
- Backups diarios automáticos de la base de datos
- Backups completos semanales del sistema
- Retención de 7 backups diarios y 4 backups semanales
- Backups automáticos antes de operaciones críticas
- Verificación automática de integridad de backups

**Procedimiento de recuperación**:
1. Detener el servicio: `sudo systemctl stop masclet-imperi`
2. Restaurar base de datos: `python backend/scripts/restore_database.py --latest`
3. Verificar integridad: `python backend/scripts/verify_db_integrity.py`
4. Reiniciar servicio: `sudo systemctl start masclet-imperi`

### 5.3. Actualizaciones

**Proceso de actualización**:
1. Realizar backup completo antes de actualizar
2. Desplegar primero en entorno de staging
3. Ejecutar tests automatizados
4. Realizar pruebas manuales críticas
5. Programar ventana de mantenimiento si es necesario
6. Desplegar en producción
7. Verificar funcionamiento post-despliegue

**Comunicación de actualizaciones**:
- Notificar a usuarios con antelación sobre actualizaciones planificadas
- Documentar cambios en lenguaje no técnico
- Proporcionar instrucciones para nuevas funcionalidades

## 6. Plan de Contingencia

### 6.1. Procedimiento de Rollback

**Condiciones para rollback**:
- Errores críticos que impiden la operación normal
- Problemas de seguridad graves
- Degradación significativa del rendimiento

**Procedimiento de rollback**:
1. Activar versión anterior del código:
   ```bash
   cd /var/www/masclet-imperi
   git checkout v1.0.0  # o tag anterior estable
   ```
2. Restaurar base de datos al estado anterior:
   ```bash
   python backend/scripts/restore_database.py --pre-update
   ```
3. Reiniciar servicios:
   ```bash
   sudo systemctl restart masclet-imperi
   ```
4. Verificar funcionamiento después del rollback

### 6.2. Gestión de Incidentes

**Clasificación de incidentes**:
- P1: Sistema caído o inaccesible
- P2: Funcionalidad crítica no disponible
- P3: Degradación de rendimiento o funcionalidad no crítica
- P4: Problemas menores, errores visuales

**Proceso de respuesta a incidentes**:
1. Detección y clasificación
2. Comunicación inicial a stakeholders
3. Investigación y diagnóstico
4. Implementación de solución
5. Verificación y cierre
6. Análisis post-incidente y mejoras

**Contactos de emergencia**:
- Administrador de sistemas: [Contacto]
- Desarrollador principal: [Contacto]
- Administrador de base de datos: [Contacto]

---

## Conclusión

Este plan de despliegue actualizado refleja el estado actual del proyecto Masclet Imperi Web 1.1.0 y establece los procedimientos necesarios para un despliegue exitoso en producción. Las mejoras implementadas en seguridad, rendimiento, internacionalización y gestión de errores han fortalecido significativamente la aplicación.

El plan será revisado y actualizado regularmente para reflejar cambios en la arquitectura o requisitos del sistema.
