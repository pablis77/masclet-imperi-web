from fastapi import APIRouter, HTTPException, Query, Depends
from app.models import Animal, Part
from app.models.enums import Estat, Genere
from app.services.dashboard_service import get_dashboard_stats, get_explotacio_dashboard, get_partos_dashboard, get_combined_dashboard
from app.schemas.dashboard import DashboardResponse, DashboardExplotacioResponse, PartosResponse, CombinedDashboardResponse
from app.core.auth import get_current_user, verify_user_role
from app.models.user import UserRole
from typing import Dict, Optional, List
from datetime import datetime, timedelta, date
import logging

# Configuración básica como animals.py
router = APIRouter()

logger = logging.getLogger(__name__)

@router.get("/stats", response_model=DashboardResponse)
async def get_stats(
    explotacio_id: Optional[int] = Query(None, description="ID de la explotación (opcional)"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)
):
    """
    Estadísticas completas del dashboard con filtros opcionales.
    
    Incluye:
    - Estadísticas detalladas de animales (total, por género, por estado, por cuadra, por edad, etc.)
    - Estadísticas detalladas de partos (total, distribución mensual, por género, tasas, etc.)
    - Estadísticas de explotaciones (cuando no se filtra por explotación)
    - Estadísticas comparativas y tendencias
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas generales
        if not verify_user_role(current_user, [UserRole.ADMIN, UserRole.GERENTE]):
            logger.warning(f"Usuario {current_user.username} intentó acceder a estadísticas generales sin permisos")
            raise HTTPException(
                status_code=403, 
                detail="No tienes permisos para ver estadísticas generales"
            )
            
        # Si se especifica una explotación, verificar que el usuario tenga acceso
        if explotacio_id and not verify_user_role(current_user, [UserRole.ADMIN]):
            # Para usuarios no admin, solo pueden ver sus explotaciones asignadas
            if current_user.explotacio_id != explotacio_id:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio_id} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
        
        stats = await get_dashboard_stats(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except HTTPException:
        # Re-lanzar las excepciones HTTP para que mantengan su código original
        raise
    except Exception as e:
        logger.error(f"Error en stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

@router.get("/explotacions/{explotacio_id}", response_model=DashboardExplotacioResponse)
async def get_explotacio_stats(
    explotacio_id: int,
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)
):
    """
    Estadísticas específicas para una explotación.
    
    Incluye:
    - Estadísticas detalladas de animales de la explotación
    - Estadísticas detalladas de partos de la explotación
    - Comparativas y tendencias específicas de la explotación
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas de explotaciones
        if not verify_user_role(current_user, [UserRole.ADMIN, UserRole.GERENTE]):
            logger.warning(f"Usuario {current_user.username} intentó acceder a estadísticas de explotación sin permisos")
            raise HTTPException(
                status_code=403, 
                detail="No tienes permisos para ver estadísticas de explotaciones"
            )
            
        # Verificar que el gerente solo puede ver sus explotaciones asignadas
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            # Los gerentes solo pueden ver sus explotaciones asignadas
            if current_user.explotacio_id != explotacio_id:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio_id} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
        
        stats = await get_explotacio_dashboard(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except HTTPException:
        # Re-lanzar las excepciones HTTP para que mantengan su código original
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error en explotacio stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas de la explotación")

@router.get("/resumen", response_model=Dict)
async def obtener_resumen(current_user = Depends(get_current_user)):
    """
    Obtiene estadísticas básicas para el dashboard (endpoint legado)
    
    Este endpoint se mantiene por compatibilidad con versiones anteriores.
    Se recomienda usar /stats para obtener estadísticas completas.
    """
    try:
        return await get_dashboard_stats()
    except Exception as e:
        logger.error(f"Error en resumen: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

@router.get("/partos", response_model=PartosResponse)
async def get_partos_stats(
    explotacio_id: Optional[int] = Query(None, description="ID de la explotación (opcional)"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)
):
    """
    Análisis detallado de partos.
    
    Incluye:
    - Métricas temporales (distribución por meses/años)
    - Tasas de éxito
    - Estadísticas por género
    - Análisis por animal
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas
        if explotacio_id and not verify_user_role(current_user, [UserRole.ADMIN]):
            # Para usuarios no admin, solo pueden ver sus explotaciones asignadas
            if current_user.explotacio_id != explotacio_id:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio_id} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
        
        stats = await get_partos_dashboard(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except HTTPException:
        # Re-lanzar las excepciones HTTP para que mantengan su código original
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error en partos stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas de partos")

@router.get("/combined", response_model=CombinedDashboardResponse)
async def get_combined_stats(
    explotacio_id: Optional[int] = Query(None, description="ID de la explotación (opcional)"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    current_user = Depends(get_current_user)
):
    """
    Vista consolidada de todas las estadísticas.
    
    Incluye:
    - Estadísticas de animales
    - Estadísticas de partos
    - Estadísticas por cuadra
    - Indicadores de rendimiento
    - Tendencias temporales
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas
        if explotacio_id and not verify_user_role(current_user, [UserRole.ADMIN]):
            # Para usuarios no admin, solo pueden ver sus explotaciones asignadas
            if current_user.explotacio_id != explotacio_id:
                logger.warning(f"Usuario {current_user.username} intentó acceder a explotación {explotacio_id} sin permisos")
                raise HTTPException(
                    status_code=403, 
                    detail="No tienes permisos para ver estadísticas de esta explotación"
                )
        
        stats = await get_combined_dashboard(
            explotacio_id=explotacio_id,
            start_date=start_date,
            end_date=end_date
        )
        return stats
    except HTTPException:
        # Re-lanzar las excepciones HTTP para que mantengan su código original
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error en combined stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas combinadas")

@router.get("/recientes", response_model=Dict)
async def get_recent_activity(
    days: int = Query(7, description="Número de días para considerar actividad reciente"),
    current_user = Depends(get_current_user)
):
    """
    Obtiene la actividad reciente (endpoint legado)
    
    Este endpoint se mantiene por compatibilidad con versiones anteriores.
    """
    try:
        # Fecha límite para considerar actividad "reciente"
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Contar animales y partos creados recientemente
        recent_animals = await Animal.filter(created_at__gte=cutoff_date).count()
        recent_partos = await Part.filter(created_at__gte=cutoff_date).count()
        
        return {
            "recientes": {
                "animales": recent_animals,
                "partos": recent_partos,
                "periodo_dias": days
            }
        }
    except Exception as e:
        logger.error(f"Error en recientes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo actividad reciente")