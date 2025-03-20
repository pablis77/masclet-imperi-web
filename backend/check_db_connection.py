import asyncio
import os
from tortoise import Tortoise
from app.core.config import settings

async def check_db_connection():
    """Verifica la conexión a la base de datos y muestra la URL utilizada"""
    try:
        # Mostrar configuración actual
        print("Configuración de la base de datos:")
        print(f"DATABASE_URL (env): {os.getenv('DATABASE_URL', 'No definido')}")
        print(f"database_url (settings): {settings.database_url}")
        print(f"Host: {settings.db_host}")
        print(f"Puerto: {settings.db_port}")
        print(f"Usuario: {settings.postgres_user}")
        print(f"Base de datos: {settings.postgres_db}")
        
        # Probar conexión con la URL original
        db_url = settings.database_url
        print(f"\nIntentando conectar con URL original: {db_url}")
        try:
            await Tortoise.init(
                db_url=db_url,
                modules={'models': settings.MODELS}
            )
            print("✅ Conexión exitosa con URL original")
            await Tortoise.close_connections()
        except Exception as e:
            print(f"❌ Error al conectar con URL original: {e}")
        
        # Probar conexión con localhost explícito
        db_url_local = f"postgres://{settings.postgres_user}:{settings.postgres_password}@localhost:{settings.db_port}/{settings.postgres_db}"
        print(f"\nIntentando conectar con localhost explícito: {db_url_local}")
        try:
            await Tortoise.init(
                db_url=db_url_local,
                modules={'models': settings.MODELS}
            )
            print("✅ Conexión exitosa con localhost explícito")
            await Tortoise.close_connections()
        except Exception as e:
            print(f"❌ Error al conectar con localhost explícito: {e}")
        
        # Probar conexión con host.docker.internal
        db_url_docker = f"postgres://{settings.postgres_user}:{settings.postgres_password}@host.docker.internal:{settings.db_port}/{settings.postgres_db}"
        print(f"\nIntentando conectar con host.docker.internal: {db_url_docker}")
        try:
            await Tortoise.init(
                db_url=db_url_docker,
                modules={'models': settings.MODELS}
            )
            print("✅ Conexión exitosa con host.docker.internal")
            await Tortoise.close_connections()
        except Exception as e:
            print(f"❌ Error al conectar con host.docker.internal: {e}")
            
        # Probar conexión con 127.0.0.1
        db_url_ip = f"postgres://{settings.postgres_user}:{settings.postgres_password}@127.0.0.1:{settings.db_port}/{settings.postgres_db}"
        print(f"\nIntentando conectar con 127.0.0.1: {db_url_ip}")
        try:
            await Tortoise.init(
                db_url=db_url_ip,
                modules={'models': settings.MODELS}
            )
            print("✅ Conexión exitosa con 127.0.0.1")
            await Tortoise.close_connections()
        except Exception as e:
            print(f"❌ Error al conectar con 127.0.0.1: {e}")
            
    except Exception as e:
        print(f"Error general: {e}")

if __name__ == "__main__":
    asyncio.run(check_db_connection())
