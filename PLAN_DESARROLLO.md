# Plan de Desarrollo Masclet Imperi

## Estado Actual del Proyecto (21/04/2025)

### 1. Backend
- **Estado**: ✅ 100% funcional en tests
- **Framework**: FastAPI con Tortoise ORM
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (Token-based)
- **Credenciales por defecto**: admin/admin123
- **Endpoints principales**: 
  - Autenticación (/api/v1/auth/*)
  - Animales (/api/v1/animals/*)
  - Dashboard (/api/v1/dashboard/*)
  - Explotaciones (como parte de dashboard)
  - Partos (como parte de animals y dashboard)

### 2. Frontend
- **Estado**: ⚠️ Parcialmente funcional
  - ✅ Listado de animales funciona
  - ✅ Visualización de ficha de animal funciona
  - ❌ Actualización de campos de animal no funciona
  - ❌ Dashboard no implementado correctamente
- **Framework**: Astro (v4.16.18)
- **Problemas detectados**: Comunicación frontend-backend inconsistente

### 3. Reglas de Negocio y Nomenclatura

#### Modelo de Animales
| Campo       | Tipo         | Descripción                                       |
|-------------|--------------|---------------------------------------------------|
| id          | int          | ID técnico autogenerado. Uso interno.             |
| nom         | string       | Nombre del animal.                                |
| explotacio  | string       | Identificador de la explotación.                  |
| genere      | enum(M/F)    | Género del animal (M: toro, F: vaca).            |
| estado      | enum(OK/DEF) | Estado del animal (OK: activo, DEF: fallecido).   |
| alletar     | enum(0,1,2)  | Estado de amamantamiento (sólo para vacas).       |

#### Modelo de Partos
| Campo       | Tipo                | Descripción                                 |
|-------------|---------------------|---------------------------------------------|
| id          | int                 | ID técnico autogenerado. Uso interno.       |
| animal_id   | int                 | ID técnico del animal asociado al parto.    |
| part        | date                | Fecha del parto (formato DD/MM/YYYY).       |
| GenereT     | enum(M/F/esforrada) | Género de la cría.                         |
| EstadoT     | enum(OK/DEF)        | Estado de la cría.                          |

#### Reglas importantes
- Los partos **siempre** están asociados a una vaca (animal con genere='F')
- Los partos son registros históricos y **no pueden eliminarse**
- El campo `explotacio` es el **único** identificador para explotaciones
- El campo `nom` está reservado exclusivamente para animales

## Plan de Acción

### Fase 1: Solucionar problemas de comunicación frontend-backend
1. **Crear componente Dashboard de prueba**
   - Implementar un componente nuevo sin tocar el existente
   - Mantener el look and feel actual
   - Verificar comunicación con `/api/v1/dashboard/resumen/`
   - Añadir logs detallados para depurar comunicación

2. **Analizar los problemas de actualización de animales**
   - Identificar patrones de error
   - Revisar el flujo completo de datos
   - Solucionar los problemas de comunicación

### Fase 2: Implementación por módulos
1. **Dashboard**
   - Implementar tarjetas de estadísticas básicas
   - Añadir gráficos de tendencias
   - Integrar panel de actividad reciente

2. **Explotaciones**
   - Desarrollar buscador y vista general
   - Implementar vista detallada por explotación

3. **Animales (mejoras)**
   - Añadir paginación y filtros
   - Arreglar actualización de campos
   - Implementar gestión de partos

### Fase 3: Módulos adicionales
- Usuarios
- Imports
- Backups

## Precauciones y Consideraciones

1. **Metodología de desarrollo**
   - Avanzar en pequeños incrementos
   - Probar exhaustivamente cada cambio
   - Realizar commits frecuentes

2. **Prioridades**
   - Resolver problemas de comunicación antes que añadir nuevas características
   - Mantener la estética y UX actual
   - Documentar cada solución para evitar problemas similares

3. **Comunicación frontend-backend**
   - Verificar formato de datos (application/json vs form-data)
   - Comprobar headers correctos (Authorization, Content-Type)
   - Confirmar que los tokens JWT se manejan correctamente

4. **Roles y autenticación**
   - Las verificaciones de roles están desactivadas para desarrollo
   - Cualquier usuario tiene permisos de administrador temporalmente
   - Implementar roles cuando el desarrollo principal esté completo

---

> Este documento se actualizará a medida que avance el desarrollo para reflejar el estado actual del proyecto y los próximos pasos.
