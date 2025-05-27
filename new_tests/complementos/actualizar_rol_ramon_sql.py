"""
Script para actualizar el rol de Ramon usando SQL puro.

Este script:
1. Verifica el rol actual de Ramon
2. Lo actualiza a 'Ramon' si es necesario
3. Verifica que el cambio se haya aplicado correctamente
"""

import asyncio
import asyncpg
import sys
import os
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Añadir la ruta del proyecto al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Importar configuración
from backend.app.core.config import get_settings

async def actualizar_rol_ramon():
    """Actualizar el rol de Ramon directamente con SQL"""
    settings = get_settings()
    db_url = f"postgres://{settings.postgres_user}:{settings.postgres_password}@{settings.db_host}:{settings.db_port}/{settings.postgres_db}"
    
    try:
        # Conectar a la base de datos usando asyncpg
        logger.info(f"Conectando a la base de datos: {db_url}")
        conn = await asyncpg.connect(db_url)
        
        # Verificar el rol actual
        logger.info("Verificando el rol actual de Ramon...")
        resultado = await conn.fetchrow("SELECT id, username, email, role FROM users WHERE username = 'Ramon'")
        
        if not resultado:
            logger.error("¡ERROR! Usuario Ramon no encontrado en la base de datos")
            return
        
        # Mostrar información actual
        logger.info(f"Usuario encontrado: {resultado['username']}")
        logger.info(f"Rol actual: {resultado['role']}")
        logger.info(f"ID: {resultado['id']}")
        logger.info(f"Email: {resultado['email']}")
        
        # Verificar si el rol ya es correcto
        if resultado['role'] == "Ramon":
            logger.info("✅ El rol ya es correcto (Ramon). No es necesario actualizar.")
        else:
            # Guardar rol anterior para referencia
            rol_anterior = resultado['role']
            
            # Actualizar el rol
            logger.info(f"Actualizando rol de '{rol_anterior}' a 'Ramon'...")
            await conn.execute("UPDATE users SET role = 'Ramon' WHERE username = 'Ramon'")
            
            # Verificar que el cambio se haya aplicado
            verificacion = await conn.fetchrow("SELECT role FROM users WHERE username = 'Ramon'")
            nuevo_rol = verificacion['role']
            
            logger.info(f"✅ Rol actualizado correctamente: {rol_anterior} -> {nuevo_rol}")
            
            if nuevo_rol == "Ramon":
                logger.info("✅ Verificación exitosa: El rol se actualizó correctamente")
            else:
                logger.error(f"❌ Error en la verificación: El rol sigue siendo {nuevo_rol}")
        
        # Cerrar conexión
        await conn.close()
        
    except Exception as e:
        logger.error(f"Error al actualizar el rol de Ramon: {str(e)}")

async def main():
    """Función principal"""
    logger.info("=== ACTUALIZACIÓN DE ROL PARA USUARIO RAMON ===")
    await actualizar_rol_ramon()
    logger.info("=== PROCESO COMPLETADO ===")

# Ejecutar la función principal
if __name__ == "__main__":
    asyncio.run(main())
