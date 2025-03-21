from tortoise import Tortoise, run_async
from app.models.user import User

async def list_users():
    # Inicializar Tortoise ORM
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.user']}
    )
    
    # Obtener todos los usuarios
    users = await User.all()
    
    print('Usuarios en la base de datos:')
    for user in users:
        print(f'- {user.username} (rol: {user.role})')
    
    # Cerrar conexiones
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(list_users())
