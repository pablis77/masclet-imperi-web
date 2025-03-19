from fastapi import APIRouter, HTTPException
from app.models.animal import Part
from app.schemas.parto import PartoCreate, PartoResponse
from app.models.animal import Animal
from typing import List

router = APIRouter()

@router.post("/partos/", response_model=PartoResponse, status_code=201)
async def create_parto(parto: PartoCreate):
    """Crear nuevo parto"""
    # Verificar que existe el animal
    animal = await Animal.get_or_none(id=parto.animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
        
    # Verificar que es hembra
    if animal.genere != "F":
        raise HTTPException(status_code=400, detail="Solo las hembras pueden tener partos")

    # Contar partos existentes para número secuencial
    num_partos = await Part.filter(animal_id=parto.animal_id).count()
    
    try:
        nuevo_parto = await Part.create(
            animal_id=parto.animal_id,
            data=parto.data,
            genere_fill=parto.genere_fill,
            estat_fill=parto.estat_fill,
            numero_part=num_partos + 1
        )
        return nuevo_parto
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/partos/animal/{animal_id}", response_model=List[PartoResponse])
async def get_partos_animal(animal_id: int):
    """Obtener partos de un animal"""
    return await Part.filter(animal_id=animal_id).order_by("-data")