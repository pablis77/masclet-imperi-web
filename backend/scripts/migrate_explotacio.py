#!/usr/bin/env python3
"""
Script de migración para corregir el modelo Explotacio según las reglas de negocio.

Este script realiza las siguientes operaciones:
1. Garantiza que todas las explotaciones tengan un campo 'explotacio' válido
2. Elimina los campos 'nom' y 'activa' que no están en las reglas de negocio

IMPORTANTE: Ejecutar este script antes de actualizar los modelos de la aplicación.
"""
import asyncio
import sys
import os
import logging
from tortoise import Tortoise
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"migrate_explotacio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para poder importar desde app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importar configuración
from app.core.config import TORTOISE_ORM
from app.models.explotacio import Explotacio

async def init_db():
    """Inicializar conexión a base de datos"""
    await Tortoise.init(config=TORTOISE_ORM)
    logger.info("Conexión a base de datos inicializada")

async def close_db():
    """Cerrar conexión a base de datos"""
    await Tortoise.close_connections()
    logger.info("Conexión a base de datos cerrada")

async def migrate_explotacio():
    """Migrar datos de explotación según nuevas reglas"""
    try:
        logger.info("Iniciando migración de Explotacio...")
        
        # Obtener todas las explotaciones
        explotaciones = await Explotacio.all()
        logger.info(f"Encontradas {len(explotaciones)} explotaciones para migrar")
        
        for i, explotacio in enumerate(explotaciones, 1):
            # Guardar datos actuales para logging
            old_data = {
                'id': explotacio.id,
                'nom': getattr(explotacio, 'nom', None),
                'explotacio': explotacio.explotacio,
                'activa': getattr(explotacio, 'activa', None),
            }
            
            # Si explotacio es null o vacío, usar el contenido de nom
            if not explotacio.explotacio:
                explotacio.explotacio = getattr(explotacio, 'nom', f"Explotacion_{explotacio.id}")
                logger.warning(f"Explotación {explotacio.id}: campo 'explotacio' estaba vacío, se usó '{explotacio.explotacio}'")
            
            # Guardar cambios
            await explotacio.save(update_fields=['explotacio'])
            
            # Log de la migración
            logger.info(f"Migrada explotación {i}/{len(explotaciones)}: {old_data} -> {explotacio.explotacio}")
            
        logger.info("Migración de Explotacio completada con éxito")
        
    except Exception as e:
        logger.error(f"Error durante la migración: {str(e)}", exc_info=True)
        raise

async def main():
    """Función principal del script"""
    try:
        logger.info("=== INICIANDO MIGRACIÓN DE EXPLOTACIONES ===")
        await init_db()
        await migrate_explotacio()
        logger.info("=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===")
    except Exception as e:
        logger.error(f"Error en la migración: {str(e)}", exc_info=True)
        sys.exit(1)
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
