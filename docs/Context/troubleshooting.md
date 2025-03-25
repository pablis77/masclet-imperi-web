# Guía de Solución de Problemas

Esta guía contiene soluciones a problemas comunes que pueden surgir durante el desarrollo y uso de la aplicación Masclet Imperi.


## Problemas de Autenticación

### Error 401 Unauthorized

Si recibes un error 401 Unauthorized al intentar acceder a un endpoint protegido, verifica lo siguiente:

1. Asegúrate de que estás enviando el token JWT en el header de autorización:
   ```bash
   Authorization: Bearer <tu_token_jwt>
   ```

2. Verifica que el token no haya expirado. Los tokens tienen una validez de 24 horas.

3. Asegúrate de que estás usando las credenciales correctas al iniciar sesión:
   - Usuario: admin
   - Contraseña: admin123


### Error 403 Forbidden

Si recibes un error 403 Forbidden, significa que tu usuario no tiene los permisos necesarios para realizar la acción solicitada. Verifica lo siguiente:

1. Asegúrate de que estás usando una cuenta con los permisos adecuados para la acción que intentas realizar.

2. Si necesitas permisos adicionales, contacta al administrador del sistema.


## Problemas con la Base de Datos

### Error al conectar con la base de datos

Si la aplicación no puede conectarse a la base de datos, verifica lo siguiente:

1. Asegúrate de que la base de datos está en ejecución.

2. Verifica que las credenciales en el archivo `.env` son correctas:
   ```makefile
   DATABASE_URL=postgres://usuario:contraseña@localhost:5432/masclet_imperi
   ```

3. Comprueba que el puerto 5432 (puerto por defecto de PostgreSQL) está abierto y accesible.


### Error en migraciones

Si encuentras errores al ejecutar migraciones, prueba lo siguiente:

1. Asegúrate de que la base de datos existe y está accesible.

2. Verifica que tienes los permisos necesarios para modificar la estructura de la base de datos.

3. Ejecuta las migraciones en orden, empezando por la más antigua.


## Problemas con la API

### Error 404 Not Found

Si recibes un error 404 Not Found al intentar acceder a un endpoint, verifica lo siguiente:

1. Asegúrate de que la URL es correcta y está bien formada.

2. Verifica que estás usando el método HTTP correcto (GET, POST, PUT, DELETE).

3. Comprueba que el endpoint existe en la documentación de la API.


### Error en las respuestas de la API

Si la API devuelve respuestas inesperadas o errores, prueba lo siguiente:

1. Verifica que estás enviando los datos en el formato correcto (generalmente JSON).

2. Asegúrate de que todos los campos requeridos están incluidos en la solicitud.

3. Comprueba los logs del servidor para obtener más información sobre el error.


## Problemas con los endpoints

### Error 405 Method Not Allowed

Si recibes un error 405 Method Not Allowed, significa que estás intentando usar un método HTTP que no está permitido para ese endpoint. Verifica lo siguiente:

1. Asegúrate de que estás usando el método HTTP correcto para el endpoint (GET, POST, PUT, DELETE).

2. Consulta la documentación de la API para ver qué métodos están permitidos para cada endpoint.


### Problemas con URLs que terminan en slash (/)

Algunos endpoints pueden requerir que la URL termine con un slash (/), mientras que otros pueden funcionar sin él. Si encuentras problemas, prueba lo siguiente:

1. Si estás recibiendo un error 404, intenta añadir o quitar el slash final de la URL.

2. En general, es una buena práctica incluir siempre el slash final en las URLs de la API.

3. Alternativamente, se puede configurar el backend para que acepte URLs sin slash final, pero esto requiere modificar la configuración de FastAPI.


## Problemas con la visualización de animales por explotación

### Problema de visualización

Se detectó un problema en la visualización de animales por explotación. La aplicación no mostraba correctamente los animales asociados a una explotación específica. Esto se debía a varios factores:

1. **Confusión conceptual**: Había una confusión entre los términos "explotacio" (código identificador de la explotación) y "explotacio_id" (ID numérico de la explotación en la base de datos).

2. **Inconsistencia en endpoints**: El frontend intentaba obtener los animales usando diferentes formatos de endpoint, lo que podía causar errores o resultados inconsistentes.

3. **Parámetro incorrecto**: Al navegar desde la página de explotaciones a la de detalles, se estaba pasando el código de explotación (`explotacio`) en lugar del ID numérico (`id`).


### Solución implementada

