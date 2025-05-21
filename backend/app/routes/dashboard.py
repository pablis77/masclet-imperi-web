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
async def obtener_resumen(
    start_date: Optional[str] = Query(None, description="Fecha de inicio (formato: dd/mm/yyyy o yyyy-mm-dd)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (formato: dd/mm/yyyy o yyyy-mm-dd)")
):
    """
    Obtiene un resumen completo para el dashboard.
    
    - **start_date**: Fecha de inicio para el periodo de análisis (opcional)
    - **end_date**: Fecha de fin para el periodo de análisis (opcional)
    """
    try:
        # Convertir fechas si se proporcionan
        start_date_parsed = parse_date(start_date) if start_date else None
        end_date_parsed = parse_date(end_date) if end_date else None
        
        # Obtener estadísticas completas
        stats = await get_combined_dashboard(
            start_date=start_date_parsed,
            end_date=end_date_parsed
        )
        
        # Estructura de respuesta que coincide con lo que espera el frontend
        return {
            "total_animales": stats["animales"].get("total", 0),
            "total_terneros": stats["partos"].get("total_terneros", 0),
            "total_partos": stats["partos"].get("total", 0),
            "ratio_partos_animal": stats["partos"].get("ratio_partos_animal", 0),
            "tendencias": {
                "partos_mes_anterior": stats["tendencias"].get("partos_mes_anterior", 0),
                "partos_actual": stats["tendencias"].get("partos_actual", 0),
                "nacimientos_promedio": stats["tendencias"].get("nacimientos_promedio", 0)
            },
            "terneros": {
                "total": stats["partos"].get("total_terneros", 0)
            },
            "explotaciones": {
                "count": len(stats.get("explotaciones", []))
            },
            "partos": {
                "total": stats["partos"].get("total", 0)
            },
            "periodo": {
                "inicio": start_date_parsed.isoformat() if start_date_parsed else "2010-01-01",
                "fin": end_date_parsed.isoformat() if end_date_parsed else date.today().isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Error en resumen: {str(e)}", exc_info=True)
        # Devolver una respuesta vacía con la estructura esperada
        return {
            "total_animales": 0,
            "total_terneros": 0,
            "total_partos": 0,
            "ratio_partos_animal": 0,
            "tendencias": {
                "partos_mes_anterior": 0,
                "partos_actual": 0,
                "nacimientos_promedio": 0
            },
            "terneros": { "total": 0 },
            "explotaciones": { "count": 0 },
            "partos": { "total": 0 },
            "periodo": {
                "inicio": start_date_parsed.isoformat() if start_date_parsed else "2010-01-01",
                "fin": end_date_parsed.isoformat() if end_date_parsed else date.today().isoformat()
            }
        }

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