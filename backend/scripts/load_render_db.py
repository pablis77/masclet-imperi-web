"""
Script para cargar datos desde CSV local a la base de datos de Render
"""
import asyncio
import logging
import os
import sys
from pathlib import Path
import csv
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent))

# Importaciones
try:
    from tortoise import Tortoise
    from app.models.animal import Animal, Part
    from app.models.user import User
    from app.core.auth import get_password_hash
except ImportError as e:
    logger.error(f"Error al importar módulos: {e}")
    sys.exit(1)

# Ruta al CSV de datos maestros
CSV_PATH = Path(__file__).parent.parent / "database" / "matriz_master.csv"

# Configuración de conexión a Render
DB_URL = "postgres://masclet_imperi_user:61Se3P3wDUXdPmb8KneScy1Gw2hHs8KH@dpg-d0g7igs9c44c73fbc5d0-a.frankfurt-postgres.render.com/masclet_imperi"

# Modelos ORM
TORTOISE_MODELS = [
    "app.models.animal",  # Contiene Animal y Part
    "app.models.user", 
    "app.models.import_model",  # Modelo para historial de importaciones
    "aerich.models"  # Este es necesario para las migraciones
]

async def create_superuser():
    """Crear usuario administrador por defecto para producción"""
    try:
        # Verificar si ya existe un superusuario
        admin = await User.filter(is_superuser=True).first()
        
        if not admin:
            # Crear nuevo superusuario con credenciales admin/admin123
            admin_username = "admin"
            admin_password = "admin123"
            
            admin = User(
                username=admin_username,
                email="admin@example.com",
                hashed_password=get_password_hash(admin_password),
                is_active=True,
                is_superuser=True,
                role="administrador",
                full_name="Administrador"
            )
            await admin.save()
            logger.info(f"Superusuario {admin_username} creado correctamente con contraseña {admin_password}")
        else:
            logger.info(f"Superusuario ya existe: {admin.username}")
            
    except Exception as e:
        logger.error(f"Error al crear superusuario: {str(e)}")
        raise

async def load_csv_data():
    """Cargar datos desde CSV a la base de datos"""
    logger.info(f"Cargando datos desde {CSV_PATH}...")
    
    if not CSV_PATH.exists():
        logger.error(f"Archivo CSV no encontrado: {CSV_PATH}")
        return False
        
    # Diccionario para rastrear animales ya creados
    created_animals = {}
    
    # Estadísticas
    stats = {
        "animals_created": 0,
        "animals_skipped": 0,
        "partos_created": 0,
        "partos_skipped": 0,
        "errors": 0
    }
    
    try:
        with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
            # Detectar dialecto CSV
            dialect = csv.Sniffer().sniff(f.read(1024))
            f.seek(0)
            
            # Leer CSV
            reader = csv.DictReader(f, dialect=dialect)
            rows = list(reader)
            
            logger.info(f"CSV cargado con {len(rows)} filas")
            
            # Procesar filas
            for i, row in enumerate(rows):
                try:
                    # Convertir claves a minúsculas y eliminar espacios
                    row = {k.strip().lower(): v.strip() if isinstance(v, str) else v for k, v in row.items()}
                    
                    # Datos del animal
                    animal_key = f"{row.get('nom', '')}-{row.get('explotacio', '')}"
                    
                    # Si este animal ya fue procesado, usamos la instancia existente
                    if animal_key in created_animals:
                        animal = created_animals[animal_key]
                        stats["animals_skipped"] += 1
                    else:
                        # Extraer datos del animal
                        animal_data = {
                            "alletar": int(row.get("alletar", 0)) if row.get("alletar") else 0,
                            "explotacio": row.get("explotacio", ""),
                            "nom": row.get("nom", ""),
                            "genere": row.get("genere", ""),
                            "pare": row.get("pare", ""),
                            "mare": row.get("mare", ""),
                            "quadra": row.get("quadra", ""),
                            "cod": row.get("cod", ""),
                            "num_serie": row.get("num_serie", ""),
                            "dob": row.get("dob", ""),
                            "estado": row.get("estado", "OK")
                        }
                        
                        # Verificar si ya existe este animal
                        existing = await Animal.filter(nom=animal_data["nom"], explotacio=animal_data["explotacio"]).first()
                        
                        if existing:
                            animal = existing
                            stats["animals_skipped"] += 1
                        else:
                            # Crear el animal
                            animal = Animal(**animal_data)
                            await animal.save()
                            stats["animals_created"] += 1
                            logger.info(f"[{i+1}/{len(rows)}] Animal creado: {animal_data['nom']} en {animal_data['explotacio']}")
                        
                        # Guardar referencia para no crearlo de nuevo
                        created_animals[animal_key] = animal
                    
                    # Procesar parto si existe
                    if row.get("part"):
                        # Datos del parto
                        parto_data = {
                            "part": row.get("part", ""),
                            "GenereT": row.get("GenereT", ""),
                            "EstadoT": row.get("EstadoT", "OK")
                        }
                        
                        # Verificar si ya existe este parto
                        existing_parto = await Part.filter(animal_id=animal.id, part=parto_data["part"]).first()
                        
                        if existing_parto:
                            stats["partos_skipped"] += 1
                        else:
                            # Crear el parto
                            parto = Part(animal_id=animal.id, **parto_data)
                            await parto.save()
                            stats["partos_created"] += 1
                            logger.info(f"[{i+1}/{len(rows)}] Parto creado: {parto_data['part']} para {animal.nom}")
                            
                except Exception as e:
                    logger.error(f"Error al procesar fila {i+1}: {str(e)}")
                    stats["errors"] += 1
                    continue
            
            logger.info(f"Carga de datos completada: {stats}")
            return True
            
    except Exception as e:
        logger.error(f"Error al cargar CSV: {str(e)}")
        return False

async def init_db():
    """Inicializar y cargar datos en la base de datos de Render"""
    try:
        # Conexión a la base de datos de Render
        logger.info(f"Conectando a base de datos de Render: {DB_URL}")
        await Tortoise.init(
            db_url=DB_URL,
            modules={'models': TORTOISE_MODELS}
        )
        
        # Crear las tablas si no existen
        await Tortoise.generate_schemas()
        logger.info("Esquema de base de datos verificado/creado correctamente")
        
        # Crear usuario administrador
        await create_superuser()
        
        # Cargar datos desde CSV
        success = await load_csv_data()
        
        if success:
            logger.info("Carga de datos exitosa")
        else:
            logger.warning("La carga de datos tuvo problemas")
        
    except Exception as e:
        logger.error(f"Error al inicializar la base de datos: {str(e)}")
        raise
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()

async def main():
    """Función principal"""
    try:
        logger.info("Iniciando carga de datos a base de datos en Render...")
        await init_db()
        return 0
    except Exception as e:
        logger.error(f"Error en el proceso de carga: {str(e)}")
        return 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario")
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        sys.exit(1)