Se realizaron las siguientes correcciones:

1. **Clarificación conceptual**:
   - `explotacio`: Es el código identificador de la explotación (ej: "Gurans-001")
   - `explotacio_id`: Es el ID numérico de la explotación en la base de datos
   - `nom`: En el contexto de explotaciones, es el nombre de la explotación (ej: "Gurans")

2. **Estandarización de endpoints**:
   - Se modificó la función `getAnimalsByExplotacio` para usar un único endpoint consistente: `animals/?explotacio_id=${id}`

3. **Corrección de parámetros**:
   - En la página de detalles de explotación, se modificó para usar el ID numérico al obtener los animales: `animals = await getAnimalsByExplotacio(id)`
   - Se corrigió el enlace para añadir nuevos animales: `/animals/new?explotacio_id=${id}`

Estos cambios aseguran que la aplicación muestre correctamente los animales asociados a cada explotación y mantenga la consistencia en toda la interfaz de usuario.


## Estrategia para el Desarrollo

1. **No modificar lo que funciona:** Especialmente los endpoints del backend que ya están probados.

2. **Probar los endpoints directamente:** Antes de integrar con el frontend, verificar que funcionen con curl o Postman.

3. **Documentar los problemas y soluciones:** Actualizar este documento con cada nuevo problema resuelto.

4. **Enfoque modular:** Resolver un problema a la vez, sin intentar arreglar todo de una vez.


## Estructura de URLs de la API

- Base URL: `http://localhost:8000/api/v1`
- Explotaciones: `/api/v1/explotacions/`
- Animales: `/api/v1/animals/`
- Autenticación: `/api/v1/auth/login`

## Configuración del Proxy

```javascript
// En astro.config.mjs
proxy: {
    '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
    }
}
```

### Problema con el Formato de URLs de la API (Slash Final)

**Problema:** El backend FastAPI requiere que las URLs terminen con slash final (`/`), mientras que las peticiones del frontend se hacen sin slash final, lo que provoca errores 404.

```bash
[404] /api/v1/explotacions 1ms
```

**Solución:**

1. Modificar el cliente API para que añada automáticamente un slash final a todas las URLs si no lo tienen ya:

   ```typescript
   // En apiClient.ts
   async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
     try {
       // Asegurarse de que el endpoint termine con slash
       const formattedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
       const response = await this.instance.get<T>(formattedEndpoint, { params });
       return response.data;
     } catch (error) {
       console.error(`GET ${endpoint} error:`, error);
       throw error;
     }
   }
   ```

2. Aplicar la misma lógica a todos los métodos HTTP (get, post, put, delete) del cliente API.

3. Alternativamente, se puede configurar el backend para que acepte URLs sin slash final, pero esto requiere modificar la configuración de FastAPI.


## Problemas con la visualización de animales por explotación

### Problema
Se detectó un problema en la visualización de animales por explotación. La aplicación no mostraba correctamente los animales asociados a una explotación específica. Esto se debía a varios factores:

1. **Confusión conceptual**: Había una confusión entre los términos "explotacio" (código identificador de la explotación) y "explotacio_id" (ID numérico de la explotación en la base de datos).

2. **Inconsistencia en endpoints**: El frontend intentaba obtener los animales usando diferentes formatos de endpoint, lo que podía causar errores o resultados inconsistentes.

3. **Parámetro incorrecto**: Al navegar desde la página de explotaciones a la de detalles, se estaba pasando el código de explotación (`explotacio`) en lugar del ID numérico (`id`).


### Solución
Se realizaron las siguientes correcciones:

1. **Clarificación conceptual**:
   - `explotacio`: Es el código identificador de la explotación (ej: "Gurans-001")
   - `explotacio_id`: Es el ID numérico de la explotación en la base de datos
   - `nom`: En el contexto de explotaciones, es el nombre de la explotación (ej: "Gurans")

2. **Estandarización de endpoints**:
   - Se modificó la función `getAnimalsByExplotacio` para usar un único endpoint consistente: `animals/?explotacio_id=${id}`

3. **Corrección de parámetros**:
   - En la página de detalles de explotación, se modificó para usar el ID numérico al obtener los animales: `animals = await getAnimalsByExplotacio(id)`
   - Se corrigió el enlace para añadir nuevos animales: `/animals/new?explotacio_id=${id}`

Estos cambios aseguran que la aplicación muestre correctamente los animales asociados a cada explotación y mantenga la consistencia en toda la interfaz de usuario.
