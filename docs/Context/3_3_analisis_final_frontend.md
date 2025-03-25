# Análisis Exhaustivo del Frontend

## Módulo: Dashboard

### Funcionalidades Existentes

#### Estadísticas Generales
- **Descripción**: Muestra datos clave como el total de animales, distribución por género, estado de crianza y actividad reciente.
- **Endpoint Utilizado**: `/api/v1/dashboard/stats`.
- **Detalles**:
  - Total de animales registrados.
  - Porcentaje de animales activos/inactivos.
  - Distribución por género (machos/hembras).
  - Estado de crianza (animales amamantando).

#### Estadísticas por Explotación
- **Descripción**: Proporciona métricas específicas de una explotación seleccionada.
- **Endpoint Utilizado**: `/api/v1/dashboard/explotacions/{id}`.
- **Detalles**:
  - Total de animales en la explotación.
  - Distribución por tipo (toros, vacas, terneros).
  - Estadísticas de partos asociados a la explotación.

#### Actividad Reciente
- **Descripción**: Lista eventos recientes en el sistema, como cambios en animales o explotaciones.
- **Endpoint Utilizado**: `/api/v1/dashboard/recientes`.
- **Detalles**:
  - Cambios en el estado de animales.
  - Nuevos registros de partos.
  - Actualizaciones en explotaciones.

#### Gráficos y KPIs
- **Descripción**: Incluye gráficos de distribución de animales y métricas clave de rendimiento.
- **Detalles**:
  - Gráficos de barras para distribución por estado.
  - Gráficos de pastel para distribución por género.
  - KPIs destacados en tarjetas (StatCards).

#### Filtros y Navegación
- **Descripción**: Permite filtrar datos por explotación, rango de fechas y tipo de actividad.
- **Problemas Detectados**:
  - **Rangos de Fechas**: No son aceptables según las reglas del CSV.
  - **Inconsistencias en Nombres de Campos**: Uso de términos como "región" o "provincia" que no están en el CSV.

#### Tabs y Visualización de Datos
- **Tabs Disponibles**:
  - Estadísticas generales.
  - Detalles de explotaciones.
  - Resumen básico.
  - Estadísticas de partos.
  - Datos combinados.
  - Actividad reciente.
- **Visualización**:
  - Uso de componentes como `StatCard` y `StatusDistribution` para mostrar datos clave y distribuciones.

#### Carga de Datos
- **Servicios Utilizados**:
  - `getDashboardStats`, `getExplotaciones`, `getPartosStats`, `getCombinedDashboard`, `getRecentActivities`.
- **Manejo de Errores**:
  - Implementa lógica de reintento para errores de red.
  - Usa datos simulados como fallback (no aceptable en producción).

#### Interactividad
- **Selector de Explotación**:
  - Permite filtrar datos por explotación.
- **Pestañas Dinámicas**:
  - Cambia el contenido según la pestaña activa.

### Problemas Detectados

#### Modo Oscuro
- **Descripción**: Algunos elementos, como las tarjetas, no se adaptan bien al modo oscuro.
- **Impacto**: Afecta la legibilidad y la experiencia de usuario.
- **Solución Propuesta**:
  - Ajustar estilos de tarjetas y gráficos para mejorar la visibilidad.
  - Usar clases de Tailwind específicas para modo oscuro (`dark:`).

#### Errores en Endpoints
- **Descripción**: Algunos endpoints, como `/api/v1/dashboard/combined`, han presentado errores en pruebas previas.
- **Impacto**: Datos incompletos o incorrectos en el dashboard.
- **Solución Propuesta**:
  - Revisar y optimizar las consultas a la base de datos desde el backend.
  - Implementar pruebas automatizadas para validar respuestas de endpoints.

#### Conexión a la Base de Datos
- **Descripción**: Problemas de inicialización de la base de datos en el backend.
- **Impacto**: Afecta la recuperación de datos para el dashboard.
- **Solución Propuesta**:
  - Implementar un sistema de reconexión automática en caso de fallos.
  - Mejorar el manejo de errores en el backend.

#### Manejo de Errores
- **Descripción**: El manejo de errores en el frontend podría mejorarse para proporcionar mensajes más claros al usuario.
- **Impacto**: Confusión para el usuario final.
- **Solución Propuesta**:
  - Implementar mensajes de error más descriptivos.
  - Mostrar sugerencias de acción cuando ocurra un error.

