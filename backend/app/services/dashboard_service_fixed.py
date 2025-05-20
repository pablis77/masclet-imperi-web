"""
Módulo de servicios del dashboard (versión corregida)
Contiene funciones para obtener estadísticas y datos para el dashboard
"""

import json
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple, Union, Any

from tortoise import connections
from tortoise.functions import Count
from tortoise.expressions import Q

from app.models.animal import Animal, Part
from app.models.user import User
from app.db.session import get_db_connection
from app.utils.date_utils import format_date, parse_date, date_range

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FUNCIÓN SIMPLIFICADA PARA OBTENER PARTOS DEL DASHBOARD
async def get_partos_dashboard(
    explotacio: Optional[str] = None,
    animal_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Obtiene estadísticas sobre partos para el dashboard.
    
    Args:
        explotacio: Código de explotación para filtrar
        animal_id: ID del animal para filtrar
        start_date: Fecha de inicio en formato YYYY-MM-DD
        end_date: Fecha fin en formato YYYY-MM-DD
        
    Returns:
        Dict con estadísticas de partos
    """
    logger.info(f"Parámetros de entrada: explotacio={explotacio}, animal_id={animal_id}, start_date={start_date}, end_date={end_date}")
    
    # Construir filtros base
    filters = {}
    if animal_id:
        filters["animal_id"] = animal_id
    
    # Fechas
    date_start = None
    date_end = None
    if start_date:
        try:
            date_start = datetime.strptime(start_date, '%Y-%m-%d').date()
            filters["part__gte"] = date_start
        except ValueError:
            logger.warning(f"Formato de fecha inicio incorrecto: {start_date}")
    
    if end_date:
        try:
            date_end = datetime.strptime(end_date, '%Y-%m-%d').date()
            filters["part__lte"] = date_end
        except ValueError:
            logger.warning(f"Formato de fecha fin incorrecto: {end_date}")
    
    # Si no hay fechas, usar todo el histórico
    if not date_start and not date_end:
        date_start = date(1900, 1, 1)
        date_end = datetime.now().date()

    # 1. Obtener TOTAL de partos
    try:
        # Primero intentamos un conteo directo usando ORM
        query = Part.filter(**filters)
        
        # Añadir filtro por explotación si existe
        if explotacio:
            query = query.filter(animal__explotacio=explotacio)
        
        # Ejecutar conteo
        total_partos = await query.count()
        logger.info(f"DIAGNÓSTICO: Total de partos en la base de datos (sin filtros): {total_partos}")
        
        # Verificación secundaria con SQL
        connection = get_db_connection()
        sql_count = "SELECT COUNT(*) FROM part WHERE part IS NOT NULL"
        count_result = await connection.execute_query(sql_count)
        direct_count = count_result[0][0] if count_result and count_result[0] else 0
        logger.info(f"DIAGNÓSTICO: Total de partos (SQL directo): {direct_count}")
        
        # Ver detalles del primer parto para diagnóstico
        first_parto = await Part.filter(part__isnull=False).first()
        if first_parto:
            logger.info(f"DIAGNÓSTICO: Primer parto (SQL): id={first_parto.id}, fecha={first_parto.part}, género={first_parto.GenereT}, estado={first_parto.EstadoT}")
    except Exception as e:
        logger.error(f"Error obteniendo total de partos: {str(e)}")
        total_partos = 0
    
    # 2. Obtener distribución por género de crías
    try:
        # Inicializar contador de géneros
        por_genero = {"M": 0, "F": 0, "esforrada": 0}
        
        # Contar por género directo con ORM
        for genero in ["M", "F", "esforrada"]:
            count = await Part.filter(GenereT=genero, **filters).count()
            por_genero[genero] = count
            logger.info(f"Género de crías '{genero}': {count}")
            
        logger.info(f"Distribución por género completa: {por_genero}")
    except Exception as e:
        logger.error(f"Error obteniendo distribución por género: {str(e)}")
        por_genero = {"M": 0, "F": 0, "esforrada": 0}
    
    # 3. DISTRIBUCIÓN MENSUAL - Inicializar
    meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    por_mes = {mes: 0 for mes in meses_abr}
    
    # 4. DISTRIBUCIÓN ANUAL - Inicializar
    distribucion_anual = {}
    
    # 5. Obtener todos los partos para procesar distribuciones
    try:
        # Ejecutar query para obtener todos los partos con fechas
        partos = await Part.filter(part__isnull=False, **filters).prefetch_related('animal')
        
        # Si hay filtro de explotación, aplicarlo a nivel de animal
        if explotacio:
            partos = [p for p in partos if p.animal and p.animal.explotacio == explotacio]
        
        # Procesar cada parto para distribución mensual y anual
        for parto in partos:
            if parto.part:
                # Distribución mensual
                try:
                    mes_idx = parto.part.month - 1  # 0-indexed
                    por_mes[meses_abr[mes_idx]] += 1
                except (IndexError, AttributeError):
                    pass
                
                # Distribución anual
                try:
                    anio = str(parto.part.year)
                    if anio in distribucion_anual:
                        distribucion_anual[anio] += 1
                    else:
                        distribucion_anual[anio] = 1
                except (AttributeError, ValueError):
                    pass
        
        # Ordenar distribución anual
        distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
        
        # Diagnóstico: ver mes y año actuales
        mes_actual = datetime.now().month
        anio_actual = datetime.now().year
        
        # Loguear algunos partos para diagnóstico
        for i, parto in enumerate(partos[:3]):
            logger.info(f"Parto #{i+1}: ID={parto.id}, Fecha={parto.part}, Tipo de fecha={type(parto.part)}")
        
        # Verificar valores específicos
        partos_este_mes = por_mes[meses_abr[mes_actual-1]]
        partos_este_anio = distribucion_anual.get(str(anio_actual), 0)
        
        logger.info(f"VALOR FINAL: Partos en {mes_actual}/{anio_actual}: {partos_este_mes}")
        logger.info(f"VALOR FINAL: Partos en {anio_actual}: {partos_este_anio}")
        
        logger.info(f"Resumen: Hay {partos_este_mes} partos en {mes_actual}/{anio_actual} y {partos_este_anio} partos en {anio_actual}")
        
    except Exception as e:
        logger.error(f"Error obteniendo partos por fecha: {str(e)}")
        # Mantener los valores por defecto inicializados antes
    
    # 6. Calcular tasa de supervivencia
    tasa_supervivencia = 0
    try:
        partos_ok = await Part.filter(EstadoT="OK", **filters).count()
        if total_partos > 0:
            tasa_supervivencia = (partos_ok / total_partos) * 100
    except Exception as e:
        logger.error(f"Error calculando tasa de supervivencia: {str(e)}")
    
    # 7. Tendencias
    tendencia = {
        "mensual": 100.0,  # Valor por defecto
        "anual": -50.0     # Valor por defecto
    }
    
    # 8. Obtener rankings de partos por animal (top 5)
    ranking_partos = []
    try:
        # Obtener los animales con más partos
        query = "SELECT animal_id, COUNT(*) as total FROM part GROUP BY animal_id ORDER BY total DESC LIMIT 5"
        result = await connections.get("default").execute_query(query)
        
        if result and len(result) > 0:
            for row in result[0]:
                animal_id = row[0]
                total = row[1]
                
                # Buscar nombre del animal
                animal = await Animal.filter(id=animal_id).first()
                if animal:
                    ranking_partos.append({
                        "id": animal_id,
                        "nom": animal.nom,
                        "total_partos": total
                    })
    except Exception as e:
        logger.error(f"Error obteniendo ranking de partos: {str(e)}")
    
    # 9. Calcular últimos valores para comparativas
    ultimo_mes = 0
    ultimo_anio = 0
    promedio_mensual = 0
    
    try:
        # Contar meses con partos
        meses_con_partos = sum(1 for v in por_mes.values() if v > 0)
        if meses_con_partos > 0:
            promedio_mensual = round(total_partos / meses_con_partos, 2)
    except Exception as e:
        logger.error(f"Error calculando promedio mensual: {str(e)}")
    
    # 10. Construir la respuesta final
    response = {
        "total": total_partos,
        "por_mes": por_mes,
        "por_genero_cria": por_genero,
        "tasa_supervivencia": tasa_supervivencia,
        "distribucion_anual": distribucion_anual,
        "tendencia": tendencia,
        "ranking_partos": ranking_partos,
        "ultimo_mes": ultimo_mes,
        "ultimo_anio": ultimo_anio,
        "promedio_mensual": promedio_mensual,
        "explotacio": explotacio,
        "periodo": {
            "inicio": date_start,
            "fin": date_end
        }
    }
    
    # Diagnóstico final
    logger.info(f"DIAGNÓSTICO: Respuesta del servicio: {response}")
    
    return response
