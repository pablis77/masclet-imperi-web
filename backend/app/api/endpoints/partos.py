"""
Endpoints para la gestión de partos
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
import logging

from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.schemas.parto import (
    PartoCreate,
    PartoUpdate,
    PartoResponse,
    PartosListResponse
)
from app.core.date_utils import DateConverter

router = APIRouter()
logger = logging.getLogger(__name__)

async def validate_animal(animal_id: int, check_female: bool = True) -> Animal:
    """Valida que existe el animal y opcionalmente que sea hembra"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal {animal_id} no encontrado"
        )
        
    if check_female and animal.genere != Genere.FEMELLA:
        raise HTTPException(
            status_code=400,
            detail="Solo las hembras pueden tener partos registrados"
        )
        
    if animal.estado == Estado.DEF:
        raise HTTPException(
            status_code=400,
            detail="No se pueden registrar partos de un animal dado de baja"
        )
        
    return animal

def validate_parto_date(fecha_parto_str: str, fecha_nacimiento: date = None) -> None:
    """Valida la fecha del parto"""
    try:
        fecha_parto = DateConverter.parse_date(fecha_parto_str)
        hoy = datetime.now().date()
        
        # Validar que no sea fecha futura
        if fecha_parto > hoy:
            raise HTTPException(
                status_code=400,
                detail="La fecha del parto no puede ser futura"
            )
            
        # Validar que el animal tenga edad suficiente
        if fecha_nacimiento:
            # Asumimos que necesita al menos 15 meses para tener un parto
            edad_minima = fecha_nacimiento + timedelta(days=15*30)
            if fecha_parto < edad_minima:
                raise HTTPException(
                    status_code=400,
                    detail="El animal es demasiado joven para tener partos en esta fecha"
                )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=PartoResponse)
async def create_parto(parto_data: PartoCreate, animal_id: int) -> dict:
    """Registrar un nuevo parto"""
    try:
        # Validar el animal usando el ID de la URL
        animal = await validate_animal(animal_id)
        
        # Validar la fecha del parto
        validate_parto_date(parto_data.data, animal.dob)
        
        # Calcular número de parto
        num_partos = await Part.filter(animal_id=animal_id).count()

        # Crear parto
        parto_db = await Part.create(
            animal=animal,
            data=DateConverter.to_db_format(parto_data.data),
            genere_fill=parto_data.genere_fill,
            estat_fill=parto_data.estat_fill,
            numero_part=num_partos + 1
        )

        # Comentado: Actualización automática del estado de amamantamiento
        # En el futuro podría activarse si se requiere
        # await Animal.filter(id=animal.id).update(
        #     alletar=EstadoAlletar.UN_TERNERO if parto_data.estat_fill == Estado.OK else EstadoAlletar.NO_ALLETAR
        # )

        return {
            "status": "success",
            "data": await parto_db.to_dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando parto: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{parto_id}", response_model=PartoResponse)
async def get_parto(parto_id: int) -> dict:
    """Obtener detalles de un parto específico"""
    try:
        parto = await Part.get_or_none(id=parto_id)
        if not parto:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado"
            )

        return {
            "status": "success",
            "data": await parto.to_dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recuperando parto {parto_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=PartosListResponse)
async def list_animal_partos(
    animal_id: int,  # Viene del path
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
) -> dict:
    """Obtener historial de partos de un animal"""
    try:
        # Validar que existe el animal
        await validate_animal(animal_id, check_female=False)

        # Validar fechas
        if desde:
            validate_parto_date(desde)
        if hasta:
            validate_parto_date(hasta)

        query = Part.filter(animal_id=animal_id)

        # Aplicar filtros de fecha
        if desde:
            query = query.filter(data__gte=DateConverter.to_db_format(desde))
        if hasta:
            query = query.filter(data__lte=DateConverter.to_db_format(hasta))

        # Ordenar por fecha descendente
        query = query.order_by("-data")

        # Obtener total de partos antes de paginar
        total = await query.count()

        # Paginación
        partos = await query.offset(offset).limit(limit)
        
        return {
            "status": "success",
            "data": {
                "total": total,
                "offset": offset,
                "limit": limit,
                "items": [await parto.to_dict() for parto in partos]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recuperando partos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{parto_id}", response_model=PartoResponse)
async def update_parto(animal_id: int, parto_id: int, parto_data: PartoUpdate) -> dict:
    """Actualizar un parto existente"""
    try:
        # Validar que existe el animal
        animal = await validate_animal(animal_id)
        
        # Obtener parto existente y validar que pertenece al animal
        parto_db = await Part.get_or_none(id=parto_id, animal_id=animal_id)
        if not parto_db:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado para el animal {animal_id}"
            )

        # Validar fecha si se proporciona
        if parto_data.data:
            animal = await validate_animal(parto_db.animal_id)
            validate_parto_date(parto_data.data, animal.dob)
            
            # Actualizar fecha
            parto_db.data = DateConverter.to_db_format(parto_data.data)
            
        # Actualizar otros campos si se proporcionan
        if parto_data.genere_fill:
            parto_db.genere_fill = parto_data.genere_fill
            
        if parto_data.estat_fill:
            parto_db.estat_fill = parto_data.estat_fill
            
        if parto_data.observacions is not None:
            parto_db.observacions = parto_data.observacions
            
        # Guardar cambios
        await parto_db.save()
        
        return {
            "status": "success",
            "data": await parto_db.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando parto {parto_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# NOTA: La eliminación de partos está deshabilitada permanentemente.
# Los partos son registros históricos fundamentales para la trazabilidad del ganado
# y deben mantenerse incluso si contienen errores. Las correcciones deben hacerse
# mediante actualizaciones que mantengan el historial.