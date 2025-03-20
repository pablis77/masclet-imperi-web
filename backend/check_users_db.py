import asyncio
from tortoise import Tortoise
from app.models.user import User
from app.database import TORTOISE_ORM

async def check_users():
    """Verifica los usuarios existentes en la base de datos"""
    try:
        print("Conectando a la base de datos...")
        await Tortoise.init(config=TORTOISE_ORM)
        
        print("\nUsuarios registrados en la base de datos:")
        users = await User.all()
        
        if not users:
            print("No hay usuarios registrados en la base de datos.")
        else:
            print(f"Total de usuarios: {len(users)}")
            print("\nDetalles de los usuarios:")
            for user in users:
                print(f"ID: {user.id}")
                print(f"Username: {user.username}")
                print(f"Email: {user.email}")
                print(f"Rol: {user.role}")
                print(f"Activo: {user.is_active}")
                print(f"Hash de contraseña (primeros 20 caracteres): {user.password_hash[:20]}...")
                print("-" * 50)
    except Exception as e:
        print(f"Error al verificar usuarios: {e}")
    finally:
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_users())
