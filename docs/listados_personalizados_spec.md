# Especificación: Sistema de Listados Personalizados

## Descripción General

Este documento describe la implementación de un sistema modular de listados personalizados para la aplicación Masclet Imperi Web. La funcionalidad permitirá a los usuarios crear, guardar y exportar listas personalizadas de animales para diferentes propósitos como vacunación, revisiones, etc.

## Enfoque de Desarrollo

- **Desarrollo Modular**: Todos los componentes se desarrollarán en archivos separados y compartimentados.
- **Sección Independiente**: Se creará una nueva sección en la aplicación, independiente del código existente.
- **Pruebas Aisladas**: Se probará toda la funcionalidad de forma aislada antes de integrarse con el resto de la aplicación.
- **Manejo Correcto de Relaciones**: Se ha implementado un enfoque manual para la creación de respuestas en los endpoints para evitar problemas con campos como `created_by` al convertir entre modelos ORM y esquemas Pydantic.

## Estructura de Archivos

```
/frontend/src/pages/listados/
  ├── index.astro         # Página principal de listados
  ├── crear.astro         # Crear nuevo listado
  ├── gestionar.astro     # Gestionar listados guardados
  └── [id].astro          # Ver/editar un listado específico

/frontend/src/components/listados/
  ├── AnimalesSelector.tsx       # Componente para selección de animales
  ├── FiltrosAvanzados.tsx       # Filtros avanzados reutilizables
  ├── ListadoForm.tsx            # Formulario para crear/editar listados
  ├── ListadosTable.tsx          # Tabla de listados guardados
  ├── AnimalesSeleccionados.tsx  # Vista de animales seleccionados
  └── PDFExporter.tsx            # Exportador de PDF específico para listados

/frontend/src/services/
  └── listadosService.ts         # Servicio para operaciones con listados

/backend/app/api/v1/routers/
  └── listados.py                # Endpoints específicos para listados

/backend/app/models/
  └── listado.py                 # Modelo para listados personalizados

/backend/app/schemas/
  └── listado.py                 # Esquemas Pydantic para listados
```

## Modelo de Datos

### Tabla de Listados (Nueva)

```sql
CREATE TABLE listados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE
);
```

### Tabla de Relación Listados-Animales (Nueva)

```sql
CREATE TABLE listado_animal (
    id SERIAL PRIMARY KEY,
    listado_id INTEGER NOT NULL REFERENCES listados(id) ON DELETE CASCADE,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    notas TEXT,
    UNIQUE (listado_id, animal_id)
);
```

## Endpoints API

Crearemos los siguientes endpoints nuevos:

```
# Listados
GET    /api/v1/listados                     # Listar todos los listados
POST   /api/v1/listados                     # Crear nuevo listado
GET    /api/v1/listados/{id}                # Obtener un listado específico
PUT    /api/v1/listados/{id}                # Actualizar un listado
DELETE /api/v1/listados/{id}                # Eliminar un listado
POST   /api/v1/listados/{id}/animals        # Añadir animales a un listado
DELETE /api/v1/listados/{id}/animals/{animalId} # Quitar un animal de un listado
GET    /api/v1/listados/{id}/export-pdf     # Exportar listado a PDF
```

## Funcionalidades a Implementar

### 1. Mejora de Filtros Actuales

- **Filtros avanzados**:
  - [  ] Por nombre/código (búsqueda parcial y exacta)
  - [  ] Por rango de edad (basado en fecha de nacimiento)
  - [  ] Por explotación o múltiples explotaciones
  - [  ] Por estado del animal (activo, fallecido)
  - [  ] Por género (macho/hembra)
  - [  ] Por estado de amamantamiento (para vacas)

- **Guardado de filtros**:
  - [  ] Posibilidad de guardar combinaciones de filtros con nombres descriptivos
  - [  ] Carga rápida de filtros guardados previamente

### 2. Sistema de Selección Manual

- [  ] Casillas de verificación junto a cada animal en la tabla
- [  ] Botones de acción masiva (Seleccionar todos, Invertir selección, Deseleccionar todos)
- [  ] Contador de selección que muestre cuántos animales están actualmente seleccionados
- [  ] Barra de herramientas que aparece cuando hay animales seleccionados

### 3. Gestión de Listas Personalizadas

- **Guardado de listas**:
  - [  ] Guardar una selección actual como una "Lista personalizada"
  - [  ] Asignar nombre, descripción y fecha a la lista
  - [  ] Categorizar listas (vacunación, revisión, tratamiento, etc.)

