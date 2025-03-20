"""
Script para actualizar el campo alletar en la base de datos
"""
import asyncio
import os
from dotenv import load_dotenv
from tortoise import Tortoise
from app.models.animal import Animal, EstadoAlletar
from app.core.config import get_settings

# Cargar variables de entorno
load_dotenv()

# Obtener configuración
settings = get_settings()

# Configuración de la base de datos
DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgres://")

async def update_alletar_field():
    """Actualiza el campo alletar de los animales existentes"""
    print(f"Conectando a la base de datos: {DATABASE_URL}")
    
    try:
        # Conectar a Tortoise ORM
        await Tortoise.init(
            db_url=DATABASE_URL,
            modules={"models": ["app.models.animal"]}
        )
        
        print("Ejecutando SQL para modificar el tipo de columna...")
        conn = Tortoise.get_connection("default")
        
        # Primero, crear una columna temporal
        await conn.execute_script("""
        ALTER TABLE animals ADD COLUMN alletar_temp VARCHAR(2);
        UPDATE animals SET alletar_temp = CASE WHEN alletar = TRUE THEN '1' ELSE 'NO' END;
        ALTER TABLE animals DROP COLUMN alletar;
        ALTER TABLE animals RENAME COLUMN alletar_temp TO alletar;
        """)
        
        print("Columna actualizada correctamente")
        
        # Cerrar conexión
        await Tortoise.close_connections()
        
    except Exception as e:
        print(f"Error al actualizar la columna: {e}")

if __name__ == "__main__":
    asyncio.run(update_alletar_field())
