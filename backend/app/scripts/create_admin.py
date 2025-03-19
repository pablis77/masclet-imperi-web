"""
Script para crear un usuario administrador
"""
import asyncio
import sys
import os

# Añadir el directorio raíz al path para importar correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.models.user import User
from app.core.auth import get_password_hash
from tortoise import Tortoise
from app.core.config import get_settings

async def init_db():
    """Inicializar la base de datos"""
    settings = get_settings()
    
    # Usar una URL de base de datos fija que sabemos que funciona
    db_url = "postgres://postgres:1234@localhost:5432/masclet_imperi"
    print(f"Conectando a la base de datos: {db_url}")
    
    await Tortoise.init(
        db_url=db_url,
        modules={"models": settings.MODELS}
    )
    print("Conexión a la base de datos establecida")

async def create_admin_user():
    """Crear usuario administrador"""
    # Datos del administrador
    admin_data = {
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",
        "full_name": "Admin Usuario",
        "role": "administrador",
        "is_active": True
    }
    
    try:
        # Verificar si ya existe
        existing_user = await User.get_or_none(username=admin_data["username"])
        if existing_user:
            print(f"Usuario '{admin_data['username']}' ya existe (id: {existing_user.id})")
            print(f"Actualizando contraseña para garantizar acceso...")
            
            # Actualizar contraseña
            existing_user.password_hash = get_password_hash(admin_data["password"])
            await existing_user.save()
            print(f"Contraseña actualizada para usuario '{admin_data['username']}'")
            return existing_user
        
        # Crear nuevo usuario
        password_hash = get_password_hash(admin_data["password"])
        new_user = await User.create(
            username=admin_data["username"],
            email=admin_data["email"],
            password_hash=password_hash,
            full_name=admin_data["full_name"],
            role=admin_data["role"],
            is_active=admin_data["is_active"]
        )
        print(f"Usuario '{admin_data['username']}' creado exitosamente (id: {new_user.id})")
        print(f"Credenciales: {admin_data['username']} / {admin_data['password']}")
        return new_user
    
    except Exception as e:
        print(f"Error al crear/actualizar usuario administrador: {e}")
        import traceback
        traceback.print_exc()
        return None

async def main():
    """Función principal"""
    try:
        await init_db()
        await create_admin_user()
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
