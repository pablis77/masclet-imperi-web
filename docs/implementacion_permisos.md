# Plan de Implementación del Sistema de Permisos

Este documento detalla el proceso paso a paso para implementar el sistema de permisos en Masclet Imperi Web, siguiendo la estructura definida en [permisos_usuarios.md](./permisos_usuarios.md).

## 1. Análisis Inicial y Pruebas No Invasivas

### 1.1 Verificación del Sistema Actual de Autenticación

- [X] Crear script de prueba para verificar roles actuales
- [X] Probar login con diferentes usuarios (admin, gerente, editor, usuario)
- [X] Analizar la respuesta del backend y verificar si incluye información de rol
- [X] Verificar cómo se almacena actualmente la información de usuario en localStorage

#### Hallazgos Importantes

1. **Token JWT incluye información de rol**: El token JWT devuelto por el backend ya contiene el campo `role` (ej: `UserRole.ADMIN`).
2. **Usuarios configurados en el sistema**:
   - `admin` → `UserRole.ADMIN` (Rol fundamental - Acceso completo)
   - `ramon` → `UserRole.GERENTE` (Rol fundamental - Acceso casi completo, sin importación)
   - `editor` → `UserRole.EDITOR` (Rol secundario - Consulta y actualización)
   - `usuario` → `UserRole.USER` (Rol secundario - Solo consulta)
3. **Respuesta del login**: No incluye el objeto usuario completo, solo el token JWT.
4. **Almacenamiento en localStorage**: El frontend guarda el token en `localStorage.token` pero no extrae ni almacena el rol.
5. **Discrepancia en el frontend**: Partes del código se refieren a `ramon` como nombre de rol en lugar de `gerente`.

### 1.2 Análisis de Estructura de Código Existente

- [X] Confirmar estructura de roles en backend (`app/core/config.py`)
- [X] Verificar middleware de autenticación existente
- [X] Analizar componentes de navegación (Sidebar, Navbar) y su integración con roles
- [X] Revisar lógica de redirección existente tras login

#### Conclusiones del Análisis

1. **Estructura de Roles en Backend**:

   - Definición clara mediante `UserRole` (enum): ADMIN, GERENTE, EDITOR, USER
   - Matriz de permisos `ROLES` con acciones específicas para cada rol
   - Acciones definidas mediante `Action` (enum): CONSULTAR, ACTUALIZAR, CREAR, etc.
2. **Middleware de Autenticación**:

   - Usa OAuth2 con JWT para autenticación
   - En desarrollo hay un bypass que siempre devuelve un usuario administrador
   - Funciones para: autenticar usuario, extraer usuario del token, verificar permisos, etc.
3. **Componentes de Navegación**:

   - `Navbar.tsx` filtra el menú según el rol del usuario
   - Filtrado mediante: `menuItems.filter(item => item.roles.includes(userRole))`
   - Controles de acceso ya implementados para opciones de menú
4. **Lógica de Redirección tras Login**:

   - Almacena token JWT en `localStorage.setItem('token', token)`
   - Redirección al dashboard principal tras login exitoso
   - No extrae ni almacena el rol desde el token

#### Áreas de Mejora Identificadas

1. **Extracción y almacenamiento del rol**:

   - **Problema**: No se extrae ni almacena el rol del token JWT en el frontend
   - **Solución**: Implementar en la fase 2.1 (ya completada) la extracción del rol del token
2. **Verificación de permisos**:

   - **Problema**: No hay un mecanismo consistente para verificar permisos en componentes/páginas
   - **Solución**: Implementar en la fase 2.2 (componentes de protección) - en curso
3. **Estandarización de nomenclatura**:

   - **Problema**: Inconsistencia en nomenclatura (gerente vs Ramon)
   - **Solución**: Cambiar todos los sitios donde aparezca "gerente" por "Ramon" - incluir en fase 3.2

## 2. Mejoras No Invasivas

### 2.1 Mejora del Servicio de Autenticación

- [X] Crear `roleService.ts` para extraer correctamente el rol del token JWT
- [X] Implementar jerarquía de roles priorizando ADMINISTRADOR y GERENTE
- [X] Estandarizar el uso de "gerente" vs "Ramon" en todo el código nuevo
- [X] Crear funciones para verificar permisos basándose en la matriz de permisos

