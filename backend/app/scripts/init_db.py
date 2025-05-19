from tortoise import Tortoise, run_async
from app.models.user import User, UserRole
from app.database import TORTOISE_ORM
import sys

async def init_db():
    """Inicializa la base de datos con datos por defecto"""
    try:
        print("Iniciando conexión a la base de datos...")
        await Tortoise.init(config=TORTOISE_ORM)
        
        # Comentamos la generación de esquemas para evitar el error con genere_t
        # print("Generando esquemas...")
        # await Tortoise.generate_schemas(safe=True)
        
        print("Verificando usuario admin...")
        if not await User.filter(username="admin").exists():
            print("Creando usuario admin...")
            await User.create_user(
                username="admin",
                password="admin123",
                email="admin@mascletimperi.com",
                role=UserRole.ADMIN
            )
            print("Usuario administrador creado con éxito")
        else:
            print("El usuario admin ya existe")
            
        # Añadimos usuarios adicionales para pruebas
        if not await User.filter(username="editor").exists():
            print("Creando usuario editor...")
            await User.create_user(
                username="editor",
                password="editor123",
                email="editor@mascletimperi.com",
                role=UserRole.EDITOR
            )
            print("Usuario editor creado con éxito")
            
        if not await User.filter(username="usuario").exists():
            print("Creando usuario básico...")
            await User.create_user(
                username="usuario",
                password="usuario123",
                email="usuario@mascletimperi.com",
                role=UserRole.USER
            )
            print("Usuario básico creado con éxito")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise
    finally:
        print("Cerrando conexiones...")
        await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(init_db())