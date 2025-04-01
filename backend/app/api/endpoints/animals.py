"""
Endpoints para la gestión de animales
"""
from fastapi import APIRouter, HTTPException, Query, Body, Depends
from pydantic import ValidationError
from typing import List, Optional
import logging
from datetime import datetime
from tortoise.expressions import Q

from app.models.animal import Animal, Genere, Estado, Part, EstadoAlletar
from app.core.date_utils import DateConverter, is_valid_date
from app.schemas.animal import AnimalCreate, AnimalResponse

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
from app.schemas.animal import (
    AnimalCreate,
    AnimalUpdate,
    AnimalResponse,
    AnimalListResponse
)
from app.core.date_utils import DateConverter, is_valid_date
from app.core.auth import get_current_user, check_permissions
from app.core.config import Action
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=AnimalResponse, status_code=201)
async def create_animal(
    animal_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
) -> AnimalResponse:
    """Crear un nuevo animal"""
    # Verificar que el usuario tiene permisos para crear animales
    await check_permissions(current_user, Action.CREAR)
    
    try:
        # Validar los datos usando el schema antes de procesar
        try:
            animal = AnimalCreate(**animal_data)
        except ValidationError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Ya no validamos contra la tabla Explotacio, pues es solo un atributo
        # Usar la fecha ya validada por el schema
        dob = None
        if animal.dob:
            try:
                dob = DateConverter.to_db_format(animal.dob)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=str(e)
                )

        # Aplicar regla de negocio: para machos siempre "0", hembras pueden tener "0", "1" o "2"
        alletar_value = EstadoAlletar.NO_ALLETAR.value  # Valor por defecto "0"
        
        # Si es hembra, permitir valores "0", "1" o "2"
        if animal.genere == Genere.FEMELLA.value:
            alletar_value = animal.alletar
        # Si es macho y se intenta establecer un valor diferente a "0", rechazar
        elif animal.genere == Genere.MASCLE.value and animal.alletar != EstadoAlletar.NO_ALLETAR.value:
            raise HTTPException(
                status_code=422,
                detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
            )

        # Crear el animal
        new_animal = await Animal.create(
            explotacio=animal.explotacio,
            nom=animal.nom,
            genere=animal.genere,
            estado=animal.estado,
            alletar=alletar_value,
            dob=dob,
            mare=animal.mare,
            pare=animal.pare,
            quadra=animal.quadra,
            cod=animal.cod,
            num_serie=animal.num_serie,
            part=animal.part
        )

        # Preparar respuesta
        return {
            "status": "success",
            "data": await new_animal.to_dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear animal: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear animal: {str(e)}"
        )

