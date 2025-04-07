"""
Script para limpiar la base de datos e importar datos desde un archivo CSV.
Maneja correctamente las diferencias en los nombres de columnas.
"""
import asyncio
import sys
import os
import csv
import logging
from datetime import datetime
from tortoise import Tortoise
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Añadir directorio raíz al path para poder importar módulos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Importar modelos y configuración
from app.core.config import settings
from app.models.animal import Animal, Part

# CSV_PATH por defecto (se puede cambiar en línea de comandos)
DEFAULT_CSV_PATH = os.path.join(BASE_DIR, "backend", "database", "matriz_master.csv")

# Mapeo de nombres de columnas (esperado_en_modelo -> exacto como aparece en el CSV)
COLUMN_MAPPING = {
    "nom": ["nom"],
    "explotacio": ["explotacio"],
    "genere": ["genere"],
    "estado": ["estado"],
    "alletar": ["alletar"],
    "pare": ["pare"],
    "mare": ["mare"],
    "quadra": ["quadra"],
    "cod": ["cod"],
    "num_serie": ["num_serie"],
    "dob": ["dob"],
    "part": ["part"],
    "generet": ["GenereT"],
    "estadot": ["EstadoT"]
}

async def init_db():
    """Inicializar conexión a la base de datos"""
    # Corregir URL si es necesario (cambiar postgresql:// a postgres://)
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql://'):
        db_url = db_url.replace('postgresql://', 'postgres://')
    
    logger.info(f"URL de base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.import_model', 'aerich.models']}
    )
    logger.info("Base de datos conectada")

async def reset_database():
    """Eliminar todos los datos de las tablas"""
    logger.info("Eliminando registros de partos...")
    await Part.all().delete()
    logger.info("Eliminando registros de animales...")
    await Animal.all().delete()
    logger.info("Base de datos limpiada correctamente")

def normalize_date(date_str):
    """Normaliza una fecha en formato DD/MM/YYYY a formato de base de datos YYYY-MM-DD"""
    if not date_str or date_str == '':
        return None
    
    try:
        # Formato DD/MM/YYYY con split manual para evitar problemas
        day, month, year = date_str.split('/')
        return datetime(int(year), int(month), int(day)).date()
    except (ValueError, AttributeError):
        logger.warning(f"Formato de fecha inválido: {date_str}")
        return None

def get_column_value(row, expected_column):
    """Obtener valor de una columna considerando diferentes nombres posibles"""
    possible_names = COLUMN_MAPPING.get(expected_column, [expected_column])
    
    for name in possible_names:
        if name in row:
            return row[name]
    
    return None

