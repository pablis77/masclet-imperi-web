import asyncio
from tortoise import Tortoise
from app.models.animal import Part

async def main():
    await Tortoise.init(
        db_url='postgres://postgres:1234@localhost:5432/masclet_imperi',
        modules={'models': ['app.models.animal', 'app.models.user', 'app.models.explotacio', 'app.models.import_model']}
    )
    
    # Consultar la tabla Part directamente, sin ordenamiento
    print("\n=== VERIFICANDO PARTOS EN LA BASE DE DATOS ===")
    
    # Consulta SQL directa para evitar problemas con el ORM
    conn = Tortoise.get_connection("default")
    result = await conn.execute_query("SELECT * FROM part")
    rows = result[0]
    print(f"Total de partos en la base: {len(rows)}")
    
    # Mostrar detalles de cada parto
    for row in rows:
        print(f"\nParto ID: {row[0]}")
        print(f"Animal ID: {row[1]}")
        print(f"Fecha: {row[2]}")
        print(f"GenereT: {row[3]}")
        print(f"EstadoT: {row[4]}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(main())