@router.get("/{animal_id}", response_model=AnimalResponse)
async def get_animal(animal_id: int) -> AnimalResponse:
    """Obtener detalles de un animal"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
            
        # Los partos ahora se incluyen automáticamente en to_dict() cuando es una hembra
        result = await animal.to_dict(include_partos=True)
        return {
            "status": "success",
            "data": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=AnimalListResponse)
async def list_animals(
    explotacio_id: Optional[str] = None,
    genere: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[str] = None,
    mare: Optional[str] = None,
    pare: Optional[str] = None,
    quadra: Optional[str] = None,
    search: Optional[str] = None,
    num_serie: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
) -> dict:
    """Listar animales con filtros opcionales"""
    try:
        query = Animal.all()

        # Filtros básicos
        if explotacio_id:
            query = query.filter(explotacio=explotacio_id)
            
        # Filtros de enums
        # Validar y aplicar filtro de género
        if genere:
            try:
                genere_enum = Genere(genere)
                query = query.filter(genere=genere_enum.value)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Género inválido: {genere}"
                )
        if estado:
            try:
                query = query.filter(estado=Estado(estado))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Estado inválido: {estado}"
                )
        if alletar is not None:
            try:
                query = query.filter(alletar=EstadoAlletar(alletar))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Estado de amamantamiento inválido: {alletar}"
                )
                
        # Filtros de texto
        if mare:
            query = query.filter(mare=mare)
        if pare:
            query = query.filter(pare=pare)
        if quadra:
            query = query.filter(quadra=quadra)
            
        # Búsqueda general
        if search:
            query = query.filter(
                Q(nom__icontains=search) |
                Q(num_serie__icontains=search)
            )
            
        # Búsqueda por número de serie (case-insensitive)
        if num_serie:
            query = query.filter(
                Q(num_serie__iexact=num_serie) |  # Exacto pero case-insensitive
                Q(num_serie__icontains=num_serie)  # Parcial pero case-insensitive
            )

        # Ordenación
        query = query.order_by('nom', '-created_at')
        
        total = await query.count()
        animals = await query.offset(offset).limit(limit)
        
        return {
            "status": "success",
            "data": {
                "total": total,
                "offset": offset,
                "limit": limit,
                "items": [await a.to_dict() for a in animals]
            }
        }
    
    except Exception as e:
        logger.error(f"Error listando animales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{animal_id}", response_model=AnimalResponse)
async def update_animal_patch(animal_id: int, animal_data: AnimalUpdate) -> dict:
    """
    Actualizar parcialmente un animal por ID (método PATCH)
    """
    # Verificar que el animal existe
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Recoger los datos del animal a actualizar
    update_data = {}
    
    # Procesar fecha de nacimiento si está presente
    if animal_data.dob:
        try:
            update_data["dob"] = DateConverter.to_db_format(animal_data.dob)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
    
    # Campos simples que no requieren procesamiento especial pero pueden ser null
    for field in ["nom", "estado", "mare", "pare", "quadra", "cod", "num_serie", "part"]:
        # Solo incluimos el campo si se especificó explícitamente en el request
        # (hasattr no es suficiente, necesitamos saber si el campo no es None o se envió explícitamente)
        if hasattr(animal_data, field) and getattr(animal_data, field) is not None:
            update_data[field] = getattr(animal_data, field)
    
    # Campo alletar (con reglas de negocio)
    if animal_data.alletar is not None:
        # Si es macho, solo puede ser "0"
        if animal.genere == Genere.MASCLE.value and animal_data.alletar != EstadoAlletar.NO_ALLETAR.value:
            raise HTTPException(
                status_code=422,
                detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
            )
        # Si es hembra, puede ser "0", "1" o "2"
        update_data["alletar"] = animal_data.alletar
    
    # Actualizar el animal
    if update_data:
        await animal.update_from_dict(update_data).save()
    
    # Devolver el animal actualizado
    return {
        "status": "success",
        "data": await animal.to_dict()
    }

@router.put("/{animal_id}", response_model=AnimalResponse)
async def update_animal(animal_id: int, animal_data: AnimalUpdate) -> dict:
    """
    Actualizar un animal por ID
    """
    # Verificar que el animal existe
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con ID {animal_id} no encontrado"
        )
    
    # Recoger los datos del animal a actualizar
    update_data = {}
    
    # Procesar fecha de nacimiento si está presente
    if animal_data.dob:
        try:
            update_data["dob"] = DateConverter.to_db_format(animal_data.dob)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
    
    # Campos simples que no requieren procesamiento especial pero pueden ser null
    for field in ["nom", "estado", "mare", "pare", "quadra", "cod", "num_serie", "part"]:
        # Usamos hasattr para comprobar si el campo existe en el modelo
        if hasattr(animal_data, field):
            # Verificamos si el campo se envió en el request (podría ser None)
            value = getattr(animal_data, field)
            # Incluimos el campo en la actualización, incluso si es None
            update_data[field] = value
    
    # Campo alletar (con reglas de negocio)
    if animal_data.alletar is not None:
        # Si es macho, solo puede ser "0"
        if animal.genere == Genere.MASCLE.value and animal_data.alletar != EstadoAlletar.NO_ALLETAR.value:
            raise HTTPException(
                status_code=422,
                detail=f"Los machos solo pueden tener estado de amamantamiento '{EstadoAlletar.NO_ALLETAR.value}' (sin amamantar)"
            )
        # Si es hembra, puede ser "0", "1" o "2"
        update_data["alletar"] = animal_data.alletar
    
    # Actualizar el animal
    if update_data:
        await animal.update_from_dict(update_data).save()
    
    # Devolver el animal actualizado
    return {
        "status": "success",
        "data": await animal.to_dict()
    }

@router.delete("/{animal_id}", status_code=204)
async def delete_animal(animal_id: int) -> None:
    """Eliminar un animal"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
            
        await animal.delete()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))