1. **Uso de Datos Simulados**:
   - Actualmente, se utilizan datos simulados como fallback, lo cual no es aceptable para producción.

2. **Complejidad del Componente**:
   - `Dashboard.tsx` maneja demasiadas responsabilidades, dificultando su mantenimiento.

3. **Modo Oscuro**:
   - Algunos componentes, como gráficos y tarjetas, necesitan ajustes para mejorar la legibilidad en modo oscuro.

4. **Accesibilidad**:
   - Los gráficos de barras en `StatusDistribution` dependen únicamente de colores, lo que puede ser problemático para usuarios con daltonismo.

### Análisis de Componentes

#### `StatCard.tsx`
- **Funcionalidad**:
  - Tarjeta reutilizable para mostrar estadísticas clave.
  - Soporta colores temáticos, iconos, subtítulos y descripciones.
- **Problemas Detectados**:
  1. Contraste en modo oscuro para algunos colores (e.g., `warning`).

#### `StatusDistribution.tsx`
- **Funcionalidad**:
  - Visualiza distribuciones de datos en un gráfico de barras horizontal.
  - Incluye una leyenda con etiquetas, valores y porcentajes.
- **Problemas Detectados**:
  1. Accesibilidad limitada debido a la dependencia de colores.
  2. Contraste de texto en modo oscuro podría mejorarse.

### Próximos Pasos

1. **Eliminar Datos Simulados**:
   - Conectar todos los componentes con datos reales del backend.

2. **Refactorizar `Dashboard.tsx`**:
   - Dividir responsabilidades en componentes más pequeños.

3. **Mejorar Modo Oscuro**:
   - Ajustar colores y contrastes en componentes como `StatCard` y `StatusDistribution`.

4. **Aumentar Accesibilidad**:
   - Añadir patrones o etiquetas a los gráficos para usuarios con daltonismo.

5. **Optimizar Manejo de Errores**:
   - Proporcionar mensajes de error más descriptivos y específicos.

---

## Módulo: Explotaciones

### Funcionalidades Existentes

#### Listado de Explotaciones
- **Descripción**: Muestra un listado de explotaciones con detalles básicos.
- **Detalles**:
  - Nombre de la explotación.
  - Código de identificación.
  - Responsable.
  - Estado (activa/inactiva).

#### Filtro por Región
- **Descripción**: Permite filtrar explotaciones por región.
- **Problema**: Este campo no existe en el CSV y no tiene sentido mantenerlo.
- **Solución Propuesta**: Eliminar este filtro.

#### Botón de Exportar
- **Descripción**: Permite exportar datos de explotaciones.
- **Detalles**:
  - Exportar un listado de animales de la explotación seleccionada.
  - Exportar un resumen general de todas las explotaciones.

#### Placeholder para Explotaciones Vacías
- **Descripción**: Muestra un mensaje cuando no hay explotaciones registradas.
- **Problema**: No aporta valor informativo.
- **Solución Propuesta**: Reemplazar por un conjunto de tarjetas (cards) con:
  - Nombre de la explotación.
  - Total de animales.
  - Sumatorios parciales de toros, vacas y terneros.

### Funcionalidades Faltantes o Mejorables

#### Resumen de Explotaciones
- **Descripción**: Mostrar tarjetas con información resumida de cada explotación.
- **Detalles**:
  - Nombre de la explotación.
  - Total de animales.
  - Total de toros, vacas y terneros (calculados según el estado de amamantamiento).

#### Listado de Animales por Explotación
- **Descripción**: Al buscar una explotación, mostrar los animales que pertenecen a ella.
- **Detalles**:
  - Nombre y tipo de cada animal.
  - Estado actual (activo/inactivo).

#### Cambio de "Filtrar" por "Buscar"
- **Descripción**: El botón debe reflejar su funcionalidad real.
- **Impacto**: Mejora la claridad para el usuario.

### Análisis del Módulo de Explotaciones

#### Funcionalidades Existentes

1. **Búsqueda y Filtros**:
   - Campo de búsqueda por nombre o código de explotación.
   - Filtro por región (aunque no está soportado en el CSV).

