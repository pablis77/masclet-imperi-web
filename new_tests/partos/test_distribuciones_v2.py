"""
Test mejorado para extraer correctamente las distribuciones de partos por mes y año.
Versión robusta que maneja diferentes formatos de respuesta SQL.
"""

import sys
import os
import asyncio
from datetime import datetime, date
import json

# Añadir la ruta del proyecto para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importar dependencias después de ajustar la ruta
from tortoise import Tortoise, connections, run_async
from backend.app.models.animal import Part, Animal

async def init_db():
    """Inicializa la conexión a la base de datos."""
    try:
        # Configuración para conectar a la base de datos
        db_url = "postgres://postgres:1234@localhost:5433/masclet_imperi"
        await Tortoise.init(
            db_url=db_url,
            modules={"models": ["backend.app.models.animal", "backend.app.models.user", "backend.app.models.import_model"]}
        )
        print(f"Conexión a la base de datos establecida: {db_url}")
    except Exception as e:
        print(f"Error al conectar a la base de datos: {str(e)}")
        raise

async def obtener_total_partos():
    """Obtiene el total de partos directamente con el ORM."""
    try:
        # Método 1: Usando ORM (más confiable)
        total = await Part.filter(part__isnull=False).count()
        print(f"Total de partos (ORM): {total}")
        
        # Método 2: SQL directo como respaldo
        conn = connections.get("default")
        sql = "SELECT COUNT(*) FROM part WHERE part IS NOT NULL;"
        result = await conn.execute_query(sql)
        
        # Extraer el conteo de la respuesta SQL (diferentes formatos posibles)
        sql_count = None
        if isinstance(result, tuple) and len(result) > 0:
            if isinstance(result[0], list) and len(result[0]) > 0:
                sql_count = result[0][0][0] if isinstance(result[0][0], (list, tuple)) else result[0][0]
            elif isinstance(result[0], int):
                sql_count = result[0]
        
        print(f"Total de partos (SQL): {sql_count}")
        
        return max(total, sql_count) if sql_count is not None else total
    
    except Exception as e:
        print(f"Error obteniendo conteo: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0

async def obtener_distribuciones_orm():
    """Obtiene distribuciones usando el ORM de Tortoise."""
    try:
        # Inicializar distribuciones
        meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        meses_completos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                           "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        
        por_mes = {mes: 0 for mes in meses_abr}
        distribucion_anual = {}
        
        # Obtener partos con ORM (método más limpio)
        partos = await Part.filter(part__isnull=False).all()
        print(f"Obtenidos {len(partos)} partos con ORM")
        
        # Procesar cada parto
        for parto in partos:
            if parto.part:
                # Distribución mensual
                mes_idx = parto.part.month - 1  # 0-indexed
                por_mes[meses_abr[mes_idx]] += 1
                
                # Distribución anual
                anio = str(parto.part.year)
                if anio in distribucion_anual:
                    distribucion_anual[anio] += 1
                else:
                    distribucion_anual[anio] = 1
        
        # Ordenar distribución anual
        distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
        
        # Mostrar resultados
        print("\n=== DISTRIBUCIÓN MENSUAL (ORM) ===")
        total_mensual = 0
        for i, mes in enumerate(meses_completos):
            mes_abr = meses_abr[i]
            cantidad = por_mes[mes_abr]
            total_mensual += cantidad
            print(f"{mes}: {cantidad} partos")
        print(f"Total de partos (mensual): {total_mensual}")
        
        print("\n=== DISTRIBUCIÓN ANUAL (ORM) ===")
        total_anual = 0
        for anio, cantidad in distribucion_anual.items():
            total_anual += cantidad
            print(f"{anio}: {cantidad} partos")
        print(f"Total de partos (anual): {total_anual}")
        
        return {
            "por_mes": por_mes,
            "distribucion_anual": distribucion_anual,
            "total_mensual": total_mensual,
            "total_anual": total_anual
        }
    
    except Exception as e:
        print(f"Error obteniendo distribuciones con ORM: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def obtener_distribuciones_sql():
    """Obtiene distribuciones usando SQL directo."""
    try:
        # Inicializar distribuciones
        meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        meses_completos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                           "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        
        por_mes = {mes: 0 for mes in meses_abr}
        distribucion_anual = {}
        
        # Obtener partos con SQL directo
        conn = connections.get("default")
        sql = "SELECT id, part FROM part WHERE part IS NOT NULL ORDER BY part;"
        result = await conn.execute_query(sql)
        
        # Determinar el formato de la respuesta y extraer partos
        partos = []
        if isinstance(result, tuple) and len(result) > 0:
            if isinstance(result[0], list):
                partos = result[0]
                print(f"Formato de resultado: Lista anidada, {len(partos)} elementos")
            else:
                # Intentar otras estructuras de datos posibles
                print(f"Formato de resultado no reconocido: {type(result[0])}")
                if hasattr(result[0], "__iter__"):
                    partos = result[0]
                    print(f"Se intentó convertir, obtuvimos {len(partos) if hasattr(partos, '__len__') else '?'} elementos")
        
        # Si no pudimos extraer partos, intentar método alternativo
        if not partos:
            print("Usando método alternativo con fetch_all")
            sql = "SELECT id, part FROM part WHERE part IS NOT NULL ORDER BY part;"
            cursor = await conn.execute_query(sql, fetch_all=True)
            partos = cursor
            print(f"Método alternativo devolvió: {type(partos)}")
        
        print(f"Procesando {len(partos) if hasattr(partos, '__len__') else '?'} registros")
        
        # Procesar cada registro si tenemos datos
        if partos:
            for parto in partos:
                # Intentar extraer la fecha (diferentes formatos posibles)
                fecha_part = None
                if isinstance(parto, tuple) and len(parto) > 1:
                    fecha_part = parto[1]
                elif isinstance(parto, dict) and 'part' in parto:
                    fecha_part = parto['part']
                elif hasattr(parto, 'part'):
                    fecha_part = parto.part
                
                if fecha_part and isinstance(fecha_part, date):
                    # Distribución mensual
                    mes_idx = fecha_part.month - 1
                    por_mes[meses_abr[mes_idx]] += 1
                    
                    # Distribución anual
                    anio = str(fecha_part.year)
                    if anio in distribucion_anual:
                        distribucion_anual[anio] += 1
                    else:
                        distribucion_anual[anio] = 1
        
        # Ordenar distribución anual
        distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
        
        # Mostrar resultados
        print("\n=== DISTRIBUCIÓN MENSUAL (SQL) ===")
        total_mensual = 0
        for i, mes in enumerate(meses_completos):
            mes_abr = meses_abr[i]
            cantidad = por_mes[mes_abr]
            total_mensual += cantidad
            print(f"{mes}: {cantidad} partos")
        print(f"Total de partos (mensual): {total_mensual}")
        
        print("\n=== DISTRIBUCIÓN ANUAL (SQL) ===")
        total_anual = 0
        for anio, cantidad in distribucion_anual.items():
            total_anual += cantidad
            print(f"{anio}: {cantidad} partos")
        print(f"Total de partos (anual): {total_anual}")
        
        return {
            "por_mes": por_mes,
            "distribucion_anual": distribucion_anual,
            "total_mensual": total_mensual,
            "total_anual": total_anual
        }
    
    except Exception as e:
        print(f"Error obteniendo distribuciones con SQL: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def generar_codigo_para_dashboard():
    """Genera código optimizado para usar en el dashboard."""
    # Verificar métodos
    total = await obtener_total_partos()
    
    if total > 0:
        print("\n🔍 Probando método ORM...")
        resultado_orm = await obtener_distribuciones_orm()
        
        print("\n🔍 Probando método SQL...")
        resultado_sql = await obtener_distribuciones_sql()
        
        # Determinar cuál método funcionó mejor
        metodo_exitoso = None
        if resultado_orm and resultado_orm["total_mensual"] > 0:
            metodo_exitoso = "ORM"
            print("\n✅ El método ORM funcionó correctamente")
            print(f"Total de partos con ORM: {resultado_orm['total_mensual']}")
        elif resultado_sql and resultado_sql["total_mensual"] > 0:
            metodo_exitoso = "SQL"
            print("\n✅ El método SQL funcionó correctamente")
            print(f"Total de partos con SQL: {resultado_sql['total_mensual']}")
        else:
            print("\n❌ Ningún método funcionó correctamente")
        
        # Generar código optimizado según el método que funcionó
        if metodo_exitoso == "ORM":
            codigo = """
# CÓDIGO OPTIMIZADO PARA DASHBOARD_SERVICE.PY (MÉTODO ORM)
# ------------------------------------------------------
# Inicializar distribuciones
meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
por_mes = {mes: 0 for mes in meses_abr}
distribucion_anual = {}

try:
    # Obtener partos con ORM (más limpio y seguro)
    partos = await Part.filter(part__isnull=False).all()
    logger.info(f"Obtenidos {len(partos)} partos con ORM")
    
    # Procesar cada parto
    for parto in partos:
        if parto.part:
            # Distribución mensual
            try:
                mes_idx = parto.part.month - 1  # 0-indexed
                por_mes[meses_abr[mes_idx]] += 1
            except (IndexError, AttributeError) as e:
                logger.error(f"Error procesando mes de parto {parto.id}: {str(e)}")
            
            # Distribución anual
            try:
                anio = str(parto.part.year)
                if anio in distribucion_anual:
                    distribucion_anual[anio] += 1
                else:
                    distribucion_anual[anio] = 1
            except (AttributeError, ValueError) as e:
                logger.error(f"Error procesando año de parto {parto.id}: {str(e)}")
    
    # Ordenar distribución anual
    distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
    
    # Verificación final
    total_mensual = sum(por_mes.values())
    total_anual = sum(distribucion_anual.values())
    logger.info(f"Total de partos por distribución mensual: {total_mensual}")
    logger.info(f"Total de partos por distribución anual: {total_anual}")
    
except Exception as e:
    logger.error(f"Error al obtener distribuciones: {str(e)}")
    logger.exception("Detalles del error:")
"""
        else:
            codigo = """
# CÓDIGO OPTIMIZADO PARA DASHBOARD_SERVICE.PY (MÉTODO SQL)
# -------------------------------------------------------
# Inicializar distribuciones
meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
por_mes = {mes: 0 for mes in meses_abr}
distribucion_anual = {}

try:
    # Obtener partos con SQL directo (más robusto para diferentes DB)
    connection = connections.get("default")
    query = "SELECT id, part FROM part WHERE part IS NOT NULL ORDER BY part;"
    result = await connection.execute_query(query)
    
    # Procesar resultado (compatible con diferentes formatos)
    partos = []
    if isinstance(result, tuple) and len(result) > 0:
        if isinstance(result[0], list):
            partos = result[0]
            logger.info(f"Obtenidos {len(partos)} partos con SQL")
    
    # Procesar cada parto
    for parto in partos:
        fecha_part = parto[1] if len(parto) > 1 else None
        
        if fecha_part and isinstance(fecha_part, date):
            # Distribución mensual
            try:
                mes_idx = fecha_part.month - 1  # 0-indexed
                por_mes[meses_abr[mes_idx]] += 1
            except (IndexError, AttributeError) as e:
                logger.error(f"Error procesando mes de parto {parto[0]}: {str(e)}")
            
            # Distribución anual
            try:
                anio = str(fecha_part.year)
                if anio in distribucion_anual:
                    distribucion_anual[anio] += 1
                else:
                    distribucion_anual[anio] = 1
            except (AttributeError, ValueError) as e:
                logger.error(f"Error procesando año de parto {parto[0]}: {str(e)}")
    
    # Ordenar distribución anual
    distribucion_anual = {k: distribucion_anual[k] for k in sorted(distribucion_anual.keys())}
    
    # Verificación final
    total_mensual = sum(por_mes.values())
    total_anual = sum(distribucion_anual.values())
    logger.info(f"Total de partos por distribución mensual: {total_mensual}")
    logger.info(f"Total de partos por distribución anual: {total_anual}")
    
except Exception as e:
    logger.error(f"Error al obtener distribuciones: {str(e)}")
    logger.exception("Detalles del error:")
"""
        
        print("\n==== CÓDIGO PARA DASHBOARD_SERVICE.PY ====")
        print(codigo)
        print("==== FIN DEL CÓDIGO ====")
        
        return codigo
    else:
        print("No se pudo obtener el total de partos, no se puede generar código.")
        return None

async def main():
    """Función principal para ejecutar el test."""
    try:
        print("🚀 INICIANDO TEST DE DISTRIBUCIONES DE PARTOS")
        print("=============================================")
        await init_db()
        await generar_codigo_para_dashboard()
        print("\nTest completado.")
    finally:
        # Cerrar conexiones
        await connections.close_all()
        print("Conexiones cerradas")

if __name__ == "__main__":
    # Ejecutar el test
    run_async(main())
