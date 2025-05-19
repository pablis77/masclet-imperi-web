# Análisis de la Estructura de Masclet Imperi Web

## 1. Análisis de archivos por ventana

### DASHBOARD

**Archivos frontend principales:**

- `frontend/src/pages/dashboard.astro` - Página principal
- `frontend/src/components/dashboard/DashboardEnhanced.tsx` - Componente principal con lógica y estado
- `frontend/src/components/dashboard/DashboardFilters.tsx` - Filtros para el dashboard
- `frontend/src/components/dashboard/StatCard.tsx` / `StatsCard.tsx` - Tarjetas de estadísticas
- `frontend/src/components/dashboard/GenderDistributionChart.tsx` - Gráfico de distribución por género
- `frontend/src/components/dashboard/StatusDistributionChart.tsx` - Gráfico de distribución por estado
- `frontend/src/components/dashboard/PartosChart.tsx` - Gráfico de partos

**Archivos backend:**

- `backend/app/api/endpoints/dashboard.py` - Endpoints API
- `backend/app/services/dashboard_service.py` - Servicios y lógica de negocio
- `backend/app/schemas/dashboard.py` - Esquemas Pydantic para validación

### EXPLOTACIONES

**Archivos frontend principales:**

- `frontend/src/pages/explotacions/index.astro` - Página de listado
- `frontend/src/pages/explotacions/[id].astro` - Página de detalle
- `frontend/src/components/Explotaciones.tsx` - Componente principal
- `frontend/src/components/explotacions/ExplotacionAnimals.tsx` - Lista de animales por explotación

**Archivos backend:**

- `backend/app/api/endpoints/explotacions.py` - Endpoints API
- `backend/app/services/explotacio_service.py` - Servicios y lógica
- `backend/app/models/animal.py` - Modelo (incluye campo explotacio)

### ANIMALES

**Archivos frontend principales:**

- `frontend/src/pages/animals/index.astro` - Página de listado
- `frontend/src/pages/animals/[id].astro` - Página de detalle
- `frontend/src/pages/animals/new.astro` - Creación
- `frontend/src/pages/animals/edit/[id].astro` - Edición
- `frontend/src/components/animals/AnimalTable.tsx` - Tabla de listado
- `frontend/src/components/animals/AnimalForm.tsx` - Formulario de edición/creación
- `frontend/src/components/animals/PartoForm.astro` - Formulario de partos

**Archivos backend:**

- `backend/app/api/endpoints/animals.py` - Endpoints API
- `backend/app/services/animal_service.py` - Servicios y lógica
- `backend/app/models/animal.py` - Modelo principal

### IMPORTACIONES

**Archivos frontend principales:**

- `frontend/src/pages/imports/index.astro` - Página principal
- `frontend/src/components/imports/ImportForm.tsx` - Formulario subida
- `frontend/src/components/imports/ImportHistory.tsx` - Historial
- `frontend/src/components/imports/ImportCsv.tsx` - Lógica importación CSV

**Archivos backend:**

- `backend/app/api/endpoints/imports.py` - Endpoints API
- `backend/app/services/import_service.py` - Servicios y lógica
- `backend/app/models/import_model.py` - Modelo de importación

## 2. Funciones y relaciones entre archivos

### DASHBOARD

- **DashboardEnhanced.tsx** contiene:

  - `fetchResumenData()` - Obtiene datos generales
  - `fetchStatsData()` - Obtiene estadísticas detalladas
  - `fetchPartosData()` - Obtiene datos de partos
  - `fetchCombinedData()` - Obtiene datos combinados
  - `renderGenderChart()` - Genera gráfico de género
  - `renderStatusChart()` - Genera gráfico de estado
  - `loadAllData()` - Punto de inicio que coordina todas las solicitudes
- **apiService.ts**: Proporciona funciones para conectarse al backend con manejo de autenticación
- **Dependencias**: ChartJS, React-ChartJS-2 para visualizaciones

### EXPLOTACIONES

- **Explotaciones.tsx** contiene:

  - `fetchExplotacions()` - Obtiene listado
  - `handleSelectExplotacio()` - Maneja selección
- **ExplotacionAnimals.tsx** contiene:

  - `fetchAnimals()` - Obtiene animales de una explotación
  - `renderAnimalTable()` - Genera tabla de animales

### ANIMALES

- **AnimalTable.tsx** contiene:

  - `fetchAnimals()` - Obtiene listado con paginación
  - `handleFilter()` - Maneja filtros
  - `handleDelete()` - Maneja eliminación
- **AnimalForm.tsx** contiene:

  - `fetchAnimal()` - Obtiene detalles de un animal
  - `handleSubmit()` - Envía el formulario
  - `validateForm()` - Valida datos

### IMPORTACIONES

- **ImportForm.tsx** contiene:

  - `handleFileUpload()` - Maneja archivo subido
  - `submitImport()` - Envía archivo al servidor
- **ImportHistory.tsx** contiene:

  - `fetchHistory()` - Obtiene historial de importaciones
  - `fetchImportDetails()` - Obtiene detalles de una importación

