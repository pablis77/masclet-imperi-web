"""
Script para probar el endpoint de imports (versión síncrona)
"""
import requests
import json
import logging
from pathlib import Path

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_import_preview():
    """Prueba el endpoint de preview de importación"""
    print("\n=== Iniciando prueba de import preview ===\n")
    
    try:
        # Verificar que el archivo existe
        csv_path = Path("tests/test.csv")
        if not csv_path.exists():
            logger.error(f"Archivo no encontrado: {csv_path}")
            return
            
        logger.info(f"Archivo encontrado: {csv_path}")
        logger.info(f"Tamaño del archivo: {csv_path.stat().st_size} bytes")
        
        # Mostrar primeras líneas del archivo
        print("Contenido del archivo de prueba:")
        with open(csv_path, 'r', encoding='utf-8') as f:
            print(f.read())
            
        # Preparar archivo para envío
        with open(csv_path, 'rb') as f:
            files = {
                "file": ("test.csv", f, "text/csv")
            }
            
            logger.info("Enviando petición al endpoint /api/v1/imports/preview...")
            
            # Hacer la petición
            response = requests.post(
                "http://localhost:8000/api/v1/imports/preview",
                files=files
            )
            
            # Mostrar información detallada
            logger.info(f"URL de la petición: {response.url}")
            logger.info(f"Headers enviados: {response.request.headers}")
            logger.info(f"Código de respuesta: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info("Respuesta exitosa del servidor")
                
                # Verificar el procesamiento de fechas
                if "data" in data and "preview" in data["data"]:
                    print("\nPreview de datos procesados:")
                    for row in data["data"]["preview"]:
                        print(f"\nFila:")
                        for key, value in row.items():
                            print(f"  {key}: {value}")
                        if "dob" in row:
                            logger.info(f"Fecha de nacimiento: {row['dob']}")
                        if "part" in row:
                            logger.info(f"Fecha de parto: {row['part']}")
                
                print("\nRespuesta completa del servidor:")
                print(json.dumps(data, indent=2))
                print("\nLa prueba se completó exitosamente!")
            else:
                logger.error(f"Error del servidor: {response.status_code}")
                logger.error(f"Contenido de error: {response.text}")
                print(f"\nError: Status {response.status_code}")
                print(f"Respuesta: {response.text}")
                
    except Exception as e:
        logger.error("Error durante la ejecución de la prueba", exc_info=True)
        print(f"\nError durante la prueba: {str(e)}")

if __name__ == "__main__":
    try:
        print("\n=== Iniciando prueba de imports ===\n")
        test_import_preview()
        print("\n=== Prueba completada ===")
    except KeyboardInterrupt:
        print("\nPrueba interrumpida por el usuario")
    except Exception as e:
        print(f"\nError fatal: {str(e)}")
        logger.error("Error fatal durante la ejecución", exc_info=True)