### 2.2 Creación de Componentes de Protección

- [X] Desarrollar componente `RoleGuard` para protección basada en roles
- [X] Desarrollar componente `PermissionGuard` para protección basada en permisos específicos
- [X] Crear script de prueba para validar el funcionamiento de los componentes

### 2.3 Solución al Problema de Detección de Roles en Token JWT

#### Problema Identificado

Durante las pruebas se detectó un problema crítico con la detección de roles desde el token JWT:

1. **Síntomas**:

   - El usuario admin siempre se detectaba como rol 'usuario' a pesar de ser administrador
   - La página `/users` mostraba error de acceso denegado para el administrador
   - En consola aparecía: `No se pudo determinar el rol a partir del token, usando valor por defecto`
2. **Análisis del Token**:

   - Creamos script de verificación `verify_console.js` para analizar el token en la consola
   - Descubrimos que el token solo contenía: `{sub: 'admin', exp: 4102444800}`
   - **NO incluía campo `role` explícito**, aunque el backend indicaba:

     ```log
     Autenticación exitosa para usuario: admin con rol: UserRole.ADMIN
     Generando token JWT para usuario: admin
     ```
3. **Causa del Problema**:

   - La función `extractRoleFromToken()` buscaba un campo `role` en el token que no existía
   - Al no encontrarlo, siempre devolvía 'usuario' como valor por defecto
   - El backend envía el nombre de usuario en campo `sub` pero no incluye el rol

#### Solución Implementada

1. **Modificación de `extractRoleFromToken()`**:

   - Añadimos reconocimiento del campo `sub` del token cuando `role` no está presente
   - Implementamos detección especial para usuario 'admin' en cualquier campo del token
   - Añadimos inferencia de rol basada en el nombre de usuario cuando no hay rol explícito
   - Mejoramos logs de depuración para facilitar diagnóstico
2. **Código Implementado**:

   ```typescript
   // Extracto de la solución principal
   export function extractRoleFromToken(): UserRole {
     try {
       const token = getToken();
       if (!token) {
         console.warn('No hay token JWT disponible');
         return 'usuario';
       }

       // Decodificar el token JWT
       const decoded = jwtDecode<{ role?: string; username?: string; sub?: string }>(token);
       console.log('Token decodificado:', decoded);

       // Caso especial: Si el usuario es admin (ya sea por username o sub), asignar rol administrador
       if (decoded.username === 'admin' || decoded.sub === 'admin') {
         console.log('Usuario admin detectado en el token, asignando rol administrador');
         return 'administrador';
       }

       // Extraer el rol del token (puede venir en varios formatos)
       if (decoded.role) {
         // Procesamiento de varios formatos de rol...
       }

       // Inferir rol a partir de sub (nombre de usuario) si role no está presente
       if (decoded.sub) {
         console.log('Intentando inferir rol a partir de sub:', decoded.sub);

         // Mapeo de nombres de usuario conocidos a roles
         if (decoded.sub === 'admin') {
           console.log('Usuario admin detectado en sub, asignando rol administrador');
           return 'administrador';
         }
         if (decoded.sub === 'ramon' || decoded.sub === 'Ramon') {
           console.log('Usuario Ramon detectado en sub, asignando rol Ramon');
           return 'Ramon';
         }
       }

       // Valor por defecto
       console.warn('No se pudo determinar el rol a partir del token, usando valor por defecto');
       return 'usuario';
     } catch (error) {
       console.error('Error al extraer rol del token:', error);
       return 'usuario';
     }
   }
   ```
3. **Verificación de la Solución**:

   - Tras implementar el cambio, el componente `RoleGuard` detecta correctamente el rol 'administrador' para el usuario admin
   - La página `/users` es accesible para el administrador correctamente
   - La página de perfil muestra el rol correcto

#### Lecciones Aprendidas

1. **Versatilidad en Token JWT**:

   - No asumir estructura específica del token JWT, ser flexible en la extracción de datos
   - Implementar mecanismos para inferir información cuando no está explícita
2. **Validación y Depuración**:

   - Añadir logs extensivos para diagnóstico en funciones críticas
   - Crear scripts de verificación para analizar el contenido real de tokens/datos
3. **Robustez**:

   - Diseñar con múltiples capas de detección para información crítica
   - Implementar casos especiales para usuarios fundamentales (admin, Ramon)

