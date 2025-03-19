"""
Tests para el endpoint de animales usando pytest
"""
import pytest
import requests
import json
import logging
import sys
import signal
import time
from contextlib import contextmanager

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

@contextmanager
def server_context(server_process):
    """Contexto para manejar el ciclo de vida del servidor"""
    try:
        # Esperar a que el servidor esté listo
        time.sleep(3)
        yield server_process
    finally:
        # Asegurarse de que el servidor se cierra
        server_process.terminate()
        server_process.wait()

def test_create_animal(api_server):
    """Test de creación de un animal"""
    with server_context(api_server):
        try:
            logger.debug("Iniciando test de creación de animal")
            
            # Verificar que el servidor está funcionando
            base_url = "http://localhost:8000"
            logger.debug(f"Verificando servidor en {base_url}")
            response = requests.get(base_url)
            logger.debug(f"Respuesta inicial del servidor: {response.status_code}")
            assert response.status_code == 200, "El servidor no está respondiendo"
            
            # Datos de prueba
            data = {
                "explotacio": "Granja Test",
                "nom": "Toro Test",
                "genere": "M",
                "estado": "OK",
                "dob": "01/01/2024"
            }
            
            logger.debug(f"Enviando datos: {json.dumps(data, indent=2)}")
            
            # Crear animal
            endpoint = f"{base_url}/api/v1/animals/"
            logger.debug(f"Haciendo POST a {endpoint}")
            
            response = requests.post(
                endpoint,
                json=data,
                headers={"Content-Type": "application/json"}
            )
            
            logger.debug(f"Status code: {response.status_code}")
            logger.debug(f"Headers: {dict(response.headers)}")
            logger.debug(f"Response body: {response.text}")
            
            # Verificar respuesta
            assert response.status_code == 200, f"Error creando animal: {response.text}"
            
            # Verificar contenido de la respuesta
            response_data = response.json()
            logger.debug(f"Response JSON: {json.dumps(response_data, indent=2)}")
            
            assert response_data["success"] == True, "La respuesta indica error"
            assert "data" in response_data, "No hay datos en la respuesta"
            
            # Verificar datos del animal creado
            animal = response_data["data"]
            assert animal["explotacio"] == data["explotacio"]
            assert animal["nom"] == data["nom"]
            assert animal["genere"] == data["genere"]
            assert animal["estado"] == data["estado"]
            assert animal["dob"] == data["dob"]
            
            logger.info("✅ Test completado exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error en el test: {str(e)}")
            raise
        except AssertionError as e:
            logger.error(f"❌ Assertion error: {str(e)}")
            raise