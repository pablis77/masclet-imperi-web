from fastapi import APIRouter, Depends
from typing import Dict, List
from app.models.animal import Animal
from tortoise.functions import Count

router = APIRouter()

@router.get("/stats/explotacion", response_model=Dict)
async def get_explotacion_stats():
    """Obtener estadísticas por explotación"""
    stats = await Animal.all().group_by("explotacio").annotate(total=Count('id'))
    return {item.explotacio: item.total for item in stats}

@router.get("/stats/genero", response_model=Dict)
async def get_gender_stats():
    """Obtener distribución por género"""
    stats = await Animal.all().group_by("genere").annotate(total=Count('id'))
    return {item.genere: item.total for item in stats}

@router.get("/stats/alletar", response_model=Dict)
async def get_alletar_stats():
    """Obtener estado de amamantamiento"""
    stats = await Animal.all().group_by("alletar").annotate(total=Count('id'))
    return {str(item.alletar): item.total for item in stats}