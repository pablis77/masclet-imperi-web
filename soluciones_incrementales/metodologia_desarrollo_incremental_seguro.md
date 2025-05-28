# Metodología de Desarrollo Incremental Seguro (MDIS)

## Introducción

Este documento describe la metodología que hemos desarrollado para implementar evoluciones y mejoras en sistemas en producción o código crítico. La **Metodología de Desarrollo Incremental Seguro (MDIS)** permite realizar cambios progresivos mientras mantenemos la capacidad de revertir a estados anteriores funcionales si las modificaciones no cumplen con los requisitos o introducen problemas.

## Principios fundamentales

1. **Preservación del estado funcional**: Nunca se avanza a un nuevo paso si no tenemos guardado el estado anterior que sabemos que funciona.
2. **Iteración con puntos de control**: Cada evolución se divide en pasos incrementales con puntos de control claros.
3. **Validación continua**: Cada cambio debe ser probado y validado antes de continuar con el siguiente.
4. **Reversibilidad total**: Siempre debe ser posible volver a un estado anterior conocido.
5. **Documentación paso a paso**: Todos los cambios y decisiones deben ser documentados.

## Proceso detallado

### 1. Preparación y análisis

- **Diagnóstico del problema**: Identificar claramente qué estamos intentando solucionar o mejorar.
- **Inventario de archivos**: Identificar todos los archivos que necesitarán modificaciones.
- **Creación de directorio de respaldo**: Establecer un directorio específico para las copias de seguridad.

### 2. Ciclo de desarrollo incremental

Para cada iteración del proceso:

1. **Crear copia de seguridad del estado actual**:

   ```bash
   copy "ruta\al\archivo_original.ext" "ruta\al\archivo_original.ext.backup"
   ```

2. **Implementar cambios en un solo aspecto**:
   - Realizar modificaciones enfocadas en un solo aspecto o funcionalidad.
   - Evitar cambios masivos que afecten múltiples características a la vez.

3. **Probar los cambios**:
   - Validar que los cambios cumplen con el objetivo específico.
   - Verificar que no se han introducido efectos secundarios.

4. **Guardar punto de control**:

   ```bash
   copy "ruta\al\archivo_modificado.ext" "ruta\al\archivo_modificado.ext.paso1"
   ```

5. **Evaluar resultados**:
   - Si los cambios son satisfactorios: Avanzar al siguiente incremento.
   - Si no son satisfactorios: Restaurar desde la copia de seguridad y replantear el enfoque.

### 3. Integración final

- Seleccionar la mejor versión de cada componente modificado.
- Aplicar pruebas de integración completas.
- Documentar las decisiones finales y el resultado obtenido.

## Ejemplo práctico: Optimización del Dashboard de Masclet Imperi

### Contexto inicial

El dashboard de la aplicación mostraba tiempos de carga excesivos, afectando la experiencia de usuario. Se identificaron varias causas potenciales:
- Múltiples peticiones secuenciales al API
- Logs de depuración excesivos
- Ausencia de caché para datos que cambian poco
- Falta de indicadores visuales durante la carga

### Iteración 1: Optimización de peticiones y sistema de caché

**Archivos modificados**:
- `DashboardV2.tsx`

**Cambios implementados**:
- Conversión de peticiones secuenciales a paralelas usando `Promise.all`
- Implementación de sistema de caché con sessionStorage
- Limpieza de logs de depuración innecesarios

**Resultado**:
- Mejora en la velocidad percibida
- Los datos se mantienen actualizados con cada visita
- **Punto de control**: `DashboardV2.tsx.paso1`

### Iteración 2: Implementación de skeleton loaders

**Archivos modificados**:
- `DashboardV2.tsx`
- Nuevo: `SkeletonLoader.tsx`

**Cambios implementados**:
- Creación de componentes de skeleton para mostrar durante la carga
- Integración con el flujo de datos existente
- Mejora en la indicación visual de carga

**Resultado**:
- Mejora en la percepción de velocidad
- Los usuarios ven contenido visual mientras se cargan los datos
- **Punto de control**: `DashboardV2.tsx.paso2`

### Iteración 3: Optimización de componente ResumenOriginalCard

**Archivos modificados**:
- `ResumenOriginalCard.tsx`

**Cambios implementados**:
- Implementación de peticiones paralelas para las 3 llamadas a API
- Eliminación de logs innecesarios
- Intento de datos simulados (luego revertido por priorizar datos dinámicos)

**Resultado**:
- Mejora en la velocidad de carga del componente
- Mantenimiento de datos dinámicos
- **Punto de control**: `ResumenOriginalCard.tsx.paso1`

