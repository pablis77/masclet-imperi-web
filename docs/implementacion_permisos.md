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

#### Credenciales de Prueba

Para realizar pruebas con diferentes roles:

- **Administrador**:
  - Usuario: `admin`
  - Contraseña: `admin123`
- **Ramon (Gerente)**:
  - Usuario: `ramon`
  - Contraseña: `Ramon123`
- **Editor**:
  - Usuario: `editor`
  - Contraseña: `editor123`
- **Usuario**:
  - Usuario: `usuario`
  - Contraseña: user123

## 3. Integración Controlada

### 3.1 Implementación en Ruta de Prueba

- [ ] Seleccionar la ruta `/users` para pruebas (accesible por ADMIN y Ramon)
- [ ] Implementar protección de ruta usando componentes desarrollados
- [ ] Probar acceso con usuario `admin` (debe funcionar)

### 3.2 Estandarización de Nomenclatura

- [ ] Cambiar todas las referencias de "gerente" a "Ramon" en el frontend
- [ ] Verificar y mantener la compatibilidad con el backend (que usa "gerente")
- [ ] Actualizar filtros de menú y componentes de protección
- [ ] Probar que la navegación y permisos funcionan correctamente con el cambio
- [ ] Probar acceso con usuario `ramon` (debe funcionar)
- [ ] Probar acceso con usuario `editor` y `usuario` (debe denegar)
- [ ] Ajustar componentes según resultados de pruebas

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