async def import_csv(csv_path):
    """Importar datos desde un archivo CSV"""
    if not os.path.exists(csv_path):
        logger.error(f"El archivo CSV no existe: {csv_path}")
        return False
    
    logger.info(f"Importando datos desde: {csv_path}")
    
    try:
        # Leer el CSV y contar registros
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            # Convertir a lista para contar y reutilizar
            rows = list(reader)
            total_records = len(rows)
            
        logger.info(f"Total de registros en CSV: {total_records}")
        
        # Mostrar información
        logger.info(f"Total de registros a procesar: {total_records}")
        
        # Procesar cada fila
        success_count = 0
        error_count = 0
        
        for idx, row in enumerate(rows, 1):
            try:
                # Obtener valores necesarios, considerando diferentes nombres de columnas
                nom = get_column_value(row, "nom")
                explotacio = get_column_value(row, "explotacio")
                genere = get_column_value(row, "genere")
                estado = get_column_value(row, "estado")
                
                # Validar campos obligatorios
                if not nom or not explotacio or not genere or not estado:
                    logger.error(f"Fila {idx}: Faltan campos obligatorios. Nom: {nom}, Explotacio: {explotacio}, Genere: {genere}, Estado: {estado}")
                    error_count += 1
                    continue
                
                # Normalizar valores
                genere = genere.upper()
                estado = estado.upper()
                alletar_str = get_column_value(row, "alletar")
                
                # Convertir alletar a string para que coincida con el enum
                if alletar_str is not None and alletar_str.strip():
                    alletar = str(alletar_str.strip())
                else:
                    alletar = "0"  # Valor por defecto según la definición
                
                # Campos opcionales
                pare = get_column_value(row, "pare")
                mare = get_column_value(row, "mare")
                quadra = get_column_value(row, "quadra")
                cod = get_column_value(row, "cod")
                num_serie = get_column_value(row, "num_serie")
                dob_str = get_column_value(row, "dob")
                dob = normalize_date(dob_str) if dob_str else None
                
                # Añadir un timestamp al nombre si es necesario para evitar duplicados
                timestamp = datetime.now().strftime("%H%M%S")
                
                # Comprobar si el código ya existe y añadir un sufijo si es necesario
                if cod:
                    existing = await Animal.filter(cod=cod).first()
                    if existing:
                        logger.warning(f"Fila {idx}: Código '{cod}' ya existe, añadiendo sufijo")
                        cod = f"{cod}_{timestamp}"
                
                # Crear animal
                try:
                    animal = await Animal.create(
                        nom=nom,
                        explotacio=explotacio,
                        genere=genere,
                        estado=estado,
                        alletar=alletar,
                        pare=pare,
                        mare=mare,
                        quadra=quadra,
                        cod=cod,
                        num_serie=num_serie,
                        dob=dob
                    )
                except Exception as e:
                    # Si falla, intentar con un nombre modificado
                    nom_modified = f"{nom}_{timestamp}"
                    logger.warning(f"Fila {idx}: Error al crear animal, intentando con nombre modificado: {nom_modified}")
                    animal = await Animal.create(
                        nom=nom_modified,
                        explotacio=explotacio,
                        genere=genere,
                        estado=estado,
                        alletar=alletar,
                        pare=pare,
                        mare=mare,
                        quadra=quadra,
                        cod=None,  # Poner cod a None para evitar restricciones
                        num_serie=num_serie,
                        dob=dob
                    )
                
                # Verificar si hay información de parto
                part_str = get_column_value(row, "part")
                generet = get_column_value(row, "GenereT")
                estadot = get_column_value(row, "EstadoT")
                
                # Si hay fecha de parto y es una hembra, intentar crear registro de parto
                if part_str and genere == "F":
                    part_date = normalize_date(part_str)
                    if part_date:
                        # Si faltan datos de género o estado, usar valores por defecto
                        if not generet:
                            generet = "M"  # Género masculino por defecto
                            logger.warning(f"Fila {idx}: Usando género por defecto 'M' para el parto")
                        
                        if not estadot:
                            estadot = "OK"  # Estado OK por defecto
                            logger.warning(f"Fila {idx}: Usando estado por defecto 'OK' para el parto")
                        
                        try:
                            await Part.create(
                                animal_id=animal.id,
                                part=part_date,
                                generet=generet.upper(),
                                estadot=estadot.upper()
                            )
                            logger.info(f"Fila {idx}: Parto registrado correctamente")
                        except Exception as e:
                            logger.error(f"Fila {idx}: Error al registrar parto: {str(e)}")
                
                success_count += 1
                if idx % 10 == 0 or idx == total_records:
                    logger.info(f"Procesados {idx}/{total_records} registros")
                
            except Exception as e:
                logger.error(f"Error en fila {idx}: {str(e)}")
                error_count += 1
        
        # Mostrar resumen final
        logger.info(f"Resumen de importación:")
        
        logger.info(f"Importación completada. Éxitos: {success_count}, Errores: {error_count}")
        return True
    
    except Exception as e:
        logger.error(f"Error durante la importación: {str(e)}")
        return False

async def main():
    """Función principal"""
    # Obtener ruta del CSV desde argumentos o usar la predeterminada
    csv_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSV_PATH
    
    logger.info(f"Iniciando proceso con archivo CSV: {csv_path}")
    
    await init_db()
    try:
        await reset_database()
        success = await import_csv(csv_path)
        if success:
            logger.info("Proceso completado correctamente")
        else:
            logger.error("Proceso completado con errores")
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
