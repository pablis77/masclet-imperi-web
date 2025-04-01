"""
Endpoints para gestionar explotaciones ganaderas.
"""
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.explotacio import Explotacio
from app.schemas.explotacio import ExplotacioCreate, ExplotacioUpdate, ExplotacioResponse

router = APIRouter()

@router.post("/", response_model=ExplotacioResponse)
async def create_explotacio(explotacio: ExplotacioCreate) -> ExplotacioResponse:
    """
    Crea una nueva explotación.
    
    IMPORTANTE: 
    - 'explotacio' es el identificador único de la explotación
    - 'id' es un campo técnico generado automáticamente por la base de datos
    """
    return await Explotacio.create(**explotacio.model_dump())

@router.get("/", response_model=List[ExplotacioResponse])
async def list_explotacions() -> List[ExplotacioResponse]:
    """Lista todas las explotaciones."""
    return await Explotacio.all()

@router.get("/{explotacio}", response_model=ExplotacioResponse)
async def get_explotacio(explotacio: str) -> ExplotacioResponse:
    """
    Obtiene una explotación por su identificador único.
    """
    explotacio = await Explotacio.get_or_none(explotacio=explotacio)
    if not explotacio:
        raise HTTPException(status_code=404, detail="Explotación no encontrada")
    return explotacio

@router.put("/{explotacio}", response_model=ExplotacioResponse)
async def update_explotacio(
    explotacio: str, 
    explotacio_update: ExplotacioUpdate
) -> ExplotacioResponse:
    """
    Actualiza una explotación por su identificador único.
    
    Los campos que pueden actualizarse son:
    - explotacio: Identificador único de la explotación
    """
    explotacio_obj = await Explotacio.get_or_none(explotacio=explotacio)
    if not explotacio_obj:
        raise HTTPException(status_code=404, detail="Explotación no encontrada")
    
    # Actualizar solo los campos que se proporcionan en la solicitud
    update_data = explotacio_update.model_dump(exclude_unset=True)
    if update_data:
        for key, value in update_data.items():
            setattr(explotacio_obj, key, value)
        await explotacio_obj.save()
    
    return explotacio_obj

@router.delete("/{explotacio}", response_model=dict)
async def delete_explotacio(explotacio: str) -> dict:
    """
    Elimina una explotación por su identificador único.
    
    Nota: La eliminación de una explotación no afecta a los animales asociados a ella.
    """
    explotacio_obj = await Explotacio.get_or_none(explotacio=explotacio)
    if not explotacio_obj:
        raise HTTPException(status_code=404, detail="Explotación no encontrada")
    
    await explotacio_obj.delete()
    return {"message": "Explotación eliminada con éxito"}