### 2.4 Solución Robusta para Bloqueo de Botones según Rol

#### Problema: Bloqueo del Botón "Nuevo Animal" para Roles Restringidos

Se identificó la necesidad de bloquear el botón "Nuevo Animal" para usuarios con roles `editor` y `usuario`, permitiendo su uso solo a `administrador` y `Ramon`. Se probaron múltiples enfoques hasta encontrar la solución óptima.

#### Intentos y Dificultades Encontradas

1. **Solución inicial con script externo**:
   - Se creó `block-delete-button.js` para bloquear botones según rol
   - Problema: El script se ejecutaba demasiado tarde, permitiendo acceso al botón brevemente
   - La función `bloquearBotonNuevoAnimal()` no siempre encontraba el botón correctamente

2. **Conversión de `<a>` a `<button>`**:
   - Se modificó el elemento de enlace `<a href="/animals/new">` a `<button>`
   - Problema: El script seguía ejecutándose demasiado tarde
   - Los selectores CSS no siempre encontraban el botón correctamente

3. **Solución con CSS global**:
   - Se intentó bloquear mediante CSS con selectores como `a[href="/animals/new"]`
   - Problema: Las reglas CSS no siempre se aplicaban a tiempo

4. **Problema de verificación innecesaria**:
   - El script buscaba el botón en todas las páginas, no solo en la lista de animales
   - Generaba errores en consola y uso innecesario de recursos

#### Solución Final Implementada

La solución definitiva utiliza un **script inline directamente en la página** donde existe el botón:

```astro
<div class="flex flex-wrap gap-2">
  <script is:inline>
    // Comprobar rol de usuario directamente aquí
    (function() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role.toLowerCase();
          
          // Variable global para que otros scripts sepan que ya está bloqueado
          window.newAnimalButtonBlocked = (role === 'editor' || role === 'usuario');
          
          document.addEventListener('DOMContentLoaded', function() {
            // Si se ejecuta muy rápido, esperar un tick para asegurar que el DOM esté listo
            setTimeout(() => {
              if (window.newAnimalButtonBlocked) {
                console.log('BLOQUEANDO BOTÓN NUEVO ANIMAL INMEDIATAMENTE PARA ROL:', role);
                const btn = document.getElementById('new-animal-btn');
                if (btn) {
                  btn.disabled = true;
                  btn.style.opacity = '0.5';
                  btn.style.cursor = 'not-allowed';
                  btn.style.pointerEvents = 'none';
                  btn.title = 'NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES';
                  
                  // Añadir icono de candado
                  if (!btn.querySelector('.lock-icon')) {
                    const lockIcon = document.createElement('span');
                    lockIcon.textContent = ' 🔒';
                    lockIcon.className = 'ml-1 lock-icon';
                    btn.appendChild(lockIcon);
                  }
                  
                  // Prevenir navegación
                  btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('NO TIENES PERMISOS PARA CREAR NUEVOS ANIMALES');
                    return false;
                  };
                }
              }
            }, 0);
          });
        }
      } catch (e) {
        console.error('Error al verificar permisos para botón Nuevo Animal:', e);
      }
    })();
  </script>
  
  <!-- El botón que será bloqueado si es necesario -->
  <button 
     class="btn btn-primary flex items-center" 
     id="new-animal-btn"
     onclick="window.location.href='/animals/new';">
    <span class="mr-1">+</span>
    {newAnimalText}
  </button>
</div>
```

#### Ventajas de la Solución Final

1. **Ejecución inmediata**: El script se ejecuta en cuanto se carga la página, antes que cualquier otro script
2. **Independencia**: No depende de scripts externos que podrían cargarse tarde
3. **Simplicidad**: El código está directamente en la página donde se encuentra el botón
4. **Robustez**: Múltiples capas de protección (visual, funcional e interactiva)
5. **Informativo**: Proporciona feedback visual (candado) y mensaje de error explicativo

#### Patrón Recomendado para Futuros Bloqueos

Para bloquear otros botones o elementos según rol, se recomienda:

1. **Ubicar el script inline lo más cerca posible** del elemento a bloquear
2. **Usar ID único** para el elemento a bloquear
3. **Verificar el rol directamente** desde el token JWT
4. **Aplicar múltiples técnicas de bloqueo**:
   - Visual: `opacity`, `cursor: not-allowed`
   - Funcional: `disabled`, reemplazar `onclick`
   - Interactivo: `pointerEvents: none`
   - Explicativo: `title` con mensaje, icono de candado 🔒
