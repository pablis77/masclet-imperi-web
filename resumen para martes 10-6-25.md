# Resumen de Estado: Dockerized OAuth2 Login Flow

## Estado actual del problema (9/junio/2025)

### 🔍 Diagnóstico general

Tras varias pruebas y modificaciones, hemos identificado los siguientes problemas en el flujo de autenticación OAuth2 del frontend Dockerizado:

1. **Problema con la ruta `/api/auth-proxy`**: 
   - La ruta devuelve error 404 aunque el archivo existe en el contenedor
   - Posible problema de configuración de rutas en Astro SSR

2. **Configuración incorrecta del API endpoint**:
   - El servicio `apiService` sigue intentando conectarse a `https://masclet-imperi-web-backend.onrender.com`
   - Debería apuntar a `http://masclet-api:8000` dentro del contenedor Docker

3. **Problema con la imagen del modal de error**:
   - El sistema busca la imagen en `/images/perro_ramon.jpg` pero da 404
   - La imagen correcta debería ser `/images/no_password.png`

### 📁 Mapa de archivos implicados

| Componente | Ubicación en contenedor | Problema |
|------------|-------------------------|----------|
| **Login** | `/app/server/pages/login.astro.mjs` | Llama a `/api/auth-proxy` que no funciona |
| **Auth-proxy** | `/app/server/pages/api/auth-proxy.astro.mjs` | Existe pero no responde a peticiones |
| **apiService** | Posiblemente en `/app/server/chunks/apiService.CS3_UAep.js` | Apunta a Render incorrectamente |
| **Imagen perro** | Debería estar en `/app/public/images/no_password.png` o `/images/perro_ramon.jpg` | No se encuentra |

### 🚨 Errores específicos observados

1. **Error de auth-proxy**:
   ```
   POST http://34.253.203.194/api/auth-proxy 404 (Not Found)
   ```

2. **Error de redirección a Render**:
   ```
   apiService.CS3_UAep.js:17 [PROD] URL final: https://masclet-imperi-web-backend.onrender.com/auth/login
   ```

3. **Error CORS por redirección incorrecta**:
   ```
   Access to XMLHttpRequest at 'https://masclet-imperi-web-backend.onrender.com/auth/login' from origin 'http://34.253.203.194' has been blocked by CORS policy
   ```

4. **Error de imagen no encontrada**:
   ```
   GET http://34.253.203.194/images/perro_ramon.jpg 404 (Not Found)
   ```

## 🔧 Plan de acción para mañana (10/junio/2025)

### 1️⃣ Exploración y diagnóstico

1. **Examinar estructura completa del contenedor**:
   ```bash
   ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker exec masclet-frontend-node find /app -type f -name '*.mjs' | sort"
   ```

2. **Verificar estructura de carpetas de imágenes**:
   ```bash
   ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker exec masclet-frontend-node find /app -path '*/images*' -type d"
   ```

3. **Examinar configuración de Astro SSR**:
   ```bash
   ssh -i "C:\Proyectos\primeros proyectos\AWS\masclet-imperi-key.pem" ec2-user@34.253.203.194 "docker exec masclet-frontend-node cat /app/entry.mjs"
   ```

### 2️⃣ Soluciones propuestas

1. **Corregir la configuración de API**:
   - Localizar el archivo apiService.CS3_UAep.js en el contenedor
   - Modificarlo para que apunte siempre a `http://masclet-api:8000`
   - O crear/modificar archivo `.env.production` con la URL correcta

2. **Corregir ruta de auth-proxy**:
   - Verificar si el problema está en la configuración de rutas de Astro
   - Considerar diferentes ubicaciones para el auth-proxy
   - Probar un enfoque de llamada directa al backend sin proxy

3. **Solucionar imagen del perro**:
   - Subir la imagen correcta (`no_password.png`) a la ubicación correcta
   - Actualizar el código para referenciar la imagen correcta

### 3️⃣ Plan de implementación escalonado

1. **Fase 1: Corregir la imagen**
   - Localizar la imagen correcta y subirla al contenedor
   - Actualizar solo la referencia a la imagen sin tocar otra funcionalidad

2. **Fase 2: Solucionar configuración de API**
   - Crear archivo `.env.production` correcto
   - O modificar apiService para apuntar a masclet-api:8000

3. **Fase 3: Arreglar auth-proxy**
   - Una vez solucionados los problemas anteriores, centrarse en el problema del proxy
   - Probar diferentes enfoques hasta que funcione correctamente

## 🧪 Soluciones alternativas a considerar

1. **Redirección directa al backend**:
   - Modificar login para llamar directamente a `http://masclet-api:8000/api/v1/auth/login`
   - Evitar el uso del auth-proxy si sigue dando problemas

2. **Configuración de CORS en backend**:
   - Si la llamada directa a Render es inevitable, configurar CORS en el backend

3. **Rebuild completo del frontend**:
   - Como último recurso, recompilar el frontend asegurando cohesión entre chunks

## 💡 Aspectos clave a recordar

- Mantener siempre backups de cada archivo modificado
- Realizar cambios incrementales y probar después de cada cambio
- La arquitectura Dockerizada requiere atención especial a la comunicación inter-contenedores
- El problema principal parece ser la coordinación entre diferentes partes del sistema más que bugs específicos
