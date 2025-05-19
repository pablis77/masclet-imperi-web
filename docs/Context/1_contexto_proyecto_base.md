# Contexto del Proyecto Base

## 1. Estructura de Datos (CSV)

### Campos Obligatorios (null_count: 0)

- explotacio: string(255) - Identificador de la explotación
- nom: string(255) - Nombre del animal
- genere: enum(M/F) - Género del animal
- estado: enum(OK/DEF) - Estado del animal (OK=activo, DEF=fallecido)

### Campos Opcionales con null_counts

- alletar: enum(0,1,2), null=true (12 nulls) - Estado de amamantamiento (0: No amamanta, 1: Un ternero, 2: Dos terneros)
- pare: string(100), null=true (28 nulls) - Padre del animal
- mare: string(100), null=true (28 nulls) - Madre del animal
- quadra: string(100), null=true (36 nulls) - Cuadra/ubicación
- cod: string(20), null=true (22 nulls) - Código identificativo
- num_serie: string(50), null=true (27 nulls) - Número de serie oficial
- dob: date(DD/MM/YYYY), null=true (25 nulls) - Fecha de nacimiento

### Campos de Partos

- part: date(DD/MM/YYYY), null=true (48 nulls) - Fecha del parto
- GenereT: enum(M/F/esforrada), null=true (48 nulls) - Género de la cría
- EstadoT: enum(OK/DEF), null=true (48 nulls) - Estado de la cría

## 2. Valores Únicos por Campo

- explotacio: ["Gurans", "Guadalajara", "Madrid", ...]
- genere: ["M", "F"]
- estado: ["OK", "DEF"]
- alletar: ["si", "no", null]
- GenereT: ["Mascle", "Femella", "esforrada", null]
- EstadoT: ["OK", "DEF", null]

## 3. Reglas de Negocio

- Solo puede existir un administrador en el sistema
- Roles definidos: administrador, editor, usuario
- Fechas en formato DD/MM/YYYY
- Un animal puede tener múltiples partos (registro histórico permanente)
- Estado "DEF" (fallecido) es definitivo
- Las hembras pueden tener tres estados de amamantamiento:
  * 0: No amamanta
  * 1: Amamanta a un ternero
  * 2: Amamanta a dos terneros
- Los partos son registros históricos y no pueden eliminarse

## 4. Validaciones

- num_serie: Formato ES + números
- dob: Fecha válida en formato DD/MM/YYYY
- genere: Solo M o F
- estado: Solo OK o DEF
- Campos obligatorios no pueden ser null

## 5. Relaciones

- Animal -> Part (One to Many)
- Part -> Animal (Many to One)

## 6. Características Especiales de Implementación

### Gestión de Datos Nulos

- Los campos opcionales pueden estar vacíos en creación e importación
- Validación específica para cada campo según contexto
- Manejo especial de nulls en importaciones masivas

### Sistema de Iconografía

- Herencia de iconos del programa original
- Iconos especiales:
  - Toro (♂️)
  - Vaca (♀️)
  - Vaca amamantando (azul/blanco según estado alletar)
  - Ternero
  - Fallecido (†)

### Funcionalidad "Alletar"

- Sistema de estados de amamantamiento en vacas:
  * Estado 0: No amamanta (icono blanco)
  * Estado 1: Amamanta un ternero (icono azul)
  * Estado 2: Amamanta dos terneros (icono azul intenso)
- Control manual del estado de amamantamiento
- Influye en el recuento de terneros:
  * Cada vaca en estado 1 suma un ternero
  * Cada vaca en estado 2 suma dos terneros
- Afecta directamente a las estadísticas de explotación
- Independiente del registro histórico de partos

## 7. Funcionalidades Principales

### Consulta de Ficha

- Visualización completa de datos del animal
- Para vacas (F): historial de partos
- Recuento total de partos
- Datos específicos de cada parto

### Listado de Explotación

- Vista general por explotación
- Recuentos segregados:
  - Total toros
  - Total vacas
  - Total terneros (según estado alletar SI)
- Filtros y ordenación
- Iconografía específica por tipo

### Gestión de Fichas

