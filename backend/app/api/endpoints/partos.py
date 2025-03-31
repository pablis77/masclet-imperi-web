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
    PartosListResponse,
    PartoData
)
from app.core.date_utils import DateConverter

router = APIRouter()
logger = logging.getLogger(__name__)

async def validate_animal(animal_id: int, check_female: bool = True) -> Animal:
    """Valida que el animal existe y es hembra si check_female es True"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    if check_female and animal.genere != Genere.FEMELLA:
        raise HTTPException(
            status_code=400,
            detail=f"El animal ID {animal_id} ({animal.nom}) no es una hembra y no puede tener partos"
        )
    
    if animal.estado == Estado.DEF:
        raise HTTPException(
            status_code=400,
            detail=f"No se pueden registrar partos de un animal dado de baja (ID: {animal_id})"
        )
    
    return animal

def validate_parto_date(parto_date_str: str, animal_dob: date) -> None:
    """Valida que la fecha del parto sea posterior a la fecha de nacimiento del animal"""
    try:
        parto_date = DateConverter.to_date(parto_date_str)
        animal_dob_date = animal_dob
        
        if parto_date < animal_dob_date:
            raise ValueError(f"La fecha del parto ({parto_date_str}) no puede ser anterior a la fecha de nacimiento del animal ({animal_dob_date})")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/animals/{animal_id}/partos", response_model=PartoResponse, status_code=201)
async def create_parto(
    animal_id: int,
    parto_data: PartoCreate,
):
    """Registrar un nuevo parto"""
    try:
        # Validar el animal usando el ID de la URL
        animal = await validate_animal(animal_id)
        
        # Validar que el animal_id en el payload coincida con el de la URL
        if parto_data.animal_id != animal_id:
            raise HTTPException(
                status_code=400,
                detail="El animal_id en el cuerpo de la solicitud no coincide con el animal_id de la URL"
            )

        # Validar fecha del parto
        if animal.dob:
            validate_parto_date(parto_data.part, animal.dob)
        
        # Contar partos existentes para asignar número secuencial
        num_partos = await Part.filter(animal_id=animal.id).count()
        
        # Crear nuevo parto
        parto = await Part.create(
            animal_id=animal.id,
            part=DateConverter.to_db_format(parto_data.part),
            GenereT=parto_data.GenereT,
            EstadoT=parto_data.EstadoT,
            numero_part=num_partos + 1,
            observacions=parto_data.observacions
        )
        
        # Actualizar estado de amamantamiento si es necesario
        if animal.alletar is None or animal.alletar == 0:
            animal.alletar = 1
            await animal.save()
        
        # Preparar la respuesta usando el esquema PartoData (que ahora espera animal_id)
        parto_dict = await parto.to_dict()
        response_data = PartoData(**parto_dict)

        return {
            "status": "success",
            "data": response_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando parto para animal ID {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/animals/{animal_id}/partos", response_model=List[PartoData])
async def get_partos(
    animal_id: int,
):
    """Obtiene todos los partos de un animal"""
    try:
        # Validar que el animal existe
        animal = await validate_animal(animal_id, check_female=False)

        # Obtener todos los partos del animal
        partos = await Part.filter(animal_id=animal.id).order_by("-part")
        
        # Convertir a esquema PartoData
        return [PartoData(**await parto.to_dict()) for parto in partos]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recuperando partos para animal ID {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/animals/{animal_id}/partos/{parto_id}", response_model=PartoData)
async def update_parto(
    animal_id: int,
    parto_id: int,
    parto_update: PartoUpdate,
):
    """Actualiza un parto existente"""
    try:
        # Validar que el animal existe
        animal = await validate_animal(animal_id)
        
        # Obtener parto existente y validar que pertenece al animal
        parto_db = await Part.get_or_none(id=parto_id, animal_id=animal.id)
        if not parto_db:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado para el animal ID {animal_id}"
            )

        # Actualizar los campos del parto
        update_data = parto_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(parto_db, key, value)
        
        await parto_db.save()
        
        # Devolver usando el esquema PartoData
        return PartoData(**await parto_db.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando parto {parto_id} para animal ID {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/animals/{animal_id}/partos/{parto_id}", response_model=PartoResponse)
async def get_parto(
    animal_id: int,
    parto_id: int,
) -> dict:
    """Obtener detalles de un parto específico"""
    try:
        # Validar que el animal existe
        animal = await validate_animal(animal_id, check_female=False)
        
        parto = await Part.get_or_none(id=parto_id, animal_id=animal.id)
        if not parto:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado para el animal ID {animal_id}"
            )
        
        # Devolver usando el esquema PartoData
        parto_dict = await parto.to_dict()
        response_data = PartoData(**parto_dict)
        return {
            "status": "success",
            "data": response_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recuperando parto {parto_id} para animal ID {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/animals/{animal_id}/partos/list", response_model=PartosListResponse)
async def list_animal_partos(
    animal_id: int,
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Lista paginada de partos de un animal con filtros opcionales por fecha"""
    try:
        # Validar que el animal existe
        animal = await validate_animal(animal_id, check_female=False)
        
        # Construir filtro base
        filters = {"animal_id": animal.id}
        
        # Añadir filtros de fecha si se proporcionan
        if desde:
            desde_date = DateConverter.to_db_format(desde)
            filters["part__gte"] = desde_date
            
        if hasta:
            hasta_date = DateConverter.to_db_format(hasta)
            filters["part__lte"] = hasta_date
        
        # Calcular offset para paginación
        offset = (page - 1) * limit
        
        # Obtener conteo total de partos que coinciden con los filtros
        total = await Part.filter(**filters).count()
        
        # Obtener partos paginados
        partos = await Part.filter(**filters).order_by("-part").offset(offset).limit(limit)
        
        # Convertir a esquema PartoData
        partos_data = [PartoData(**await parto.to_dict()) for parto in partos]
        
        # Calcular metadatos de paginación
        total_pages = (total + limit - 1) // limit  # Ceil division
        
        return {
            "status": "success",
            "data": partos_data,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listando partos para animal ID {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# NOTA: La eliminación de partos está deshabilitada permanentemente.
# Los partos son registros históricos fundamentales para la trazabilidad del ganado
# y deben mantenerse incluso si contienen errores. Las correcciones deben hacerse
# mediante actualizaciones que mantengan el historial.