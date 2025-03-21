from fastapi import APIRouter, HTTPException, Query, Depends, Path
from app.models import Animal, Part
from app.models.explotacio import Explotacio
from app.models.enums import Estat, Genere
from app.services.dashboard_service import get_dashboard_stats, get_explotacio_dashboard, get_partos_dashboard, get_combined_dashboard
from app.schemas.dashboard import DashboardResponse, DashboardExplotacioResponse, PartosResponse, CombinedDashboardResponse
from app.core.auth import get_current_user, verify_user_role
from app.models.user import UserRole
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional
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

@router.get("/explotacions", response_model=List[Dict])
async def list_explotacions(current_user = Depends(get_current_user)):
    """
    Lista todas las explotaciones disponibles en el sistema.
    
    Devuelve una lista de explotaciones con su ID y nombre.
    """
    try:
        # Verificar que el usuario tiene acceso a las estadísticas de explotaciones
        if not verify_user_role(current_user, [UserRole.ADMIN, UserRole.GERENTE]):
            logger.warning(f"Usuario {current_user.username} intentó acceder a lista de explotaciones sin permisos")
            raise HTTPException(
                status_code=403, 
                detail="No tienes permisos para ver la lista de explotaciones"
            )
            
        # Si es gerente, solo puede ver sus explotaciones asignadas
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            # Los gerentes solo pueden ver sus explotaciones asignadas
            explotaciones = await Explotacio.filter(id=current_user.explotacio_id).values('id', 'nom')
        else:
            # Los administradores pueden ver todas las explotaciones
            explotaciones = await Explotacio.all().values('id', 'nom')
            
        return [{"id": e["id"], "nombre": e["nom"]} for e in explotaciones]
    except Exception as e:
        logger.error(f"Error al listar explotaciones: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error obteniendo lista de explotaciones")

