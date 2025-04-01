# Cambios en el modelo de Explotaciones

## Problema Identificado

Se detectó una inconsistencia en la nomenclatura de campos en el modelo de `Explotacio` y sus relaciones:

1. El campo `nom` se estaba usando incorrectamente para identificar explotaciones, cuando debería usarse únicamente para animales.
2. El campo `explotacio` estaba configurado como nullable, cuando debería ser el identificador principal.
3. La identificación de explotaciones mezclaba `id` (numérico) con `explotacio` (texto), causando confusión.

## Cambios Realizados

### 1. Modelo Explotacio

Se modificó el modelo en `backend/app/models/explotacio.py`:

- Renombrado el campo `nom` a `descripcion` para evitar confusión con los animales.
- Establecido `explotacio` como clave primaria (no nullable).
- Eliminado el antiguo campo `id` implícito, ya que ahora `explotacio` es el identificador.

```python
class Explotacio(models.Model):
    """Modelo de explotación ganadera."""
    descripcion = fields.CharField(max_length=255)
    explotacio = fields.CharField(max_length=255, pk=True, null=False)
    activa = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "explotacions"
```

### 2. Schemas de Pydantic

Se actualizaron los schemas en `backend/app/schemas/explotacio.py` para mantener coherencia:

- Renombrado campo `nom` a `descripcion` en todos los schemas.
- El campo `explotacio` ahora es obligatorio, no opcional.
- Eliminada la posibilidad de actualizar el identificador `explotacio`.

```python
class ExplotacioBase(BaseModel):
    """Schema base para explotaciones."""
    descripcion: str
    explotacio: str  # Campo obligatorio y principal identificador
    activa: bool = True
```

### 3. Endpoints de API

Se modificaron los endpoints en `backend/app/api/endpoints/explotacions.py`:

- Cambiado el parámetro de ruta de `explotacio_id` (int) a `codigo_explotacion` (str).
- Actualizado todos los métodos para buscar por `explotacio` en lugar de por `id`.

```python
@router.get("/{codigo_explotacion}", response_model=ExplotacioResponse)
async def get_explotacio(codigo_explotacion: str) -> ExplotacioResponse:
    """Obtiene una explotación por su código de explotación."""
    explotacio = await Explotacio.get_or_none(explotacio=codigo_explotacion)
    # ...
```

## Migración necesaria

Para implementar estos cambios, será necesario ejecutar una migración en la base de datos:

1. Crear una nueva columna `descripcion` y copiar los datos desde `nom`.
2. Asegurar que `explotacio` tenga valores válidos para todas las filas (no NULL).
3. Establecer `explotacio` como clave primaria.
4. Eliminar la columna `nom`.

## Impacto en el frontend

El frontend deberá actualizarse para:

1. Utilizar `descripcion` en lugar de `nom` para mostrar el nombre de la explotación.
2. Usar `explotacio` como identificador único para referencias y URLs.
3. Actualizar los formularios de creación y edición con los nuevos campos.

## Validación

Ejecutar los scripts de prueba:
- `test_dashboard_explotacio.py` para verificar que los nuevos nombres de campo estén presentes.
- `debug_explotaciones_detail.py` para verificar la correcta relación entre animales y explotaciones.
