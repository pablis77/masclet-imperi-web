"""
Extensión del servicio de dashboard con funciones adicionales para estadísticas detalladas.
Debe importarse desde el archivo principal dashboard_service.py.
"""

from typing import Dict, Optional, Tuple
from datetime import date, timedelta
from app.models import Animal, Part
from app.models.animal import EstadoAlletar
import logging

logger = logging.getLogger(__name__)

async def obtener_periodo_dinamico(explotacio: Optional[str] = None) -> Tuple[date, date]:
    """
    Obtiene el período dinámico para el dashboard, usando la fecha más antigua en la base de datos
    como fecha de inicio y la fecha actual como fecha de fin.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        
    Returns:
        Tuple[date, date]: Tupla con (fecha_inicio, fecha_fin)
    """
    # Fecha de fin siempre es la fecha actual
    fecha_fin = date.today()
    
    try:
        # Preparar filtros
        filtro = {}
        if explotacio:
            filtro["explotacio"] = explotacio
        
        # Buscar la fecha más antigua de nacimiento (dob) de animales
        animal_min_date = await Animal.filter(**filtro).order_by('dob').first()
        fecha_min_animal = animal_min_date.dob if animal_min_date and animal_min_date.dob else None
        
        # Buscar la fecha más antigua de partos
        parto_min_date = await Part.filter(**filtro).order_by('part').first()
        fecha_min_parto = parto_min_date.part if parto_min_date and parto_min_date.part else None
        
        # Determinar la fecha más antigua entre ambas
        fechas_candidatas = []
        if fecha_min_animal:
            fechas_candidatas.append(fecha_min_animal)
            logger.info(f"Fecha más antigua de animal: {fecha_min_animal}")
        if fecha_min_parto:
            fechas_candidatas.append(fecha_min_parto)
            logger.info(f"Fecha más antigua de parto: {fecha_min_parto}")
        
        if fechas_candidatas:
            # Usar la fecha más antigua encontrada
            fecha_inicio = min(fechas_candidatas)
            logger.info(f"Usando fecha más antigua del sistema como inicio: {fecha_inicio}")
        else:
            # Si no hay datos, usar un año atrás como fecha predeterminada
            fecha_inicio = date.today().replace(year=date.today().year - 1)
            logger.info(f"No se encontraron fechas, usando fecha predeterminada: {fecha_inicio}")
    
    except Exception as e:
        # En caso de error, usar un año atrás como fecha predeterminada
        logger.error(f"Error determinando fecha más antigua: {str(e)}")
        fecha_inicio = date.today().replace(year=date.today().year - 1)
    
    return fecha_inicio, fecha_fin

async def obtener_fecha_primer_parto(explotacio: Optional[str] = None) -> Tuple[date, date]:
    """Obtiene la fecha del primer parto registrado en la base de datos,
    para optimizar las gráficas de partos y evitar el 'salchichón' de datos vacíos
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        
    Returns:
        Tuple[date, date]: Tupla con (fecha_inicio, fecha_fin)
    """
    # Fecha de fin siempre es la fecha actual
    fecha_fin = date.today()
    
    try:
        # Preparar filtros para partos
        filtro = {}
        if explotacio:
            # Para filtrar partos por explotación, necesitamos los IDs de animales de esa explotación
            animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
            if animal_ids:
                filtro["animal_id__in"] = animal_ids
        
        # Buscar la fecha más antigua de partos
        parto_min_date = await Part.filter(**filtro).order_by('part').first()
        
        if parto_min_date and parto_min_date.part:
            # Tenemos un parto, usar su fecha como inicio
            fecha_inicio = parto_min_date.part
            # Restar un año para tener un poco de contexto visual en las gráficas
            fecha_inicio = fecha_inicio.replace(year=fecha_inicio.year - 1)
            logger.info(f"Usando primer parto como fecha inicio: {parto_min_date.part} (ajustado a {fecha_inicio})")
            return fecha_inicio, fecha_fin
        else:
            # Si no hay partos, usar 5 años atrás como predeterminado
            logger.info("No se encontraron partos, usando período predeterminado")
            fecha_inicio = date.today().replace(year=date.today().year - 5)
            return fecha_inicio, fecha_fin
    
    except Exception as e:
        # En caso de error, usar 5 años atrás como predeterminado
        logger.error(f"Error determinando fecha del primer parto: {str(e)}")
        fecha_inicio = date.today().replace(year=date.today().year - 5)
        return fecha_inicio, fecha_fin

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
