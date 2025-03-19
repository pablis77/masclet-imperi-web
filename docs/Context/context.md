# Decisiones Estructurales

## Modelo Animal y Base de Datos
### Campos Obligatorios (null_count: 0)
- explotacio (string, max_length=255)
- nom (string, max_length=255)
- genere (enum: M/F)
- estado (enum: OK/DEF)

### Campos Opcionales
- alletar (boolean, null=True) - null_count: 12
- pare (string, max_length=100, null=True) - null_count: 28
- mare (string, max_length=100, null=True) - null_count: 28
- quadra (string, max_length=100, null=True) - null_count: 36
- cod (string, max_length=20, null=True) - null_count: 22
- num_serie (string, max_length=50, null=True) - null_count: 27
- dob (date, null=True) - null_count: 25

### Convenciones de Nombres
- Mantener nombres originales del CSV para compatibilidad
- Desarrollo: Variables/comentarios en castellano
- UI Final: Todo en catalán
- Código: inglés para términos técnicos (create, update, delete)

### Enums y Validaciones
- Genere:
  - M = Macho/Mascle
  - F = Hembra/Femella

- Estat:
  - OK = Activo/Actiu
  - DEF = Fallecido/Mort

### Relaciones
- Animal -> Part (One to Many)
- Part -> Animal (Many to One)

## API Endpoints
- GET /animals - Listar todos
- GET /animals/{id} - Obtener uno
- POST /animals - Crear nuevo
- PUT /animals/{id} - Actualizar
- DELETE /animals/{id} - Eliminar


1. BASE -> 1_conetxto_proyecto_base.md
2. DATABASE: Modelos y migraciones
3. API: Endpoints y lógica
4. AUTH: Autenticación y permisos
5. UI: Frontend y templates