2. **Listado de Explotaciones**:
   - Muestra tarjetas con información básica de cada explotación:
     - Nombre, código, responsable, región, estado (activa/inactiva) y número de animales.
   - Incluye un botón para ver detalles de cada explotación.

3. **Exportación de Datos**:
   - Genera un archivo CSV con los datos de las explotaciones visibles.

4. **Placeholder para Explotaciones Vacías**:
   - Muestra un mensaje cuando no hay explotaciones registradas.

#### Problemas Detectados

1. **Filtro por Región**:
   - Este campo no está soportado en el CSV y debe eliminarse.

2. **Dependencia de Datos Simulados**:
   - Actualmente, los datos de animales por explotación se cargan dinámicamente, pero no se valida su consistencia con los datos reales.

3. **Exportación Limitada**:
   - La exportación solo incluye las explotaciones visibles, lo que puede ser confuso para el usuario.

4. **Modo Oscuro**:
   - Algunos elementos, como las tarjetas, necesitan ajustes para mejorar la legibilidad en modo oscuro.

#### Próximos Pasos

1. **Eliminar el Filtro por Región**:
   - Ajustar la interfaz para que no incluya este filtro.

2. **Validar Datos Reales**:
   - Asegurar que los datos de animales por explotación coincidan con los datos reales del backend.

3. **Mejorar la Exportación**:
   - Permitir la exportación de todas las explotaciones, no solo las visibles.

4. **Optimizar el Modo Oscuro**:
   - Ajustar colores y contrastes en las tarjetas y otros elementos visuales.

5. **Refactorizar Código**:
   - Simplificar la lógica de carga y renderizado de explotaciones para mejorar el mantenimiento.

---

## Módulo: Animales

### Funcionalidades Existentes

#### Ventana Principal de Animales
- **Barra de Búsqueda y Filtros**:
  - Filtros por explotación, género, estado y estado de amamantamiento.
  - Campo de búsqueda por nombre o código.
- **Listado de Animales**:
  - Tabla con columnas para tipo, nombre, código, explotación, estado y acciones.
  - Iconografía específica para género (♂️/♀️) y estado (activo/inactivo).
  - Paginación y ordenamiento.

#### Ficha de Animal
- **Datos Generales**:
  - Información básica como nombre, código, género, explotación, cuadra, fecha de nacimiento, etc.
- **Historial de Partos**:
  - Lista cronológica de partos asociados al animal.
  - Incluye género y estado de las crías.
- **Historial de Cambios**:
  - Registro de modificaciones realizadas en la ficha del animal.

#### Actualizar Ficha de Animal
- **Datos Generales**:
  - Formulario para editar información básica.
- **Cambios Habituales**:
  - Actualización de estado (activo/inactivo).
  - Gestión del estado de amamantamiento (0, 1 o 2 terneros).
  - Registro de nuevos partos.

#### Nueva Ficha de Animal
- Formulario para registrar un nuevo animal.
- Campos obligatorios y opcionales basados en el CSV.
- Validación en tiempo real.

### Problemas Detectados

1. **Campos Faltantes**:
   - En la ventana de "Nueva Ficha de Animal", faltan campos como `pare`, `mare`, `quadra`, y `num_serie`, que están presentes en el CSV.

2. **Datos Simulados**:
   - Actualmente, los datos mostrados son simulados. Es necesario conectar con la base de datos real para trabajar con datos auténticos.

3. **Validaciones**:
   - Asegurar que las validaciones de campos como `dob`, `genere`, y `estado` coincidan con las reglas del CSV.

4. **Partos como Dependencia de Vacas**:
   - Los partos no son entidades independientes, sino que dependen de las vacas. Esto debe reflejarse en la lógica del frontend y backend.

### Próximos Pasos

1. **Completar Campos Faltantes**:
   - Añadir los campos que faltan en el formulario de nueva ficha y en la vista de actualización.

2. **Conexión con Datos Reales**:
   - Sustituir los datos simulados por datos reales de la base de datos.

3. **Validaciones y Reglas de Negocio**:
   - Implementar validaciones estrictas para los campos según las reglas del CSV.

4. **Optimización de la Interfaz**:
   - Revisar y mejorar la experiencia de usuario en todas las vistas.

