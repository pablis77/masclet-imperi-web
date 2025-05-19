import asyncio
import json
import sys
from datetime import date, datetime, timedelta
from tortoise import Tortoise

# Añadir el directorio actual al path para poder importar los módulos
sys.path.append(".")

from app.services.dashboard_service import get_explotacio_dashboard

async def main():
    # Inicializar la base de datos con Tortoise ORM
    # Tortoise espera 'postgres://' no 'postgresql://'
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={
            "models": [
                "app.models.animal", 
                "app.models.explotacio",
                "app.models.animal_history",
                "app.models.user",  # Añadir el modelo de usuario
                "app.models"
            ]
        }
    )
    
    # Obtener el ID de explotación de los argumentos o usar 321 (Gurans) por defecto
    explotacio_id = int(sys.argv[1]) if len(sys.argv) > 1 else 321
    
    try:
        # Obtener estadísticas de la explotación
        print(f"Obteniendo estadísticas para la explotación ID: {explotacio_id}")
        stats = await get_explotacio_dashboard(explotacio_id)
        
        # Imprimir las estadísticas en formato JSON
        print(json.dumps(stats, indent=2, default=str))
        print(f"\nEstadísticas obtenidas correctamente para la explotación ID: {explotacio_id}")
        
    except ValueError as e:
        print(f"Error: {str(e)}")
        # Si la explotación no existe, mostrar las explotaciones disponibles
        print("\nExplotaciones disponibles:")
        from app.models.explotacio import Explotacio
        explotaciones = await Explotacio.all().values('id', 'nom')
        for explotacion in explotaciones:
            print(f"ID: {explotacion['id']} - Nombre: {explotacion['nom']}")
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Cerrar la conexión a la base de datos
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
