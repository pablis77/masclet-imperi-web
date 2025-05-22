"""
Endpoints para obtener información sobre el período de análisis del dashboard.
Permite obtener un período dinámico basado en los datos reales del sistema.
"""

from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.dashboard_service_extended import obtener_periodo_dinamico
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/periodo-dinamico")
async def get_periodo_dinamico_endpoint(
    explotacio: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Dict:
    """
    Obtiene el período dinámico para el dashboard, basado en la fecha más antigua
    encontrada en la base de datos.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        
    Returns:
        Dict: Información sobre el período dinámico para el dashboard
    """
    try:
        fecha_inicio, fecha_fin = await obtener_periodo_dinamico(explotacio)
        
        return {
            "inicio": fecha_inicio.strftime("%Y-%m-%d"),
            "fin": fecha_fin.strftime("%Y-%m-%d"),
            "dias_totales": (fecha_fin - fecha_inicio).days,
            "dinamico": True,
            "mensaje": "Período calculado dinámicamente basado en los datos del sistema"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo período dinámico: {str(e)}"
        )
