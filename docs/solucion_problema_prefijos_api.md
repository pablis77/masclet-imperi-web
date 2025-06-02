# Solución al Problema de Prefijos API en AWS

## Diagnóstico del problema

Hemos identificado que el problema principal en el despliegue AWS era la duplicación del prefijo API, causando rutas como `/api/api/v1/auth/login` que generaban errores 404 en algunos casos y comportamientos inconsistentes en otros.

### Causas identificadas:

1. **Frontend**: En `apiConfig.ts` se configuraba explícitamente para usar `/api/api/v1` en producción.
2. **Nginx**: La configuración redirigía las peticiones al backend añadiendo otro prefijo `/api`.

## Cambios realizados

### 1. Modificación del frontend

En el archivo `frontend/src/config/apiConfig.ts`:

```typescript
// ANTES
baseURL: IS_PRODUCTION ? '/api/api/v1' : '/api/v1',  // En producción usa la ruta duplicada detectada

// AHORA
baseURL: '/api/v1',  // Prefijo unificado: /api/v1 en todos los entornos
```

### 2. Modificación de la configuración de Nginx

En el archivo `deployment/frontend/nginx-linux.conf`:

```nginx
# ANTES
# COMPATIBILIDAD: Mantener soporte para rutas doble prefijo (actuales)
location ~ ^/api/api/v1/(.*)$ {
    proxy_pass http://masclet-api:8000/api/v1/$1;
    proxy_http_version 1.1;
    # otros headers...
}

# AHORA
# COMPATIBILIDAD TEMPORAL: Soporte para rutas con doble prefijo 
location ~ ^/api/api/v1/(.*)$ {
    # Redireccionamos permanentemente a la URL correcta
    return 301 /api/v1/$1;
}
```

### 3. Script `fix-api-urls.js` 

Confirmamos que este script ya estaba correctamente configurado para reemplazar `/api/api/v1` por `/api/v1` en los archivos compilados del frontend.

## Verificación y pruebas

Creamos varios scripts para probar los endpoints y verificar la solución:

1. `test_auth_aws.js`: Prueba específica de autenticación con diferentes formatos y URLs
2. `test_all_endpoints_aws.js`: Prueba completa de todos los endpoints principales
3. `verificar_solucion_prefijo.js`: Script final para verificar la solución implementada

## Resultados de las pruebas

Los resultados clave de nuestras pruebas:

1. La URL correcta para el backend es `/api/v1/[endpoint]` sin duplicación
2. El endpoint de autenticación espera datos en formato **form-urlencoded**, no JSON
3. Todos los endpoints principales funcionan correctamente con la URL correcta:
   - Login: `/api/v1/auth/login`
   - Perfil: `/api/v1/users/me`
   - Animales: `/api/v1/animals/`
   - Partos: `/api/v1/partos/`
   - Dashboard: `/api/v1/dashboard/stats`

## Plan de despliegue

1. Hacer commit de todos los cambios
2. Desplegar en AWS con:
   ```bash
   # En Windows
   ./deployment/frontend/deploy.ps1
   
   # En Linux
   ./deployment/frontend/docker-linux.sh
   ```
3. Verificar el despliegue con el script `verificar_solucion_prefijo.js`
4. Validar que la aplicación funciona correctamente en el navegador

## Mejoras adicionales

1. Configuramos Nginx para hacer redirección 301 de URLs antiguas con doble prefijo
2. Mantuvimos el script `fix-api-urls.js` para asegurar la corrección de URLs en archivos compilados
3. Unificamos la configuración API para desarrollo y producción, simplificando el mantenimiento

## Conclusiones

El problema principal era una combinación de:
1. Configuración incorrecta en el frontend que añadía `/api` a todas las URLs
2. Configuración de Nginx que redirigía al backend añadiendo otro prefijo `/api`

Con los cambios realizados, ahora todas las peticiones usan consistentemente el prefijo `/api/v1` en todos los entornos, eliminando la duplicación y los errores asociados.
