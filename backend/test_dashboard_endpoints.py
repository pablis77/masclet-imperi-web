"""
Script para probar todos los endpoints del dashboard.
Este script inicializa la conexión a la base de datos y prueba cada uno
de los endpoints relacionados con el dashboard.
"""
import asyncio
import logging
import requests
from tortoise import Tortoise
from app.core.config import get_settings, TORTOISE_ORM
from datetime import date, timedelta
from app.models.user import User, UserRole

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Obtener configuración
settings = get_settings()

# URL base para los endpoints
BASE_URL = "http://localhost:8000"

async def initialize_tortoise():
    """Inicializa la conexión a la base de datos de forma explícita."""
    logger.info("Inicializando conexión a la base de datos...")
    
    # Configuración de Tortoise ORM
    await Tortoise.init(config=TORTOISE_ORM)
    logger.info("Conexión a la base de datos inicializada correctamente.")

async def close_tortoise():
    """Cierra la conexión a la base de datos."""
    await Tortoise.close_connections()
    logger.info("Conexión a la base de datos cerrada.")

def get_auth_token():
    """Obtiene un token de autenticación para las pruebas."""
    logger.info("Obteniendo token de autenticación...")
    
    # Usar directamente las credenciales conocidas del administrador
    auth_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    logger.info(f"Usando usuario: {auth_data['username']}")
    
    # Intentar obtener token con credenciales conocidas
    try:
        auth_url = f"{BASE_URL}/api/v1/auth/login"
        response = requests.post(
            auth_url,
            data=auth_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            logger.info("Token de autenticación obtenido correctamente.")
            return token_data.get("access_token")
        else:
            logger.error(f"Error al obtener token: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Excepción al obtener token: {str(e)}")
        return None

async def test_dashboard_endpoints(token):
    """Prueba los endpoints del dashboard."""
    logger.info("Probando endpoints del dashboard...")
    
    # Configurar headers con el token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Primero obtenemos la lista de explotaciones para usar un ID válido
    logger.info("Obteniendo lista de explotaciones para usar un ID válido...")
    try:
        explotacions_url = f"{BASE_URL}/api/v1/dashboard/explotacions"
        response = requests.get(explotacions_url, headers=headers)
        
        if response.status_code == 200:
            explotaciones = response.json()
            if explotaciones and len(explotaciones) > 0:
                # Usar el ID de la primera explotación
                explotacio_id = explotaciones[0]['id']
                logger.info(f"Usando explotación con ID {explotacio_id} para las pruebas")
            else:
                # Si no hay explotaciones, usar un ID por defecto (que probablemente fallará)
                explotacio_id = 1
                logger.warning("No se encontraron explotaciones. Usando ID 1 por defecto.")
        else:
            # Si hay error, usar un ID por defecto
            explotacio_id = 1
            logger.warning(f"Error al obtener explotaciones: {response.status_code}. Usando ID 1 por defecto.")
    except Exception as e:
        # Si hay excepción, usar un ID por defecto
        explotacio_id = 1
        logger.warning(f"Excepción al obtener explotaciones: {str(e)}. Usando ID 1 por defecto.")
    
    # Lista de endpoints a probar
    endpoints = [
        {
            "name": "Lista de explotaciones",
            "url": f"{BASE_URL}/api/v1/dashboard/explotacions",
            "params": {}
        },
        {
            "name": "Estadísticas generales",
            "url": f"{BASE_URL}/api/v1/dashboard/stats",
            "params": {}
        },
        {
            "name": "Estadísticas de explotación",
            "url": f"{BASE_URL}/api/v1/dashboard/explotacions/{explotacio_id}",
            "params": {}
        },
        {
            "name": "Resumen",
            "url": f"{BASE_URL}/api/v1/dashboard/resumen",
            "params": {}
        },
        {
            "name": "Estadísticas de partos",
            "url": f"{BASE_URL}/api/v1/dashboard/partos",
            "params": {}
        },
        {
            "name": "Estadísticas combinadas",
            "url": f"{BASE_URL}/api/v1/dashboard/combined",
            "params": {}
        },
        {
            "name": "Actividad reciente",
            "url": f"{BASE_URL}/api/v1/dashboard/recientes",
            "params": {"days": 7}
        }
    ]
    
    # Probar cada endpoint
    for endpoint in endpoints:
        logger.info(f"Probando endpoint: {endpoint['name']} - {endpoint['url']}")
        try:
            response = requests.get(
                endpoint['url'],
                params=endpoint['params'],
                headers=headers
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Endpoint {endpoint['name']} funciona correctamente")
                # Mostrar un resumen de los datos recibidos
                data = response.json()
                logger.info(f"Datos recibidos: {str(data)[:200]}...")
            else:
                logger.error(f"❌ Error en endpoint {endpoint['name']}: {response.status_code}")
                # Si es un error 404 en el endpoint de explotación, mostrar las explotaciones disponibles
                if response.status_code == 404 and "explotacions/" in endpoint['url']:
                    try:
                        error_data = response.json()
                        if "explotaciones_disponibles" in error_data:
                            explotaciones = error_data["explotaciones_disponibles"]
                            logger.info(f"Explotaciones disponibles: {explotaciones}")
                            # Intentar con la primera explotación disponible
                            if explotaciones and len(explotaciones) > 0:
                                new_id = explotaciones[0]["id"]
                                logger.info(f"Intentando con explotación ID {new_id}...")
                                new_url = f"{BASE_URL}/api/v1/dashboard/explotacions/{new_id}"
                                new_response = requests.get(new_url, headers=headers)
                                if new_response.status_code == 200:
                                    logger.info(f"✅ Endpoint con ID {new_id} funciona correctamente")
                                    data = new_response.json()
                                    logger.info(f"Datos recibidos: {str(data)[:200]}...")
                    except Exception as e:
                        logger.error(f"Error al procesar respuesta de error: {str(e)}")
                logger.error(f"Detalles del error: {response.text}")
        except Exception as e:
            logger.error(f"❌ Excepción en endpoint {endpoint['name']}: {str(e)}")

async def main():
    """Función principal."""
    logger.info("Iniciando pruebas de endpoints del dashboard...")
    
    try:
        # Inicializar la conexión a la base de datos
        await initialize_tortoise()
        
        # Obtener token de autenticación
        token = get_auth_token()
        
        # Probar endpoints
        await test_dashboard_endpoints(token)
        
        logger.info("Pruebas de endpoints del dashboard completadas.")
    except Exception as e:
        logger.error(f"Error durante las pruebas: {str(e)}")
    finally:
        # Cerrar conexión a la base de datos
        await close_tortoise()

if __name__ == "__main__":
    asyncio.run(main())
