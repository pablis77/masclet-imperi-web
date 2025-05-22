import asyncio
import sys
import os
import logging
from datetime import date

# Configurar path para encontrar los módulos de la aplicación
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Importar modelos después de configurar el path
from app.models import Animal, Part
from app.core.config import get_settings
from tortoise import Tortoise

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

async def inicializar_db():
    """Inicializa la conexión con la base de datos"""
    # Obtener configuraciones
    settings = get_settings()
    
    # Construir la URL de la base de datos manualmente
    database_url = f"postgres://postgres:{settings.postgres_password}@localhost:{settings.db_port}/{settings.postgres_db}"
    logger.info(f"URL de la base de datos: {database_url}")
    
    await Tortoise.init(
        db_url=database_url,
        modules={"models": ["app.models"]}
    )

async def obtener_fecha_mas_antigua():
    """Obtiene la fecha más antigua de la base de datos entre animales y partos"""
    # Inicializar la base de datos
    await inicializar_db()
    
    try:
        # Buscar la fecha más antigua de nacimiento (dob) de animales
        fecha_min_animal = None
        animal_min_date = await Animal.all().order_by('dob').first()
        if animal_min_date and animal_min_date.dob:
            fecha_min_animal = animal_min_date.dob
            logger.info(f"Fecha más antigua de animal: {fecha_min_animal}")
            logger.info(f"Animal con fecha más antigua: {animal_min_date.nom} (ID: {animal_min_date.id})")
        else:
            logger.info("No se encontraron fechas de nacimiento de animales")
        
        # Buscar la fecha más antigua de partos
        fecha_min_parto = None
        parto_min_date = await Part.all().order_by('part').first()
        if parto_min_date and parto_min_date.part:
            fecha_min_parto = parto_min_date.part
            logger.info(f"Fecha más antigua de parto: {fecha_min_parto}")
            logger.info(f"Parto con fecha más antigua: ID {parto_min_date.id}")
            
            # Obtener información del animal relacionado con este parto
            if hasattr(parto_min_date, 'animal_id') and parto_min_date.animal_id:
                animal = await Animal.get_or_none(id=parto_min_date.animal_id)
                if animal:
                    logger.info(f"El parto más antiguo pertenece a: {animal.nom}")
        else:
            logger.info("No se encontraron fechas de partos")
        
        # Determinar la fecha más antigua entre ambas
        fechas_candidatas = []
        if fecha_min_animal:
            fechas_candidatas.append((fecha_min_animal, "nacimiento animal"))
        if fecha_min_parto:
            fechas_candidatas.append((fecha_min_parto, "parto"))
        
        if fechas_candidatas:
            # Obtener la fecha más antigua
            fecha_mas_antigua, tipo = min(fechas_candidatas, key=lambda x: x[0])
            logger.info(f"\n📅 FECHA MÁS ANTIGUA ENCONTRADA: {fecha_mas_antigua} (tipo: {tipo})")
            
            # Comparar con la fecha por defecto usada actualmente
            fecha_por_defecto = date(1900, 1, 1)
            dias_diferencia = (fecha_mas_antigua - fecha_por_defecto).days
            años_diferencia = dias_diferencia / 365.25
            
            logger.info(f"\n📊 COMPARACIÓN CON FECHA POR DEFECTO:")
            logger.info(f"  - Fecha por defecto actual: {fecha_por_defecto}")
            logger.info(f"  - Fecha más antigua real: {fecha_mas_antigua}")
            logger.info(f"  - Diferencia: {dias_diferencia} días ({años_diferencia:.2f} años)")
            
            # Recomendar un rango de fechas para el dashboard
            fecha_actual = date.today()
            logger.info(f"\n🗓️ RANGO RECOMENDADO PARA EL DASHBOARD:")
            logger.info(f"  - Fecha de inicio: {fecha_mas_antigua}")
            logger.info(f"  - Fecha de fin: {fecha_actual}")
            logger.info(f"  - Duración: {(fecha_actual - fecha_mas_antigua).days} días")
            
            # Generar configuración para el dashboard_service.py
            logger.info(f"\n⚙️ CÓDIGO PARA IMPLEMENTAR EN dashboard_service.py:")
            logger.info(f"""    # Obtener período dinámico basado en la fecha más antigua de la base de datos
    async def obtener_periodo_dinamico(self, explotacio: Optional[str] = None) -> Tuple[date, date]:
        fecha_fin = date.today()
        
        try:
            # Preparar filtros
            filtro = {{}}
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
            if fecha_min_parto:
                fechas_candidatas.append(fecha_min_parto)
            
            if fechas_candidatas:
                # Usar la fecha más antigua encontrada
                fecha_inicio = min(fechas_candidatas)
                logger.info(f"Usando fecha más antigua del sistema como inicio: {{fecha_inicio}}")
            else:
                # Si no hay datos, usar un año atrás como fecha predeterminada
                fecha_inicio = date.today().replace(year=date.today().year - 1)
                logger.info(f"No se encontraron fechas, usando fecha predeterminada: {{fecha_inicio}}")
        
        except Exception as e:
            # En caso de error, usar un año atrás como fecha predeterminada
            logger.error(f"Error determinando fecha más antigua: {{str(e)}}")
            fecha_inicio = date.today().replace(year=date.today().year - 1)
        
        return fecha_inicio, fecha_fin""")
            
            return fecha_mas_antigua, tipo
        else:
            logger.warning("No se encontraron fechas en la base de datos")
            # Recomendar un rango predeterminado (5 años atrás)
            fecha_predeterminada = date.today().replace(year=date.today().year - 5)
            logger.info(f"Usando fecha predeterminada recomendada: {fecha_predeterminada}")
            return None, None
    
    except Exception as e:
        logger.error(f"Error obteniendo fecha más antigua: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None
    finally:
        # Cerrar conexión con la base de datos
        await Tortoise.close_connections()

if __name__ == "__main__":
    logger.info("🔍 ANÁLISIS DE FECHA MÁS ANTIGUA EN LA BASE DE DATOS")
    logger.info("==================================================")
    logger.info("Analizando fechas más antiguas para el dashboard...")
    asyncio.run(obtener_fecha_mas_antigua())
    logger.info("\n✅ Análisis completado")
    logger.info("Usa estos datos para configurar el período dinámico en el dashboard_service.py")
