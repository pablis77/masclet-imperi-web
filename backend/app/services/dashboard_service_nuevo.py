from typing import Dict, List, Optional, Tuple
from datetime import date, datetime, timedelta
import logging
from tortoise.functions import Count
from app.models import Animal, Part
from app.models.enums import Estado, Genere
from app.models.animal import EstadoAlletar

logger = logging.getLogger(__name__)

async def get_dashboard_stats(explotacio: Optional[str] = None, 
                              start_date: Optional[date] = None,
                              end_date: Optional[date] = None) -> Dict:
    """
    Obtiene estadísticas para el dashboard general o de una explotación específica.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        start_date: Fecha de inicio para el periodo de análisis (opcional)
        end_date: Fecha de fin para el periodo de análisis (opcional)
        
    Returns:
        Dict: Diccionario con las estadísticas
    """
    try:
        # Si no se especifican fechas, usar el último año
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=365)
        
        # Filtro base para todos los queries
        base_filter = {}
        nombre_explotacio = None
        
        if explotacio:
            base_filter["explotacio"] = explotacio
            nombre_explotacio = explotacio  # El nombre de la explotación es el mismo valor del campo
        
        # Estadísticas de animales
        total_animales = await Animal.filter(**base_filter).count()
        total_machos = await Animal.filter(**base_filter, genere="M").count()
        total_hembras = await Animal.filter(**base_filter, genere="F").count()
        
        # Ratio machos/hembras (evitar división por cero)
        ratio = 0.0
        if total_hembras > 0:
            ratio = total_machos / total_hembras
        
        # Estadísticas por estado
        total_activos = await Animal.filter(**base_filter, estado="OK").count()
        total_bajas = await Animal.filter(**base_filter, estado="DEF").count()
        
        # Porcentajes por estado
        por_estado = {
            "OK": total_activos,
            "DEF": total_bajas
        }
        
        # Estadísticas por estado de amamantamiento (solo para hembras)
        no_alletar = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.NO_ALLETAR).count()
        un_ternero = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.UN_TERNERO).count()
        dos_terneros = await Animal.filter(**base_filter, genere="F", alletar=EstadoAlletar.DOS_TERNEROS).count()
        
        por_alletar = {
            EstadoAlletar.NO_ALLETAR: no_alletar,
            EstadoAlletar.UN_TERNERO: un_ternero,
            EstadoAlletar.DOS_TERNEROS: dos_terneros
        }
        
        # Total de terneros: cada vaca con un ternero cuenta como 1, cada vaca con dos terneros cuenta como 2
        total_terneros = un_ternero + (dos_terneros * 2)
        
        # Estadísticas por origen
        por_origen = {}
        origenes = await Animal.filter(**base_filter).distinct().values_list('origen', flat=True)
        
        for origen in origenes:
            if origen:  # Ignorar valores nulos
                count = await Animal.filter(**base_filter, origen=origen).count()
                por_origen[origen] = count
        
        # Distribución por edades
        today = date.today()
        
        edades = {
            "menos_1_año": await Animal.filter(
                **base_filter,
                dob__gte=today - timedelta(days=365)
            ).count(),
            "1_2_años": await Animal.filter(
                **base_filter,
                dob__lt=today - timedelta(days=365),
                dob__gte=today - timedelta(days=365*2)
            ).count(),
            "2_5_años": await Animal.filter(
                **base_filter,
                dob__lt=today - timedelta(days=365*2),
                dob__gte=today - timedelta(days=365*5)
            ).count(),
            "mas_5_años": await Animal.filter(
                **base_filter,
                dob__lt=today - timedelta(days=365*5)
            ).count()
        }
        
        # Filtro para consultas de partos
        parto_filter = {}
        
        if explotacio:
            # Para filtrar partos por explotación, necesitamos los IDs de animales de esa explotación
            animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
            if animal_ids:
                parto_filter["animal_id__in"] = animal_ids
        
        # Filtrar partos por fecha
        fecha_filter = {
            "part__gte": start_date,
            "part__lte": end_date
        }
        
        # Estadísticas de partos
        total_partos = await Part.filter(**parto_filter, **fecha_filter).count()
        
        # Partos por género de cría
        partos_cria_macho = await Part.filter(**parto_filter, **fecha_filter, GenereT="M").count()
        partos_cria_hembra = await Part.filter(**parto_filter, **fecha_filter, GenereT="F").count()
        
        por_genero_cria = {
            "M": partos_cria_macho,
            "F": partos_cria_hembra
        }
        
        # Tasa de supervivencia
        partos_cria_ok = await Part.filter(**parto_filter, **fecha_filter, EstadoT="OK").count()
        
        tasa_supervivencia = 0.0
        if total_partos > 0:
            tasa_supervivencia = (partos_cria_ok / total_partos) * 100
        
        # Distribución mensual de partos
        partos_por_mes = {}
        current_date = start_date
        
        while current_date <= end_date:
            month_key = f"{current_date.year}-{current_date.month:02d}"
            month_start = date(current_date.year, current_date.month, 1)
            
            # Calcular el último día del mes
            if current_date.month == 12:
                next_month = date(current_date.year + 1, 1, 1)
            else:
                next_month = date(current_date.year, current_date.month + 1, 1)
            month_end = next_month - timedelta(days=1)
            
            # Contar partos en este mes
            count = await Part.filter(
                **parto_filter,
                part__gte=month_start,
                part__lte=month_end
            ).count()
            
            partos_por_mes[month_key] = count
            
            # Avanzar al siguiente mes
            if current_date.month == 12:
                current_date = date(current_date.year + 1, 1, 1)
            else:
                current_date = date(current_date.year, current_date.month + 1, 1)
        
        # Distribución anual de partos
        distribucion_anual = {}
        for year in range(start_date.year, end_date.year + 1):
            # Contar partos por año
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)
            year_count = await Part.filter(
                **parto_filter,
                part__gte=year_start,
                part__lte=year_end
            ).count()
            distribucion_anual[str(year)] = year_count
        
        # Últimos N animales con más partos (top 5)
        ranking_partos = []
        if explotacio and 'animal_ids' in locals() and animal_ids:
            # Consulta para contar partos por animal
            animal_partos = []
            for animal_id in animal_ids:
                count = await Part.filter(animal_id=animal_id).count()
                if count > 0:  # Solo incluir animales con partos
                    # Obtener información básica del animal
                    animal = await Animal.filter(id=animal_id).first()
                    if animal:
                        animal_partos.append({
                            "id": animal_id,
                            "nom": animal.nom,
                            "total_partos": count
                        })
            
            # Ordenar por número de partos (descendente)
            animal_partos.sort(key=lambda x: x["total_partos"], reverse=True)
            
            # Tomar los top 5
            ranking_partos = animal_partos[:5]
        
        # Partos en último mes
        un_mes_atras = end_date - timedelta(days=30)
        partos_ultimo_mes = await Part.filter(
            **parto_filter,
            part__gte=un_mes_atras,
            part__lte=end_date
        ).count()
        
        # Partos en último año
        partos_ultimo_anio = await Part.filter(
            **parto_filter,
            part__gte=start_date,
            part__lte=end_date
        ).count()
        
        # Estadísticas comparativas (tendencias)
        mes_actual_start = date(end_date.year, end_date.month, 1)
        if end_date.month == 1:
            mes_anterior_start = date(end_date.year - 1, 12, 1)
            mes_anterior_end = date(end_date.year, 1, 1) - timedelta(days=1)
        else:
            mes_anterior_start = date(end_date.year, end_date.month - 1, 1)
            mes_anterior_end = mes_actual_start - timedelta(days=1)
        
        # Partos del mes actual vs mes anterior
        partos_mes_actual = await Part.filter(
            **parto_filter,
            part__gte=mes_actual_start,
            part__lte=end_date
        ).count()
        
        partos_mes_anterior = await Part.filter(
            **parto_filter,
            part__gte=mes_anterior_start,
            part__lte=mes_anterior_end
        ).count()
        
        # Variación porcentual de partos (evitar división por cero)
        variacion_partos_mensual = 0.0
        if partos_mes_anterior > 0:
            variacion_partos_mensual = ((partos_mes_actual - partos_mes_anterior) / partos_mes_anterior) * 100
        
        # Animales creados en el mes actual vs mes anterior
        animales_mes_actual = await Animal.filter(
            **base_filter,
            created_at__gte=mes_actual_start,
            created_at__lte=end_date
        ).count()
        
        animales_mes_anterior = await Animal.filter(
            **base_filter,
            created_at__gte=mes_anterior_start,
            created_at__lte=mes_anterior_end
        ).count()
        
        # Variación porcentual de animales (evitar división por cero)
        variacion_animales_mensual = 0.0
        if animales_mes_anterior > 0:
            variacion_animales_mensual = ((animales_mes_actual - animales_mes_anterior) / animales_mes_anterior) * 100
        
        # Comparativa año actual vs año anterior
        año_actual_start = date(end_date.year, 1, 1)
        año_anterior_start = date(end_date.year - 1, 1, 1)
        año_anterior_end = date(end_date.year - 1, 12, 31)
        
        partos_año_actual = await Part.filter(
            **parto_filter,
            part__gte=año_actual_start,
            part__lte=end_date
        ).count()
        
        partos_año_anterior = await Part.filter(
            **parto_filter,
            part__gte=año_anterior_start,
            part__lte=año_anterior_end
        ).count()
        
        # Variación porcentual anual (evitar división por cero)
        variacion_partos_anual = 0.0
        if partos_año_anterior > 0:
            variacion_partos_anual = ((partos_año_actual - partos_año_anterior) / partos_año_anterior) * 100
        
        # Estructura de respuesta completa
        return {
            "animales": {
                "total": total_animales,
                "machos": total_machos,
                "hembras": total_hembras,
                "ratio_m_h": round(ratio, 3),
                "por_estado": por_estado,
                "por_alletar": por_alletar,
                "por_origen": por_origen,
                "por_edad": edades,
                "terneros": total_terneros
            },
            "partos": {
                "total": total_partos,
                "ultimo_mes": partos_ultimo_mes,
                "ultimo_anio": partos_ultimo_anio,
                "por_mes": partos_por_mes,
                "por_genero_cria": por_genero_cria,
                "tasa_supervivencia": round(tasa_supervivencia, 2),
                "distribucion_anual": distribucion_anual,
                "ranking_partos": ranking_partos
            },
            "comparativas": {
                "mes_actual_vs_anterior": {
                    "partos": {
                        "mes_actual": partos_mes_actual,
                        "mes_anterior": partos_mes_anterior,
                        "variacion_porcentual": round(variacion_partos_mensual, 2)
                    },
                    "animales": {
                        "mes_actual": animales_mes_actual,
                        "mes_anterior": animales_mes_anterior,
                        "variacion_porcentual": round(variacion_animales_mensual, 2)
                    }
                },
                "año_actual_vs_anterior": {
                    "partos": {
                        "año_actual": partos_año_actual,
                        "año_anterior": partos_año_anterior,
                        "variacion_porcentual": round(variacion_partos_anual, 2)
                    }
                }
            },
            "periodo": {
                "inicio": start_date,
                "fin": end_date
            },
            "explotacio": explotacio,
            "nombre_explotacio": nombre_explotacio
        }
    except Exception as e:
        logger.error(f"Error en get_dashboard_stats: {str(e)}", exc_info=True)
        # Si ocurre cualquier error, devolver una estructura de respuesta vacía
        return {
            "animales": {
                "total": 0,
                "machos": 0,
                "hembras": 0,
                "ratio_m_h": 0.0,
                "por_estado": {"OK": 0, "DEF": 0},
                "por_alletar": {
                    EstadoAlletar.NO_ALLETAR: 0,
                    EstadoAlletar.UN_TERNERO: 0,
                    EstadoAlletar.DOS_TERNEROS: 0
                },
                "por_origen": {},
                "por_edad": {
                    "menos_1_año": 0,
                    "1_2_años": 0,
                    "2_5_años": 0,
                    "mas_5_años": 0
                },
                "terneros": 0
            },
            "partos": {
                "total": 0,
                "ultimo_mes": 0,
                "ultimo_anio": 0,
                "por_mes": {},
                "por_genero_cria": {"M": 0, "F": 0},
                "tasa_supervivencia": 0.0,
                "distribucion_anual": {},
                "ranking_partos": []
            },
            "comparativas": {
                "mes_actual_vs_anterior": {
                    "partos": {
                        "mes_actual": 0,
                        "mes_anterior": 0,
                        "variacion_porcentual": 0.0
                    },
                    "animales": {
                        "mes_actual": 0,
                        "mes_anterior": 0,
                        "variacion_porcentual": 0.0
                    }
                },
                "año_actual_vs_anterior": {
                    "partos": {
                        "año_actual": 0,
                        "año_anterior": 0,
                        "variacion_porcentual": 0.0
                    }
                }
            },
            "periodo": {
                "inicio": start_date if start_date else date.today() - timedelta(days=365),
                "fin": end_date if end_date else date.today()
            },
            "explotacio": explotacio,
            "nombre_explotacio": nombre_explotacio
        }

