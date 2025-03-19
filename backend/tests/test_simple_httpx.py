"""
Script simple para probar el endpoint de animales usando httpx
"""
import asyncio
import httpx
import json
import logging
import sys

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('test_simple.log')
    ]
)
logger = logging.getLogger(__name__)

print("Script iniciando...")  # Debug directo

async def test_create_animal():
    """Prueba la creación de un animal usando httpx"""
    print("Iniciando test_create_animal...")  # Debug directo
    
    async with httpx.AsyncClient() as client:
        try:
            print("Cliente httpx creado...")  # Debug directo
            
            # Datos de prueba
            data = {
                "explotacio": "Granja Test",
                "nom": "Toro Test",
                "genere": "M",
                "estado": "OK",
                "dob": "01/01/2024"
            }

            print(f"Datos a enviar: {json.dumps(data, indent=2)}")  # Debug directo

            # Primero probamos el endpoint raíz
            print("Probando endpoint raíz...")  # Debug directo
            root_response = await client.get(
                "http://localhost:8000/",
                timeout=30.0
            )
            print(f"Respuesta raíz: {root_response.status_code} - {root_response.text}")

            # Ahora probamos crear el animal
            print("Enviando POST para crear animal...")  # Debug directo
            response = await client.post(
                "http://localhost:8000/api/v1/animals/",
                json=data,
                timeout=30.0
            )

            print(f"Status: {response.status_code}")  # Debug directo
            print(f"Headers: {dict(response.headers)}")
            print(f"Response body: {response.text}")

            return response.status_code == 200

        except Exception as e:
            print(f"Error en la prueba: {str(e)}")  # Debug directo
            logger.exception("Error detallado:")
            return False

async def main():
    """Función principal"""
    print("Ejecutando función main...")  # Debug directo
    try:
        success = await test_create_animal()
        print(f"Prueba completada. Éxito: {success}")
    except Exception as e:
        print(f"Error en main: {str(e)}")
        logger.exception("Error detallado en main:")
        sys.exit(1)

if __name__ == "__main__":
    print("Iniciando script principal...")  # Debug directo
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Prueba interrumpida por el usuario")
    except Exception as e:
        print(f"Error fatal: {str(e)}")
        logger.exception("Error fatal detallado:")
        sys.exit(1)