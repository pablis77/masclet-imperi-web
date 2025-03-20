"""
Script para aplicar la migración del campo alletar de boolean a character varying
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgres://postgres:1234@localhost:5432/masclet_imperi"
)

async def apply_migration():
    """Aplica la migración del campo alletar"""
    print(f"Conectando a la base de datos: {DATABASE_URL}")
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Iniciar una transacción
        async with conn.transaction():
            # 1. Convertir los valores booleanos actuales a los valores de la enumeración
            print("Convirtiendo valores booleanos a valores de enumeración...")
            await conn.execute(
                "UPDATE animals SET alletar = CASE WHEN alletar THEN '1'::text ELSE 'NO'::text END::text"
            )
            
            # 2. Cambiar el tipo de columna de boolean a character varying
            print("Cambiando tipo de columna de boolean a character varying...")
            await conn.execute(
                "ALTER TABLE animals ALTER COLUMN alletar TYPE character varying(2)"
            )
            
            print("Migración aplicada correctamente")
        
        # Cerrar la conexión
        await conn.close()
        
    except Exception as e:
        print(f"Error al aplicar la migración: {e}")

if __name__ == "__main__":
    asyncio.run(apply_migration())
