"""
Script para probar directamente el registro en el historial de animales
"""
import sys
import os
import asyncio
import json
from datetime import datetime
import logging

# Configurar el logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger(__name__)

# Añadir el directorio raíz al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importaciones asyncio para conexión a base de datos
from tortoise import Tortoise

# Inicializar la conexión a la base de datos
async def inicializar_db():
    # Cargar variables de entorno para la conexión
    db_port = "5433"  # Puerto conocido
    db_user = "postgres"
    db_password = "1234"
    db_host = "localhost"
    db_name = "masclet_imperi"
    
    # Configuración de Tortoise-ORM
    db_url = f"postgres://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    logger.info(f"Conectando a la base de datos: {db_url}")
    
    # Inicializar Tortoise
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["app.models.animal", "app.models.user"]}
    )

async def probar_registro_historial():
    """Probar la creación de un registro en el historial"""
    try:
        # Inicializar la base de datos
        await inicializar_db()
        
        # Importar los modelos (después de iniciar Tortoise)
        from app.models.animal import Animal, AnimalHistory
        
        # Buscar un animal existente
        animal_id = 3083  # El ID que sabemos que existe
        logger.info(f"Buscando animal con ID {animal_id}")
        
        animal = await Animal.get_or_none(id=animal_id)
        if not animal:
            logger.error(f"No se encontró el animal con ID {animal_id}")
            return
        
        logger.info(f"Animal encontrado: {animal.nom}")
        
        # Datos para el registro de historial
        campo = "test_script"
        valor_anterior = "valor_viejo"
        nuevo_valor = "valor_nuevo"
        descripcion = f"Prueba de registro desde script: {datetime.now()}"
        usuario = "script_test"
        
        # Crear estructura JSON para cambios
        cambios_json = {
            campo: {
                "anterior": valor_anterior,
                "nuevo": nuevo_valor
            }
        }
        
        # Intentar crear el registro de historial
        logger.info(f"Intentando crear registro de historial para animal {animal.nom}")
        
        try:
            history_record = await AnimalHistory.create(
                # Campos del formato original
                animal=animal,
                usuario=usuario,
                cambio=descripcion,
                campo=campo,
                valor_anterior=valor_anterior,
                valor_nuevo=nuevo_valor,
                
                # Campos del formato extendido
                action="UPDATE",
                timestamp=datetime.now(),
                field=campo,
                description=descripcion,
                old_value=valor_anterior,
                new_value=nuevo_valor,
                changes=json.dumps(cambios_json)
            )
            
            logger.info(f"✅ Registro de historial creado correctamente con ID: {history_record.id}")
            
            # Verificar si se puede recuperar
            historial = await AnimalHistory.filter(animal_id=animal_id).order_by("-id").limit(5).all()
            for item in historial:
                logger.info(f"Registro en historial: ID={item.id}, Campo={item.campo}, Cambio={item.cambio}")
            
            return True
        except Exception as e:
            logger.error(f"❌ Error al crear registro de historial: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    except Exception as e:
        logger.error(f"Error general: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False
    finally:
        # Cerrar conexión a la base de datos
        if Tortoise._inited:
            await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(probar_registro_historial())
