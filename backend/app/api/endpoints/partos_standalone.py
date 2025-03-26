"""
Endpoints para la gestión de partos de forma independiente
Este módulo proporciona acceso directo a los partos sin necesidad de especificar
un animal en la URL, facilitando las pruebas y el acceso a los datos de partos.
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import logging
from tortoise.expressions import Q
from tortoise.functions import Function

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

def validate_parto_date(fecha_parto_str: str, fecha_nacimiento: date = None) -> date:
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
            
        # Si tenemos fecha de nacimiento del animal, validar que el parto sea posterior
        if fecha_nacimiento and fecha_parto < fecha_nacimiento:
            raise HTTPException(
                status_code=400,
                detail="La fecha del parto no puede ser anterior a la fecha de nacimiento del animal"
            )
            
        return fecha_parto
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Formato de fecha inválido. Use DD/MM/YYYY"
        )

@router.post("", response_model=PartoResponse, status_code=201)
async def create_parto(parto_data: PartoCreate):
    """
    Registra un nuevo parto.
    
    - **animal_id**: ID del animal (madre)
    - **data**: Fecha del parto (DD/MM/YYYY)
    - **genere_fill**: Género del ternero (M/F)
    - **estat_fill**: Estado del ternero (OK/MUERTO)
    - **numero_part**: Número de parto para este animal
    """
    # Validar animal
    animal = await validate_animal(parto_data.animal_id)
    
    # Validar fecha
    fecha_parto = validate_parto_date(parto_data.data, animal.dob)
    
    # Validar género del ternero
    if parto_data.genere_fill not in [Genere.MASCLE, Genere.FEMELLA]:
        raise HTTPException(
            status_code=400,
            detail="El género del ternero debe ser M o F"
        )
    
    # Crear parto
    parto = await Part.create(
        animal=animal,
        data=fecha_parto,
        genere_fill=parto_data.genere_fill,
        estat_fill=parto_data.estat_fill,
        numero_part=parto_data.numero_part
    )
    
    # Actualizar estado de la madre (alletar = 1)
    animal.alletar = EstadoAlletar.UN_TERNERO
    await animal.save()
    
    logger.info(f"Parto registrado: ID={parto.id}, Animal={animal.id}, Fecha={parto_data.data}")
    
    return {
        "success": True,
        "data": {
            "id": parto.id,
            "animal_id": animal.id,
            "data": parto_data.data,
            "genere_fill": parto_data.genere_fill,
            "estat_fill": parto_data.estat_fill,
            "numero_part": parto_data.numero_part,
            "created_at": parto.created_at.strftime("%d/%m/%Y %H:%M:%S") if parto.created_at else None
        }
    }

@router.get("/{parto_id}", response_model=PartoResponse)
async def get_parto(parto_id: int):
    """
    Obtiene los detalles de un parto específico.
    
    - **parto_id**: ID del parto a consultar
    """
    parto = await Part.get_or_none(id=parto_id).prefetch_related("animal")
    
    if not parto:
        raise HTTPException(
            status_code=404,
            detail=f"Parto {parto_id} no encontrado"
        )
    
    return {
        "success": True,
        "data": {
            "id": parto.id,
            "animal_id": parto.animal.id,
            "data": parto.data.strftime("%d/%m/%Y"),
            "genere_fill": parto.genere_fill,
            "estat_fill": parto.estat_fill,
            "numero_part": parto.numero_part,
            "created_at": parto.created_at.strftime("%d/%m/%Y %H:%M:%S") if parto.created_at else None
        }
    }

@router.get("", response_model=PartosListResponse)
async def list_partos(
    animal_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    genere_fill: Optional[str] = None,
    estat_fill: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort: Optional[str] = "data",
    order: Optional[str] = "desc"
):
    """
    Obtiene un listado de partos con filtros opcionales.
    
    - **animal_id**: Filtrar por ID del animal (madre)
    - **year**: Filtrar por año
    - **month**: Filtrar por mes
    - **start_date**: Fecha inicial (DD/MM/YYYY)
    - **end_date**: Fecha final (DD/MM/YYYY)
    - **genere_fill**: Filtrar por género del ternero (M/F)
    - **estat_fill**: Filtrar por estado del ternero (OK/MUERTO)
    - **offset**: Número de registros a saltar (paginación)
    - **limit**: Número máximo de registros a devolver
    - **sort**: Campo por el que ordenar (data, numero_part)
    - **order**: Orden (asc, desc)
    """
    # Construir query base
    query = Part.all().prefetch_related("animal")
    
    # Aplicar filtros
    if animal_id:
        query = query.filter(animal_id=animal_id)
    
    # Filtros de fecha
    date_filters = Q()
    
    if year:
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)
        date_filters &= Q(data__gte=start_of_year, data__lte=end_of_year)
    
    if month:
        if year:
            start_date_month = date(year, month, 1)
            end_date_month = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
            date_filters &= Q(data__gte=start_date_month, data__lte=end_date_month)
    
    if start_date:
        try:
            fecha_inicio = DateConverter.parse_date(start_date)
            date_filters &= Q(data__gte=fecha_inicio)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha inicial inválido. Use DD/MM/YYYY"
            )
    
    if end_date:
        try:
            fecha_fin = DateConverter.parse_date(end_date)
            date_filters &= Q(data__lte=fecha_fin)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha final inválido. Use DD/MM/YYYY"
            )
    
    if date_filters:
        query = query.filter(date_filters)
    
    # Filtros adicionales
    if genere_fill:
        query = query.filter(genere_fill=genere_fill)
    
    if estat_fill:
        query = query.filter(estat_fill=estat_fill)
    
    # Contar total de registros (para paginación)
    total = await query.count()
    
    # Aplicar ordenación
    if sort and sort in ["data", "numero_part", "created_at"]:
        query = query.order_by(sort if order == "asc" else f"-{sort}")
    
    # Aplicar paginación
    query = query.offset(offset).limit(limit)
    
    # Ejecutar consulta
    partos = await query
    
    # Formatear resultados
    results = []
    for parto in partos:
        results.append({
            "id": parto.id,
            "animal_id": parto.animal.id,
            "animal_nom": parto.animal.nom,  # Incluir el nombre de la vaca
            "part": parto.data.strftime("%d/%m/%Y"),  # Cambiar data a part
            "GenereT": parto.genere_fill,  # Cambiar genere_fill a GenereT
            "EstadoT": parto.estat_fill,  # Cambiar estat_fill a EstadoT
            "numero_part": parto.numero_part,
            "created_at": parto.created_at.strftime("%d/%m/%Y %H:%M:%S") if parto.created_at else None
        })
    
    return {
        "status": "success",
        "data": {
            "total": total,
            "offset": offset,
            "limit": limit,
            "items": results
        }
    }

@router.put("/{parto_id}", response_model=PartoResponse)
async def update_parto(parto_id: int, parto_data: PartoUpdate):
    """
    Actualiza los datos de un parto existente.
    
    - **parto_id**: ID del parto a actualizar
    - **data**: Nueva fecha del parto (DD/MM/YYYY)
    - **genere_fill**: Nuevo género del ternero (M/F)
    - **estat_fill**: Nuevo estado del ternero (OK/MUERTO)
    - **numero_part**: Nuevo número de parto
    """
    # Obtener parto existente
    parto = await Part.get_or_none(id=parto_id).prefetch_related("animal")
    
    if not parto:
        raise HTTPException(
            status_code=404,
            detail=f"Parto {parto_id} no encontrado"
        )
    
    # Validar fecha si se proporciona
    if parto_data.data:
        fecha_parto = validate_parto_date(
            parto_data.data, 
            parto.animal.dob
        )
        parto.data = fecha_parto
    
    # Actualizar campos si se proporcionan
    if parto_data.genere_fill:
        if parto_data.genere_fill not in [Genere.MASCLE, Genere.FEMELLA]:
            raise HTTPException(
                status_code=400,
                detail="El género del ternero debe ser M o F"
            )
        parto.genere_fill = parto_data.genere_fill
    
    if parto_data.estat_fill:
        parto.estat_fill = parto_data.estat_fill
    
    if parto_data.numero_part:
        parto.numero_part = parto_data.numero_part
    
    # Guardar cambios
    await parto.save()
    
    logger.info(f"Parto actualizado: ID={parto.id}")
    
    return {
        "success": True,
        "data": {
            "id": parto.id,
            "animal_id": parto.animal.id,
            "data": parto.data.strftime("%d/%m/%Y"),
            "genere_fill": parto.genere_fill,
            "estat_fill": parto.estat_fill,
            "numero_part": parto.numero_part,
            "created_at": parto.created_at.strftime("%d/%m/%Y %H:%M:%S") if parto.created_at else None
        }
    }