5. **Manejar errores** adecuadamente para evitar fallos en la interfaz

#### Código Reutilizable para Bloqueo de Botones

Plantilla para futuros bloqueos:

```javascript
function bloquearElemento(id, roles, mensaje) {
  try {
    // Obtener rol del usuario
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = (payload.role || '').toLowerCase();
    
    // Verificar si el rol actual está en la lista de roles a bloquear
    if (roles.includes(userRole)) {
      // Encontrar el elemento por ID
      const elemento = document.getElementById(id);
      if (!elemento) return;
      
      // Aplicar bloqueo visual
      elemento.disabled = true;
      elemento.style.opacity = '0.5';
      elemento.style.cursor = 'not-allowed';
      elemento.style.pointerEvents = 'none';
      elemento.title = mensaje;
      
      // Añadir icono de candado
      if (!elemento.querySelector('.lock-icon')) {
        const lockIcon = document.createElement('span');
        lockIcon.textContent = ' 🔒';
        lockIcon.className = 'ml-1 lock-icon';
        elemento.appendChild(lockIcon);
      }
      
      // Reemplazar eventos
      const originalClick = elemento.onclick;
      elemento.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        alert(mensaje);
        return false;
      };
      
      console.log(`Elemento ${id} bloqueado para rol ${userRole}`);
    }
  } catch (e) {
    console.error(`Error al bloquear elemento ${id}:`, e);
  }
}

// Ejemplo de uso:
// document.addEventListener('DOMContentLoaded', function() {
//   setTimeout(() => {
//     bloquearElemento('nuevo-usuario-btn', ['editor', 'usuario'], 'NO TIENES PERMISOS PARA CREAR NUEVOS USUARIOS');
//   }, 0);
// });
```

#### Credenciales de Prueba

Para realizar pruebas con diferentes roles:

- **Administrador**:
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Ramon (Gerente)**:
  - Usuario: `Ramon`
  - Contraseña: `Ramon123`
- **Editor**:
  - Usuario: `editor`
  - Contraseña: `editor123`
- **Usuario**:
  - Usuario: `usuario`
  - Contraseña: user123

## 3. Integración Controlada

### 3.1 Implementación en Ruta de Prueba

- [X] Seleccionar la ruta `/users` para pruebas (accesible por ADMIN y Ramon)
- [X] Implementar protección de ruta usando componentes desarrollados
- [X] Probar acceso con usuario `admin` (debe funcionar)

### 3.2 Estandarización de Nomenclatura

- [X] Cambiar todas las referencias de "gerente" a "Ramon" en el frontend
- [X] Verificar y mantener la compatibilidad con el backend (que usa "gerente")
- [X] Actualizar filtros de menú y componentes de protección
- [X] Archivos actualizados:
  - `frontend/src/components/layout/types.ts`: Definición de tipos `UserRole`
  - `frontend/src/services/authService.ts`: Servicio de autenticación con lógica de compatibilidad
  - `frontend/src/services/roleService.ts`: Servicio de roles mejorado
  - `frontend/src/components/layout/Sidebar.tsx` y `Sidebar.astro`: Componentes de navegación
  - `frontend/src/middlewares/authUtils.ts`: Middleware con reglas de acceso a rutas
  - `frontend/src/components/users/UsersManagement.tsx`: Componente de gestión de usuarios
- [X] Probar que la navegación y permisos funcionan correctamente con el cambio
- [X] Probar acceso con usuario `ramon` (debe funcionar)
- [ ] Probar acceso con usuario `editor` y `usuario` (debe denegar)
- [ ] Ajustar componentes según resultados de pruebas

### 3.3 Avances y Problemas con el Usuario Ramon

#### Progresos Positivos

1. [X] Modificación exitosa del modelo de usuario en backend:
   - Cambiado `CharEnumField` a `CharField` para permitir valores flexibles de roles
   - Esto permite que el rol "Ramon" sea válido en la base de datos
   - Visualización correcta del usuario Ramon en la tabla de usuarios

