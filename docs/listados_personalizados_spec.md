# Especificación: Sistema de Listados Personalizados

## Descripción General

Este documento describe la implementación de un sistema modular de listados personalizados para la aplicación Masclet Imperi Web. La funcionalidad permitirá a los usuarios crear, guardar y exportar listas personalizadas de animales para diferentes propósitos como vacunación, revisiones, etc.

## Enfoque de Desarrollo

- **Desarrollo Modular**: Todos los componentes se desarrollarán en archivos separados y compartimentados.
- **Sección Independiente**: Se creará una nueva sección en la aplicación, independiente del código existente.
- **Pruebas Aisladas**: Se probará toda la funcionalidad de forma aislada antes de integrarse con el resto de la aplicación.

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

- [  ] Crear estructura de archivos y directorios
- [  ] Implementar modelos y esquemas en el backend
- [  ] Crear endpoints básicos
- [  ] Pruebas de la API

### Fase 2: Implementar componentes básicos

- [  ] Desarrollar componentes de UI principales
- [  ] Crear el selector de animales con casillas
- [  ] Implementar filtros avanzados

### Fase 3: Funcionalidad principal

- [  ] Implementar guardado de listados
- [  ] Crear vista de gestión de listados
- [  ] Desarrollar la exportación PDF específica

### Fase 4: Pruebas y refinamiento

- [  ] Probar la funcionalidad completa en la sección separada
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

## Próximos Pasos

1. Empezar por la implementación de los modelos de base de datos para listados
2. Implementar los endpoints básicos para gestionar listados
3. Desarrollar la interfaz de usuario para la selección de animales
4. Implementar la exportación a PDF específica para listados

## Notas Adicionales

- No se modificará la arquitectura general del proyecto en este momento
- Todo el desarrollo se realizará en archivos separados para facilitar la integración posterior
- Se mantendrá una estructura de pruebas para verificar cada componente
