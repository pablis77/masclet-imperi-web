import asyncio
import asyncpg
from backend.app.core.config import settings

async def check_aerich_schema():
    print("Conectando a la base de datos...")
    conn = await asyncpg.connect(
        database=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password,
        host=settings.db_host,
        port=settings.db_port
    )
    
    try:
        # Verificar las columnas de la tabla aerich
        columns = await conn.fetch("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'aerich'
        ORDER BY ordinal_position;
        """)
        
        print("\n=== COLUMNAS DE LA TABLA: aerich ===")
        print("COLUMNA              TIPO                      PERMITE NULL")
        print("--------------------------------------------------------------------------")
        for column in columns:
            print(f"{column['column_name']:<20} {column['data_type']:<25} {column['is_nullable']}")
        
        # Obtener la última versión de migración
        latest_migration = await conn.fetchrow("""
        SELECT * FROM aerich ORDER BY id DESC LIMIT 1;
        """)
        
        if latest_migration:
            print("\n=== ÚLTIMA MIGRACIÓN REGISTRADA ===")
            for key, value in latest_migration.items():
                print(f"{key}: {value}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()
        print("\nConexión cerrada.")

asyncio.run(check_aerich_schema())
