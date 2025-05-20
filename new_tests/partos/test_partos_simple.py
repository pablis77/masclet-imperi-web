import sys
import os
import asyncio
from datetime import datetime, date
import json

# Añadir la ruta del proyecto para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importar dependencias después de ajustar la ruta
from tortoise import Tortoise, connections, run_async
from backend.app.models.animal import Part
from backend.app.db.session import get_db_connection

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

async def contar_partos():
    """Obtiene y muestra información básica sobre los partos."""
    try:
        # Contar todos los partos
        total_partos = await Part.all().count()
        print(f"Total de partos en la base de datos: {total_partos}")
        
        # Obtener distribución mensual
        meses_abr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        distribucion_mensual = {mes: 0 for mes in meses_abr}
        
        # Obtener distribución anual
        distribucion_anual = {}
        
        # Obtener todos los partos con sus fechas
        partos = await Part.all().prefetch_related("animal")
        print(f"Se han recuperado {len(partos)} partos con sus detalles")
        
        # Mostrar los primeros 5 partos para inspección
        for i, parto in enumerate(partos[:5]):
            print(f"Parto #{i+1}: ID={parto.id}, Fecha={parto.part}, Animal={parto.animal.nom if parto.animal else 'N/A'}")
        
        # Procesar todos los partos para estadísticas
        for parto in partos:
            if parto.part:
                # Registrar en distribución mensual
                mes_idx = parto.part.month - 1
                distribucion_mensual[meses_abr[mes_idx]] += 1
                
                # Registrar en distribución anual
                anio = str(parto.part.year)
                if anio in distribucion_anual:
                    distribucion_anual[anio] += 1
                else:
                    distribucion_anual[anio] = 1
        
        # Mostrar resultados
        print("\n=== Distribución Mensual ===")
        for mes, cantidad in distribucion_mensual.items():
            print(f"{mes}: {cantidad} partos")
        print(f"Total calculado: {sum(distribucion_mensual.values())}")
        
        print("\n=== Distribución Anual ===")
        for anio in sorted(distribucion_anual.keys()):
            print(f"{anio}: {distribucion_anual[anio]} partos")
        print(f"Total calculado: {sum(distribucion_anual.values())}")
        
        return {
            "total": total_partos,
            "por_mes": distribucion_mensual,
            "por_anio": distribucion_anual
        }
    except Exception as e:
        print(f"Error al procesar partos: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    """Función principal para ejecutar el test."""
    try:
        await init_db()
        resultado = await contar_partos()
        print("\nResultado final:")
        print(json.dumps(resultado, indent=2, default=str))
    finally:
        # Cerrar conexiones
        await connections.close_all()
        print("Conexiones cerradas")

if __name__ == "__main__":
    # Ejecutar el test
    run_async(main())
