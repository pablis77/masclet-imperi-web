# Análisis del Dashboard y Cálculo de Estadísticas

## Estructura de Datos y Filtrado

### Estructura Actual
- **Explotaciones**: 
  - El nombre/identificador de la explotación se almacena en el campo `nom` del modelo `Explotacio`
  - El campo `explotacio` en el modelo `Explotacio` actualmente está vacío (NULL)
  - ⚠️ **ALERTA**: En la serialización JSON, el campo `explotacio` aparece truncado como `explotaci`, lo que podría causar inconsistencias
- **Animales**:
  - El nombre del animal se almacena en el campo `nom` del modelo `Animal`
  - La explotación a la que pertenece se almacena en el campo `explotacio` del modelo `Animal`
  - Este campo `explotacio` en el animal debe coincidir con el `nom` de la explotación correspondiente

### Mecanismo de Filtrado
- Cuando filtramos por ID de explotación, primero obtenemos el objeto `Explotacio`
- Extraemos el nombre de la explotación del campo `nom`
- Usamos ese nombre para filtrar animales donde `explotacio == nombre_explotacion`

### Posibles Problemas
- **Importaciones futuras**: Si se importan datos con una estructura diferente (donde el campo `explotacio` del modelo `Explotacio` contiene el nombre), esto causará problemas en el filtrado
- **Confusión en la nomenclatura**: El uso de `nom` para el nombre de explotación y `explotacio` para la referencia en animales puede crear confusión

## Cálculo de Terneros

### Reglas de Negocio
- El recuento de terneros se basa en el **estado de amamantamiento** de las vacas, no en el historial de partos
- Estados posibles de amamantamiento:
  - `NO_ALLETAR` (NO): La vaca no está amamantando = 0 terneros
  - `UN_TERNERO` (1): La vaca está amamantando a un ternero = 1 ternero
  - `DOS_TERNEROS` (2): La vaca está amamantando a dos terneros = 2 terneros

### Implementación
```python
# Cálculo de terneros basado en el estado de amamantamiento
alletar_filter = dict(base_filter)
alletar_filter["alletar"] = EstadoAlletar.UN_TERNERO  # Vacas con 1 ternero
vacas_con_un_ternero = await Animal.filter(**alletar_filter).count()

alletar_filter["alletar"] = EstadoAlletar.DOS_TERNEROS  # Vacas con 2 terneros
vacas_con_dos_terneros = await Animal.filter(**alletar_filter).count()

# El total de terneros es: (1 × número de vacas con alletar=1) + (2 × número de vacas con alletar=2)
total_terneros = vacas_con_un_ternero + (vacas_con_dos_terneros * 2)
```

### Consideraciones Importantes
- El recuento de terneros es independiente del registro histórico de partos
- Solo las vacas (animales con género "F") pueden tener estados de amamantamiento distintos a NO_ALLETAR
- El estado de amamantamiento puede cambiar a lo largo del tiempo y no está directamente relacionado con los partos registrados

## Filtrado de Partos

### Proceso
1. Primero filtramos los animales que pertenecen a la explotación seleccionada
2. Obtenemos los IDs de esos animales
3. Filtramos los partos que tienen animal_id en ese conjunto de IDs

### Consideraciones
- Los partos siempre están asociados a un animal específico (una vaca)
- Son registros históricos y nunca se eliminan
- Solo las vacas (género "F") pueden tener partos

## Recomendaciones para el Futuro

### Consistencia en la Base de Datos
- Considerar normalizar la estructura para que la relación entre animales y explotaciones sea más clara
- Posiblemente cambiando el campo `explotacio` de los animales a `explotacio_id` o `explotacio_nombre`
- Corregir la inconsistencia entre el campo `explotacio` en el modelo y `explotaci` en la serialización JSON
- Establecer un estándar claro para la nomenclatura de los campos relacionados con explotaciones

### Importación de Datos
- Durante las importaciones futuras, asegurarse de que el nombre de la explotación se almacene en el campo `nom` del modelo `Explotacio`
- Verificar que el valor en el campo `explotacio` de los animales coincida exactamente con el `nom` de la explotación correspondiente

### UI Frontend
- En la interfaz, mostrar claramente la explotación a la que pertenece cada animal
- Proporcionar estadísticas desglosadas por explotación
- Mostrar el recuento correcto de terneros basado en estados de amamantamiento, no en partos históricos

## API Dashboard

### Endpoint `/resumen`
- **URL**: `GET /api/v1/dashboard/resumen/`
- **Parámetros**:
  - `explotacio`: ID de la explotación para filtrar (opcional)
  - `start_date`: Fecha de inicio para el periodo (opcional, formato YYYY-MM-DD)
  - `end_date`: Fecha de fin para el periodo (opcional, formato YYYY-MM-DD)
- **Respuesta**:
```json
{
  "total_animals": 91,
  "terneros": {
    "total": 44
  },
  "explotaciones": {
    "count": 9
  },
  "partos": {
    "total": 30
  },
  "periodo": {
    "inicio": "2024-04-01",
    "fin": "2025-04-01"
  }
}
