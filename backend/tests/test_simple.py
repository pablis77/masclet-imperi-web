"""
Script simple para probar el endpoint de animales
"""
import asyncio
import httpx
import json
import logging
import sys

# Configurar logging para mostrar toda la salida
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

async def test_create_animal():
    """Prueba la creación de un animal"""
    logger.info("Iniciando prueba de creación de animal")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Datos de prueba con fecha de nacimiento
        animal_data = {
            "explotacio": "Granja Test",
            "nom": "Toro Test",
            "genere": "M",
            "estado": "OK",
            "dob": "01/01/2024"  # Fecha en formato español
        }
        
        try:
            # Primera prueba: obtener la raíz para verificar que el servidor responde
            logger.info("Verificando conexión con el servidor...")
            response = await client.get("http://localhost:8000/")
            
            if response.status_code != 200:
                logger.error(f"Error conectando con el servidor: {response.status_code}")
                logger.error(f"Respuesta: {response.text}")
                return
                
            logger.info(f"Conexión exitosa. Status: {response.status_code}")
            logger.info(f"Respuesta: {response.text}")
            
            # Segunda prueba: crear animal
            logger.info("\nIntentando crear animal con fecha de nacimiento...")
            logger.info(f"Datos a enviar: {json.dumps(animal_data, indent=2)}")
            
            response = await client.post(
                "http://localhost:8000/api/v1/animals/",
                json=animal_data,
                headers={"Content-Type": "application/json"}
            )
            
            logger.info(f"Status: {response.status_code}")
            logger.info(f"Headers: {response.headers}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Respuesta exitosa: {json.dumps(data, indent=2)}")
                
                # Verificar fecha
                if data["data"]["dob"] == "01/01/2024":
                    logger.info("✅ Éxito: La fecha se procesó y retornó correctamente")
                else:
                    logger.error(f"❌ Error: La fecha retornada ({data['data']['dob']}) no coincide con la enviada (01/01/2024)")
            else:
                logger.error(f"❌ Error: El servidor respondió con status {response.status_code}")
                logger.error(f"Respuesta de error: {response.text}")
            
        except Exception as e:
            logger.error("Error durante la prueba", exc_info=True)
            raise e

if __name__ == "__main__":
    logger.info("=== Iniciando prueba de creación de animal con fecha ===")
    try:
        asyncio.run(test_create_animal())
        logger.info("=== Prueba completada ===")
    except KeyboardInterrupt:
        logger.info("Prueba interrumpida por el usuario")
    except Exception as e:
        logger.error("Error fatal durante la ejecución", exc_info=True)
        sys.exit(1)