"""
Script para actualizar el rol de Ramon en la base de datos.

Este script:
1. Verifica el rol actual de Ramon
2. Lo actualiza a 'Ramon' si es necesario
3. Verifica que el cambio se haya aplicado correctamente
"""

import asyncio
from tortoise import Tortoise
import sys
import os
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir la ruta del proyecto al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar modelos y configuración
from backend.app.auth.models import User
from backend.app.core.config import settings

async def connect_to_db():
    """Conectar a la base de datos"""
    logger.info("Conectando a la base de datos...")
    
    # Obtener la URL de conexión
    db_url = f"postgres://{settings.postgres_user}:{settings.postgres_password}@{settings.db_host}:{settings.db_port}/{settings.postgres_db}"
    logger.info(f"URL de conexión: {db_url}")
    
    # Inicializar Tortoise
    await Tortoise.init(
        db_url=db_url,
        modules={"models": settings.MODELS}
    )
    logger.info("Conexión establecida correctamente")

async def actualizar_rol_ramon():
    """Actualizar el rol de Ramon"""
    try:
        # Conectar a la base de datos
        await connect_to_db()
        
        # Buscar usuario Ramon
        ramon = await User.get_or_none(username='Ramon')
        if not ramon:
            logger.error("¡ERROR! Usuario Ramon no encontrado en la base de datos")
            return
        
        # Mostrar información actual
        logger.info(f"Usuario encontrado: {ramon.username}")
        logger.info(f"Rol actual: {ramon.role}")
        logger.info(f"ID: {ramon.id}")
        logger.info(f"Email: {ramon.email}")
        
        # Verificar si el rol ya es correcto
        if ramon.role == "Ramon":
            logger.info("✅ El rol ya es correcto (Ramon). No es necesario actualizar.")
        else:
            # Guardar rol anterior para referencia
            rol_anterior = ramon.role
            
            # Actualizar el rol
            ramon.role = "Ramon"
            await ramon.save()
            
            logger.info(f"✅ Rol actualizado correctamente: {rol_anterior} -> Ramon")
            
            # Verificar que el cambio se haya aplicado
            ramon_actualizado = await User.get(id=ramon.id)
            logger.info(f"Rol verificado en la base de datos: {ramon_actualizado.role}")
            
            if ramon_actualizado.role == "Ramon":
                logger.info("✅ Verificación exitosa: El rol se actualizó correctamente")
            else:
                logger.error(f"❌ Error en la verificación: El rol sigue siendo {ramon_actualizado.role}")
        
    except Exception as e:
        logger.error(f"Error al actualizar el rol de Ramon: {str(e)}")
    finally:
        # Cerrar conexión
        await Tortoise.close_connections()

async def main():
    """Función principal"""
    logger.info("=== ACTUALIZACIÓN DE ROL PARA USUARIO RAMON ===")
    await actualizar_rol_ramon()
    logger.info("=== PROCESO COMPLETADO ===")

# Ejecutar la función principal
if __name__ == "__main__":
    asyncio.run(main())
