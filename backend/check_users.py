import asyncio
import os
import sys
from tortoise import Tortoise

# Añadir el directorio actual al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def check_users():
    # Inicializar la conexión a la base de datos
    print("Inicializando conexión a la base de datos...")
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={'models': ['app.models.user']}
    )
    
    print('Verificando usuarios en la base de datos...')
    try:
        # Importar el modelo User después de inicializar Tortoise
        from app.models.user import User
        
        users = await User.all()
        print(f'Número de usuarios encontrados: {len(users)}')
        for user in users:
            print(f'Usuario: {user.username}, Rol: {user.role}, Activo: {user.is_active}')
    except Exception as e:
        print(f"Error al consultar usuarios: {e}")
    finally:
        # Cerrar la conexión a la base de datos
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_users())
