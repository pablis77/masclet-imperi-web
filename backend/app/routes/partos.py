from fastapi import APIRouter, HTTPException
from app.models.animal import Part
from app.schemas.parto import PartoCreate, PartoResponse
from app.models.animal import Animal
from typing import List

router = APIRouter()

@router.post("/partos/", response_model=PartoResponse, status_code=201)
async def create_parto(parto: PartoCreate):
    """Crear nuevo parto"""
    # Verificar que existe el animal por nombre o ID según lo que se proporcione
    animal = None
    
    if hasattr(parto, 'animal_nom') and parto.animal_nom:
        animal = await Animal.get_or_none(nom=parto.animal_nom)
    elif hasattr(parto, 'animal_id') and parto.animal_id:
        animal = await Animal.get_or_none(id=parto.animal_id)
    
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
        
    # Verificar que es hembra
    if animal.genere != "F":
        raise HTTPException(status_code=400, detail="Solo las hembras pueden tener partos")

    # Contar partos existentes para número secuencial
    num_partos = await Part.filter(animal_id=animal.id).count()
    
    try:
        # Mapear los nombres de campos (asegurarse que los campos corresponden a los correctos)
        nuevo_parto = await Part.create(
            animal_id=animal.id,
            # Usar el campo part (nuevo) como entrada para data (viejo) si existe
            data=parto.part if hasattr(parto, 'part') else parto.data,
            # Usar GenereT (nuevo) como entrada para genere_fill (viejo) si existe
            genere_fill=parto.GenereT if hasattr(parto, 'GenereT') else parto.genere_fill,
            # Usar EstadoT (nuevo) como entrada para estat_fill (viejo) si existe
            estat_fill=parto.EstadoT if hasattr(parto, 'EstadoT') else parto.estat_fill,
            numero_part=num_partos + 1
        )
        
        # Asegurar que la respuesta usa los nombres de campos actualizados
        resultado = {
            "id": nuevo_parto.id,
            "animal_id": nuevo_parto.animal_id,
            "animal_nom": animal.nom, # Añadir nombre del animal
            "part": nuevo_parto.data,
            "GenereT": nuevo_parto.genere_fill,
            "EstadoT": nuevo_parto.estat_fill,
            "created_at": nuevo_parto.created_at,
            "updated_at": nuevo_parto.updated_at
        }
        
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Actualizamos para permitir búsqueda por ID o por nombre
@router.get("/partos/animal/{animal_id}", response_model=List[PartoResponse])
async def get_partos_animal(animal_id: int):
    """Obtener partos de un animal por ID"""
    animal = await Animal.get_or_none(id=animal_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    partos = await Part.filter(animal_id=animal_id).order_by("-data")
    
    # Convertir al formato esperado por el frontend
    resultado = [{
        "id": parto.id,
        "animal_id": parto.animal_id,
        "animal_nom": animal.nom,
        "part": parto.data,
        "GenereT": parto.genere_fill,
        "EstadoT": parto.estat_fill,
        "created_at": parto.created_at,
        "updated_at": parto.updated_at
    } for parto in partos]
    
    return resultado

# Añadimos endpoint para buscar por nombre del animal
@router.get("/partos/animal/nombre/{animal_nom}", response_model=List[PartoResponse])
async def get_partos_by_animal_name(animal_nom: str):
    """Obtener partos de un animal por nombre"""
    animal = await Animal.get_or_none(nom=animal_nom)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal no encontrado")
    
    partos = await Part.filter(animal_id=animal.id).order_by("-data")
    
    # Convertir al formato esperado por el frontend
    resultado = [{
        "id": parto.id,
        "animal_id": parto.animal_id,
        "animal_nom": animal.nom,
        "part": parto.data,
        "GenereT": parto.genere_fill,
        "EstadoT": parto.estat_fill,
        "created_at": parto.created_at,
        "updated_at": parto.updated_at
    } for parto in partos]
    
    return resultado