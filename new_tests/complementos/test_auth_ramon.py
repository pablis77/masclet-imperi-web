"""
Script para probar la autenticación del usuario Ramon.
"""
import asyncio
import sys
import os
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)8s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent.parent))

from tortoise import Tortoise
from backend.app.models.user import User
from backend.app.core.auth import authenticate_user, verify_password
import bcrypt

async def test_authentication():
    """Probar la autenticación del usuario Ramon"""
    # Conectar a la base de datos
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5433/masclet_imperi',
        modules={'models': ['backend.app.models.user']}
    )
    
    try:
        # Verificar si el usuario existe
        username = "Ramon"
        user = await User.get_or_none(username=username)
        
        if not user:
            logger.error(f"Usuario {username} no encontrado en la base de datos")
            return
        
        logger.info(f"Usuario encontrado: {user.username}, ID: {user.id}, Rol: {user.role}")
        logger.info(f"Hash de contraseña: {user.password_hash[:20]}...")
        
        # Probar contraseña
        test_password = "Ramon123"
        logger.info(f"Probando contraseña: {test_password}")
        
        # Prueba directa con bcrypt
        password_bytes = test_password.encode('utf-8')
        hashed_bytes = user.password_hash.encode('utf-8') if isinstance(user.password_hash, str) else user.password_hash
        
        bcrypt_result = bcrypt.checkpw(password_bytes, hashed_bytes)
        logger.info(f"Verificación directa con bcrypt: {'ÉXITO' if bcrypt_result else 'FALLO'}")
        
        # Prueba con la función verify_password
        verify_result = verify_password(test_password, user.password_hash)
        logger.info(f"Verificación con función verify_password: {'ÉXITO' if verify_result else 'FALLO'}")
        
        # Prueba completa con authenticate_user
        auth_result = await authenticate_user(username, test_password)
        logger.info(f"Autenticación completa: {'ÉXITO' if auth_result else 'FALLO'}")
        
        if not auth_result:
            logger.error("La autenticación falló - posible contraseña incorrecta")
            
            # Intentemos actualizar la contraseña para asegurar que coincide
            logger.info("Actualizando contraseña para el usuario Ramon...")
            
            # Generar nuevo hash
            hashed_password = bcrypt.hashpw(
                test_password.encode(),
                bcrypt.gensalt()
            ).decode()
            
            # Actualizar usuario
            user.password_hash = hashed_password
            await user.save()
            
            logger.info(f"Contraseña actualizada. Nuevo hash: {user.password_hash[:20]}...")
            
            # Probar nuevamente
            auth_result_after = await authenticate_user(username, test_password)
            logger.info(f"Autenticación después de actualizar: {'ÉXITO' if auth_result_after else 'FALLO'}")
        
    except Exception as e:
        logger.error(f"Error durante la prueba: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        # Cerrar la conexión
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(test_authentication())
