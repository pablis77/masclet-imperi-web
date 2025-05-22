import logging
import logging
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Union, Any

from tortoise.functions import Sum, Count, Min
from tortoise.expressions import F

from app.models import Animal, Part, Import
from app.models.enums import ImportStatus
from app.models.animal import Genere, EstadoAlletar

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
    logger.info(f"Iniciando get_dashboard_stats: explotacio={explotacio}, start_date={start_date}, end_date={end_date}")
    try:
        # Si no se especifican fechas, usar desde 1900 hasta hoy (para incluir TODOS los datos)
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar una fecha muy antigua (1900) para incluir TODOS los datos históricos
            start_date = date(1900, 1, 1)  # Modificado para incluir TODOS los partos históricos
        
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
        
        # Estadísticas por estado de amamantamiento (solo para hembras activas)
        no_alletar = await Animal.filter(**base_filter, genere="F", estado="OK", alletar=EstadoAlletar.NO_ALLETAR).count()
        un_ternero = await Animal.filter(**base_filter, genere="F", estado="OK", alletar=EstadoAlletar.UN_TERNERO).count()
        dos_terneros = await Animal.filter(**base_filter, genere="F", estado="OK", alletar=EstadoAlletar.DOS_TERNEROS).count()
        
        por_alletar = {
            EstadoAlletar.NO_ALLETAR: no_alletar,
            EstadoAlletar.UN_TERNERO: un_ternero,
            EstadoAlletar.DOS_TERNEROS: dos_terneros
        }
        
        # Total de terneros: cada vaca con un ternero cuenta como 1, cada vaca con dos terneros cuenta como 2
        total_terneros = un_ternero + (dos_terneros * 2)
        
        logger.info("Calculando distribución por origen")
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
        
        logger.info("Calculando estadísticas de partos")
        
        # Obtener partos históricos (sin filtro de fecha)
        total_partos_historicos = await Part.filter(**parto_filter).count()
        # Definimos total_partos como el número histórico de partos para que esté disponible en la respuesta
        total_partos = total_partos_historicos
        logger.info(f"Total partos históricos: {total_partos_historicos}")
        
        # Obtener partos en el período seleccionado
        partos_periodo = await Part.filter(
            **parto_filter,
            part__gte=start_date,
            part__lte=end_date
        ).count()
        logger.info(f"Total partos en período: {partos_periodo}")
        
        # Distribución por género de la cría (para el período)
        por_genero_cria = {}
        for genero in ["M", "F", "esforrada"]:
            count = await Part.filter(**parto_filter, **fecha_filter, GenereT=genero).count()
            por_genero_cria[genero] = count
            
        # Calcular totales de partos
        total_partos_historicos = await Part.filter(**parto_filter).count()
        total_partos_periodo = total_partos_historicos  # Por ahora, mostramos el histórico siempre
        
        # Log para depuración
        logger.info(f"Conteo de partos para explotación '{explotacio}':")
        logger.info(f"  - Total histórico: {total_partos_historicos}")
        logger.info(f"  - Periodo seleccionado: {total_partos_periodo}")
        logger.info(f"  - Total animales: {total_animales}")
        
        # Tasa de supervivencia (basada en TODOS los partos históricos)
        supervivientes = await Part.filter(**parto_filter, EstadoT="OK").count()
        tasa_supervivencia = 0.0
        if total_partos_historicos > 0:
            tasa_supervivencia = supervivientes / total_partos_historicos
            logger.info(f"Tasa supervivencia: {tasa_supervivencia:.2f} ({supervivientes}/{total_partos_historicos})")
        else:
            logger.info("No hay partos históricos para calcular tasa de supervivencia")
        
        logger.info("Calculando distribución de partos por mes")
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
        
        logger.info("Calculando distribución de partos por año")
        distribucion_anual = {}
        
        # Obtener IDs de animales para filtrar partos
        animal_ids = []
        if explotacio:
            # Si filtramos por explotación, obtener solo esos IDs
            animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
        else:
            # Sin filtro, obtener todos los IDs
            animal_ids = await Animal.all().values_list('id', flat=True)
        
        # Crear filtro básico para partos
        parto_filter = {}
        if animal_ids:
            parto_filter["animal_id__in"] = list(animal_ids)
        
        # Calcular distribución por año
        for year in range(start_date.year, end_date.year + 1):
            # Contar partos por año
            year_start = date(year, 1, 1)
            year_end = date(year, 12, 31)
            
            # Construir filtro con fechas
            year_filter = dict(parto_filter)
            year_filter["part__gte"] = year_start
            year_filter["part__lte"] = year_end
            
            # Contar partos en este año
            year_count = await Part.filter(**year_filter).count()
            distribucion_anual[str(year)] = year_count
        
        logger.info("Calculando ranking de partos por animal")
        ranking_partos = []
        if animal_ids:
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
        
        # Calcular partos en último mes
        hoy = date.today()
        un_anio_atras = hoy - timedelta(days=365)  
        un_mes_atras = hoy - timedelta(days=30)
        partos_ultimo_mes = await Part.filter(
            **parto_filter,
            part__gte=un_mes_atras,
            part__lte=hoy
        ).count()
        
        # Partos en último año
        partos_ultimo_anio = await Part.filter(
            **parto_filter,
            part__gte=un_anio_atras,
            part__lte=hoy
        ).count()
        
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
            part__gte=un_anio_atras,
            part__lte=hoy
        ).count()
        
        # Estadísticas comparativas (tendencias)
        logger.info("Calculando comparativas temporales")
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
        logger.info("Calculando comparativa anual")
        año_actual_start = date(end_date.year, 1, 1)
        año_anterior_start = date(end_date.year - 1, 1, 1)
        año_anterior_end = date(end_date.year - 1, 12, 31)
        logger.info(f"Año actual: {año_actual_start}, Año anterior: {año_anterior_start}-{año_anterior_end}")
        
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
        
        # Calcular promedio mensual para partos (meses con datos)
        logger.info("Calculando promedio mensual de partos")
        meses_con_partos = sum(1 for count in partos_por_mes.values() if count > 0)
        promedio_mensual = total_partos / max(1, meses_con_partos) if meses_con_partos > 0 else 0.0
        logger.info(f"Meses con partos: {meses_con_partos}, Promedio mensual: {promedio_mensual}")
        
        # Estructura de respuesta completa
        logger.info("Generando estructura de respuesta final")
        return {
            "animales": {
                "total": total_animales,
                "machos": total_machos,  # Total de machos (activos + inactivos)
                "hembras": total_hembras,  # Total de hembras (activas + inactivas)
                "machos_activos": await Animal.filter(**base_filter, genere="M", estado="OK").count(),  # Solo machos activos
                "hembras_activas": await Animal.filter(**base_filter, genere="F", estado="OK").count(),  # Solo hembras activas
                # Añadir variables EXACTAMENTE como en verificar_contadores.py
                "toros_activos": await Animal.filter(**base_filter, genere="M", estado="OK").count(),
                "toros_fallecidos": await Animal.filter(**base_filter, genere="M", estado="DEF").count(),
                "vacas_activas": await Animal.filter(**base_filter, genere="F", estado="OK").count(),
                "vacas_fallecidas": await Animal.filter(**base_filter, genere="F", estado="DEF").count(),
                "ratio_m_h": ratio,
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
                "promedio_mensual": round(promedio_mensual, 2),  # Campo requerido
                "por_mes": partos_por_mes,
                "por_genero_cria": por_genero_cria,
                "tasa_supervivencia": round(tasa_supervivencia, 2),
                "distribucion_anual": distribucion_anual,
                "ranking_partos": ranking_partos
            },
            "comparativas": {
                "mes_actual_vs_anterior": {
                    "partos": round(variacion_partos_mensual, 2),  # Valor directo en lugar de objeto
                    "animales": round(variacion_animales_mensual, 2)  # Valor directo en lugar de objeto
                },
                "año_actual_vs_anterior": {
                    "partos": round(variacion_partos_anual, 2)  # Valor directo en lugar de objeto
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
                "machos_activos": 0,
                "hembras_activas": 0,
                "toros_activos": 0,
                "toros_fallecidos": 0,
                "vacas_activas": 0,
                "vacas_fallecidas": 0,
                "ratio_m_h": 0.0,
                "por_estado": {"OK": 0, "DEF": 0},
                "por_alletar": {
                    EstadoAlletar.NO_ALLETAR: 0,
                    EstadoAlletar.UN_TERNERO: 0,
                    EstadoAlletar.DOS_TERNEROS: 0
                },
                "por_quadra": {},
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
                "promedio_mensual": 0.0,  # Campo requerido
                "por_mes": {},
                "por_genero_cria": {"M": 0, "F": 0},
                "tasa_supervivencia": 0.0,
                "distribucion_anual": {},
                "ranking_partos": []
            },
            "comparativas": {
                "mes_actual_vs_anterior": {
                    "partos": 0.0,  # Valor directo en lugar de objeto
                    "animales": 0.0  # Valor directo en lugar de objeto
                },
                "año_actual_vs_anterior": {
                    "partos": 0.0  # Valor directo en lugar de objeto
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
        "total": 0,
        "por_mes": {},
        "por_genero_cria": {"M": 0, "F": 0, "esforrada": 0},
        "tasa_supervivencia": 0.0,
        "distribucion_anual": {},
        "tendencia": {"mensual": 0.0, "anual": 0.0},
        "ranking_partos": [],
        "ultimo_mes": 0,
        "ultimo_año": 0,  # Cambiado de ultimo_anio a ultimo_año para que coincida con el frontend
        "promedio_mensual": 0.0,
        "explotacio": explotacio,
        "periodo": {
            "inicio": start_date if start_date else date.today() - timedelta(days=365),
            "fin": end_date if end_date else date.today()
        }
    }

async def get_explotacio_dashboard(explotacio_value: str,
                                  start_date: Optional[date] = None,
                                  end_date: Optional[date] = None) -> Dict:
    """
    Obtiene estadísticas específicas para una explotación usando su valor.
    
    Args:
        explotacio_value: Valor del campo explotacio para filtrar
        start_date: Fecha de inicio para el periodo de análisis (opcional)
        end_date: Fecha de fin para el periodo de análisis (opcional)
        
    Returns:
        Dict: Diccionario con las estadísticas de la explotación
    """
    try:
        # Verificar que la explotación existe
        exists = await Animal.filter(explotacio=explotacio_value).exists()
        if not exists:
            raise ValueError(f"No existen animales para la explotación '{explotacio_value}'")
        
        # Si no se especifican fechas, usar desde 1900 hasta hoy (para incluir TODOS los datos)
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar una fecha muy antigua (1900) para incluir TODOS los datos históricos
            start_date = date(1900, 1, 1)  # Modificado para incluir TODOS los partos históricos
        
        # Filtro base para todos los queries
        base_filter = {"explotacio": explotacio_value}
        
        # Estadísticas de animales
        total_animales = await Animal.filter(**base_filter).count()
        total_machos = await Animal.filter(**base_filter, genere="M").count()
        total_hembras = await Animal.filter(**base_filter, genere="F").count()
        
        # Ratio machos/hembras (evitar división por cero)
        ratio = 0.0 if total_hembras == 0 else total_machos / total_hembras
        
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
        
        # Calcular el número total de terneros
        total_terneros = 0
        # Vacas con 1 ternero
        total_terneros += por_alletar.get(EstadoAlletar.UN_TERNERO, 0)
        # Vacas con 2 terneros (cada una cuenta como 2)
        total_terneros += por_alletar.get(EstadoAlletar.DOS_TERNEROS, 0) * 2
        
        # Estadísticas de partos
        parto_filter = {}
        animal_ids = await Animal.filter(explotacio=explotacio_value).values_list('id', flat=True)
        if animal_ids:
            parto_filter["animal_id__in"] = animal_ids
        
        # Aplicar filtro de fechas a los partos
        fecha_filter = {
            "part__gte": start_date,
            "part__lte": end_date
        }
        logger.info(f"Filtro de fechas para partos: {fecha_filter}")
        
        total_partos = await Part.filter(**parto_filter, **fecha_filter).count()
        logger.info(f"Total partos: {total_partos}")
        
        # Partos en el último mes
        un_mes_atras = end_date - timedelta(days=30)
        partos_ultimo_mes = await Part.filter(
            **parto_filter,
            part__gte=un_mes_atras,
            part__lte=end_date
        ).count()
        
        # Construir el resultado
        return {
            # Incluimos el campo explotacio directamente en la raíz
            "explotacio": explotacio_value,
            "explotacion": {
                "explotacio": explotacio_value,
                "nombre": explotacio_value
            },
            "periodo": {
                "inicio": start_date.isoformat(),
                "fin": end_date.isoformat(),
                "dias": (end_date - start_date).days
            },
            "animales": {
                "total": total_animales,
                "machos": total_machos,
                "hembras": total_hembras,
                "ratio_m_h": round(ratio, 3),
                "por_estado": por_estado,
                "por_alletar": por_alletar,
                "terneros": total_terneros
            },
            "partos": {
                "total": total_partos,
                "ultimo_mes": partos_ultimo_mes
            }
        }
    except Exception as e:
        logger.error(f"Error en get_explotacio_dashboard: {str(e)}", exc_info=True)
        raise

async def get_dashboard_resumen(explotacio: Optional[str] = None,
                               start_date: Optional[date] = None,
                               end_date: Optional[date] = None) -> Dict:
    """
    Obtiene un resumen general para el dashboard.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        start_date: Fecha de inicio para el periodo de análisis (opcional)
        end_date: Fecha de fin para el periodo de análisis (opcional)
        
    Returns:
        Dict: Resumen con estadísticas clave
    """
    try:
        # Si no se proporcionan fechas, usar desde 2010 hasta hoy
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar 2010 como fecha de inicio para incluir todos los datos históricos
            start_date = date(1900, 1, 1)  # Modificado para incluir TODOS los partos históricos
            
        logger.info(f"Dashboard resumen: usando rango ampliado {start_date} a {end_date}")
        
        # Filtro base para consultas
        base_filter = {}
        nombre_explotacio = None
        
        if explotacio:
            base_filter["explotacio"] = explotacio
            nombre_explotacio = explotacio
        
        # Estadísticas de animales
        total_animales = await Animal.filter(**base_filter).count()
        total_machos = await Animal.filter(**base_filter, genere="M").count()
        total_hembras = await Animal.filter(**base_filter, genere="F").count()
        
        # Cálculo correcto de terneros basado en el estado de amamantamiento
        alletar_filter = dict(base_filter)
        alletar_filter["alletar"] = EstadoAlletar.UN_TERNERO  # Vacas con 1 ternero
        vacas_con_un_ternero = await Animal.filter(**alletar_filter).count()
        
        alletar_filter = dict(base_filter)  # Reiniciar el filtro
        alletar_filter["alletar"] = EstadoAlletar.DOS_TERNEROS  # Vacas con 2 terneros
        vacas_con_dos_terneros = await Animal.filter(**alletar_filter).count()
        
        # El total de terneros es: (1 × número de vacas con alletar=1) + (2 × número de vacas con alletar=2)
        total_terneros = vacas_con_un_ternero + (vacas_con_dos_terneros * 2)
        
        # Estadísticas de partos
        # Obtener IDs de animales para filtrar los partos
        animal_ids = []
        if explotacio:
            # Si se está filtrando por explotación, obtener solo los IDs de esa explotación
            animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
        else:
            # Si no hay filtro de explotación, obtener todos los IDs de animales
            animal_ids = await Animal.all().values_list('id', flat=True)
        
        # Conteo de partos - TOTAL HISTÓRICO (sin filtro de fechas)
        total_partos_historicos = 0
        # Conteo de partos - PERIODO SELECCIONADO (con filtro de fechas)
        total_partos_periodo = 0
        
        if animal_ids:  # Verificar que hay animales antes de consultar partos
            # Contar TODOS los partos históricos sin filtro de fecha
            total_partos_historicos = await Part.filter(animal_id__in=list(animal_ids)).count()
            
            # Aplicar filtros de fecha para el periodo seleccionado
            fecha_filter = {}
            if start_date:
                fecha_filter["part__gte"] = start_date
            if end_date:
                fecha_filter["part__lte"] = end_date
                
            # Consultar partos DEL PERIODO que pertenecen a los animales filtrados
            total_partos_periodo = await Part.filter(animal_id__in=list(animal_ids), **fecha_filter).count()
            
            # Agregar logging para depuración
            logger.info(f"Conteo de partos para explotación '{explotacio}':")
            logger.info(f"  - Total histórico: {total_partos_historicos}")
            logger.info(f"  - Periodo seleccionado: {total_partos_periodo}")
            logger.info(f"  - Total animales: {len(animal_ids)}")
            
            # Contar partos del último mes y desde 2010 (datos históricos)
            un_mes_atras = date.today() - timedelta(days=30)
            un_anio_atras = date.today() - timedelta(days=365)  # Definimos la variable aquí
            # Usar 2010 como fecha de inicio para datos históricos
            fecha_inicio_historica = date(2010, 1, 1)
            
            partos_ultimo_mes = await Part.filter(
                animal_id__in=list(animal_ids),
                part__gte=un_mes_atras
            ).count()
            
            partos_ultimo_anio = await Part.filter(
                animal_id__in=list(animal_ids),
                part__gte=un_anio_atras
            ).count()
            
            # Calcular tasa de supervivencia (partos con EstadoT='OK' dividido por total)
            total_partos_ok = await Part.filter(
                animal_id__in=list(animal_ids),
                EstadoT="OK"
            ).count()
            
            tasa_supervivencia = 0.0
            if total_partos_historicos > 0:
                tasa_supervivencia = total_partos_ok / total_partos_historicos
        
        # Inicializar variables que podrían no estar definidas
        partos_ultimo_mes = 0
        partos_ultimo_anio = 0
        tasa_supervivencia = 0.0
        
        # Si hay animales, calcular últimos partos y supervivencia
        if animal_ids and len(animal_ids) > 0:
            # Si hay animales, calcular partos último mes
            un_mes_atras = date.today() - timedelta(days=30)
            partos_ultimo_mes = await Part.filter(
                animal_id__in=list(animal_ids),
                part__gte=un_mes_atras
            ).count()
            
            # Si hay animales, calcular partos último año
            un_anio_atras = date(2010, 1, 1)  # Usar fecha inicio 2010
            partos_ultimo_anio = await Part.filter(
                animal_id__in=list(animal_ids),
                part__gte=un_anio_atras
            ).count()
            
            # Si hay partos, calcular tasa de supervivencia
            if total_partos_historicos > 0:
                # Calcular tasa de supervivencia (partos con EstadoT='OK' dividido por total)
                total_partos_ok = await Part.filter(
                    animal_id__in=list(animal_ids),
                    EstadoT="OK"
                ).count()
                tasa_supervivencia = total_partos_ok / total_partos_historicos
        
        # Estructura final
        return {
            "total_animales": total_animales,
            "total_partos": total_partos_historicos,
            "total_terneros": total_terneros,
            "ratio_partos_animal": round(total_partos_historicos / total_animales, 2) if total_animales > 0 else 0,
            "explotacio": explotacio,
            "nombre_explotacio": nombre_explotacio,
            "tendencias": {
                "partos_mes_anterior": partos_ultimo_mes,
                "partos_actual": total_partos_periodo,
                "nacimientos_promedio": round(total_partos_historicos / 12, 1) if total_partos_historicos > 0 else 0
            },
            "tasa_supervivencia": round(tasa_supervivencia * 100, 1),
            "partos": {
                "total": total_partos_historicos,
                "ultimo_mes": partos_ultimo_mes,
                "ultimo_anio": partos_ultimo_anio
            },
            "periodo": {
                "inicio": start_date,
                "fin": end_date
            }
        }
    except Exception as e:
        logger.error(f"Error en get_dashboard_resumen: {str(e)}", exc_info=True)
        return crear_respuesta_vacia_resumen(start_date, end_date, explotacio, nombre_explotacio)

def crear_respuesta_vacia_resumen(start_date, end_date, explotacio=None, nombre_explotacio=None):
    """
    Crea una estructura de respuesta vacía para el resumen cuando no hay datos.
    """
    return {
        "total_animales": 0,
        "total_partos": 0,
        "total_terneros": 0,
        "ratio_partos_animal": 0,
        "explotacio": explotacio,
        "nombre_explotacio": nombre_explotacio,
        "periodo": {
            "inicio": start_date if start_date else date.today() - timedelta(days=365),
            "fin": end_date if end_date else date.today()
        }
    }

async def get_combined_dashboard(explotacio: Optional[str] = None,
                                start_date: Optional[date] = None,
                                end_date: Optional[date] = None) -> Dict:
    """
    Obtiene una vista combinada de todas las estadísticas para el dashboard.
    
    Args:
        explotacio: Valor del campo explotacio para filtrar (opcional)
        start_date: Fecha de inicio para el periodo de análisis (opcional)
        end_date: Fecha de fin para el periodo de análisis (opcional)
        
    Returns:
        Dict: Diccionario con estadísticas combinadas que cumple con CombinedDashboardResponse
    """
    try:
        logger.info(f"Iniciando get_combined_dashboard: explotacio={explotacio}, start_date={start_date}, end_date={end_date}")
        
        # Si no se especifican fechas, usar desde 1900 hasta hoy (para incluir TODOS los datos)
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar una fecha muy antigua (1900) para incluir TODOS los datos históricos
            start_date = date(1900, 1, 1)
        
        # Obtener estadísticas básicas
        stats = await get_dashboard_stats(explotacio, start_date, end_date)
        
        # Verificar si stats es None y crear una estructura predeterminada si es necesario
        if stats is None:
            logger.warning("No se encontraron estadísticas básicas")
            return crear_respuesta_vacia_combined(start_date, end_date, explotacio)
        
        # Calcular ratio machos/hembras
        total_machos = stats.get("animales", {}).get("machos", 0)
        total_hembras = stats.get("animales", {}).get("hembras", 0)
        ratio_m_h = total_machos / total_hembras if total_hembras > 0 else 0
        
        # Calcular estadísticas de partos
        total_partos = stats.get("partos", {}).get("total", 0)
        
        # Calcular partos del último mes
        un_mes_atras = date.today() - timedelta(days=30)
        partos_ultimo_mes = await Part.filter(
            part__gte=un_mes_atras,
            part__lte=date.today()
        ).count()
        
        # Calcular promedio mensual de partos
        dias_periodo = (end_date - start_date).days
        meses_periodo = max(1, dias_periodo / 30.44)  # 30.44 días por mes en promedio
        promedio_mensual = total_partos / meses_periodo if meses_periodo > 0 else 0
        
        # Construir la respuesta completa con la estructura que espera el frontend
        combined_stats = {
            "animales": {
                "total": total_machos + total_hembras,
                "machos": total_machos,
                "hembras": total_hembras,
                "ratio_m_h": round(ratio_m_h, 2),
                "por_estado": stats.get("animales", {}).get("por_estado", {"OK": 0, "DEF": 0}),
                "por_alletar": stats.get("animales", {}).get("por_alletar", {"0": 0, "1": 0, "2": 0}),
                "por_origen": stats.get("animales", {}).get("por_origen", {}),
                "edades": stats.get("animales", {}).get("por_edad", {})
            },
            "partos": {
                "total": total_partos,
                "ultimo_mes": partos_ultimo_mes,
                "ultimo_anio": total_partos,  # Usar total como aproximación para el último año
                "promedio_mensual": round(promedio_mensual, 1),
                "por_mes": stats.get("partos", {}).get("por_mes", {}),
                "por_genero_cria": stats.get("partos", {}).get("por_genero_cria", {"M": 0, "F": 0, "esforzada": 0}),
                "tasa_supervivencia": stats.get("partos", {}).get("tasa_supervivencia", 0.0)
            },
            "comparativas": {
                "mes_actual_vs_anterior": stats.get("comparativas", {}).get("mes_actual_vs_anterior", {}),
                "año_actual_vs_anterior": stats.get("comparativas", {}).get("año_actual_vs_anterior", {})
            },
            "por_origen": {
                origen: {
                    "animales": count,
                    "partos": 0,  # Se podría calcular con más detalle si es necesario
                    "ratio_partos": 0.0
                }
                for origen, count in stats.get("animales", {}).get("por_origen", {}).items()
            },
            "rendimiento_partos": {
                "anual": (total_partos / total_hembras) * (365 / dias_periodo) if total_hembras > 0 and dias_periodo > 0 else 0.0,
                "mensual": (total_partos / total_hembras) * (12 / (dias_periodo / 30.44)) if total_hembras > 0 and dias_periodo > 0 else 0.0,
                "semanal": (total_partos / total_hembras) * (52 / (dias_periodo / 7)) if total_hembras > 0 and dias_periodo > 0 else 0.0
            },
            "tendencias": {
                "partos": {
                    "ultimo_mes": partos_ultimo_mes,
                    "ultimo_anio": total_partos  # Usar total como aproximación
                },
                "animales": {
                    "ultimo_mes": 0.0,  # No hay datos históricos de animales
                    "ultimo_anio": 0.0  # No hay datos históricos de animales
                }
            },
            "explotacio": explotacio,
            "nombre_explotacio": explotacio,  # Mismo valor que explotacio si no hay nombre específico
            "periodo": {
                "inicio": start_date,
                "fin": end_date
            }
        }
        
        return combined_stats
    except Exception as e:
        logger.error(f"Error en get_combined_dashboard: {str(e)}", exc_info=True)
        return crear_respuesta_vacia_combined(start_date, end_date, explotacio)

def crear_respuesta_vacia_combined(start_date, end_date, explotacio=None):
    """
    Crea una estructura de respuesta vacía para el dashboard combinado cuando no hay datos o hay errores.
    
    Args:
        start_date: Fecha de inicio del periodo analizado
        end_date: Fecha de fin del periodo analizado
        explotacio: Valor del campo explotacio si se filtró por explotación
        
    Returns:
        Dict: Estructura predeterminada para CombinedDashboardResponse
    """
    logger.info(f"Creando respuesta vacía para dashboard combinado: explotacio={explotacio}")
    
    # Crear estructura básica que coincida con lo que usa nuestro frontend
    return {
        "animales": {
            "total": 0,
            "machos": 0,
            "hembras": 0,
            "ratio_m_h": 0.0,
            "por_estado": {
                "OK": 0,
                "DEF": 0
            },
            "por_alletar": {
                "0": 0,
                "1": 0,
                "2": 0
            },
            "terneros": 0,
            "por_quadra": {},
            "edades": {
                "menos_1_año": 0,
                "1_2_años": 0,
                "2_5_años": 0,
                "mas_5_años": 0
            }
        },
        "partos": {
            "total": 0,
            "en_periodo": 0,
            "por_genero": {
                "M": 0,
                "F": 0,
                "esforrada": 0
            },
            "por_estado": {
                "OK": 0,
                "DEF": 0
            },
            "tasa_supervivencia": 0.0,
            "distribucion_mensual": {},
            "distribucion_anual": {},
            "por_animal": []
        },
        "explotacio": explotacio,
        "periodo": {
            "inicio": start_date,
            "fin": end_date if end_date else date.today()
        }
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
        logger.info(f"Iniciando get_partos_dashboard: explotacio={explotacio}, animal_id={animal_id}, start_date={start_date}, end_date={end_date}")
        
        # Si no se especifican fechas, usar desde 1900 hasta hoy (para incluir TODOS los datos)
        if not end_date:
            end_date = date.today()
        if not start_date:
            # Usar una fecha muy antigua (1900) para incluir TODOS los datos históricos
            start_date = date(1900, 1, 1)  # Modificado para incluir TODOS los partos históricos
        
        # Inicializar el filtro de partos
        parto_filter = {}
        
        # Filtrar por animal_id si se proporciona
        if animal_id:
            parto_filter["animal_id"] = animal_id
        
        # Si se especifica una explotación, filtrar por animales de esa explotación
        if explotacio:
            animal_ids = await Animal.filter(explotacio=explotacio).values_list('id', flat=True)
            if animal_ids:
                parto_filter["animal_id__in"] = animal_ids
            else:
                # Si no hay animales en la explotación, devolver una respuesta vacía
                return await crear_respuesta_vacia_partos(start_date, end_date, explotacio)
        
        # Aplicar filtro de fechas
        fecha_filter = {
            "part__gte": start_date,
            "part__lte": end_date
        }
        
        # Obtener total de partos históricos (sin filtro de fecha)
        total_partos_historicos = await Part.filter(**parto_filter).count()
        
        # Obtener total de partos en el periodo seleccionado
        total_partos_periodo = await Part.filter(**parto_filter, **fecha_filter).count()
        
        # Usamos el total histórico para el campo total
        total_partos = total_partos_historicos
        
        # Si no hay partos históricos, devolver una respuesta vacía
        if total_partos_historicos == 0:
            return await crear_respuesta_vacia_partos(start_date, end_date, explotacio)
            
        # Distribución por género
        por_genero_cria = {}
        for genere in ["M", "F", "esforrada"]:
            count = await Part.filter(
                **parto_filter,
                GenereT=genere  # Quitamos el filtro de fecha para obtener todos los valores históricos
            ).count()
            por_genero_cria[genere] = count
            logger.info(f"Género de crías '{genere}': {count} (filtros: {parto_filter})")
        
        logger.info(f"Distribución por género completa: {por_genero_cria}")
                
        # Distribución por estado en el período filtrado
        por_estado = {}
        for estado in ["OK", "DEF"]:
            por_estado[estado] = await Part.filter(
                **parto_filter,
                **fecha_filter,
                EstadoT=estado
            ).count()
        
        # Calcular el estado para TODOS los partos históricos (sin filtro de fecha)
        por_estado_historico = {}
        for estado in ["OK", "DEF"]:
            por_estado_historico[estado] = await Part.filter(
                **parto_filter,
                EstadoT=estado
            ).count()
        
        # Calcular tasa de supervivencia basada en TODOS los partos (histórico)
        total_ok_historico = por_estado_historico.get("OK", 0)
        tasa_supervivencia = 0.0
        
        if total_partos_historicos > 0:
            # Calculamos la tasa pero nos aseguramos de que no sea más del 100%
            tasa_supervivencia = min(100.0, (total_ok_historico / total_partos_historicos) * 100)
        
        # Distribución mensual (por_mes en el esquema) - agrupar por mes independientemente del año
        # Nombres de meses en español
        nombres_meses = {
            1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
            7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
        }
        
        # Inicializar todos los meses con 0 partos
        por_mes = {nombre: 0 for nombre in nombres_meses.values()}
        
        # Usar SQL nativo para evitar problemas con el ORM
        try:
            # Consulta SQL directa para obtener partos
            from tortoise import connections
            connection = connections.get('default')
            
            # Consulta SQL básica para obtener todos los partos
            # PostgreSQL requiere comillas dobles para preservar las mayúsculas
            query = "SELECT id, part, \"GenereT\", \"EstadoT\" FROM part"
            
            # Ejecutar la consulta
            results = await connection.execute_query(query)
            
            # Convertir resultados a formato de diccionario
            partos = []
            for row in results[1]:  # results[1] contiene las filas de resultados
                partos.append({
                    'id': row[0],
                    'part': row[1],  # Esto será un string en formato 'YYYY-MM-DD'
                    'GenereT': row[2],
                    'EstadoT': row[3]
                })
                
            logger.info(f"Se encontraron {len(partos)} partos mediante SQL directo")
            
            # Convertir las fechas de string a objetos date
            import datetime
            for parto in partos:
                if parto['part'] and isinstance(parto['part'], str):
                    try:
                        # Intentar convertir de formato ISO (YYYY-MM-DD)
                        fecha = datetime.date.fromisoformat(parto['part'])
                        parto['part'] = fecha
                        logger.info(f"Fecha convertida: {parto['part']} (Tipo: {type(parto['part'])})")
                    except Exception as e:
                        try:
                            # Intentar convertir desde DD/MM/YYYY
                            dia, mes, anio = parto['part'].split('/')
                            fecha = datetime.date(int(anio), int(mes), int(dia))
                            parto['part'] = fecha
                            logger.info(f"Fecha convertida desde DD/MM/YYYY: {parto['part']}")
                        except Exception as e2:
                            logger.error(f"No se pudo convertir la fecha: {parto['part']} - Error: {e2}")
            
            # Imprimir las fechas para depuración
            for i, p in enumerate(partos[:5]):  # Solo los primeros 5 para no llenar el log
                logger.info(f"Parto #{i+1}: ID={p['id']}, Fecha={p['part']}, Tipo={type(p['part'])}")
                
        except Exception as e:
            logger.error(f"Error al ejecutar consulta SQL para partos: {str(e)}")
            logger.exception("Detalles completos:")
            partos = []  # Si todo falla, inicializar como lista vacía
        
        # Contar partos por mes (ignorando el año)
        for parto in partos:
            if parto['part']:  # Verificar que la fecha no sea None
                mes_numero = parto['part'].month
                mes_nombre = nombres_meses[mes_numero]
                por_mes[mes_nombre] += 1
                
        logger.info(f"Distribución mensual de partos: {por_mes}")
        
        # Distribución anual - mostrar todos los años desde el parto más antiguo (Emma, 1978) hasta el presente
        # Inicializar la distribución anual con años desde 1978 hasta el presente
        anio_actual = date.today().year
        anio_inicio = 1978  # Año del parto más antiguo (Emma) esto de todas todas debe ser tambien dinamico, si yo borro por lo que sea el aprto del 78, que se quede de refrencia siemrpe el parto mas antiguo
        
        # LOG PARA DEPURACIÓN
        logger.info(f"CREANDO DISTRIBUCIÓN ANUAL: del año {anio_inicio} al {anio_actual}")
        logger.info(f"TOTAL AÑOS A GENERAR: {anio_actual - anio_inicio + 1}")
        
        distribucion_anual = {str(anio): 0 for anio in range(anio_inicio, anio_actual + 1)}
        
        # Log para confirmar que se inicializaron todos los años
        logger.info(f"DISTRIBUCIÓN ANUAL INICIALIZADA CON {len(distribucion_anual)} AÑOS")
        logger.info(f"PRIMEROS 5 AÑOS: {list(distribucion_anual.keys())[:5]}")
        logger.info(f"ÚLTIMOS 5 AÑOS: {list(distribucion_anual.keys())[-5:]}")
        
        # NO usar la consulta ORM que está dando error
        # En su lugar, usar los partos que ya obtuvimos con SQL directo
        
        # Si ya tenemos los partos de la consulta SQL directa anterior, los usamos
        # Sino, distribución anual se queda con ceros
        try:
            # Usar los partos que encontramos antes con SQL directo
            # Contar partos por año
            for parto in partos:
                if parto.get('part'):  # Verificar que la fecha no sea None
                    # Convertir a string para usar como clave
                    anio = str(parto['part'].year)
                    if anio in distribucion_anual:
                        distribucion_anual[anio] += 1
                    else:
                        # Si el año es anterior a 2010 o posterior al año actual, lo agregamos
                        distribucion_anual[anio] = 1
        except Exception as e:
            logger.error(f"Error al procesar la distribución anual: {e}")
            # Si ocurre un error, dejamos distribucion_anual con los valores por defecto (ceros)
        
        # Ordenar la distribución por año
        distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
        
        # Log para verificar que NO se están filtrando años con valor 0
        total_anios = len(distribucion_anual)
        anios_con_partos = sum(1 for v in distribucion_anual.values() if v > 0)
        anios_sin_partos = sum(1 for v in distribucion_anual.values() if v == 0)
        
        logger.info(f"VERIFICACIÓN FINAL DISTRIBUCIÓN ANUAL:")
        logger.info(f"TOTAL AÑOS EN DISTRIBUCIÓN: {total_anios}")
        logger.info(f"AÑOS CON PARTOS: {anios_con_partos}")
        logger.info(f"AÑOS SIN PARTOS: {anios_sin_partos}")
        logger.info(f"VERIFICACIÓN: {anios_con_partos} + {anios_sin_partos} = {anios_con_partos + anios_sin_partos} (debe ser igual a {total_anios})")
        
        # Log completo de la distribución anual
        logger.info(f"Distribución anual de partos: {distribucion_anual}")
        
        # Log de algunos años específicos como prueba
        for anio_test in ['1978', '1980', '1990', '2000', '2010', '2020', str(date.today().year)]:
            if anio_test in distribucion_anual:
                logger.info(f"Año {anio_test}: {distribucion_anual[anio_test]} partos")
            else:
                logger.info(f"Año {anio_test}: NO EXISTE EN LA DISTRIBUCIÓN")
                
        # Ahora vamos a comprobar que se están incluyendo los años sin partos
        # Si todos los años con valor 0 se eliminaran, anios_sin_partos sería 0, lo cual es incorrecto
        
        # Calcular tendencia (variación mes a mes y año a año)
        tendencia = {
            "mensual": 0.0,
            "anual": 0.0
        }
        
        # Mes actual y anterior
        mes_actual = date(end_date.year, end_date.month, 1)
        if mes_actual.month == 1:
            mes_anterior = date(mes_actual.year - 1, 12, 1)
        else:
            mes_anterior = date(mes_actual.year, mes_actual.month - 1, 1)
        
        mes_actual_end = end_date
        mes_anterior_end = mes_actual - timedelta(days=1)
        
        partos_mes_actual = await Part.filter(
            **parto_filter,
            part__gte=mes_actual,
            part__lte=mes_actual_end
        ).count()
        
        partos_mes_anterior = await Part.filter(
            **parto_filter,
            part__gte=mes_anterior,
            part__lte=mes_anterior_end
        ).count()
        
        if partos_mes_anterior > 0:
            tendencia["mensual"] = ((partos_mes_actual - partos_mes_anterior) / partos_mes_anterior) * 100
        
        # Año actual y anterior
        año_actual = date(end_date.year, 1, 1)
        año_anterior = date(end_date.year - 1, 1, 1)
        año_anterior_end = date(end_date.year - 1, 12, 31)
        
        partos_año_actual = await Part.filter(
            **parto_filter,
            part__gte=año_actual,
            part__lte=end_date
        ).count()
        
        partos_año_anterior = await Part.filter(
            **parto_filter,
            part__gte=año_anterior,
            part__lte=año_anterior_end
        ).count()
        
        if partos_año_anterior > 0:
            tendencia["anual"] = ((partos_año_actual - partos_año_anterior) / partos_año_anterior) * 100
        
        # Obtener partos del último mes y año para el esquema
        un_mes_atras = end_date - timedelta(days=30)
        ultimo_mes = await Part.filter(
            **parto_filter,
            part__gte=un_mes_atras,
            part__lte=end_date
        ).count()
        
        un_año_atras = end_date - timedelta(days=365)
        ultimo_anio = await Part.filter(
            **parto_filter,
            part__gte=un_año_atras,
            part__lte=end_date
        ).count()
        
        # Calcular promedio mensual
        meses_con_partos = sum(1 for count in por_mes.values() if count > 0)
        promedio_mensual = total_partos / max(1, meses_con_partos) if meses_con_partos > 0 else 0.0
        
        # Ranking de animales por número de partos (top 5)
        ranking_partos = []
        if not animal_id:  # Solo si no estamos ya filtrando por un animal específico
            # Enfoque alternativo: hacemos una consulta distinta que es compatible con Tortoise ORM
            # Primero agrupamos y contamos
            query = Part.filter(**parto_filter, **fecha_filter)
            # Usamos .group_by para la agregación
            result = await query.group_by('animal_id').annotate(total=Count('id')).order_by('-total').limit(5).values('animal_id', 'total')
            
            # Procesamos el resultado
            for item in result:
                animal = await Animal.filter(id=item['animal_id']).first()
                if animal:
                    ranking_partos.append({
                        "id": animal.id,
                        "nom": animal.nom,
                        "total_partos": item['total']
                    })
        
        # Construir la respuesta completa según el esquema PartosResponse
        return {
            "total": total_partos_historicos,  # Usar el total histórico sin filtro de fecha
            "por_mes": por_mes,
            "por_genero_cria": por_genero_cria,
            "tasa_supervivencia": tasa_supervivencia,
            "distribucion_anual": distribucion_anual,
            "tendencia": tendencia,
            "ranking_partos": ranking_partos,
            "ultimo_mes": ultimo_mes,
            "ultimo_año": ultimo_anio,  # Usando el nombre que espera el frontend (con ñ)
            "promedio_mensual": round(total_partos_historicos / 12, 2) if total_partos_historicos > 0 else 0.0,
            "explotacio": explotacio,
            "periodo": {
                "inicio": start_date,
                "fin": end_date
            }
        }
    except Exception as e:
        logger.error(f"Error en get_partos_dashboard: {str(e)}", exc_info=True)
        return await crear_respuesta_vacia_partos(start_date, end_date, explotacio)