async def crear_respuesta_vacia_partos(start_date, end_date, explotacio=None):
    """
    Crea una estructura de respuesta vacía para get_partos_dashboard cuando hay errores.
    """
    return {
        "total_partos": 0,
        "por_estado": {"OK": 0, "DEF": 0},
        "por_genero": {"M": 0, "F": 0},
        "distribucion_mensual": {},
        "periodo": {
            "inicio": start_date if start_date else date.today() - timedelta(days=365),
            "fin": end_date if end_date else date.today()
        },
        "explotacio": explotacio
    }

async def get_partos_dashboard(explotacio: Optional[str] = None,
                              animal_id: Optional[int] = None,
                              start_date: Optional[date] = None,
                              end_date: Optional[date] = None) -> Dict:
    """
    Obtiene estadísticas detalladas de partos para el dashboard.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        animal_id: ID del animal para filtrar (opcional)
        start_date: Fecha de inicio para el periodo de análisis (opcional)
        end_date: Fecha de fin para el periodo de análisis (opcional)
        
    Returns:
        Dict: Diccionario con estadísticas detalladas de partos
    """
    try:
        # Si no se especifican fechas, usar el último año
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=365)
            
        # Filtro base para todos los queries
        base_filter = {}
        if explotacio:
            base_filter["explotacio"] = explotacio
            
        # Distribución por estado
        por_estado = {}
        estados = ["OK", "DEF"]  # Añadir otros estados si existen
        for estado in estados:
            count = await Animal.filter(**base_filter, estado=estado).count()
            por_estado[estado] = count
        
        # Distribución por alletar (amamantamiento)
        por_alletar = {}
        alletar_values = [EstadoAlletar.NO_ALLETAR, EstadoAlletar.UN_TERNERO, EstadoAlletar.DOS_TERNEROS]
        for alletar_value in alletar_values:
            count = await Animal.filter(**base_filter, alletar=alletar_value).count()
            por_alletar[alletar_value] = count
            
    except Exception as e:
        logger.error(f"Error en get_partos_dashboard: {str(e)}", exc_info=True)
        # Si ocurre cualquier error, devolver una estructura de respuesta vacía
        return crear_respuesta_vacia_partos(start_date, end_date, explotacio)
    
    # Distribución por edades
    today = date.today()
    edades = {
        "menos_1_año": await Animal.filter(**base_filter, dob__gte=today - timedelta(days=365)).count(),
        "1_2_años": await Animal.filter(
            **base_filter, 
            dob__lt=today - timedelta(days=365),
            dob__gte=today - timedelta(days=365*2)
        ).count(),
        "2_5_años": await Animal.filter(
            **base_filter, 
            dob__lt=today - timedelta(days=365*2),
            dob__gte=today - timedelta(days=365*5)
        ).count(),
        "mas_5_años": await Animal.filter(
            **base_filter, 
            dob__lt=today - timedelta(days=365*5)
        ).count()
    }
    
    # Preparar filtros para los partos
    parto_filter = {}
    
    if animal_id:
        parto_filter["animal_id"] = animal_id
    elif explotacio:
        # Para filtrar partos por explotación, necesitamos los IDs de animales de esa explotación
        animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
        if animal_ids:
            parto_filter["animal_id__in"] = animal_ids
    
    # Filtrar partos por fecha
    fecha_filter = {
        "part__gte": start_date,
        "part__lte": end_date
    }
    
    # Total de partos en el periodo
    total_partos = await Part.filter(**parto_filter, **fecha_filter).count()
    
    # Distribución por género de cría
    por_genero = {
        "M": await Part.filter(**parto_filter, **fecha_filter, GenereT="M").count(),
        "F": await Part.filter(**parto_filter, **fecha_filter, GenereT="F").count()
    }
    
    # Distribución por estado de cría
    por_estado_cria = {
        "OK": await Part.filter(**parto_filter, **fecha_filter, EstadoT="OK").count(),
        "DEF": await Part.filter(**parto_filter, **fecha_filter, EstadoT="DEF").count()
    }
    
    # Distribución mensual de partos
    distribucion_mensual = {}
    current_date = start_date
    
    while current_date <= end_date:
        month_key = f"{current_date.year}-{current_date.month:02d}"
        month_start = date(current_date.year, current_date.month, 1)
        
        # Calcular el último día del mes
        if current_date.month == 12:
            next_month = date(current_date.year + 1, 1, 1)
        else:
            next_month = date(current_date.year, current_date.month + 1, 1)
        month_end = next_month - timedelta(days=1)
        
        # Contar partos en este mes
        count = await Part.filter(
            **parto_filter,
            part__gte=month_start,
            part__lte=month_end
        ).count()
        
        distribucion_mensual[month_key] = count
        
        # Avanzar al siguiente mes
        if current_date.month == 12:
            current_date = date(current_date.year + 1, 1, 1)
        else:
            current_date = date(current_date.year, current_date.month + 1, 1)
    
    # Tasa de supervivencia
    tasa_supervivencia = 0.0
    if total_partos > 0:
        tasa_supervivencia = (por_estado_cria["OK"] / total_partos) * 100
    
    # Información de la explotación (si aplica)
    info_explotacio = None
    if explotacio:
        # Podemos obtener información adicional de la explotación si es necesario
        info_explotacio = {
            "codigo": explotacio,
            "total_animales": await Animal.filter(explotacio=explotacio).count(),
            "activos": await Animal.filter(explotacio=explotacio, estado="OK").count()
        }
    
    # Estructura de respuesta
    return {
        "total_partos": total_partos,
        "por_genero": por_genero,
        "por_estado": por_estado_cria,
        "tasa_supervivencia": round(tasa_supervivencia, 2),
        "distribucion_mensual": distribucion_mensual,
        "info_animal": {
            "id": animal_id,
            "nom": await Animal.filter(id=animal_id).values_list("nom", flat=True)[0] if animal_id else None
        } if animal_id else None,
        "info_explotacio": info_explotacio,
        "periodo": {
            "inicio": start_date,
            "fin": end_date
        }
    }
