"""
Test simple para extraer correctamente las distribuciones de partos por mes y año.
Este código será usado directamente en el dashboard.
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

async def obtener_distribuciones():
    """
    Obtiene distribuciones mensuales y anuales de partos.
    Este código será usado directamente en el dashboard.
    """
    try:
        # Consulta SQL directa para obtener todos los partos con fechas
        conn = connections.get("default")
        sql = """
        SELECT p.id, p.part
        FROM part p
        WHERE p.part IS NOT NULL
        ORDER BY p.part;
        """
        result = await conn.execute_query(sql)
        
        # Verificar que tenemos resultados
        if not result or not result[0]:
            print("No se encontraron partos en la base de datos")
            return None
        
        partos = result[0]  # Lista de tuplas (id, fecha)
        print(f"Encontrados {len(partos)} partos con fecha")
        
        # Inicializar distribuciones
        meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        meses_completos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        
        por_mes = {mes: 0 for mes in meses_abr}
        distribucion_anual = {}
        
        # Procesar cada parto
        for parto in partos:
            parto_id = parto[0]
            fecha_part = parto[1]
            
            if fecha_part:
                # Distribución mensual
                mes_idx = fecha_part.month - 1  # 0-indexed
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
        print("\n=== DISTRIBUCIÓN MENSUAL ===")
        total_mensual = 0
        for i, mes in enumerate(meses_completos):
            mes_abr = meses_abr[i]
            cantidad = por_mes[mes_abr]
            total_mensual += cantidad
            print(f"{mes}: {cantidad} partos")
        print(f"Total de partos (mensual): {total_mensual}")
        
        print("\n=== DISTRIBUCIÓN ANUAL ===")
        total_anual = 0
        for anio, cantidad in distribucion_anual.items():
            total_anual += cantidad
            print(f"{anio}: {cantidad} partos")
        print(f"Total de partos (anual): {total_anual}")
        
        # Mostrar totales para verificación
        print(f"\nTotales para verificación:")
        print(f"Total partos por mes: {total_mensual}")
        print(f"Total partos por año: {total_anual}")
        
        # También regresar un objeto con los resultados
        return {
            "por_mes": por_mes,
            "distribucion_anual": distribucion_anual,
            "total_mensual": total_mensual,
            "total_anual": total_anual
        }
    except Exception as e:
        print(f"Error al obtener distribuciones: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def extraer_codigo_para_dashboard():
    """
    Función que extrae el código listo para usar en el dashboard.
    """
    # Parte importante: el código que se debe copiar al dashboard
    codigo = """
# CÓDIGO PARA USAR EN DASHBOARD_SERVICE.PY - FUNCIÓN get_partos_dashboard
# ------------------------------------------------------------------
# Esta sección reemplaza el código problemático de distribución mensual/anual
# Inicializar distribuciones
meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
por_mes = {mes: 0 for mes in meses_abr}
distribucion_anual = {}

# Obtener los partos usando SQL directo (más confiable)
try:
    # Consulta SQL directa para obtener todos los partos con fechas
    conn = connections.get("default")
    sql = "SELECT p.id, p.part FROM part p WHERE p.part IS NOT NULL ORDER BY p.part;"
    result = await conn.execute_query(sql)
    
    # Procesar solo si hay resultados
    if result and result[0]:
        partos = result[0]  # Lista de tuplas (id, fecha)
        logger.info(f"Encontrados {len(partos)} partos con fecha")
        
        # Procesar cada parto para distribuciones
        for parto in partos:
            fecha_part = parto[1]
            if fecha_part:
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
except Exception as e:
    logger.error(f"Error al obtener distribuciones de partos: {str(e)}")
    logger.exception("Detalles del error:")
    # Mantener valores por defecto si hay error
    """
    
    print("==== CÓDIGO PARA COPIAR A DASHBOARD_SERVICE.PY ====")
    print(codigo)
    print("==== FIN DEL CÓDIGO ====")
    
    # También hacer un test para verificar
    resultados = await obtener_distribuciones()
    
    if resultados:
        print("\n✅ Test exitoso: El código funciona correctamente")
        return resultados
    else:
        print("\n❌ Error: El código no funcionó como se esperaba")
        return None

async def main():
    """Función principal para ejecutar el test."""
    try:
        await init_db()
        await extraer_codigo_para_dashboard()
    finally:
        # Cerrar conexiones
        await connections.close_all()
        print("Conexiones cerradas")

if __name__ == "__main__":
    # Ejecutar el test
    run_async(main())
