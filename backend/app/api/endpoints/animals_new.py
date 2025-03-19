from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.schemas.animal import (
    AnimalCreate, AnimalUpdate, AnimalResponse, 
    AnimalDetail, ExplotacioResponse
)
from app.core.messages import MessageResponse
from app.core.permissions import check_permissions, Action

router = APIRouter()

# Solo los endpoints optimizados
@router.get("/", response_model=List[AnimalResponse])
async def list_animals(
    explotacio: Optional[str] = Query(None),
    genere: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    alletar: Optional[bool] = Query(None)
):
    """Listar animales con filtros"""
    return []  # Por ahora retornamos lista vacía para probar ruta