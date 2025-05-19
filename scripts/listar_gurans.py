import asyncio
from tortoise import Tortoise
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)7s] %(message)s')
logger = logging.getLogger(__name__)

async def listar_animales_gurans():
    # Conectar a la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models"]}
    )
    
    # Ejecutar la consulta
    conn = Tortoise.get_connection("default")
    resultados = await conn.execute_query(
        """
        SELECT id, nom, genere, estado, alletar, cod, num_serie, dob 
        FROM animals 
        WHERE explotacio = 'Gurans'
        ORDER BY nom
        """
    )
    
    # Mostrar los resultados
    logger.info(f"Total de animales en Gurans: {len(resultados[1])}")
    logger.info("=== LISTADO DE ANIMALES EN GURANS ===")
    for animal in resultados[1]:
        fecha_nacimiento = animal[7].strftime('%d/%m/%Y') if animal[7] else 'N/A'
        logger.info(f"ID: {animal[0]}, Nombre: {animal[1]}, Género: {animal[2]}, Estado: {animal[3]}, " +
                   f"Amamantando: {animal[4]}, Código: {animal[5]}, Serie: {animal[6]}, Nacimiento: {fecha_nacimiento}")
    
    # Búsqueda específica del animal 20-36
    result_20_36 = await conn.execute_query(
        """
        SELECT * FROM animals 
        WHERE nom = '20-36' AND explotacio = 'Gurans'
        """
    )
    
    if result_20_36[1]:
        logger.info("\n=== ANIMAL ESPECÍFICO 20-36 ===")
        animal_20_36 = result_20_36[1][0]
        logger.info(f"ID: {animal_20_36[12]}, Nombre: {animal_20_36[4]}, Explotación: {animal_20_36[14]}")
        logger.info(f"Género: {animal_20_36[13]}, Estado: {animal_20_36[0]}, Amamantando: {animal_20_36[7]}")
        logger.info(f"Código: {animal_20_36[11]}, Serie: {animal_20_36[6]}")
    else:
        logger.warning("¡El animal 20-36 NO se encuentra en la base de datos!")
    
    # Cerrar la conexión
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(listar_animales_gurans())
