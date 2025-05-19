"""
Script para pruebas completas del sistema de historial de animales
"""
import sys
import os
import asyncio
import json
import logging
import requests
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Agregar el directorio padre al path para poder importar los módulos de la aplicación
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar solo lo necesario
from app.models.animal import Animal, AnimalHistory
from tortoise import Tortoise

async def init_db():
    """Inicializar la conexión a la base de datos"""
    # Configuración para conectar directamente a la base de datos
    db_user = "postgres"
    db_password = "1234"
    db_host = "localhost"
    db_port = "5433"
    db_name = "masclet_imperi"
    
    # URL de conexión
    db_url = f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    logger.info(f"Conectando a la base de datos: {db_url}")
    
    # Inicializar Tortoise-ORM con los modelos que necesitamos
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["app.models.animal", "app.models.user"]}
    )

async def close_db():
    """Cerrar la conexión a la base de datos"""
    await Tortoise.close_connections()

# URL base para las pruebas (API local)
API_BASE_URL = "http://localhost:8000/api/v1"

# Credenciales para autenticación (default en desarrollo)
USERNAME = "admin"
PASSWORD = "admin123"

async def test_create_history():
    """Probar la creación de un registro en el historial de animales"""
    # Ya configuramos el logging globalmente
    logger.info("Iniciando prueba de AnimalHistory")
    
    try:
        # Inicializar la base de datos
        await init_db()
        
        # Obtener un animal existente
        animal_id = 3083  # ID del animal que ya hemos comprobado que existe
        animal = await Animal.get(id=animal_id)
        
        logger.info(f"Animal encontrado: {animal.nom} (ID: {animal.id})")
        
        # 1. Prueba 1: Crear un registro de historial directamente en la base de datos
        campo = "pare"
        valor_anterior = animal.pare if animal.pare else "null"
        nuevo_valor = f"TestPadre_{datetime.now().strftime('%H%M%S')}"
        descripcion = f"Prueba de actualización de {campo}"
        
        # Crear el registro de historial
        cambios_json = {campo: {"anterior": valor_anterior, "nuevo": nuevo_valor}}
        
        logger.info("1️⃣ Intentando crear registro de historial directamente en la base de datos")
        try:
            history = await AnimalHistory.create(
                # Campos del formato antiguo
                animal=animal,
                usuario="test_script",
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior),
                valor_nuevo=str(nuevo_valor),
                
                # Campos del nuevo formato extendido
                action="UPDATE",
                timestamp=datetime.now(),
                field=campo,
                description=descripcion,
                old_value=str(valor_anterior),
                new_value=str(nuevo_valor),
                changes=json.dumps(cambios_json)
            )
            logger.info(f"✅ Registro de historial creado con ID: {history.id}")
        except Exception as e:
            logger.error(f"❌ Error al crear registro de historial: {e}")
            # Mostrar más detalles sobre la excepción
            import traceback
            logger.error(traceback.format_exc())
        
        # 2. Prueba 2: Verificar si se creó el registro consultando la base de datos
        history_records = await AnimalHistory.filter(animal=animal).order_by("-id").limit(5).all()
        logger.info(f"2️⃣ Total de registros de historial para este animal: {len(history_records)}")
        for i, record in enumerate(history_records[:5]):
            logger.info(f"   {i+1}. ID: {record.id}, Campo: {record.campo}, Cambio: {record.cambio}")
        
        # Actualizar también el animal con el nuevo valor para que sea coherente
        await animal.update_from_dict({campo: nuevo_valor}).save()
        logger.info(f"✅ Animal actualizado con nuevo valor para {campo}: {nuevo_valor}")
        
    except Exception as e:
        logger.error(f"❌ Error durante la prueba de creación: {e}")
    finally:
        # Cerrar la conexión a la base de datos
        await close_db()

def test_get_animal_history_api():
    """Probar la obtención del historial de un animal a través del API"""
    logger.info("3️⃣ Iniciando prueba de obtención de historial a través del API")
    
    # Parámetros
    animal_id = 3083  # El mismo animal que usamos antes
    
    try:
        # 1. Autenticarse para obtener el token
        logger.info("Autenticando con el API...")
        login_url = f"{API_BASE_URL}/auth/login"
        login_data = {
            "username": USERNAME,
            "password": PASSWORD
        }
        
        # Intento de login
        login_response = requests.post(login_url, json=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            logger.info(f"✅ Autenticación exitosa, token obtenido")
            
            # Configurar headers con el token
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Obtener el historial del animal
            history_url = f"{API_BASE_URL}/animals/{animal_id}/history"
            logger.info(f"Consultando historial en: {history_url}")
            
            history_response = requests.get(history_url, headers=headers)
            
            if history_response.status_code == 200:
                history_data = history_response.json()
                logger.info(f"✅ Historial obtenido correctamente: {len(history_data)} registros")
                
                # Mostrar los primeros 5 registros
                for i, record in enumerate(history_data[:5]):
                    logger.info(f"   {i+1}. ID: {record.get('id')}, Campo: {record.get('campo')}, Cambio: {record.get('cambio')}")
                
                return history_data
            else:
                logger.error(f"❌ Error al obtener historial: {history_response.status_code} - {history_response.text}")
        else:
            logger.error(f"❌ Error en autenticación: {login_response.status_code} - {login_response.text}")
    
    except Exception as e:
        logger.error(f"❌ Error durante la prueba de API: {e}")
        import traceback
        logger.error(traceback.format_exc())
    
    return None

if __name__ == "__main__":
    # Ejecutar la prueba de creación asíncrona
    asyncio.run(test_create_history())
    
    # Ejecutar la prueba de API (sincrónica)
    print("\n" + "-"*50)
    print("Iniciando prueba de API HTTP después de las pruebas directas en base de datos")
    print("-"*50 + "\n")
    test_get_animal_history_api()
