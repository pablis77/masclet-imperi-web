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

async def validate_animal(animal_nom: str, check_female: bool = True) -> Animal:
    """Valida que existe el animal y opcionalmente que sea hembra"""
    animal = await Animal.get_or_none(nom=animal_nom)
    if not animal:
        raise HTTPException(
            status_code=404,
            detail=f"Animal con nombre {animal_nom} no encontrado"
        )
        
    if check_female and animal.genere != Genere.FEMELLA:
        raise HTTPException(
            status_code=400,
            detail=f"El animal {animal_nom} no es una hembra y no puede tener partos"
        )
        
    if animal.estado == Estado.DEF:
        raise HTTPException(
            status_code=400,
            detail="No se pueden registrar partos de un animal dado de baja"
        )
        
    return animal

def validate_parto_date(parto_date_str: str, animal_dob: date = None) -> date:
    """Valida la fecha del parto"""
    try:
        parto_date = DateConverter.parse_date(parto_date_str)
        hoy = datetime.now().date()
        
        # Validar que no sea fecha futura
        if parto_date > hoy:
            raise HTTPException(
                status_code=400,
                detail="La fecha del parto no puede ser futura"
            )
            
        # Validar que el animal tenga edad suficiente
        if animal_dob:
            # Asumimos que necesita al menos 15 meses para tener un parto
            edad_minima = animal_dob + timedelta(days=15*30)
            if parto_date < edad_minima:
                raise HTTPException(
                    status_code=400,
                    detail="El animal es demasiado joven para tener partos en esta fecha"
                )
                
        return parto_date
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=PartoResponse, status_code=201)
async def create_parto(parto_data: PartoCreate) -> dict:
    """Registrar un nuevo parto"""
    try:
        # Validar el animal
        animal = await validate_animal(parto_data.animal_nom)
        
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
        
        return {
            "status": "success",
            "data": await parto.to_dict()
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
        # Buscar parto por ID
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

@router.patch("/{parto_id}", response_model=PartoResponse)
async def update_parto(parto_id: int, parto_data: PartoUpdate) -> dict:
    """Actualizar un parto existente"""
    try:
        # Buscar parto por ID
        parto_db = await Part.get_or_none(id=parto_id)
        if not parto_db:
            raise HTTPException(
                status_code=404,
                detail=f"Parto {parto_id} no encontrado"
            )
            
        # Validar animal
        animal = await validate_animal(parto_db.animal.nom, check_female=False)
        
        # Validar fecha si se proporciona
        if parto_data.part:
            if animal.dob:
                validate_parto_date(parto_data.part, animal.dob)
            parto_db.part = DateConverter.to_db_format(parto_data.part)
            
        # Actualizar otros campos si se proporcionan
        if parto_data.GenereT:
            parto_db.GenereT = parto_data.GenereT
            
        if parto_data.EstadoT:
            parto_db.EstadoT = parto_data.EstadoT
            
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

@router.get("", response_model=PartosListResponse)
async def list_partos(
    animal_nom: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    GenereT: Optional[str] = None,
    EstadoT: Optional[str] = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    sort: Optional[str] = "part",
    order: Optional[str] = "desc"
):
    """
    Obtiene un listado de partos con filtros opcionales.
    
    - **animal_nom**: Filtrar por nombre del animal (madre)
    - **year**: Filtrar por año
    - **month**: Filtrar por mes
    - **start_date**: Fecha inicial (DD/MM/YYYY)
    - **end_date**: Fecha final (DD/MM/YYYY)
    - **GenereT**: Filtrar por género del ternero (M/F)
    - **EstadoT**: Filtrar por estado del ternero (OK/MUERTO)
    - **offset**: Número de registros a saltar (paginación)
    - **limit**: Número máximo de registros a devolver
    - **sort**: Campo por el que ordenar (part, numero_part)
    - **order**: Orden (asc, desc)
    """
    # Construir query base
    query = Part.all().prefetch_related("animal")
    
    # Aplicar filtros
    if animal_nom:
        animal = await Animal.get_or_none(nom=animal_nom)
        if not animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal con nombre {animal_nom} no encontrado"
            )
        query = query.filter(animal_id=animal.id)
    
    # Filtros de fecha
    date_filters = Q()
    
    if year:
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)
        date_filters &= Q(part__gte=start_of_year, part__lte=end_of_year)
    
    if month:
        if year:
            start_date_month = date(year, month, 1)
            end_date_month = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
            date_filters &= Q(part__gte=start_date_month, part__lte=end_date_month)
    
    if start_date:
        try:
            fecha_inicio = DateConverter.parse_date(start_date)
            date_filters &= Q(part__gte=fecha_inicio)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha inicial inválido. Use DD/MM/YYYY"
            )
    
    if end_date:
        try:
            fecha_fin = DateConverter.parse_date(end_date)
            date_filters &= Q(part__lte=fecha_fin)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Formato de fecha final inválido. Use DD/MM/YYYY"
            )
    
    if date_filters:
        query = query.filter(date_filters)
    
    # Filtros adicionales
    if GenereT:
        query = query.filter(GenereT=GenereT)
    
    if EstadoT:
        query = query.filter(EstadoT=EstadoT)
    
    # Contar total de registros (para paginación)
    total = await query.count()
    
    # Aplicar ordenación
    if sort and sort in ["part", "numero_part", "created_at"]:
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
            "animal_nom": parto.animal.nom,  
            "part": parto.part.strftime("%d/%m/%Y"),  
            "GenereT": parto.GenereT,  
            "EstadoT": parto.EstadoT,  
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
