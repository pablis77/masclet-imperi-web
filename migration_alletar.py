import asyncio
import os
from tortoise import Tortoise
from tortoise.expressions import RawSQL
from backend.app.models.animal import Animal

async def migrate_alletar_values():
    print("Iniciando migración de valores 'NO' a '0' en el campo alletar...")
    
    # Configuración de la base de datos
    db_url = "postgres://postgres:1234@localhost:5432/masclet_imperi"
    
    # Inicializar Tortoise ORM
    await Tortoise.init(
        db_url=db_url,
        modules={'models': ['backend.app.models.animal', 'backend.app.models.user', 'backend.app.models.explotacio']}
    )
    
    # Obtener el nombre real de la tabla desde el modelo
    table_name = Animal._meta.db_table
    print(f"Nombre de la tabla en la base de datos: {table_name}")

    # Obtener una conexión directa a la base de datos
    conn = Tortoise.get_connection("default")
    
    # Contar registros antes de la actualización
    query = f'SELECT COUNT(*) FROM "{table_name}" WHERE "alletar" = \'NO\''
    print(f"Ejecutando query: {query}")
    result = await conn.execute_query(query)
    count = result[1][0][0]
    print(f"Encontrados {count} animales con alletar='NO'")
    
    if count > 0:
        # Actualizar los registros usando SQL directo
        update_query = f'UPDATE "{table_name}" SET "alletar" = \'0\' WHERE "alletar" = \'NO\''
        print(f"Ejecutando update: {update_query}")
        result = await conn.execute_query(update_query)
        print(f"Migración completada. Se actualizaron {count} animales.")
    else:
        print("No se encontraron animales para actualizar.")
    
    # Cerrar conexión a la base de datos
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(migrate_alletar_values())
