"""
Extensión del servicio de dashboard con funciones adicionales para estadísticas detalladas.
Debe importarse desde el archivo principal dashboard_service.py.
"""

from typing import Dict, Optional
from app.models import Animal
from app.models.animal import EstadoAlletar
import logging

logger = logging.getLogger(__name__)

async def get_animales_detallado(explotacio: Optional[str] = None) -> Dict:
    """
    Obtiene estadísticas detalladas de animales con desglose por género y estado.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        
    Returns:
        Dict: Diccionario con estadísticas detalladas de animales
    """
    logger.info(f"Iniciando get_animales_detallado: explotacio={explotacio}")
    
    try:
        # Filtro base para todos los queries
        base_filter = {}
        
        if explotacio:
            base_filter["explotacio"] = explotacio
        
        # Estadísticas generales
        total_animales = await Animal.filter(**base_filter).count()
        total_machos = await Animal.filter(**base_filter, genere="M").count()
        total_hembras = await Animal.filter(**base_filter, genere="F").count()
        
        # Estadísticas por estado
        total_activos = await Animal.filter(**base_filter, estado="OK").count()
        total_fallecidos = await Animal.filter(**base_filter, estado="DEF").count()
        
        # Estadísticas detalladas por género y estado
        machos_activos = await Animal.filter(**base_filter, genere="M", estado="OK").count()
        machos_fallecidos = await Animal.filter(**base_filter, genere="M", estado="DEF").count()
        hembras_activas = await Animal.filter(**base_filter, genere="F", estado="OK").count()
        hembras_fallecidas = await Animal.filter(**base_filter, genere="F", estado="DEF").count()
        
        # Estadísticas por estado de amamantamiento (solo para hembras)
        no_alletar = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.NO_ALLETAR).count()
        un_ternero = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.UN_TERNERO).count()
        dos_terneros = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.DOS_TERNEROS).count()
        
        por_alletar = {
            EstadoAlletar.NO_ALLETAR: no_alletar,
            EstadoAlletar.UN_TERNERO: un_ternero,
            EstadoAlletar.DOS_TERNEROS: dos_terneros
        }
        
        # Construir y devolver el resultado
        resultado = {
            "total": total_animales,
            "general": {
                "machos": total_machos,
                "hembras": total_hembras,
                "activos": total_activos,
                "fallecidos": total_fallecidos
            },
            "por_genero": {
                "machos": {
                    "total": total_machos,
                    "activos": machos_activos,
                    "fallecidos": machos_fallecidos
                },
                "hembras": {
                    "total": total_hembras,
                    "activas": hembras_activas,
                    "fallecidas": hembras_fallecidas
                }
            },
            "por_alletar": por_alletar
        }
        
        logger.info(f"Resultado de get_animales_detallado: {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Error en get_animales_detallado: {e}")
        # Devolver estructura vacía en caso de error
        return {
            "total": 0,
            "general": {
                "machos": 0,
                "hembras": 0,
                "activos": 0,
                "fallecidos": 0
            },
            "por_genero": {
                "machos": {
                    "total": 0,
                    "activos": 0,
                    "fallecidos": 0
                },
                "hembras": {
                    "total": 0,
                    "activas": 0,
                    "fallecidas": 0
                }
            },
            "por_alletar": {
                EstadoAlletar.NO_ALLETAR: 0,
                EstadoAlletar.UN_TERNERO: 0,
                EstadoAlletar.DOS_TERNEROS: 0
            }
        }
