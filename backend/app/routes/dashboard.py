from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import date, datetime, timedelta
from app.schemas.dashboard import DashboardResponse, DashboardExplotacioResponse
from app.services.dashboard_service import get_dashboard_stats, get_explotacio_dashboard
from app.core.date_utils import parse_date
from app.models import Animal, Part
import logging

router = APIRouter()

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_statistics(
    explotacio_id: Optional[int] = Query(None, description="ID de la explotación (opcional)"),
    desde: Optional[str] = Query(None, description="Fecha de inicio (formato: dd/mm/yyyy o yyyy-mm-dd)"),
    hasta: Optional[str] = Query(None, description="Fecha de fin (formato: dd/mm/yyyy o yyyy-mm-dd)")
):
    """
    Obtiene estadísticas completas para el dashboard con filtros opcionales.
    
    - **explotacio_id**: ID de la explotación (opcional para filtrar por explotación)
    - **desde**: Fecha de inicio para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    - **hasta**: Fecha de fin para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    """
    try:
        # Convertir fechas si se proporcionan
        start_date = parse_date(desde) if desde else None
        end_date = parse_date(hasta) if hasta else None
        
        # Obtener estadísticas
        stats = await get_dashboard_stats(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return stats
        
    except Exception as e:
        logging.error(f"Error al obtener estadísticas de dashboard: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas"
        )

@router.get("/explotacions/{explotacio_id}", response_model=DashboardExplotacioResponse)
async def get_explotacio_statistics(
    explotacio_id: int,
    desde: Optional[str] = Query(None, description="Fecha de inicio (formato: dd/mm/yyyy o yyyy-mm-dd)"),
    hasta: Optional[str] = Query(None, description="Fecha de fin (formato: dd/mm/yyyy o yyyy-mm-dd)")
):
    """
    Obtiene estadísticas específicas para una explotación.
    
    - **explotacio_id**: ID de la explotación
    - **desde**: Fecha de inicio para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    - **hasta**: Fecha de fin para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    """
    try:
        # Convertir fechas si se proporcionan
        start_date = parse_date(desde) if desde else None
        end_date = parse_date(hasta) if hasta else None
        
        # Obtener estadísticas
        stats = await get_explotacio_dashboard(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return stats
        
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        logging.error(f"Error al obtener estadísticas de explotación: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas de la explotación"
        )

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    explotacio_id: Optional[int] = None,
    desde: Optional[str] = None,
    hasta: Optional[str] = None
):
    """
    Obtiene estadísticas generales para el dashboard (endpoint legado, usar /stats para la versión más completa).
    
    - **explotacio_id**: ID de la explotación (opcional para filtrar por explotación)
    - **desde**: Fecha de inicio para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    - **hasta**: Fecha de fin para el periodo de análisis (formato: dd/mm/yyyy o yyyy-mm-dd)
    """
    return await get_dashboard_statistics(explotacio_id, desde, hasta)

@router.get("/resumen")
async def obtener_resumen():
    """Obtiene estadísticas básicas para el dashboard (endpoint legado)"""
    try:
        stats = await get_dashboard_stats()
        total_animales = stats["animales"]["total"]
        activos = stats["animales"]["por_estado"].get("OK", 0)
        
        return {
            "total_animales": total_animales,
            "animales_activos": activos,
            "porcentaje_activos": round(activos/total_animales * 100 if total_animales > 0 else 0, 2)
        }
    except Exception as e:
        logging.error(f"Error en resumen: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo resumen")

@router.get("/recientes")
async def get_recent_activity():
    """Obtiene la actividad reciente (endpoint legado)"""
    try:
        una_semana = datetime.now() - timedelta(days=7)
        
        return {
            "nuevos_registros": await Animal.filter(
                created_at__gte=una_semana
            ).count(),
            "ultimos_animales": await Animal.filter(
                created_at__gte=una_semana
            ).order_by("-created_at").limit(5).values(
                "id", "nom", "genere", "created_at"
            )
        }
    except Exception as e:
        logging.error(f"Error en actividad reciente: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo actividad reciente")