5. **Integración de Partos**:
   - Asegurar que los partos se gestionen correctamente como dependencias de las vacas, reflejando su historial y estado de amamantamiento.

---

## Análisis de Componentes del Módulo de Animales

### `AnimalTable.tsx`
- **Funcionalidad**:
  - Muestra una tabla con el listado de animales.
  - Incluye paginación, manejo de errores y acciones como "Ver" y "Actualizar".
- **Problemas Detectados**:
  1. Uso de datos simulados en caso de error.
  2. Dependencia de la columna `estado_t`, que no debería existir según el CSV.
  3. Falta de validaciones para los datos mostrados.

### `AnimalForm.tsx`
- **Funcionalidad**:
  - Gestiona los formularios para crear y actualizar animales.
  - Carga listas de padres y madres potenciales según la explotación seleccionada.
- **Problemas Detectados**:
  1. Uso de datos simulados para padres/madres en caso de error.
  2. Validaciones limitadas para campos como `num_serie` y `dob`.
  3. Dependencia de explotaciones para completar el formulario.

### `AnimalFilters.tsx`
- **Funcionalidad**:
  - Proporciona filtros para la ventana principal de animales.
  - Incluye filtros por explotación, género, estado, estado de amamantamiento y búsqueda por texto.
- **Problemas Detectados**:
  1. Dependencia de explotaciones para el filtro correspondiente.
  2. Falta de validaciones para los valores de los filtros.

### `AnimalIcon.tsx`
- **Funcionalidad**:
  - Muestra un icono representativo del animal según su tipo y estado.
- **Problemas Detectados**:
  1. Uso limitado de estados (e.g., no considera estados personalizados).
  2. Uso de emojis como iconos, lo que podría afectar la accesibilidad y consistencia visual.

---

## Conexión con Backend y Endpoints

### Endpoints Relacionados con Animales
- **GET `/api/v1/animals/`**: Listado de animales con filtros y paginación.
- **GET `/api/v1/animals/{id}`**: Detalles de un animal, incluyendo historial de partos.
- **POST `/api/v1/animals/`**: Crear un nuevo animal.
- **PUT `/api/v1/animals/{id}`**: Actualizar un animal existente.
- **DELETE `/api/v1/animals/{id}`**: Eliminar un animal (soft delete).

### Problemas Detectados en la Conexión
1. **Inconsistencias en las URLs**:
   - Algunos servicios usan rutas relativas y otros incluyen el prefijo `/api/v1`.
2. **Manejo de Respuestas**:
   - Falta de estandarización en las estructuras de respuesta.
3. **Validaciones en Backend**:
   - Asegurar que los valores de `genere`, `estado` y `alletar` coincidan con las enumeraciones definidas.

---

## Problemas Generales Detectados

### Inconsistencias en Nombres de Campos
- **Descripción**: Uso de términos como "región" o "provincia" que no están en el CSV. (NO ESTAN PERMITIDOS)
- **Impacto**: Puede causar errores de programación y confusión.
- **Solución Propuesta**:
  - Estandarizar los nombres de campos según el CSV.
  - Documentar claramente los nombres aceptados.

### Inconsistencias en Rutas
- **Descripción**: Diferencias en cómo se llaman las rutas en diferentes partes del sistema.
- **Impacto**: Problemas de sintaxis y errores de conexión.
- **Solución Propuesta**:
  - Crear una lista centralizada de rutas y sus usos.
  - Implementar constantes para evitar errores tipográficos.

---

## Próximos Pasos

1. **Documentar las dependencias entre módulos**:
   - Cómo el módulo de explotaciones interactúa con el de animales.
   - Qué endpoints del backend son necesarios para completar las funcionalidades faltantes.

2. **Definir prioridades**:
   - Implementar primero las funcionalidades críticas (búsqueda, listado de animales, exportación).
   - Mejorar la experiencia de usuario en el dashboard.

3. **Revisar la integración con el backend**:
   - Verificar que los endpoints necesarios están implementados y funcionales.
   - Asegurar que las respuestas del backend cumplen con los requisitos del frontend.

4. **Planificar mejoras futuras**:
   - Añadir estadísticas avanzadas en el dashboard.
   - Optimizar el rendimiento de la carga de datos en explotaciones y animales.