"""
Script simple para probar la autenticación
"""
import asyncio
import sys
import os

# Añadir el directorio raíz al path para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.models.user import User
from app.core.auth import get_password_hash, verify_password, authenticate_user
from app.core.config import get_settings
from tortoise import Tortoise

async def init_db():
    """Inicializar la base de datos para pruebas"""
    settings = get_settings()
    db_url = settings.database_url.replace("localhost", "host.docker.internal")
    print(f"Intentando conectar a la base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={"models": ["app.models.animal", "app.models.user", "app.models.explotacio", "aerich.models"]}
    )
    print("Conexión a la base de datos establecida")

async def create_test_user():
    """Crear un usuario de prueba"""
    try:
        # Comprobar si el usuario ya existe
        user = await User.get_or_none(username="admin")
        
        if user:
            print(f"El usuario 'admin' ya existe (id: {user.id})")
            return user
            
        # Crear el usuario si no existe
        password_hash = get_password_hash("admin123")
        user = await User.create(
            username="admin",
            email="admin@example.com",
            password_hash=password_hash,
            full_name="Admin User",
            role="administrador",
            is_active=True
        )
        print(f"Usuario 'admin' creado con éxito (id: {user.id})")
        return user
    except Exception as e:
        print(f"Error al crear usuario: {e}")
        import traceback
        traceback.print_exc()
        return None

async def test_authentication():
    """Probar la autenticación con el usuario creado"""
    try:
        print("\nProbando autenticación...")
        user = await authenticate_user("admin", "admin123")
        
        if user:
            print(f"Autenticación exitosa para usuario: {user.username}")
            print(f"Detalles del usuario: id={user.id}, role={user.role}, active={user.is_active}")
            return True
        else:
            print("Autenticación fallida")
            return False
    except Exception as e:
        print(f"Error durante la autenticación: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Función principal"""
    try:
        # Inicializar la base de datos
        await init_db()
        
        # Crear usuario de prueba
        user = await create_test_user()
        if not user:
            print("No se pudo crear el usuario de prueba")
            return
            
        # Probar autenticación
        success = await test_authentication()
        print(f"\nResultado de la prueba: {'ÉXITO' if success else 'FALLO'}")
        
    except Exception as e:
        print(f"Error en la prueba: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cerrar conexión a la base de datos
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
