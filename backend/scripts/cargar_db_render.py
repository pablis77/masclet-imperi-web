"""
Script directo para cargar datos desde CSV local a la base de datos de Render
usando psycopg2 directamente (sin Tortoise ORM)
"""
import csv
import logging
import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import DictCursor
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Ruta al CSV de datos maestros
CSV_PATH = Path(__file__).parent.parent / "database" / "matriz_master.csv"

# Configuración de conexión a Render
DB_PARAMS = {
    "host": "dpg-d0g7igs9c44c73fbc5d0-a.frankfurt-postgres.render.com",
    "port": "5432",
    "dbname": "masclet_imperi",
    "user": "masclet_imperi_user",
    "password": "61Se3P3wDUXdPmb8KneScy1Gw2hHs8KH"
}

def create_superuser(conn):
    """Crear usuario administrador"""
    admin_username = "admin"
    admin_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # hash de 'admin123'
    
    try:
        with conn.cursor() as cur:
            # Verificar si ya existe el usuario
            cur.execute("SELECT id FROM users WHERE username = %s", (admin_username,))
            if cur.fetchone():
                logger.info(f"Usuario {admin_username} ya existe")
                return True
                
            # Crear usuario administrador
            cur.execute("""
                INSERT INTO users (username, email, hashed_password, is_active, is_superuser, role, full_name, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                admin_username, 
                "admin@example.com", 
                admin_password,
                True,
                True,
                "administrador",
                "Administrador"
            ))
            conn.commit()
            logger.info(f"Usuario administrador {admin_username} creado correctamente")
            return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Error al crear superusuario: {str(e)}")
        return False

def load_csv_data(conn):
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
            # Leer CSV
            reader = csv.DictReader(f)
            rows = list(reader)
            
            logger.info(f"CSV cargado con {len(rows)} filas")
            
            # Procesar filas
            with conn.cursor() as cur:
                for i, row in enumerate(rows):
                    try:
                        # Convertir claves a minúsculas y eliminar espacios
                        row = {k.strip().lower(): v.strip() if isinstance(v, str) else v for k, v in row.items()}
                        
                        # Datos del animal
                        animal_key = f"{row.get('nom', '')}-{row.get('explotacio', '')}"
                        
                        # Si este animal ya fue procesado, usamos el ID guardado
                        if animal_key in created_animals:
                            animal_id = created_animals[animal_key]
                            stats["animals_skipped"] += 1
                        else:
                            # Extraer datos del animal
                            alletar = int(row.get("alletar", 0)) if row.get("alletar") else 0
                            explotacio = row.get("explotacio", "")
                            nom = row.get("nom", "")
                            genere = row.get("genere", "")
                            pare = row.get("pare", "")
                            mare = row.get("mare", "")
                            quadra = row.get("quadra", "")
                            cod = row.get("cod", "")
                            num_serie = row.get("num_serie", "")
                            dob = row.get("dob", "")
                            estado = row.get("estado", "OK")
                            
                            # Verificar si ya existe este animal
                            cur.execute("""
                                SELECT id FROM animals 
                                WHERE nom = %s AND explotacio = %s
                            """, (nom, explotacio))
                            
                            existing = cur.fetchone()
                            
                            if existing:
                                animal_id = existing[0]
                                stats["animals_skipped"] += 1
                            else:
                                # Crear el animal
                                cur.execute("""
                                    INSERT INTO animals 
                                    (alletar, explotacio, nom, genere, pare, mare, quadra, cod, num_serie, dob, estado, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                                    RETURNING id
                                """, (
                                    alletar, explotacio, nom, genere, pare, mare, quadra, cod, num_serie, dob, estado
                                ))
                                
                                animal_id = cur.fetchone()[0]
                                stats["animals_created"] += 1
                                logger.info(f"[{i+1}/{len(rows)}] Animal creado: {nom} en {explotacio}")
                            
                            # Guardar referencia para no crearlo de nuevo
                            created_animals[animal_key] = animal_id
                        
                        # Procesar parto si existe
                        if row.get("part"):
                            # Datos del parto
                            part_date = row.get("part", "")
                            generet = row.get("generet", "")
                            estadot = row.get("estadot", "OK")
                            
                            # Verificar si ya existe este parto
                            cur.execute("""
                                SELECT id FROM parts 
                                WHERE animal_id = %s AND part = %s
                            """, (animal_id, part_date))
                            
                            existing_parto = cur.fetchone()
                            
                            if existing_parto:
                                stats["partos_skipped"] += 1
                            else:
                                # Crear el parto
                                cur.execute("""
                                    INSERT INTO parts
                                    (animal_id, part, "GenereT", "EstadoT", created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                                """, (
                                    animal_id, part_date, generet, estadot
                                ))
                                
                                stats["partos_created"] += 1
                                logger.info(f"[{i+1}/{len(rows)}] Parto creado: {part_date} para animal_id={animal_id}")
                                
                    except Exception as e:
                        conn.rollback()
                        logger.error(f"Error al procesar fila {i+1}: {str(e)}")
                        stats["errors"] += 1
                        continue
                
                # Commit al final de todo el proceso
                conn.commit()
            
            logger.info(f"Carga de datos completada: {stats}")
            return True
            
    except Exception as e:
        logger.error(f"Error al cargar CSV: {str(e)}")
        return False

def main():
    """Función principal"""
    logger.info("Iniciando carga de datos a base de datos en Render...")
    
    try:
        # Mostrar información de configuración
        logger.info(f"Conectando a: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']} como {DB_PARAMS['user']}")
        
        # Intentar conexión con retry
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Conectar a la base de datos
                conn = psycopg2.connect(**DB_PARAMS)
                
                logger.info("Conexión exitosa a la base de datos")
                
                # Crear superusuario
                if create_superuser(conn):
                    logger.info("Superusuario verificado/creado")
                else:
                    logger.warning("No se pudo crear/verificar superusuario")
                
                # Cargar datos desde CSV
                if load_csv_data(conn):
                    logger.info("Carga de datos exitosa")
                else:
                    logger.warning("La carga de datos tuvo problemas")
                
                # Cerrar conexión
                conn.close()
                logger.info("Conexión cerrada")
                return 0
                
            except psycopg2.OperationalError as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Error de conexión (intento {attempt+1}/{max_retries}): {str(e)}")
                    logger.info(f"Reintentando en {retry_delay} segundos...")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"Error de conexión después de {max_retries} intentos: {str(e)}")
                    return 1
    
    except Exception as e:
        logger.error(f"Error en el proceso de carga: {str(e)}")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario")
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        sys.exit(1)
