from fastapi import APIRouter, HTTPException, status
from app.models.animal import Animal
from app.schemas.animal import AnimalCreate, AnimalResponse, AnimalResponseData, AnimalUpdate
from app.core.messages import MessageType
from fastapi.responses import JSONResponse
from typing import Optional, Dict, List
import json
import logging
from tortoise.exceptions import IntegrityError
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[AnimalResponse])
async def list_animals(
    explotacio: Optional[str] = None,
    genere: Optional[str] = None,
    estado: Optional[str] = None,
    alletar: Optional[bool] = None
):
    """Listar animales con filtros"""
    query = Animal.all()
    if explotacio:
        query = query.filter(explotacio=explotacio)
    if genere:
        query = query.filter(genere=genere)
    if estado:
        query = query.filter(estado=estado)
    if alletar is not None:
        query = query.filter(alletar=alletar)
    
    return await query.order_by("nom")

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
