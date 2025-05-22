from typing import Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException

from app.services.dashboard_service_extended import get_animales_detallado
from app.api.deps.auth import get_current_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/animales-detallado")
async def get_animales_detallado_endpoint(
    explotacio: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Obtiene estadísticas detalladas de animales, incluyendo:
    - Total de animales
    - Desglose por género (machos/hembras)
    - Desglose por estado (activos/fallecidos)
    - Desglose combinado (machos activos, machos fallecidos, hembras activas, hembras fallecidas)
    - Desglose por estado de amamantamiento
    """
    logger.info(f"Obteniendo estadísticas detalladas para: explotacio={explotacio}")
    
    try:
        resultado = await get_animales_detallado(explotacio)
        logger.info(f"Resultado de estadísticas detalladas: {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas detalladas: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")
