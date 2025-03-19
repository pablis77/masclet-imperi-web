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
    """Crea una nueva explotación."""
    return await Explotacio.create(**explotacio.model_dump())

@router.get("/", response_model=List[ExplotacioResponse])
async def list_explotacions() -> List[ExplotacioResponse]:
    """Lista todas las explotaciones."""
    return await Explotacio.all()

@router.get("/{explotacio_id}", response_model=ExplotacioResponse)
async def get_explotacio(explotacio_id: int) -> ExplotacioResponse:
    """Obtiene una explotación por su ID."""
    explotacio = await Explotacio.get_or_none(id=explotacio_id)
    if not explotacio:
        raise HTTPException(status_code=404, detail="Explotación no encontrada")
    return explotacio

@router.put("/{explotacio_id}", response_model=ExplotacioResponse)
async def update_explotacio(
    explotacio_id: int, 
    explotacio_update: ExplotacioUpdate
) -> ExplotacioResponse:
    """Actualiza una explotación."""
    explotacio = await Explotacio.get_or_none(id=explotacio_id)
    if not explotacio:
        raise HTTPException(status_code=404, detail="Explotación no encontrada")
        
    update_data = explotacio_update.model_dump(exclude_unset=True)
    await explotacio.update_from_dict(update_data)
    await explotacio.save()
    return explotacio