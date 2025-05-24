import asyncio
import logging
import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from tabulate import tabulate

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
root_path = Path(__file__).parent.parent.parent
env_files = [
    os.path.join(root_path, 'backend', '.env'),
    os.path.join(root_path, '.env'),
    os.path.join(root_path, 'backend', 'docker', '.env')
]

for env_file in env_files:
    if os.path.exists(env_file):
        load_dotenv(env_file)
        logger.info(f"Archivo .env encontrado: {env_file}")
        if "DB_PORT" in os.environ:
            logger.info(f"  - DB_PORT={os.environ['DB_PORT']}")

# Determinar qué archivo .env usar
env_file = os.path.join(root_path, 'backend', '.env')
logger.info(f"Usando archivo .env: {env_file}")

# Obtener configuración de la base de datos
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "5433")
db_user = os.getenv("POSTGRES_USER", "postgres")
db_password = os.getenv("POSTGRES_PASSWORD", "1234")
db_name = os.getenv("POSTGRES_DB", "masclet_imperi")

logger.info(f"DB_PORT cargado: {db_port}")
logger.info(f"DATABASE_URL generada: postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}")

def main():
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            dbname=db_name,
            cursor_factory=RealDictCursor
        )
        logger.info(f"Conexión establecida con la base de datos en {db_host}:{db_port}")
        
        # Crear un cursor
        cur = conn.cursor()
        
        # Consultar los registros del listado 15
        cur.execute("SELECT * FROM listado_animal WHERE listado_id = 15")
        records = cur.fetchall()
        
        if not records:
            logger.info("No se encontraron registros para el listado 15")
        else:
            logger.info(f"Se encontraron {len(records)} registros para el listado 15")
            
            # Convertir a formato tabular
            headers = records[0].keys()
            rows = [[record[col] for col in headers] for record in records]
            print(tabulate(rows, headers=headers, tablefmt="grid"))
            
            # Mostrar información de los animales asociados
            animal_ids = [record['animal_id'] for record in records]
            placeholders = ','.join(['%s'] * len(animal_ids))
            
            cur.execute(f"SELECT id, nom, explotacio, genere, estado FROM animals WHERE id IN ({placeholders})", animal_ids)
            animals = cur.fetchall()
            
            logger.info("\nInformación de los animales asociados:")
            headers = animals[0].keys()
            rows = [[animal[col] for col in headers] for animal in animals]
            print(tabulate(rows, headers=headers, tablefmt="grid"))
        
        # Cerrar la conexión
        cur.close()
        conn.close()
        logger.info("Conexión cerrada")
        
    except Exception as e:
        logger.error(f"Error: {e}")

if __name__ == "__main__":
    main()