### Decisión final

Tras evaluar las tres iteraciones, se determinó:
1. Mantener las optimizaciones de la Iteración 1 (peticiones paralelas y caché)
2. Conservar parcialmente las mejoras de la Iteración 2 (skeleton loaders simplificados)
3. Para `ResumenOriginalCard`, priorizar datos dinámicos sobre velocidad

### Próximos pasos

Se identificó que para una optimización más profunda sería necesario:
1. Unificar endpoints en el backend
2. Crear un nuevo endpoint específico para dashboard que combine datos
3. Optimizar consultas a nivel de base de datos

## Estructura de Documentación de Soluciones

Para mantener un registro organizado y accesible de todas las mejoras implementadas, se ha establecido la siguiente estructura de documentación:

### 1. Carpeta Principal de Soluciones

En el directorio raíz del proyecto se encuentra la carpeta `soluciones_incrementales`, que sirve como repositorio central de todas las mejoras implementadas:


```text
ruta/al/proyecto/
└── soluciones_incrementales/
```


### 2. Subcarpetas por Solución

Dentro de la carpeta principal, cada solución o mejora implementada tiene su propia subcarpeta con un nombre descriptivo:


```text
soluciones_incrementales/
├── mejora_resumen_general_dashboard/
├── optimizacion_lazy_loading/
├── implementacion_multiidioma/
└── ... otras soluciones ...
```


### 3. Documentación Estándar por Solución

Cada subcarpeta debe contener como mínimo los siguientes archivos de documentación:

#### 3.1 Archivo README.md

Describe en detalle la solución implementada, incluyendo:

- **Problema**: Descripción clara del problema que se intenta resolver
- **Solución Implementada**: Explicación detallada de la solución
- **Archivos Modificados**: Lista de archivos que fueron modificados
- **Mejoras Obtenidas**: Beneficios y mejoras logradas
- **Notas Adicionales**: Información complementaria relevante
- **Fecha de Implementación**: Cuándo se implementó la solución


#### 3.2 Archivo codigo_implementado.md

Contiene el código exacto que se implementó, con bloques de código marcados según el lenguaje:


```markdown
# Código Implementado para [Nombre de la Solución]

## [Nombre del Archivo 1]

```[lenguaje]
// Código implementado
```

## [Nombre del Archivo 2]

```[lenguaje]
// Código implementado
```
```


#### 3.3 Archivos Adicionales (opcionales)

- **capturas/**: Directorio con capturas de pantalla antes/después
- **datos_prueba.md**: Datos de prueba utilizados para validar la solución
- **alternativas_consideradas.md**: Otras soluciones que se evaluaron


### 4. Proceso para Documentar una Nueva Solución

1. **Crear la estructura de carpetas**:

   ```bash
   mkdir soluciones_incrementales/nombre_descriptivo_solucion
   ```

2. **Crear los archivos de documentación**:

   ```bash
   touch soluciones_incrementales/nombre_descriptivo_solucion/README.md
   touch soluciones_incrementales/nombre_descriptivo_solucion/codigo_implementado.md
   ```

3. **Documentar la solución** siguiendo las plantillas establecidas

4. **Actualizar registro central** (opcional) añadiendo la nueva solución a un índice general


## Ventajas de la metodología MDIS

1. **Seguridad en el desarrollo**: Siempre podemos volver a un estado conocido funcional.
2. **Evolución controlada**: Cada cambio se evalúa individualmente.
3. **Aprendizaje iterativo**: Cada paso nos enseña sobre el comportamiento del sistema.
4. **Documentación automática**: El proceso genera su propia documentación.
5. **Reducción de riesgos**: Minimizamos el impacto de cambios problemáticos.
6. **Conocimiento compartido**: La documentación estructurada facilita que otros miembros del equipo entiendan los cambios.
7. **Reutilización de soluciones**: Soluciones documentadas pueden adaptarse a otros problemas similares.


## Implementación en su organización

Para implementar esta metodología en su equipo:

1. Establecer una estructura de directorios para copias de seguridad
2. Adoptar una convención de nomenclatura para los puntos de control
3. Documentar cada iteración, incluyendo las decisiones no implementadas
4. Realizar sesiones de revisión después de cada ciclo completo
5. Mantener actualizada la carpeta de soluciones incrementales
6. Fomentar la consulta de soluciones previas antes de abordar nuevos problemas


---

*Este documento fue creado como parte del proyecto de optimización del dashboard de Masclet Imperi, Mayo 2025.*
