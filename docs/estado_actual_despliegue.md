# Estado Actual del Despliegue Masclet Imperi Web

Fecha de revisión: 5 junio 2025 (actualizado)

tenemos claramente separado el DOCKER de local del DOCKER de AWS??? tengo dudas de cuando habals de docker de AWS sea realemtren DOCKER... es DOCKER o AWS EC2 u otra tipo de ehrramiensta de AWS???
respuesta WINDSURF: Sí, son entornos totalmente separados. En el entorno local usamos Docker Desktop en Windows para ejecutar el contenedor PostgreSQL, mientras que en AWS usamos Docker dentro de una instancia EC2 (máquina virtual de AWS). La instancia EC2 es el servidor Linux que aloja todos los contenedores Docker de producción. Por tanto, son sistemas Docker independientes que no se comunican entre sí - uno funciona en tu PC local y otro en la nube de AWS.

## 1. Entorno Local (Desarrollo)

### 1.1 Componentes Activos

- **Frontend:** [http://localhost:3000](http://localhost:3000)

  - Astro.js en puerto 3000 (ejecutado con `npm run dev -- --host`)
  - Muestra correctamente la interfaz con soporte de i18n
- **Backend:** [http://localhost:8000](http://localhost:8000)

  pregunta: esto es local??? en docker desktop tengo dos imagenes una de la API y otra apra el POSTGRES 17... comoe sta trbajando en lcoal la aplicacion con esto??
  respuesta WINDSURF: En el entorno de desarrollo local tienes una configuración híbrida: el backend (FastAPI) y el frontend (Astro) están ejecutándose directamente en tu PC (fuera de Docker), mientras que solamente la base de datos PostgreSQL está en un contenedor Docker (`masclet-db-new`). Las imágenes que ves en Docker Desktop son: una para PostgreSQL (que estás usando activamente) y otra para la API (que probablemente es una imagen de respaldo o para pruebas, pero no la estás usando ahora ya que ejecutas el backend directamente con Python).

  - FastAPI en puerto 8000 (ejecutado con `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`)
  - Endpoints API accesibles en `/api/v1/...`
  - Endpoints dashboard funcionando correctamente
- **Base de datos:** PostgreSQL

  - Contenedor Docker `masclet-db-new`
  - Puerto expuesto: 5433 (mapeado a 5432 interno)
  - Nombre de BD: `masclet_imperi`
  - Credenciales: postgres/1234
  - Datos de prueba disponibles

### 1.2 Configuración

- Archivos `.env` localizados en:
  - `C:\Proyectos\claude\masclet-imperi-web\backend\.env`
  - `C:\Proyectos\claude\masclet-imperi-web\.env`
  - C:\Proyectos\claude\masclet-imperi-web\frontend\\.env
  - `C:\Proyectos\claude\masclet-imperi-web\backend\docker\.env`
- URL de conexión: `postgres://postgres:1234@localhost:5433/masclet_imperi`

### 1.3 Comandos Importantes

- Iniciar backend: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`
- Iniciar frontend: `npm run dev -- --host`
- Iniciar contenedor PostgreSQL: `docker start masclet-db-new`

### 1.4 Comentarios y Preguntas sobre Entorno Local

**Pregunta 1:**

**Respuesta:**

**Pregunta 2:**

**Respuesta:**

## 2. Entorno AWS (Producción) - ACTUALIZADO 05/06/2025

### 2.1 Componentes Desplegados

- **Servidor EC2**

  - IP pública: 108.129.139.119  -> (en este momento no tenemos acceso!!!)
  - Acceso SSH: `ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119`
- **Contenedores Docker**

  son DOCKER pero estan en EC2???
  respuestra Windsurf: Sí, los contenedores Docker están ejecutándose dentro de la instancia EC2. El servidor EC2 es la máquina virtual en la nube de AWS donde hemos instalado Docker Engine. Todos los contenedores (frontend, backend, base de datos) se ejecutan dentro de esta instancia, compartiendo sus recursos (CPU, memoria, disco). Esto es una práctica estándar: usar una VM en la nube para alojar los contenedores Docker.

  masclet-frontend y masclet-frontend-node hay alguna manera de que se desplieguen como uno solo en AWS??? para que el despliegue sea mas homogeneo y ams facil??? si la respuesta es positiva habria que analizar si es que son mas caras o tienen otros pros y otros contras
  respeusta Windsurf: Sí, podemos unificar estos dos servicios en un solo contenedor. Actualmente tenemos esta separación porque seguimos una arquitectura de "proxy inverso" donde Nginx (masclet-frontend) sirve los activos estáticos y redirecciona las peticiones dinámicas al servidor Node (masclet-frontend-node).
  NUEVA pregunta: posibles costes si hay algun coste añadido de cambair el enfoque?? no hay ninguna otra alternativa adicional?????
  respuesta WINDSURF: No habría costes adicionales en AWS por unificar los contenedores - de hecho, podría reducir ligeramente los costes al optimizar el uso de recursos. Otra alternativa sería mantener la arquitectura actual pero implementar una capa de orquestación con Docker Compose o Kubernetes para simplificar la gestión. También existe la opción de usar servicios gestionados de AWS como Elastic Beanstalk (más simple) o ECS/EKS (más complejo pero potente), que podrían gestionar la infraestructura por nosotros, aunque esto implicaría una curva de aprendizaje y posiblemente costes adicionales.

  Pros de unificación:

  - Simplifica el despliegue y la gestión
  - Reduce el número de contenedores a mantener
  - Facilita la depuración de errores

  Contras:

  - Menos modular (si un componente falla, todo el frontend falla)
  - Potencialmente menos escalable (no podemos escalar independientemente)
  - La configuración podría ser más compleja al inicio

  Una alternativa sería mantener los contenedores separados pero mejorar el proceso de despliegue con Docker Compose, lo que nos permitiría gestionar ambos servicios con un solo comando.
  COMENTARIO USUARIO: hacemos un par de intentos serios de despliegue asi (separados los contenedores) y sino analizamos la alternativa de unirlos. Entiendo de tu respuesta que en principio prefieres seguir con este planteamiento
  respuesta WINDSURF: Sí, estoy de acuerdo con tu enfoque pragmático. Es mejor mantener la arquitectura actual en estos primeros intentos de despliegue, ya que cambiarla ahora introduciría nuevas variables y complejidades. Si después de 2-3 intentos seguimos enfrentando problemas consistentes, entonces tendría sentido evaluar la unificación de contenedores como parte de un refactoring más amplio. La arquitectura actual es más modular y estándar, por lo que debería ser viable con la configuración correcta.

  - `masclet-frontend` (Nginx): Puerto 80
  - `masclet-frontend-node` (Node.js/Astro SSR): Puerto 10000
  - `masclet-api` (FastAPI): Puerto 8000
  - `masclet-db` (PostgreSQL)
  - Red Docker: `masclet-network`

### 2.2 Problemas Actuales

- **Error de proxy en Nginx**: Cuando el frontend solicita `/api/auth/login`, Nginx añade incorrectamente otro prefijo resultando en `/api/api/v1/auth/login`
- CADA VEZ QUE CREAS UN SCRIPT me dejas el anterior que te ha salido mal, pq salen mal y los abandonas al primer error, ME TIENES HASTA LA POLLA!!!!!!!!!!!!!!!!!!
- olvidas conexto rapidismo y no peude ser, NO PEUDE SER!!!!!!!!!!!!!!!!!!!!!
- Hemos desarrollado scripts de diagnóstico pero aún no hemos aplicado la corrección final
- ahora mismo no se tiene acceso a 108.129.139.119 (YA ESTA ARREGLADO 02/06/2025 17:32)
- la ultima vez que pudimos acceder al frontend desde el navegador:
  - DASHBOARD: no se cargaban ningunos datos
  - explotaciones: no se cargaban ningunos datos
  - animales: no se cargaban ningunos datos
  - Usuarios: no se puede acceder a esta seccion, cuando lo intentabas salia directamente a la pantalla de login pero desde la pantalla de login no se puede ya logear con admin/admin123
  - Importaciones: no se puede acceder a esta seccion, cuando lo intentabas salia directamente a la pantalla de login pero desde la pantalla de login no se puede ya logear con admin/admin123
  - Copias de Seguridad: no se puede acceder a esta seccion, cuando lo intentabas salia directamente a la pantalla de login pero desde la pantalla de login no se puede ya logear con admin/admin123
  - Listados: no se puede acceder a esta seccion, cuando lo intentabas salia directamente a la pantalla de login pero desde la pantalla de login no se puede ya logear con admin/admin123
  - configuracion: se entraba en la ventana y se veia bien...
  - Mi perfil: no acceso
  - LOGIN: no hay ninguna accion cuando se logea...

### 2.3 Scripts de Diagnóstico Implementados

- `diagnostico_nginx.py`: Prueba diferentes rutas y analiza respuestas
- `verificar_login_produccion.py`: Enfocado en pruebas de autenticación
- `comprobar_despliegue.py`: Verificación integral del sistema
- `verificar_contenedores.ps1`: Comprueba el estado de los contenedores Docker

### 2.4 Sistema de Backups en AWS

- Backups diarios automáticos a las 2:00 AM
- Backups automáticos al crear/editar animales
- Backups automáticos después de cada importación
- Política de retención: 7 backups diarios + 7 backups semanales +infinitos manuales (hasta un maximo de sumatorio de todos de 30 backups... te parece??? o son muchos, pesan tan poco (110KB))
  **Respuesta WINDSURF:** Dado que los backups son tan pequeños (110KB), la política de 30 backups totales es perfectamente razonable. Incluso podríamos ampliarla a 50-60 sin problema de espacio. Para contexto, 30 backups ocuparían apenas 3.3 MB. Recomiendo mantener más backups manuales (hasta 15-20) ya que son los que se crean en momentos críticos por decisión humana, y son más valiosos que los automáticos en caso de necesitar restaurar.

### 2.5 Endpoints de gestión de backups

- `/api/v1/scheduled-backup/history` - Ver historial de backups
- `/api/v1/scheduled-backup/trigger/daily` - Ejecutar backup diario manualmente
- `/api/v1/scheduled-backup/configure` - Configurar política de retención
- `/api/v1/scheduled-backup/cleanup` - Limpiar backups antiguos

### 2.6 Comentarios y Preguntas sobre Entorno AWS

**Pregunta 1:existen los endpoints de gestion de backups???**

**Respuesta WINDSURF:** Actualmente estos endpoints están parcialmente implementados en el backend. Funcionan en local pero aún no se han probado completamente en AWS. Los endpoints para ver el historial y ejecutar un backup manual ya están codificados, pero los de configuración de política de retención y limpieza automática necesitan completarse. Estimo que necesitamos dedicar aproximadamente 3-4 horas para completar su implementación y pruebas en AWS.

**Pregunta 2:**

**Respuesta:**

## 3. Plan de Pruebas y Acciones (TODAS LAS PRUEBAS YA SON EN AWS, lo local nos sirve para respaldar lo que estamos confirmando en el despliegue y para confirmar lo que queremos ver en neustro frontend desplegado

### 3.1 Pruebas Backend AWS

- Verificar todos los endpoints principales:
  - Login/autenticación: `/api/v1/auth/login`
- - Dashboard: `/api/v1/dashboard/stats`,
  - Explotaciones: `/api/v1/dashboard/explotacions/   (los endpoints de explotaciones propios estan anulados solo van estos que estan en el area de dashbaord!!!!)`
  - Animales: `/api/v1/animals/`
  - Partos: `/api/v1/partos/`
  - Imports:
  - backups:
  - listados:
  - users:

Ver los endpoints activos:

```bash
python new_tests\complementos\list_endpoints.py -v
```

Mostrar estructura de la base de datos:

```bash
python new_tests\complementos\show_db_structure.py -v
```

### 3.2 Pruebas Frontend-Backend AWS

- Verificar flujo completo de login
- Comprobar carga de dashboard
- Verificar listado y creación de animales
- Comprobar integración con partos

### 3.3 Verificación Conexión AWS

- Probar conexión SSH al servidor AWS:

  ```bash
  ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@108.129.139.119
  ```
- Verificar estado de los contenedores con `docker ps`
- Comprobar logs de Nginx para identificar problemas de proxy:

  ```bash
  docker logs masclet-frontend
  ```

### 3.4 Plan de Corrección AWS

1. **Actualizar configuración Nginx**:

   - Modificar la configuración dentro del contenedor para corregir el problema de proxy
   - Asegurar que las rutas `/api/` se redirijan correctamente sin duplicar prefijos
2. **Aplicar correcciones**:

   - Reiniciar contenedor Nginx sin afectar otros servicios
   - Verificar que la configuración nueva se aplica correctamente
3. **Verificaciones finales**:

   - Comprobar que el frontend puede acceder correctamente a los endpoints del backend
   - Asegurar que la autenticación funciona correctamente
   - Verificar que los datos se muestran adecuadamente en el dashboard
4. si falla este primer plan:

   1. repasar estado de todos los contenedores de AWS
   2. ~~desmotnar los contenendores de frontend~~ ✅ COMPLETADO - No es necesario tocar el frontend por ahora
   3. ~~pruebas exhaustivas y reales de la base de datos de AWS~~ ✅ COMPLETADO - Base de datos verificada con éxito
   4. ~~pruebas exhaustivas y reales de la API de AWS~~ ✅ COMPLETADO - API verificada y funcionando correctamente
   5. ~~analisis de estrategia de despliegue~~ ✅ COMPLETADO - Procedimiento documentado y probado
   6. análisis de todos los errores anteriores en despliegue y repaso de carpeta de frontend en local y en github ⚠️ PENDIENTE
   7. decisión sobre el origen del despliegue (local vs. GitHub) ⚠️ PENDIENTE
   8. revisar `deploy.ps1` como archivo de referencia para el despliegue ⚠️ PENDIENTE
   9. desplegar frontend cuando backend esté estable ⚠️ PENDIENTE

**COMENTARIO WINDSURF SOBRE PLAN DE CORRECCIÓN:** El plan es muy completo y sigue una metodología sistemática que me parece adecuada. Me gusta especialmente que hayas incluido el punto 4 con los pasos alternativos si falla el plan inicial, esto demuestra previsión. Sugiero algunas mejoras:

1. Añadir puntos de control (checkpoints) después de cada paso importante para documentar qué funciona y qué no
2. Crear una carpeta `/docs/despliegue/intentos/` donde guardar un archivo de registro por cada intento con fecha, acciones realizadas y resultados
3. Para la primera verificación, considerar usar herramientas como `curl` o scripts de Python que verifiquen la comunicación entre servicios sin depender del frontend completo
4. Recomiendo poner GitHub en público sólo durante el tiempo necesario para el despliegue, y volver a privado inmediatamente después
5. Considerar añadir control de versiones a `deploy.ps1` con un sistema de numeración (v1, v2, etc.) para cada modificación

### 3.5 Comentarios y Preguntas sobre el Plan de Pruebas

**Pregunta 1:**

**Respuesta:**

**Pregunta 2:**

**Respuesta:**

## 4. Plan a medio plazo

1. **Monitorización continua**:

   - Asegurar que los contenedores permanecen funcionando
   - Implementar sistema de alertas para caídas de servicio
2. **Backups automatizados**:

   - Implementar respaldos regulares de la base de datos
   - Verificar la correcta ejecución de los backups
3. **Corrección del frontend**:

   - Modificar `apiConfig.ts` para evitar duplicación del prefijo `/api/`
   - Asegurar que todas las rutas siguen un formato consistente
4. **Pruebas de carga**:

   - Verificar rendimiento en producción con datos reales
   - Identificar posibles cuellos de botella
5. **Documentación de despliegue**:

   - Completar documentación técnica para futuros despliegues
   - Crear manuales de mantenimiento y resolución de problemas

### 4.1 Comentarios y Preguntas sobre el Plan a medio plazo

**Pregunta 1:**

**Respuesta:**

## 5. Estado actual del despliegue backend (02/06/2025)

### 5.1. Resultados de la verificación

Hemos realizado pruebas exhaustivas del backend y base de datos desplegados en AWS, con los siguientes resultados:

1. ✅ **Backend API**: Funcionando correctamente en [http://108.129.139.119:8000/](http://108.129.139.119:8000/)
   - Swagger UI accesible en [http://108.129.139.119:8000/docs](http://108.129.139.119:8000/docs)
   - Autenticación funcionando correctamente (admin/admin123)
   - Endpoints críticos funcionando correctamente:
     - Dashboard stats: `/api/v1/dashboard/stats`
     - Explotaciones: `/api/v1/dashboard/explotacions`
     - Animales: `/api/v1/animals`

2. ✅ **Base de datos**: Funcionando correctamente
   - 85 animales en la base de datos
   - 5 machos, 80 hembras
   - 5 explotaciones registradas
   - Distribución de amamantamiento: 41 (0), 38 (1), 1 (2)

3. ✅ **Configuración**: Correcta
   - El hostname de la base de datos está correctamente configurado como `db`
   - Los contenedores se nombran correctamente: `masclet-api` y `masclet-db`
   - Las variables de entorno están correctamente configuradas

### 5.2. Script de verificación

Hemos creado un script para verificar el estado del backend: `new_tests/complementos/verificar_backend_aws.py`

Este script comprueba:

- Disponibilidad de Swagger UI
- Autenticación correcta
- Funcionamiento de endpoints críticos

#### 5.2.1 Resultados de la ejecución (02/06/2025)

La ejecución del script ha confirmado que todo funciona correctamente:

```text
================================================================================
                 VERIFICACIÓN DEL BACKEND MASCLET IMPERI EN AWS
================================================================================
URL Base: http://108.129.139.119:8000
Fecha y hora: 02/06/2025 16:58:19
================================================================================

[✓] Servidor responde correctamente
[✓] ¡Login exitoso! Token obtenido correctamente
[✓] Documentación Swagger accesible
[✓] Estadísticas Dashboard funcionando
[✓] Endpoint de Explotaciones: 5 explotaciones encontradas
[✓] Endpoint de Animales: 85 animales en la base de datos

================================================================================
RESUMEN DE VERIFICACIÓN
================================================================================

✓ Endpoints verificados con éxito: 4/4
✓ VERIFICACIÓN EXITOSA: El backend está funcionando correctamente
```

El script mostró los siguientes datos importantes:

- **Explotaciones:** El Grau, Gurans, Madrid, Guadalajara, LA CASANOVA
- **Animales:** 85 en total (5 machos, 80 hembras)
- **Estados de amamantamiento:** 41 (0), 38 (1), 1 (2)

### 5.3. Proceso de despliegue correcto

El proceso de despliegue correcto es:

1. Conectarse al servidor AWS mediante SSH
2. Ejecutar el script `desplegar_backend_aws.py`
3. Verificar el funcionamiento con `verificar_backend_aws.py`

### 5.4. Problemas conocidos y soluciones

1. **Error de conexión a base de datos**:
   - **Problema**: Contenedor API usa nombre incorrecto para conectarse a la base de datos
   - **Solución**: Configurar `DATABASE_URL` con `db` como hostname, no `masclet-db`

2. **Formato de autenticación**:
   - **Formato correcto**: `Content-Type: application/x-www-form-urlencoded` con parámetros:
     - `username: admin`
     - `password: admin123`
     - `grant_type: password`

### 5.5. Próximos pasos

1. **Continuar con el despliegue del frontend**:
   - Revisar configuración del frontend para apuntar al backend AWS
   - Actualizar VITE_API_URL en `.env` para usar la IP de AWS
   - Modificar configuración de proxy si es necesario

2. **Preparar documentación para despliegue en servidor final**:
   - Consolidar todos los scripts y pasos en un único documento
   - Crear una lista de verificación para cada despliegue
   - Documentar procedimiento de backup y restauración

3. **Pruebas de integración**:
   - Probar conexión frontend-backend con usuarios reales
   - Verificar funcionamiento completo de la aplicación
   - Documentar cualquier problema encontrado

### 5.6. Comentarios y Preguntas adicionales

**Pregunta 1:**

**Respuesta:**

**Pregunta 2:**

**Respuesta:**

## 6. Comandos útiles para gestión y diagnóstico

### 6.1 Ver endpoints activos

```bash
python new_tests\complementos\list_endpoints.py -v
```

## 7. Diagnóstico y Solución de Problemas con la Base de Datos

### 7.1 Problema identificado (2 junio 2025)

Analizando los logs del contenedor API, se ha identificado un problema crítico que impide el correcto funcionamiento del backend:

```
socket.gaierror: [Errno -2] Name or service not known
```

Este error indica que el contenedor API no puede resolver el nombre del host de la base de datos. Específicamente:

1. El contenedor API intenta conectarse a `masclet-db` (según configuración en `.env`).
2. Sin embargo, en `docker-compose.yml`, el servicio se define como `db` y se le asigna el nombre de contenedor `masclet-db`.
3. El problema es que la variable de entorno en el contenedor API usa la configuración de `.env` directamente en lugar de utilizar las variables que están en el docker-compose.

### 7.2 Solución implementada

Se ha creado un script especializado para desplegar correctamente el backend y la base de datos, asegurando la consistencia entre la configuración:

```bash
python new_tests\complementos\desplegar_backend_aws.py
```

Este script realiza las siguientes acciones:

1. Detiene y elimina los contenedores existentes para evitar conflictos
2. Crea un archivo `.env` con la configuración correcta (usando `db` como nombre de host)
3. Despliega los contenedores de base de datos y API asegurando la conectividad
4. Verifica que el backend esté funcionando correctamente

### 7.3 Recomendaciones de configuración

Para evitar problemas similares en el futuro, es importante:

1. Mantener consistencia entre los nombres en `docker-compose.yml` y `.env`
2. Usar los nombres de servicio (ej. `db`) para referencias entre contenedores
3. Documentar claramente la arquitectura de red de los contenedores
4. Usar el script `desplegar_backend_aws.py` para futuros despliegues del backend

### 6.2 Mostrar estructura de la base de datos

```bash
python new_tests\complementos\show_db_structure.py -v
```

### 6.3 Resetear la base de datos (¡Usar con precaución!)

```bash
python new_tests\complementos\reset_database.py
```

### 6.4 Gestión de backups

```bash
python new_tests\complementos\backup_database.py


verificar contenedores:
.\new_tests\complementos\verificar_contenedores.ps1 -EC2_IP "108.129.139.119" -PEM_PATH "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem"


comprobar despliegue ARCHIVO PRINCIPAL DE COMPROBACION
python .\new_tests\complementos\comprobar_despliegue.py -u http://108.129.139.119 -v

Los backups se almacenan en `backend/backups/` y se eliminan automáticamente los que tienen más de 7 días de antigüedad.

## 7. Mejoras de acceso remoto a medio plazo

Para solucionar el problema de IP dinámica al acceder por SSH, se proponen las siguientes opciones con sus costes aproximados:

### 7.1 AWS Systems Manager Session Manager

- **Coste**: Sin costo adicional para EC2. Solo pagamos por los recursos de EC2 que ya estamos utilizando.
- **Beneficios**:
  - No requiere abrir el puerto 22
  - Acceso a través de la consola AWS sin necesidad de gestionar IPs
  - Registro detallado de sesiones para auditoría
  - Integración nativa con IAM para control de permisos
- **Implementación**: ~2-3 horas de trabajo (instalar SSM Agent, configurar permisos IAM)

### 7.2 Servidor Bastion con IP Elástica

- **Coste**:
  - Instancia EC2 t3.micro: ~$8-10/mes
  - IP Elástica (si se usa con la instancia EC2): Gratis
  - IP Elástica (si no está asociada): ~$3-4/mes
- **Beneficios**:
  - Punto de entrada único y seguro a la infraestructura
  - Control centralizado de acceso SSH
  - Posibilidad de implementar autenticación de dos factores
- **Implementación**: ~3-4 horas (configurar instancia, hardening de seguridad, configuración de acceso)

### 7.3 Script de actualización automática de IP

- **Coste**: Sin coste adicional de infraestructura
- **Funcionamiento**: Script local que detecta cambios en IP pública y actualiza las reglas de seguridad AWS
- **Beneficios**:
  - Solución de bajo coste
  - No requiere cambios en arquitectura
- **Desventajas**:
  - Menos seguro que las otras opciones
  - Requiere ejecución manual o configuración de tareas programadas
- **Implementación**: ~2 horas (desarrollo de script y pruebas)
