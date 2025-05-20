"""
Test muy simple para encontrar y corregir el problema del dashboard
"""
import os
import sys
from datetime import datetime, date
from tortoise import Tortoise, run_async

# Añadir la ruta del proyecto
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

async def init_db():
    """Inicializar la DB"""
    db_url = "postgres://postgres:1234@localhost:5433/masclet_imperi"
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["backend.app.models.animal", "backend.app.models.user", "backend.app.models.import_model"]}
    )
    print(f"Conexión DB: {db_url}")

async def buscar_partos_hardcodeados():
    """Buscar hardcodeados en el código del dashboard"""
    from backend.app.api.endpoints import dashboard
    import inspect
    
    print("\n===== BUSCANDO CÓDIGO HARDCODEADO =====")
    
    # Ver código fuente de la función
    codigo_fuente = inspect.getsource(dashboard)
    
    # Patrones de hardcoding a buscar
    patrones = [
        'por_mes = {"Ene":', 
        '"Ene": 1', 
        '"Feb": 2',
        'datos de prueba',
        'distribución de prueba'
    ]
    
    for patron in patrones:
        if patron in codigo_fuente:
            print(f"⚠️ Encontrado patrón sospechoso: '{patron}'")
    
    print("Búsqueda de hardcoding completa")

async def extraer_codigo_dashboard():
    """Extraer código relevante del dashboard_service.py"""
    import backend.app.services.dashboard_service as ds
    import inspect
    
    print("\n===== CÓDIGO DE get_partos_dashboard =====")
    
    try:
        codigo = inspect.getsource(ds.get_partos_dashboard)
        # Buscar sección de distribución mensual
        if "por_mes = {" in codigo:
            print("\nSección problemática encontrada:")
            
            # Extraer líneas con la inicialización de por_mes
            lineas = codigo.split('\n')
            for i, linea in enumerate(lineas):
                if "por_mes = {" in linea:
                    print(f"\nLínea {i+1}: {linea}")
                    for j in range(1, 10):
                        if i+j < len(lineas):
                            print(f"Línea {i+j+1}: {lineas[i+j]}")
    except Exception as e:
        print(f"Error al extraer código: {str(e)}")

async def obtener_total_real_partos():
    """Obtener el número real de partos"""
    from backend.app.models.animal import Part
    
    print("\n===== CONTEO REAL DE PARTOS =====")
    try:
        # Conteo total
        total = await Part.all().count()
        print(f"Total de partos en DB: {total}")
        
        # Ver algunos partos
        partos = await Part.all().limit(5)
        print(f"\nPrimeros {len(partos)} partos:")
        for i, p in enumerate(partos):
            print(f"Parto #{i+1}: ID={p.id}, Fecha={p.part}, Animal={p.animal_id}")
        
        return total
    except Exception as e:
        print(f"Error contando partos: {str(e)}")
        return 0

async def generar_soluciones():
    """Generar soluciones para el problema"""
    print("\n===== SOLUCIONES PROPUESTAS =====")
    
    solucion1 = """
# SOLUCIÓN 1: REEMPLAZAR EL CÓDIGO HARDCODEADO
# Reemplazar esto:
por_mes = {"Ene": 1, "Feb": 2, "Mar": 0, "Abr": 0, "May": 1, "Jun": 0, 
          "Jul": 0, "Ago": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dic": 0}

# Por esto:
meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
por_mes = {mes: 0 for mes in meses_abr}  # Inicializar todos a cero

# Y luego en la sección donde procesa los partos, asegurarse que incrementa los contadores:
fecha_part = parto[1]  # Asumiendo que esto contiene la fecha
if fecha_part and isinstance(fecha_part, date):
    mes_idx = fecha_part.month - 1
    por_mes[meses_abr[mes_idx]] += 1
"""
    
    solucion2 = """
# SOLUCIÓN 2: CORREGIR SOLO LA PARTE DE INICIALIZACIÓN
# Buscar esta línea:
por_mes = {"Ene": 1, "Feb": 2, "Mar": 0, "Abr": 0, "May": 1, "Jun": 0, 
          "Jul": 0, "Ago": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dic": 0}

# Reemplazarla por:
por_mes = {"Ene": 0, "Feb": 0, "Mar": 0, "Abr": 0, "May": 0, "Jun": 0, 
          "Jul": 0, "Ago": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dic": 0}

# Esto al menos elimina los valores hardcodeados y permitirá que el código existente
# funcione si ya está incrementando los contadores correctamente.
"""
    
    print(solucion1)
    print("\n---\n")
    print(solucion2)

async def main():
    """Función principal"""
    print("🔍 TEST PARA CORREGIR DASHBOARD")
    await init_db()
    
    # Obtener número real de partos
    total_partos = await obtener_total_real_partos()
    
    # Buscar hardcoding
    await buscar_partos_hardcodeados()
    
    # Extraer código relevante
    await extraer_codigo_dashboard()
    
    # Generar soluciones
    await generar_soluciones()
    
    print("\n✅ Test completado")
    
    # Cerrar conexiones
    await Tortoise.close_connections()
    print("Conexiones cerradas")

if __name__ == "__main__":
    run_async(main())
