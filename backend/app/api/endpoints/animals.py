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
from app.models.explotacio import Explotacio
from app.core.date_utils import DateConverter, is_valid_date
from app.schemas.animal import AnimalCreate, AnimalResponse

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
from app.models.explotacio import Explotacio
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
        
        # Validar explotación
        explotacio = None
        if animal.explotacio.isdigit():
            explotacio = await Explotacio.get_or_none(id=animal.explotacio)
        
        # Si no se encuentra por ID, buscar por campo explotacio
        if not explotacio:
            explotacio = await Explotacio.get_or_none(explotacio=animal.explotacio)
            
        if not explotacio:
            raise HTTPException(
                status_code=404,
                detail=f"Explotación con identificador {animal.explotacio} no encontrada"
            )

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

        # Crear el animal
        new_animal = await Animal.create(
            explotacio=animal.explotacio,
            nom=animal.nom,
            genere=animal.genere,
            estado=animal.estado,
            alletar=animal.alletar,
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
async def update_animal(animal_id: int, animal_data: AnimalUpdate) -> dict:
    """Actualizar un animal"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
            
        # Actualizar campos
        update_data = animal_data.model_dump(exclude_unset=True)
        
        # Procesar la fecha si se actualiza
        if "dob" in update_data:
            try:
                update_data["dob"] = DateConverter.to_db_format(update_data["dob"])
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Formato de fecha inválido: {str(e)}"
                )

        # Validar madre y padre si se actualizan
        if "mare" in update_data:
            mare = await Animal.get_or_none(
                nom=update_data["mare"],
                explotacio=animal.explotacio,
                genere=Genere.FEMELLA
            )
            if not mare and update_data["mare"] is not None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Madre {update_data['mare']} no encontrada"
                )

        if "pare" in update_data:
            pare = await Animal.get_or_none(
                nom=update_data["pare"],
                explotacio=animal.explotacio,
                genere=Genere.MASCLE
            )
            if not pare and update_data["pare"] is not None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Padre {update_data['pare']} no encontrado"
                )
                
        # Actualizar campos de transición
        if "genere_t" in update_data:
            update_data["genere_t"] = update_data["genere_t"]
        if "estado_t" in update_data:
            update_data["estado_t"] = update_data["estado_t"]
            
        # Validar campos de enumeración
        if "estado" in update_data:
            try:
                # Verificar que el valor es válido para el enum Estado
                if update_data["estado"] not in [e.value for e in Estado]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para estado: {update_data['estado']}. Valores válidos: {[e.value for e in Estado]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para estado: {update_data['estado']}. Valores válidos: {[e.value for e in Estado]}"
                )
                
        if "alletar" in update_data:
            try:
                # Verificar que el valor es válido para el enum EstadoAlletar
                if update_data["alletar"] not in [e.value for e in EstadoAlletar]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para alletar: {update_data['alletar']}. Valores válidos: {[e.value for e in EstadoAlletar]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para alletar: {update_data['alletar']}. Valores válidos: {[e.value for e in EstadoAlletar]}"
                )
                
        if "genere" in update_data:
            try:
                # Verificar que el valor es válido para el enum Genere
                if update_data["genere"] not in [e.value for e in Genere]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para genere: {update_data['genere']}. Valores válidos: {[e.value for e in Genere]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para genere: {update_data['genere']}. Valores válidos: {[e.value for e in Genere]}"
                )
            
        # Actualizar el animal
        await Animal.filter(id=animal_id).update(**update_data)
        updated_animal = await Animal.get(id=animal_id)
        
        return {
            "status": "success",
            "data": await updated_animal.to_dict()
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Error de validación actualizando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{animal_id}", response_model=AnimalResponse)
async def update_animal_put(animal_id: int, animal_data: AnimalUpdate) -> dict:
    """Actualizar un animal (método PUT)"""
    try:
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {animal_id} no encontrado"
            )
            
        # Actualizar campos
        update_data = animal_data.model_dump(exclude_unset=True)
        
        # Procesar la fecha si se actualiza
        if "dob" in update_data:
            try:
                update_data["dob"] = DateConverter.to_db_format(update_data["dob"])
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Formato de fecha inválido: {str(e)}"
                )

        # Validar madre y padre si se actualizan
        if "mare" in update_data:
            mare = await Animal.get_or_none(
                nom=update_data["mare"],
                explotacio=animal.explotacio,
                genere=Genere.FEMELLA
            )
            if not mare and update_data["mare"] is not None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Madre {update_data['mare']} no encontrada"
                )

        if "pare" in update_data:
            pare = await Animal.get_or_none(
                nom=update_data["pare"],
                explotacio=animal.explotacio,
                genere=Genere.MASCLE
            )
            if not pare and update_data["pare"] is not None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Padre {update_data['pare']} no encontrado"
                )
                
        # Actualizar campos de transición
        if "genere_t" in update_data:
            update_data["genere_t"] = update_data["genere_t"]
        if "estado_t" in update_data:
            update_data["estado_t"] = update_data["estado_t"]
            
        # Validar campos de enumeración
        if "estado" in update_data:
            try:
                # Verificar que el valor es válido para el enum Estado
                if update_data["estado"] not in [e.value for e in Estado]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para estado: {update_data['estado']}. Valores válidos: {[e.value for e in Estado]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para estado: {update_data['estado']}. Valores válidos: {[e.value for e in Estado]}"
                )
                
        if "alletar" in update_data:
            try:
                # Verificar que el valor es válido para el enum EstadoAlletar
                if update_data["alletar"] not in [e.value for e in EstadoAlletar]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para alletar: {update_data['alletar']}. Valores válidos: {[e.value for e in EstadoAlletar]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para alletar: {update_data['alletar']}. Valores válidos: {[e.value for e in EstadoAlletar]}"
                )
                
        if "genere" in update_data:
            try:
                # Verificar que el valor es válido para el enum Genere
                if update_data["genere"] not in [e.value for e in Genere]:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Valor inválido para genere: {update_data['genere']}. Valores válidos: {[e.value for e in Genere]}"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Valor inválido para genere: {update_data['genere']}. Valores válidos: {[e.value for e in Genere]}"
                )
            
        # Actualizar el animal
        await Animal.filter(id=animal_id).update(**update_data)
        updated_animal = await Animal.get(id=animal_id)
        
        return {
            "status": "success",
            "data": await updated_animal.to_dict()
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Error de validación actualizando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error actualizando animal {animal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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