## 3. Endpoints utilizados por cada ventana

### DASHBOARD

- **GET** `/api/v1/dashboard/resumen/` - Datos generales
- **GET** `/api/v1/dashboard/stats` - Estadísticas detalladas
- **GET** `/api/v1/dashboard/partos` - Estadísticas de partos
- **GET** `/api/v1/dashboard/combined` - Datos combinados
- **GET** `/api/v1/dashboard/explotacions` - Lista de explotaciones

### EXPLOTACIONES

- **GET** `/api/v1/explotacions` - Listado de explotaciones
- **GET** `/api/v1/explotacions/{id}` - Detalles de explotación
- **GET** `/api/v1/animals?explotacio={id}` - Animales de una explotación

### ANIMALES

- **GET** `/api/v1/animals` - Listado de animales (con filtros)
- **GET** `/api/v1/animals/{id}` - Detalles de animal
- **POST** `/api/v1/animals` - Crear animal
- **PUT** `/api/v1/animals/{id}` - Actualizar animal
- **DELETE** `/api/v1/animals/{id}` - Eliminar animal
- **POST** `/api/v1/animals/{id}/partos` - Añadir parto a animal

### IMPORTACIONES

- **POST** `/api/v1/imports` - Subir archivo para importación
- **GET** `/api/v1/imports` - Obtener historial de importaciones
- **GET** `/api/v1/imports/{id}` - Obtener detalles de una importación

## 4. Propuesta de conexión frontend-backend (EN PRINCIPIO ESTO ESTA ARREGLADO, asi que ste punto 4 queda anulado)

### Problemas actuales identificados:

1. Inconsistencia en nombres de campos entre frontend y backend (ej: ultimo_año vs ultimo_anio)
2. Validaciones Pydantic incorrectas (campos requeridos mal definidos)
3. Manejo de errores incompleto en el frontend
4. Mezcla de datos reales y simulados

### Propuestas de solución:

1. **Estandarizar nomenclatura**: Asegurar que los nombres de campos sean consistentes

   - Usar solo `ultimo_anio` en lugar de `ultimo_año` en todos los endpoints
   - Documentar todos los campos requeridos por cada endpoint
2. **Mejorar esquemas Pydantic**:

   - Revisar todos los esquemas de respuesta (PartosResponse, DashboardResponse)
   - Establecer valores predeterminados para campos opcionales
3. **Mejorar gestión de errores**:

   - Implementar manejo estándar de errores en el frontend
   - Definir estructura de respuesta de error consistente en el backend
4. **Separación clara de datos reales/simulados**:

   - Crear endpoint de modo "demo" específico para datos simulados
   - Marcar claramente en la UI cuando se muestran datos simulados

## 5. Diagrama de flujo de funcionamiento

### Diagrama general (LOGIN → DASHBOARD):

```
[LOGIN] → Autenticación con OAuth2 (JWT) → Almacena token en localStorage
    ↓
[DASHBOARD] → Verificación de token → Solicitudes paralelas a endpoints:
    ↓                                      ↓           ↓            ↓
resumen/ → Datos básicos       stats/ → Estadísticas  partos/ → Datos partos
    ↓                              ↓                      ↓  
  Procesar datos              Procesar datos         Procesar datos
    ↓                              ↓                      ↓
  Renderizar componentes visuales y mostrar resultados al usuario
```

### Flujo en detalle para cada ventana:

- **DASHBOARD**: Login → Cargar datos de múltiples endpoints → Mostrar visualizaciones
- **EXPLOTACIONES**: Login → Cargar lista → Selección → Cargar detalles y animales
- **ANIMALES**: Login → Cargar lista con filtros → Paginación → Ver/Editar/Crear
- **IMPORTACIONES**: Login → Subir archivo → Procesar en backend → Actualizar estado

## 6. Archivos temporales/duplicados a eliminar

Identificados varios archivos que parecen ser duplicados o temporales:

- `dashboard-*.astro` - Múltiples variantes (simple, direct, test, new...)
- `explotacions\_*.astro` - Versiones duplicadas con prefijo
- `animals\update\_*.astro` - Archivos temporales
- Archivos con prefijo "\_\_" que indican versiones de respaldo

**Recomendación**: Mantener solo las versiones activas y eliminar el resto para reducir la confusión.

## Sugerencias adicionales:

1. **Crear documentación centralizada de la API**:

   - Esquema OpenAPI/Swagger completo
   - Mapeo entre endpoints y componentes frontend
2. **Implementar pruebas automatizadas**:

   - Tests unitarios para servicios del backend
   - Tests de componentes para el frontend
   - Tests de integración para flujos completos
3. **Mejorar estructura de proyecto**:

   - Organizar componentes por funcionalidad más que por tipo
   - Implementar un sistema de tipos TypeScript más sólido
4. **Revisar patrón de estado global**:

   - Considerar implementar Context API o Redux para estado compartido
   - Centralizar lógica de autenticación y manejo de errores