@router.get("/explotacions/{explotacio_id}", response_model=Dict)
async def get_explotacio_stats(
    explotacio_id: int = Path(..., description="ID de la explotación"),
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
        
        # Verificar que la explotación existe
        explotacio = await Explotacio.get_or_none(id=explotacio_id)
        if not explotacio:
            # Obtener lista de explotaciones disponibles para el usuario
            if not verify_user_role(current_user, [UserRole.ADMIN]):
                # Los gerentes solo pueden ver sus explotaciones asignadas
                explotaciones = await Explotacio.filter(id=current_user.explotacio_id).values('id', 'nom')
            else:
                # Los administradores pueden ver todas las explotaciones
                explotaciones = await Explotacio.all().values('id', 'nom')
                
            explotaciones_list = [{"id": e["id"], "nombre": e["nom"]} for e in explotaciones]
            
            raise HTTPException(
                status_code=404, 
                detail={
                    "message": f"La explotación con ID {explotacio_id} no existe",
                    "explotaciones_disponibles": explotaciones_list
                }
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
        
        # Obtener estadísticas reales de la base de datos
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
        
        # Obtener estadísticas reales de la base de datos
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

def generar_datos_simulados_partos(start_date, end_date):
    """
    Genera datos simulados para estadísticas de partos que coinciden con el esquema PartosResponse.
    """
    from datetime import date, timedelta
    import random
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365)
    
    # Generar datos por mes
    por_mes = {}
    current_date = start_date
    while current_date <= end_date:
        month_key = current_date.strftime("%Y-%m")
        por_mes[month_key] = random.randint(1, 5)  # Entre 1 y 5 partos por mes
        # Avanzar al siguiente mes
        if current_date.month == 12:
            current_date = date(current_date.year + 1, 1, 1)
        else:
            current_date = date(current_date.year, current_date.month + 1, 1)
    
    # Calcular totales
    total_partos = sum(por_mes.values())
    
    # Generar distribución por género
    por_genero_cria = {"M": int(total_partos * 0.52), "F": int(total_partos * 0.48)}
    
    # Generar distribución anual
    distribucion_anual = {}
    for year in range(start_date.year, end_date.year + 1):
        distribucion_anual[str(year)] = sum(por_mes.get(f"{year}-{month:02d}", 0) for month in range(1, 13))
    
    # Generar datos por animal (simulados)
    por_animal = []
    for i in range(1, 6):  # 5 animales simulados
        por_animal.append({
            "id": i,
            "nombre": f"Animal Simulado {i}",
            "partos": random.randint(1, 4)
        })
    
    # Calcular último mes y año
    ultimo_mes = por_mes.get(end_date.strftime("%Y-%m"), 0)
    ultimo_año = sum(por_mes.get(f"{end_date.year}-{month:02d}", 0) for month in range(1, 13))
    
    # Calcular promedio mensual
    num_meses = len(por_mes)
    promedio_mensual = total_partos / num_meses if num_meses > 0 else 0
    
    # Tendencia (como diccionario con valores float, no como lista o string)
    tendencia = {
        "tendencia": 0.5,  # Valor float para la tendencia
        "promedio": promedio_mensual,  # Valor float para el promedio
        "valores": {k: float(v) for k, v in list(por_mes.items())[-3:]}  # Convertir valores a float
    }
    
    return {
        "total": total_partos,
        "por_mes": por_mes,
        "por_genero_cria": por_genero_cria,
        "tasa_supervivencia": 0.85,  # Valor simulado
        "distribucion_anual": distribucion_anual,
        "tendencia": tendencia,
        "por_animal": por_animal,
        "ultimo_mes": ultimo_mes,
        "ultimo_año": ultimo_año,
        "promedio_mensual": promedio_mensual,
        "explotacio_id": None,  # Opcional
        "periodo": {
            "inicio": start_date,
            "fin": end_date
        }
    }

def generar_datos_simulados_combined(explotacio_id, start_date, end_date):
    """
    Genera datos simulados para estadísticas combinadas que coinciden con el esquema CombinedDashboardResponse.
    """
    from datetime import date, timedelta
    import random
    
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365)
    
    # Generar estadísticas de animales
    animales = {
        "total": 100,
        "machos": 25,
        "hembras": 75,
        "ratio_m_h": 0.33,
        "por_estado": {"OK": 95, "DEF": 5},
        "por_alletar": {"NO": 20, "1": 60, "2": 20},
        "por_quadra": {"Principal": 60, "Secundaria": 40},
        "edades": {"0-1": 20, "1-2": 30, "2-5": 40, "5+": 10}
    }
    
    # Generar estadísticas de partos
    por_mes = {}
    current_date = start_date
    while current_date <= end_date:
        month_key = current_date.strftime("%Y-%m")
        por_mes[month_key] = random.randint(1, 8)
        if current_date.month == 12:
            current_date = date(current_date.year + 1, 1, 1)
        else:
            current_date = date(current_date.year, current_date.month + 1, 1)
    
    total_partos = sum(por_mes.values())
    ultimo_mes = por_mes.get(end_date.strftime("%Y-%m"), 0)
    ultimo_año = sum(por_mes.get(f"{end_date.year}-{month:02d}", 0) for month in range(1, 13))
    num_meses = len(por_mes) if por_mes else 1
    promedio_mensual = total_partos / num_meses if num_meses > 0 else 0
    
    partos = {
        "total": total_partos,
        "ultimo_mes": ultimo_mes,
        "ultimo_año": ultimo_año,
        "promedio_mensual": promedio_mensual,
        "por_mes": por_mes,
        "por_genero_cria": {"M": int(total_partos * 0.52), "F": int(total_partos * 0.48)},
        "tasa_supervivencia": 0.88,
        "distribucion_anual": {str(year): sum(por_mes.get(f"{year}-{month:02d}", 0) for month in range(1, 13)) 
                               for year in range(start_date.year, end_date.year + 1)}
    }
    
    # Generar estadísticas de explotaciones (si no se especifica una explotación)
    explotaciones = None
    if not explotacio_id:
        explotaciones = {
            "total": 5,
            "activas": 4,
            "inactivas": 1,
            "por_provincia": {"Barcelona": 2, "Girona": 1, "Lleida": 1, "Tarragona": 1},
            "ranking_partos": [
                {"id": 1, "nombre": "Explotación A", "partos": 45},
                {"id": 2, "nombre": "Explotación B", "partos": 30},
                {"id": 3, "nombre": "Explotación C", "partos": 15}
            ],
            "ranking_animales": [
                {"id": 1, "nombre": "Explotación A", "animales": 60},
                {"id": 2, "nombre": "Explotación B", "animales": 25},
                {"id": 3, "nombre": "Explotación C", "animales": 15}
            ]
        }
    
    # Generar estadísticas por cuadra
    por_quadra = {
        "Principal": {
            "total_animales": 60,
            "machos": 15,
            "hembras": 45,
            "total_partos": 30,
            "partos_periodo": 15
        },
        "Secundaria": {
            "total_animales": 40,
            "machos": 10,
            "hembras": 30,
            "total_partos": 20,
            "partos_periodo": 10
        }
    }
    
    # Generar indicadores de rendimiento
    rendimiento_partos = {
        "promedio_partos_por_hembra": 0.4,
        "partos_por_animal": 0.3,
        "eficiencia_reproductiva": 0.6
    }
    
    # Generar estadísticas comparativas
    comparativas = {
        "mes_actual_vs_anterior": {"animales": 0.05, "partos": 0.1},
        "año_actual_vs_anterior": {"animales": 0.15, "partos": 0.2},
        "tendencia_partos": {"valores": [5, 6, 7], "cambio_porcentual": 40.0},
        "tendencia_animales": {"valores": [90, 95, 100], "cambio_porcentual": 11.1}
    }
    
    # Generar tendencias (corregido para usar valores float)
    tendencias = {
        "partos": {
            "tendencia": 2.5,  # Valor float para la tendencia
            "promedio": 5.0,   # Valor float para el promedio
            "valores": 3.0     # Valor float para valores (no un diccionario)
        },
        "animales": {
            "tendencia": 5.0,  # Valor float para la tendencia
            "promedio": 95.0,  # Valor float para el promedio
            "valores": 10.0    # Valor float para valores (no un diccionario)
        }
    }
    
    # Nombre de la explotación (si se especifica)
    nombre_explotacio = f"Explotación {explotacio_id}" if explotacio_id else None
    
    return {
        "animales": animales,
        "partos": partos,
        "explotaciones": explotaciones,
        "comparativas": comparativas,
        "por_quadra": por_quadra,
        "rendimiento_partos": rendimiento_partos,
        "tendencias": tendencias,
        "explotacio_id": explotacio_id,
        "nombre_explotacio": nombre_explotacio,
        "periodo": {
            "inicio": start_date,
            "fin": end_date
        }
    }