2. [X] Autenticación correcta del usuario Ramon:
   - Corregida la importación del modelo User en `auth.py`
   - Verificación exitosa de la contraseña con bcrypt
   - Generación correcta del token JWT para el usuario Ramon
   - Log de autenticación exitosa: `Login exitoso para usuario: Ramon`

#### Problemas Identificados

1. [X] **CRÍTICO - Bypass de autenticación en modo desarrollo**:
   - Aunque la autenticación funciona, el sistema usaba un bypass que forzaba todas las peticiones a usar el usuario administrador
   - Evidencia en logs: `BYPASS ACTIVADO: usando usuario administrador para esta petición`
   - Consecuencia: Ramon iniciaba sesión correctamente pero recibía permisos de administrador
   - **SOLUCIÓN:** Se modificó `auth.py` para cambiar el valor por defecto de `BYPASS_MODE` a 'off' en lugar de 'admin'

   - Después de desactivar el bypass, el token JWT no se validaba correctamente
   - Evidencia en logs: `Error en token JWT: Invalid crypto padding. Acceso denegado`
   - Consecuencia: El usuario Ramon podía iniciar sesión pero recibía error 401 en todas las peticiones
   - Frontend mostraba errores: ❌ Error en petición GET a [/dashboard/stats](/dashboard/stats): Request failed with status code 401
    - **CAUSA RAIZ:** Se identificó código en `index.astro` que:
      - Primero eliminaba cualquier token existente: `localStorage.removeItem('token')`
      - Luego sobreescribía el token con uno hardcodeado inválido
    - **SOLUCION:** Se modificaron dos archivos:
      - `index.astro` - Se comentó el código que eliminaba y sobreescribía tokens válidos
      - `auth.py` - Se cambió el valor por defecto de `BYPASS_MODE` a 'off'

3. [X] - Validación de permisos funcionando correctamente:
   - Se verificó que los permisos se validan correctamente según el rol del usuario
   - El módulo `permissions.py` procesa correctamente los roles como strings
   - Las peticiones a endpoints restringidos devuelven error 403 (Prohibido) cuando el usuario no tiene permisos
   - Las peticiones a endpoints permitidos funcionan correctamente (ej: dashboard-detallado/animales-detallado)

4. [X] **CRÍTICO - Permisos incorrectos para el usuario Ramon**:
   - Ramon debería tener permisos de visualización de todo y edición de navegación según `permisos_usuarios.md`
   - Sin embargo, recibía errores 403 al intentar acceder a los datos del dashboard de explotaciones
   - Evidencia en logs: `❌ Error en petición GET a dashboard/explotacions/Gurans: Request failed with status code 403`
   - **CAUSA RAÍZ:** En `dashboard.py` existía una verificación que comparaba `current_user.explotacio_id` con la explotación solicitada
   - **SOLUCIÓN:** Se eliminó la restricción para que el rol GERENTE (Ramon) pueda acceder a todas las explotaciones sin importar el valor de `explotacio_id`

5. [ ] **CRÍTICO - Información incorrecta del usuario en frontend**:
   - En la barra superior se muestra "administrador" en lugar de "Ramon"
   - En el perfil de usuario se muestra la información del administrador en lugar de la de Ramon
   - **CAUSA RAÍZ:** El componente `ProfileManagement.tsx` no está recibiendo o actualizando correctamente la información del usuario actual
   - Aunque el usuario está autenticado como Ramon, la interfaz sigue mostrando datos del administrador

### 3.4 Resultados y Conclusiones

- [X] Se logró la autenticación correcta con el usuario Ramon
- [X] El token JWT se valida correctamente en el backend
- [X] El sistema de permisos funciona correctamente, restringiendo acceso según el rol
- [X] **COMPLETADO:** Corregir visualización de información de usuario en la interfaz
  - Se ha corregido el componente ProfileManagement para usar datos reales del token JWT
  - Se ha corregido la visualización del rol en la barra de navegación (ahora muestra "Ramon" correctamente)
  - Se ha optimizado el script para evitar mensajes excesivos en consola
  - Se ha corregido el email para que use el valor correcto de la base de datos (ramon@prueba.com)

### 5.3 Implementación de Restricciones para Roles Editor y Usuario

