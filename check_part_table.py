#!/usr/bin/env python
"""
Script para verificar la estructura de la tabla part.
"""
import asyncio
from tortoise import Tortoise

async def check_table():
    # Inicializar la conexión a la base de datos
    await Tortoise.init(
        db_url="postgres://postgres:1234@localhost:5432/masclet_imperi",
        modules={"models": ["app.models.user", "app.models.animal", "app.models.explotacio"]}
    )
    
    try:
        conn = Tortoise.get_connection("default")
        
        # Verificar si la tabla 'part' existe
        result = await conn.execute_query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='part');")
        table_exists = result[1][0]["exists"]
        
        if not table_exists:
            print("La tabla 'part' no existe en la base de datos.")
            return
        
        # Obtener la estructura de la tabla
        result = await conn.execute_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'part';")
        
        print("Estructura actual de la tabla part:")
        for row in result[1]:
            print(f"{row['column_name']} - {row['data_type']}")
    
    except Exception as e:
        print(f"Error al verificar la tabla: {e}")
    
    finally:
        # Cerrar conexiones
        await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(check_table())
