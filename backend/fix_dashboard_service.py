"""
Script para diagnosticar y solucionar problemas del servicio de dashboard.
Este script inicializa correctamente la conexión a la base de datos antes de
acceder a los modelos, lo que debería resolver el error de conexión.
"""
import asyncio
import logging
from tortoise import Tortoise
from app.core.config import get_settings
from app.services.dashboard_service import get_dashboard_stats
from app.models.animal import EstadoAlletar
from datetime import date, timedelta

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Obtener configuración
settings = get_settings()

async def initialize_tortoise():
    """Inicializa la conexión a la base de datos de forma explícita."""
    logger.info("Inicializando conexión a la base de datos...")
    
    # Configuración de Tortoise ORM
    TORTOISE_ORM = {
        "connections": {"default": settings.database_url},
        "apps": {
            "models": {
                "models": settings.MODELS,
                "default_connection": "default",
            },
        },
        "use_tz": False,
        "timezone": "UTC"
    }
    
    # Inicializar Tortoise ORM
    await Tortoise.init(config=TORTOISE_ORM)
    logger.info("Conexión a la base de datos inicializada correctamente.")

async def test_dashboard_stats():
    """Prueba el servicio de dashboard con la conexión inicializada."""
    try:
        # Inicializar la conexión a la base de datos
        await initialize_tortoise()
        
        # Obtener estadísticas del dashboard
        logger.info("Obteniendo estadísticas del dashboard...")
        today = date.today()
        start_date = today - timedelta(days=30)
        
        stats = await get_dashboard_stats(
            start_date=start_date,
            end_date=today
        )
        
        # Mostrar resultados
        logger.info("Estadísticas obtenidas correctamente:")
        logger.info(f"Total de animales: {stats.get('total_animales', 'N/A')}")
        logger.info(f"Total de machos: {stats.get('total_machos', 'N/A')}")
        logger.info(f"Total de hembras: {stats.get('total_hembras', 'N/A')}")
        logger.info(f"Total de partos: {stats.get('total_partos', 'N/A')}")
        
        return True
    except Exception as e:
        logger.error(f"Error al obtener estadísticas: {str(e)}", exc_info=True)
        return False
    finally:
        # Cerrar la conexión a la base de datos
        await Tortoise.close_connections()

async def main():
    """Función principal."""
    logger.info("Iniciando diagnóstico del servicio de dashboard...")
    
    # Probar el servicio de dashboard
    success = await test_dashboard_stats()
    
    if success:
        logger.info("El servicio de dashboard funciona correctamente con la conexión inicializada.")
        logger.info("SOLUCIÓN: Asegurarse de que la conexión a la base de datos esté inicializada antes de acceder a los modelos.")
    else:
        logger.error("El servicio de dashboard sigue fallando incluso con la conexión inicializada.")
        logger.error("Es posible que haya otros problemas que necesiten ser investigados.")

if __name__ == "__main__":
    asyncio.run(main())
