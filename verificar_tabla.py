import asyncio
from tortoise import Tortoise
from backend.app.main import TORTOISE_ORM

async def check_table():
    # Corrigiendo URL de postgresql a postgres
    if TORTOISE_ORM['connections']['default'].startswith('postgresql'):
        TORTOISE_ORM['connections']['default'] = TORTOISE_ORM['connections']['default'].replace('postgresql', 'postgres')
    
    print("Conectando a la base de datos...")
    await Tortoise.init(config=TORTOISE_ORM)
    
    # Obtener conexión
    conn = Tortoise.get_connection('default')
    
    print("\n=== ESTRUCTURA DE LA TABLA: animal_history ===\n")
    result = await conn.execute_query("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'animal_history' 
    ORDER BY ordinal_position
    """)
    
    print("COLUMNAS:")
    print("+---------------+-------------------------+---------------+")
    print("| Nombre        | Tipo de dato            | Permite NULL  |")
    print("+===============+=========================+===============+")
    for row in result[1]:
        print(f"| {row[0]:<13} | {row[1]:<23} | {row[2]:<13} |")
    print("+---------------+-------------------------+---------------+")
    
    # Obtener restricciones
    print("\nRESTRICCIONES:")
    result = await conn.execute_query("""
    SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name as referenced_table,
        ccu.column_name as referenced_column
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.table_name = 'animal_history'
    """)
    
    if result[1]:
        print("+--------------------+-------------+------------+----------------------+--------------------------+")
        print("| Nombre             | Tipo        | Columnas   | Tabla referenciada   | Columnas referenciadas   |")
        print("+====================+=============+============+======================+==========================+")
        for row in result[1]:
            ref_table = row[3] if row[3] else ""
            ref_column = row[4] if row[4] else ""
            print(f"| {row[0]:<18} | {row[1]:<11} | {row[2]:<10} | {ref_table:<20} | {ref_column:<24} |")
        print("+--------------------+-------------+------------+----------------------+--------------------------+")
    else:
        print("No se encontraron restricciones para la tabla animal_history.")
    
    # Cerrar conexión
    await Tortoise.close_connections()
    print("\nConexión cerrada.")

if __name__ == "__main__":
    asyncio.run(check_table())