- Actualización:
  - Modificación datos existentes
  - Registro histórico de cambios
  - Validaciones específicas por campo
- Nueva ficha:
  - Creación individual
  - Validaciones en tiempo real
  - Campos obligatorios y opcionales

### Importación Masiva

- Carga de CSV con múltiples registros
- Validación de formato y datos
- Gestión de errores y duplicados
- Log de importación

### Gestión de Usuarios

- Roles: administrador, editor, usuario
- Limitación: único administrador
- CRUD completo de usuarios
- Permisos por rol

## 8. Filosofía de Diseño y Usabilidad

- **Flexibilidad Extrema**: La aplicación está diseñada para ganaderos trabajando en campo, no en oficina
- **Tolerancia a Datos Imperfectos**:
  * Acepta datos incompletos o con erratas
  * Prioriza el registro sobre la validación estricta
  * Proporciona defaults inteligentes
  * Permite correcciones posteriores
- **UX Adaptada al Contexto Rural**:
  * Interfaces simples y robustas
  * Funciona con conexión inestable
  * Tolerante a errores de entrada
  * Prioriza la no frustración del usuario

## 9. Sistema de Errores y Monitorización

### Gestión de Errores

```python
ERROR_TYPES = {
    "validation": "Errores de validación de datos",
    "format": "Errores de formato CSV",
    "duplicate": "Registros duplicados",
    "date": "Errores en fechas",
    "encoding": "Problemas de codificación"
}

ERROR_LEVELS = {
    "critical": "Detiene importación",
    "warning": "Permite continuar",
    "info": "Solo informativo"
}
```

### Sistema de Logging

```python
LOGGING = {
    "file": "app.log",
    "level": "DEBUG",
    "rotation": "1 week",
    "alerts": {
        "error_rate": ">10%",
        "process_time": ">5min",
        "memory_usage": ">1GB"
    }
}
```

### Métricas Globales

```python
METRICS = {
    "performance": [
        "tiempo_proceso",
        "memoria_utilizada",
        "registros_por_segundo"
    ],
    "calidad": [
        "tasa_exito",
        "errores_por_tipo",
        "registros_duplicados"
    ],
    "sistema": [
        "uso_cpu",
        "uso_memoria",
        "tiempo_respuesta_db"
    ]
}
```

## 10. ACTUALIZACIÓN (14/Marzo/2025): Contexto de Uso y Despliegue

### Usuarios Finales

- **Perfil de Usuario**: Ganaderos trabajando en campo
- **Dispositivo Principal**: Teléfonos móviles y tablets (no PC de escritorio)
- **Entorno de Uso**: Exterior, en explotaciones ganaderas, con posible conectividad limitada
- **Conocimientos Técnicos**: Básicos, orientados al uso práctico

### Requisitos Operativos

- **Autonomía**: Sistema debe ser mayormente autónomo con mínima intervención técnica
- **Mantenimiento**: No habrá contrato de mantenimiento formal, solo asistencia puntual
- **Robustez**: Debe soportar uso intensivo en condiciones adversas
- **Offline**: Capacidad parcial de funcionamiento sin conexión constante

### Arquitectura Objetivo

- **Frontend**: Desplegado en servicio cloud (Vercel/Netlify)
- **Backend**: Servidor VPS económico (DigitalOcean/Hetzner)
- **Dominio**: Se adquirirá un dominio propio para el servicio
- **Enfoque Móvil**: Diseño "mobile-first" con optimizaciones para conexiones inestables
- **Proxies de Comunicación**: Implementación de proxies API para asegurar comunicación robusta entre frontend y backend

### Ciclo de Vida

- **Lanzamiento**: Período inicial de supervisión intensiva
- **Estabilización**: Ajustes según retroalimentación de usuarios reales
- **Mantenimiento**: Intervenciones puntuales, no supervisión continua
- **Actualizaciones**: Programadas según necesidad, no frecuentes

Esta actualización refuerza la necesidad de un diseño extremadamente robusto y autónomo, adaptado específicamente para el uso por ganaderos en condiciones de campo, con dispositivos móviles y conectividad potencialmente limitada.
