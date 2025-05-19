"""
Endpoints para la gestión de animales
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from tortoise.expressions import Q
import logging

from app.models.animal import Animal, Part
from app.core.responses import SuccessResponse, ErrorResponse
from app.schemas.animal import AnimalCreate, AnimalUpdate, AnimalResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=AnimalResponse)
async def create_animal(animal: AnimalCreate):
    """Crea un nuevo animal"""
    try:
        logger.debug(f"Datos recibidos: {animal.dict()}")
        
        # Crear animal usando el modelo
        new_animal = await Animal.create(**animal.dict(exclude_unset=True))
        logger.debug(f"Animal creado con ID: {new_animal.id}")
        
        return SuccessResponse(
            message="Animal creado exitosamente",
            data=AnimalResponse.from_orm(new_animal)
        )
        
    except Exception as e:
        logger.error(f"Error creando animal: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int):
    """Obtiene los detalles de un animal específico"""
    try:
        animal = await Animal.get_or_none(id=animal_id).prefetch_related('parts')
        if not animal:
            return ErrorResponse(
                message="Animal no encontrado",
                data={"animal_id": animal_id}
            )
            
        return SuccessResponse(
            message="Animal recuperado exitosamente",
            data=AnimalResponse.from_orm(animal)
        )
        
    except Exception as e:
        logger.error(f"Error recuperando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[AnimalResponse])
async def list_animals(
    explotacio: Optional[str] = None,
    genere: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[bool] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Lista animales con filtros opcionales"""
    try:
        query = Animal.all()
        
        if explotacio:
            query = query.filter(explotacio=explotacio)
        if genere:
            query = query.filter(genere=genere)
        if estado:
            query = query.filter(estado=estado)
        if alletar is not None:
            query = query.filter(alletar=alletar)
            
        total = await query.count()
        animals = await query.offset(offset).limit(limit).prefetch_related('parts')
        
        result = []
        for animal in animals:
            animal_data = AnimalResponse.from_orm(animal)
            if animal.genere == "F":
                total_partos = await animal.total_partos
                ultimo_parto = await animal.ultimo_parto
                animal_data.partos = {
                    "total": total_partos,
                    "ultimo": await ultimo_parto.to_dict() if ultimo_parto else None
                }
            result.append(animal_data)
            
        return SuccessResponse(
            message="Animales recuperados exitosamente",
            data={
                "items": result,
                "total": total,
                "offset": offset,
                "limit": limit
            }
        )
            
    except Exception as e:
        logger.error(f"Error recuperando animales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{animal_id}", response_model=AnimalResponse)
async def update_animal(animal_id: int, animal: AnimalUpdate):
    """Actualiza un animal existente"""
    try:
        db_animal = await Animal.get_or_none(id=animal_id)
        if not db_animal:
            return ErrorResponse(
                message="Animal no encontrado",
                data={"animal_id": animal_id}
            )
            
        if db_animal.estado == "DEF" and animal.estado and animal.estado != "DEF":
            return ErrorResponse(
                message="No se puede cambiar el estado de un animal fallecido"
            )
            
        # Actualizar solo los campos proporcionados
        update_data = animal.dict(exclude_unset=True)
        await Animal.filter(id=animal_id).update(**update_data)
        updated_animal = await Animal.get(id=animal_id)
        
        return SuccessResponse(
            message="Animal actualizado exitosamente",
            data=AnimalResponse.from_orm(updated_animal)
        )
        
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{animal_id}")
async def delete_animal(animal_id: int):
    """Elimina (soft delete) un animal cambiando su estado a DEF"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            return ErrorResponse(
                message="Animal no encontrado",
                data={"animal_id": animal_id}
            )
            
        await Animal.filter(id=animal_id).update(estado="DEF")
        
        return SuccessResponse(
            message="Animal eliminado exitosamente"
        )
        
    except Exception as e:
        logger.error(f"Error eliminando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[AnimalResponse])
async def search_animals(
    q: str,
    explotacio: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100)
):
    """Búsqueda de animales por nombre, código o número de serie"""
    try:
        query = Animal.filter(
            Q(nom__icontains=q) |
            Q(cod__icontains=q) |
            Q(num_serie__icontains=q)
        )
        
        if explotacio:
            query = query.filter(explotacio=explotacio)
            
        animals = await query.limit(limit)
        result = [AnimalResponse.from_orm(animal) for animal in animals]
            
        return SuccessResponse(
            message="Búsqueda realizada exitosamente",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error en búsqueda: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))