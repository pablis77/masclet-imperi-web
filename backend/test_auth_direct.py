import asyncio
import os
from tortoise import Tortoise
from app.core.config import settings
from app.models.user import User
import bcrypt

async def test_auth():
    """Probar autenticación directamente con la base de datos"""
    try:
        # Mostrar configuración actual
        print("Configuración de la base de datos:")
        print(f"DATABASE_URL (env): {os.getenv('DATABASE_URL', 'No definido')}")
        print(f"database_url (settings): {settings.database_url}")
        print(f"Host: {settings.db_host}")
        print(f"Puerto: {settings.db_port}")
        print(f"Usuario: {settings.postgres_user}")
        print(f"Base de datos: {settings.postgres_db}")
        
        # Conectar a la base de datos
        db_url = settings.database_url
        print(f"\nIntentando conectar con URL: {db_url}")
        # Asegurarse de que la URL comienza con postgres:// (no postgresql://)
        if db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgres://")
            print(f"URL corregida: {db_url}")
            
        await Tortoise.init(
            db_url=db_url,
            modules={'models': settings.MODELS}
        )
        print("✅ Conexión exitosa")
        
        # Buscar usuario admin
        username = "admin"
        password = "admin123"
        print(f"\nBuscando usuario: {username}")
        user = await User.get_or_none(username=username)
        
        if user:
            print(f"✅ Usuario encontrado: {username}")
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Rol: {user.role}")
            print(f"Activo: {user.is_active}")
            print(f"Hash de contraseña: {user.password_hash[:20]}...")
            
            # Verificar contraseña
            print(f"\nVerificando contraseña para usuario: {username}")
            password_bytes = password.encode('utf-8')
            hashed_bytes = user.password_hash.encode('utf-8')
            
            # Verificar formato del hash
            if not hashed_bytes.startswith(b'$2'):
                print("❌ Error: El hash no tiene el formato correcto de bcrypt")
            else:
                result = bcrypt.checkpw(password_bytes, hashed_bytes)
                print(f"Resultado de verificación: {'✅ Exitosa' if result else '❌ Fallida'}")
        else:
            print(f"❌ Usuario no encontrado: {username}")
        
        await Tortoise.close_connections()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth())
