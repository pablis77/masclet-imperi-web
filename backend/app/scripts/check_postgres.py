import sys
import asyncio
import asyncpg
from app.database import DB_CONFIG

async def check_postgres():
    try:
        print("Verificando configuración PostgreSQL...")
        print(f"Host: {DB_CONFIG['host']}")
        print(f"Port: {DB_CONFIG['port']}")
        print(f"User: {DB_CONFIG['user']}")
        print(f"Database: {DB_CONFIG['database']}")
        
        print("\nIntentando conexión simple...")
        conn = await asyncpg.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database='postgres'
        )
        
        version = await conn.fetchval('SELECT version()')
        print(f"\n✅ Conexión exitosa!")
        print(f"Versión PostgreSQL: {version}")
        
        await conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_postgres())