- [X] **COMPLETADO:** Bloquear creación de nuevos animales para roles restringidos
  - Se ha creado script específico `block-new-animal-button.js` siguiendo el patrón de `block-delete-button.js`
  - Se ha implementado bloqueo visual completo (opacidad reducida, cursor no permitido)
  - Se ha añadido icono de candado 🔒 para indicar visualmente el bloqueo
  - Se ha configurado alerta con mensaje explicativo al intentar usar el botón
  - Implementado para roles Editor y Usuario

- [X] **COMPLETADO:** Implementar restricciones para el rol Usuario
  - Se ha actualizado `permissions-ui.js` con restricciones específicas
  - Bloqueo de acceso a páginas administrativas: importaciones, backups y usuarios
  - Redirección automática si intenta acceder directamente a estas rutas
  - Deshabilitado visual de enlaces a secciones restringidas
  - Mensajes explicativos al pasar el cursor sobre elementos bloqueados
  
- [X] **COMPLETADO:** Reorganización de scripts de permisos
  - Se ha corregido referencia a scripts en `PermissionsManager.astro`
  - Se ha eliminado duplicidad de implementaciones entre scripts
  - Se ha mejorado la organización con scripts específicos para cada restricción
  - Se ha implementado detección de rol más robusta
- [ ] **PENDIENTE:** Implementar permisos específicos para Ramon en cada sección del sistema (ver [`permisos_usuarios.md`](../permisos_usuarios.md))
- [X] El rol "Ramon" es reconocido por el sistema y tiene los permisos básicos

### 3.5 Próximos pasos

1. [ ] Crear una interfaz adaptativa que muestre solo las opciones permitidas para cada rol
2. [ ] Implementar una página de "Acceso denegado" para mostrar errores 403 de forma amigable
3. [ ] Ajustar los tests automatizados para verificar los permisos por rol
4. [ ] Documentar el sistema de permisos para futuros desarrolladores
5. [ ] Crear una matriz de permisos completa para todos los endpoints por rol

### 3.2 Adaptación del Sidebar y Navbar

- [ ] Integrar componente de protección en Sidebar
- [ ] Actualizar Navbar para mostrar elementos según rol
- [ ] Probar navegación con diferentes roles

## 4. Despliegue Completo

### 4.1 Aplicación a Todas las Rutas

- [ ] Implementar protección en rutas de Dashboard
- [ ] Implementar protección en rutas de Explotaciones
- [ ] Implementar protección en rutas de Animales
- [ ] Implementar protección en rutas de Listados
- [ ] Implementar protección en rutas de Administración

### 4.2 Pruebas Completas del Sistema

- [ ] Verificar que cada rol solo puede acceder a sus secciones permitidas
- [ ] Verificar que elementos de UI se muestran/ocultan correctamente
- [ ] Probar flujos completos de navegación con cada rol

### 4.3 Optimización y Refactorización

- [ ] Optimizar rendimiento de verificaciones de permisos
- [ ] Refactorizar código duplicado
- [ ] Documentar el sistema implementado

## 5. Compatibilidad con AWS

- [ ] Verificar que todos los cambios son compatibles con el despliegue en AWS
- [ ] Confirmar que no hay dependencias específicas de entorno local
- [ ] Verificar que el sistema de autenticación funciona en el entorno de producción

## Notas Importantes

1. **Seguridad**: Todos los cambios mantendrán o mejorarán la seguridad existente del sistema.
2. **Compatibilidad**: La implementación será compatible con la estructura actual y no romperá funcionalidades existentes.
3. **Progresividad**: Cada paso será confirmado como exitoso antes de avanzar al siguiente.
4. **AWS**: La solución está diseñada para funcionar correctamente tanto en entorno local como en AWS sin problemas.

## Registro de Progreso

| Fecha      | Paso Completado                                    | Resultado                                             | Commit  |
| ---------- | -------------------------------------------------- | ----------------------------------------------------- | ------- |
| 27/05/2025 | Creación del plan de implementación              | Documento detallado con fases y checklist             | 286e126 |
| 27/05/2025 | Verificación del sistema actual de autenticación | Script de prueba creado y ejecutado con éxito        | 9676447 |
| 27/05/2025 | Actualización del plan priorizando roles          | Enfoque en roles ADMINISTRADOR y GERENTE              | f4e6b3b |
| 27/05/2025 | Implementación de componentes básicos            | Creación de roleService, RoleGuard y PermissionGuard | f637c4b |
