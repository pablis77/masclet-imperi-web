# Documentación de Tests para Endpoints de Animales

## Tabla de Endpoints

| Endpoint                  | Método | Descripción               | Tests Asociados          | Estado | Detalle de salida de cada test | Funcionalidad Cubierta | Propósito del Test | Discrepancias con nuestro CSV | Notas | Encaje en Frontend |
|---------------------------|--------|---------------------------|--------------------------|--------|-------------------------------|------------------------|--------------------|-------------------------------|-------|--------------------|
| `/api/v1/animals/` | GET | Listar animales | `test_animals_list.py` | ✅ | Exitoso | Listado con filtros | Verificar filtros | Los campos se devuelven en minúsculas | Soporta múltiples filtros, estructura paginada | Listado de animales |
| `/api/v1/animals/{animal_id}/` | GET | Obtener animal | `test_animals_get.py` | ✅ | Exitoso | Detalle de animal | Verificar detalle | Los campos se devuelven en minúsculas | Incluye todos los campos del CSV | Ficha de animal |
| `/api/v1/animals/` | POST | Crear animal | `test_animals_create.py` | ❌ | Error 500 | Creación | Verificar validaciones | Problema con la columna "explotaci" | Requiere campos en minúsculas | Formulario de creación |
| `/api/v1/animals/{animal_id}/` | PUT | Actualizar animal | `test_animals_update.py` | ❓ | Pendiente | Actualización | Verificar cambios | N/A | Validaciones de estado | Formulario de edición |
| `/api/v1/animals/{animal_id}/` | DELETE | Eliminar animal | `test_animals_delete.py` | ❓ | Pendiente | Eliminación | Verificar eliminación | N/A | Ninguna | Botón de eliminación |

## Detalles de los tests de animales

### `test_animals_get.py`
- **Descripción**: Prueba para obtener un animal por ID
- **Estado**: ✅ Exitoso
- **Implementación**: Obtiene la lista de animales, selecciona uno existente y verifica que se puede obtener por ID
- **Campos verificados**: nom, genere, explotacio, estado, alletar, mare, pare, quadra, cod, num_serie, dob, part
- **Observaciones**: 
  - Los campos se devuelven en minúsculas, no en mayúsculas o camelCase
  - La respuesta tiene una estructura anidada: `{"status": "success", "data": {...}}`
  - El endpoint requiere autenticación mediante token Bearer

### `test_animals_create.py`
- **Descripción**: Prueba para crear un animal
- **Estado**: ❌ Error 500
- **Problema detectado**: Error en la base de datos: "no existe la columna «explotaci»"
- **Posibles soluciones**: 
  - Revisar el esquema de la base de datos y corregir el nombre de la columna
  - Verificar si hay un problema de mapeo entre el modelo y la base de datos
- **Requisitos de entrada**: 
  - Los campos deben enviarse en minúsculas (nom, genere, explotacio)
  - Campos mínimos requeridos: nom, genere, explotacio

## Consideraciones generales para los endpoints de animales

1. **Autenticación**: Todos los endpoints requieren autenticación mediante token Bearer
2. **Formato de campos**: 
   - Para enviar datos (POST/PUT), los campos deben estar en minúsculas
   - En las respuestas, los campos también vienen en minúsculas
3. **Estructura de respuesta**: Todas las respuestas siguen el formato `{"status": "success", "data": {...}}`
4. **Listado de animales**: 
   - El endpoint de listado devuelve una estructura paginada
   - Formato: `{"status": "success", "data": {"total": X, "offset": Y, "limit": Z, "items": [...]}}`
5. **Campos del CSV**: Todos los campos definidos en el CSV están presentes en las respuestas de la API

## Problemas identificados

1. **Creación de animales**: El endpoint para crear animales está fallando con un error 500 relacionado con la columna "explotaci"
2. **Inconsistencia en nombres de campos**: Hay discrepancias entre los nombres de campos esperados por el backend y los definidos en el CSV
3. **Documentación incompleta**: No hay documentación clara sobre el formato esperado para los campos de fecha y enumeraciones
