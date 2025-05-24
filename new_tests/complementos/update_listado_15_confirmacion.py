import psycopg2
import logging
import os
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backend', '.env')
load_dotenv(env_path)

# Obtener configuración de la base de datos
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "5433")
db_user = os.getenv("POSTGRES_USER", "postgres")
db_password = os.getenv("POSTGRES_PASSWORD", "1234")
db_name = os.getenv("POSTGRES_DB", "masclet_imperi")

logger.info(f"Usando configuración de base de datos: {db_host}:{db_port}/{db_name}")

def main():
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            dbname=db_name
        )
        logger.info(f"Conexión establecida con la base de datos en {db_host}:{db_port}")
        
        # Crear un cursor
        cur = conn.cursor()
        
        # Mostrar los valores actuales
        cur.execute("SELECT id, animal_id, listado_id, confirmacion, observaciones FROM listado_animal WHERE listado_id = 15")
        rows = cur.fetchall()
        
        logger.info("Valores actuales en la base de datos:")
        for row in rows:
            logger.info(f"  Animal {row[1]}: confirmacion={row[3]}, observaciones={row[4]}")
        
        # Actualizar los valores de confirmación para los animales 3091 y 3100
        cur.execute("""
            UPDATE listado_animal 
            SET confirmacion = 'OK', observaciones = 'Actualizado manualmente'
            WHERE listado_id = 15 AND animal_id IN (3091, 3100)
        """)
        
        # Confirmar los cambios
        conn.commit()
        logger.info(f"Se actualizaron {cur.rowcount} registros")
        
        # Mostrar los valores actualizados
        cur.execute("SELECT id, animal_id, listado_id, confirmacion, observaciones FROM listado_animal WHERE listado_id = 15")
        rows = cur.fetchall()
        
        logger.info("Valores actualizados en la base de datos:")
        for row in rows:
            logger.info(f"  Animal {row[1]}: confirmacion={row[3]}, observaciones={row[4]}")
        
        # Cerrar la conexión
        cur.close()
        conn.close()
        logger.info("Conexión cerrada")
        
    except Exception as e:
        logger.error(f"Error: {e}")

if __name__ == "__main__":
    main()
