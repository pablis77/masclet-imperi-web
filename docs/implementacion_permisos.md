# Plan de Implementación del Sistema de Permisos

Este documento detalla el proceso paso a paso para implementar el sistema de permisos en Masclet Imperi Web, siguiendo la estructura definida en [permisos_usuarios.md](./permisos_usuarios.md).

## 1. Análisis Inicial y Pruebas No Invasivas

### 1.1 Verificación del Sistema Actual de Autenticación

- [x] Crear script de prueba para verificar roles actuales
- [x] Probar login con diferentes usuarios (admin, gerente, editor, usuario)
- [x] Analizar la respuesta del backend y verificar si incluye información de rol
- [x] Verificar cómo se almacena actualmente la información de usuario en localStorage

#### Hallazgos Importantes

1. **Token JWT incluye información de rol**: El token JWT devuelto por el backend ya contiene el campo `role` (ej: `UserRole.ADMIN`).
2. **Usuarios configurados en el sistema**:
   - `admin` → `UserRole.ADMIN`
   - `editor` → `UserRole.EDITOR`
   - `usuario` → `UserRole.USER`
   - El usuario `ramon` (gerente) no existe actualmente en el sistema.
3. **Respuesta del login**: No incluye el objeto usuario completo, solo el token JWT.
4. **Almacenamiento en localStorage**: El frontend guarda el token en `localStorage.token` pero no extrae ni almacena el rol.

### 1.2 Análisis de Estructura de Código Existente

- [ ] Confirmar estructura de roles en backend (`app/core/config.py`)
- [ ] Verificar middleware de autenticación existente
- [ ] Analizar componentes de navegación (Sidebar, Navbar) y su integración con roles
- [ ] Revisar lógica de redirección existente tras login

## 2. Mejoras No Invasivas

### 2.1 Mejora del Servicio de Autenticación

- [ ] Actualizar `authService.ts` para mejorar detección de roles
- [ ] Agregar funciones auxiliares para verificación de permisos
- [ ] Implementar función para verificar permisos específicos basados en matriz

### 2.2 Creación de Componentes de Protección

- [ ] Desarrollar componente `RoleGuard` para protección basada en roles
- [ ] Desarrollar componente `PermissionGuard` para protección basada en permisos específicos
- [ ] Crear integración cliente-servidor para validación de permisos

## 3. Integración Controlada

### 3.1 Implementación en Ruta de Prueba

- [ ] Seleccionar una ruta específica para pruebas (ej: `/users`)
- [ ] Implementar protección de ruta usando componentes desarrollados
- [ ] Verificar comportamiento con diferentes roles de usuario
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

| Fecha | Paso Completado | Resultado | Commit |
|-------|-----------------|-----------|--------|
| 27/05/2025 | Creación del plan de implementación | Documento detallado con fases y checklist | 286e126 |
| 27/05/2025 | Verificación del sistema actual de autenticación | Script de prueba creado y ejecutado con éxito | Pendiente |