- **Panel de listas guardadas**:
  - [  ] Visualización de todas las listas creadas
  - [  ] Ordenación por fecha, nombre o categoría
  - [  ] Posibilidad de editar listas existentes añadiendo o quitando animales

### 4. Exportación e Impresión

- **Exportación a PDF**:
  - [  ] Documento optimizado para operarios en campo
  - [  ] Formato tabular con información relevante y espacio para anotaciones
  - [  ] Opción para incluir o no observaciones y notas
  - [  ] Logo corporativo y cabecera profesional

- **Opciones de impresión**:
  - [  ] Posibilidad de imprimir directamente desde la aplicación
  - [  ] Vista previa de impresión
  - [  ] Ajuste automático para papel A4 con orientación óptima

## Plan de Implementación

### Fase 1: Crear estructura básica y modelos

- [x] Crear estructura de archivos y directorios
- [x] Implementar modelos y esquemas en el backend
- [x] Crear endpoints básicos
- [x] Pruebas de la API

### Fase 2: Implementar componentes básicos

- [x] Desarrollar componentes de UI principales (Página principal implementada)
- [  ] Crear el selector de animales con casillas
- [  ] Implementar filtros avanzados

### Fase 3: Funcionalidad principal

- [x] Implementar guardado de listados (API backend implementada)
- [x] Crear vista de gestión de listados (Estructura base implementada)
- [  ] Desarrollar la exportación PDF específica (API endpoint creado, falta implementación en frontend)

### Fase 4: Pruebas y refinamiento

- [x] Probar la funcionalidad completa en la sección separada (Tests de backend completados)
- [  ] Refinar la interfaz y corregir errores
- [  ] Optimizar rendimiento

### Fase 5: Integración

- [  ] Decidir cómo integrar con la aplicación principal
- [  ] Implementar enlaces desde las secciones existentes
- [  ] Asegurar coherencia visual y funcional

## Observaciones sobre Estructura Existente

Basándonos en la información proporcionada sobre los endpoints y la estructura de la base de datos:

### Tablas Existentes Relevantes
- `animals`: Contiene la información principal de los animales
- `part`: Contiene información sobre partos (relacionada con animales mediante `animal_id`)

### Endpoints Existentes Relevantes
- Los endpoints de `animals` nos permitirán obtener los datos de los animales
- No hay endpoints específicos para "explotaciones" operativos actualmente


## Estado Actual (23/05/2025)

### Backend ✅

- **Endpoints desarrollados y funcionando correctamente:**
  - GET /api/v1/listados
  - POST /api/v1/listados
  - GET /api/v1/listados/{id}
  - PUT /api/v1/listados/{id}
  - DELETE /api/v1/listados/{id}
  - POST /api/v1/listados/{id}/animals
  - DELETE /api/v1/listados/{id}/animals/{animalId}
  - GET /api/v1/listados/{id}/export-pdf

- **Modelos y esquemas completados:**
  - Modelo `Listado`  
  - Relación `ListadoAnimal`
  - Esquemas Pydantic para validación

- **Tests:**
  - Tests funcionales que verifican todos los endpoints
  - Corregidos problemas con el campo `created_by`

### Frontend 🔄
- **Implementado:**
  - Página principal (`index.astro`) con estructura base para mostrar listados
  - Interfaz para visualizar listados existentes

- **Pendiente de implementar:**
  - Página de creación de listados (`nuevo.astro`)
  - Página de detalle/edición de listados (`[id].astro`)
  - Componentes para selección de animales
  - Filtros avanzados
  - Exportación a PDF en el frontend

## Próximos Pasos

1. Completar las páginas del frontend:
   - Crear la página `nuevo.astro` para crear listados
   - Implementar la página `[id].astro` para ver/editar listados

2. Desarrollar los componentes esenciales:
   - `AnimalesSelector.tsx`: Para seleccionar animales en los listados
   - `FiltrosAvanzados.tsx`: Para filtrar animales
   - `ListadoForm.tsx`: Formulario para crear/editar listados

3. Implementar la funcionalidad de exportación a PDF en el frontend

## Notas Adicionales

- No se modificará la arquitectura general del proyecto en este momento
- Todo el desarrollo se realizará en archivos separados para facilitar la integración posterior
- Se mantendrá una estructura de pruebas para verificar cada componente
