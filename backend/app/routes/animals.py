from fastapi import APIRouter, HTTPException, status
from app.models.animal import Animal
from app.schemas.animal import AnimalCreate, AnimalResponse, AnimalResponseData, AnimalUpdate
from app.core.messages import MessageType, MessageResponse
from fastapi.responses import JSONResponse
from typing import Optional, Dict, List, Any
import json
import logging
from tortoise.exceptions import IntegrityError
from datetime import datetime
from tortoise.functions import Count
from tortoise.contrib.pydantic import pydantic_model_creator

router = APIRouter()

@router.get("/")
async def list_animals(
    explotacio: Optional[str] = None,
    genere: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[str] = None,
    search: Optional[str] = None,
    quadra: Optional[str] = None,
    page: Optional[int] = 1,
    limit: Optional[int] = 10,
    all: Optional[bool] = False
):
    """Listar animales con filtros y paginación"""
    # SOLUCIÓN DEFINITIVA DE PAGINACIÓN
    
    # Log para depuración
    logging.info(f"NUEVA IMPLEMENTACIÓN - Recibida petición: página {page}, límite {limit}")
    logging.info(f"Filtros: explotacio={explotacio}, genere={genere}, estado={estado}, search={search}")
    
    try:
        # Paso 1: Obtener todos los IDs que coinciden con los filtros
        # Esto nos permite hacer una paginación exacta
        query = Animal.all()
        
        # Aplicar filtros
        if explotacio:
            query = query.filter(explotacio=explotacio)
        if genere:
            query = query.filter(genere=genere)
        if estado:
            query = query.filter(estado=estado)
        if alletar is not None:
            query = query.filter(alletar=alletar)
        if quadra:
            query = query.filter(quadra=quadra)
        
        # Búsqueda por texto
        if search:
            query = query.filter(
                (Animal.nom.contains(search)) |
                (Animal.cod.contains(search)) |
                (Animal.num_serie.contains(search))
            )
        
        # Paso 2: Contar el total de animales para la paginación
        total = await query.count()
        logging.info(f"Total de animales que coinciden con los filtros: {total}")
        
        # Paso 3: Calcular páginas
        pages = (total + limit - 1) // limit if limit > 0 else 1  # Evitar división por cero
        
        # IMPORTANTE: Asegurar que la página solicitada es válida
        if page <= 0:
            page = 1
        if page > pages and pages > 0:
            page = pages
        
        # Paso 4: Calcular offset basado en página
        offset = (page - 1) * limit
        logging.info(f"PAGINACIÓN: página {page} de {pages}, offset={offset}, limit={limit}")
        
        # Paso 5: Obtener los elementos para la página actual
        if all:
            # Modo "todos los animales"
            logging.info("Modo 'all=true': obteniendo TODOS los animales")
            # En este caso no aplicamos paginación
            animal_ids = await query.order_by("nom").values_list("id", flat=True)
            all_animals = await Animal.filter(id__in=animal_ids).order_by("nom")
            items = await Animal.to_api_dict_list(all_animals)
            logging.info(f"Obtenidos {len(items)} animales en modo 'all'")
        else:
            # Modo paginado normal
            logging.info(f"Ejecutando consulta paginada con offset={offset}, limit={limit}")
            
            # Obtener IDs ordenados (esto garantiza consistencia)
            all_ids = await query.order_by("nom").values_list("id", flat=True)
            
            # Aplicar slice de Python para paginación manual (más confiable que offset/limit de ORM)
            page_ids = all_ids[offset:offset+limit]
            
            logging.info(f"IDs para esta página: {page_ids}")
            
            # Obtener registros completos para estos IDs específicos
            if page_ids:
                page_animals = await Animal.filter(id__in=page_ids).order_by("nom")
                items = await Animal.to_api_dict_list(page_animals)
                
                if items:
                    logging.info(f"Primer animal en página {page}: {items[0]['nom']}")
                else:
                    logging.info(f"No hay animales en la página {page}")
            else:
                items = []
                logging.info("No hay IDs para esta página")
        
        # Paso 6: Construir respuesta
        response = {
            "status": "success",
            "data": {
                "total": total,
                "offset": offset,
                "limit": limit,
                "pages": pages,
                "page": page,
                "items": items
            }
        }
        
        logging.info(f"RESPUESTA: página {page} de {pages}, mostrando {len(items)} animales de {total}")
        return JSONResponse(content=response)
        
    except Exception as e:
        logging.error(f"ERROR en list_animals: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Error al listar animales: {str(e)}"
            }
        )

@router.post("/", response_model=MessageResponse, status_code=201)
async def create_animal(animal: AnimalCreate):
    """Crear nuevo animal"""
    try:
        # Convertir fecha si viene en formato DD/MM/YYYY
        if isinstance(animal.dob, str) and '/' in animal.dob:
            day, month, year = map(int, animal.dob.split('/'))
            animal.dob = datetime(year, month, day)

        # Crear diccionario con solo valores no nulos
        animal_dict = {k:v for k,v in animal.model_dump().items() if v is not None}
        
        # Crear animal
        new_animal = await Animal.create(**animal_dict)

        # Usar el método to_api_dict para la respuesta
        response_data = await new_animal.to_api_dict()

        return MessageResponse(
            message="Animal creado correctamente",
            type="success",
            data={"animal": response_data},
            status_code=201
        )
        
    except Exception as e:
        logging.error(f"Error creando animal: {str(e)}", exc_info=True)
        return MessageResponse(
            message=str(e),
            type="error",
            data=None,
            status_code=500
        )

@router.get("/{id}", response_model=AnimalResponseData)
async def get_animal(id: int):
    """Obtener detalles de un animal"""
    animal = await Animal.get_or_none(id=id).prefetch_related("parts")
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    return animal

@router.put("/{id}", response_model=AnimalResponse)
async def update_animal(id: int, data: AnimalUpdate):
    """Actualizar animal"""
    animal = await Animal.get_or_none(id=id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    await animal.update_from_dict(data.model_dump(exclude_unset=True))
    await animal.save()
    return animal

@router.delete("/{id}", status_code=204)
async def delete_animal(id: int):
    """Eliminar animal"""
    animal = await Animal.get_or_none(id=id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    await animal.delete()
from app.core.messages import MessageResponse
