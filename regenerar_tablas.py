import asyncio
import sys
from tortoise import Tortoise
from backend.app.main import TORTOISE_ORM
from backend.app.models.animal import AnimalHistory

async def regenerar_tablas():
    print("Conectando a la base de datos...")
    
    # Corregir URL: cambiar postgresql por postgres si es necesario
    db_url = TORTOISE_ORM['connections']['default']
    if db_url.startswith('postgresql'):
        TORTOISE_ORM['connections']['default'] = db_url.replace('postgresql', 'postgres')
    
    print(f"URL de la base de datos: {TORTOISE_ORM['connections']['default']}")
    await Tortoise.init(config=TORTOISE_ORM)
    
    # Imprimir estructura del modelo AnimalHistory para depuración
    print("\nEstructura del modelo AnimalHistory:")
    for field_name, field_object in AnimalHistory._meta.fields_map.items():
        print(f"  - {field_name}: {type(field_object).__name__}")
    
    # Primero eliminamos la tabla animal_history si existe
    try:
        connection = Tortoise.get_connection("default")
        print("\nEliminando tabla animal_history...")
        await connection.execute_query("DROP TABLE IF EXISTS animal_history CASCADE")
        print("Tabla eliminada correctamente.")
        
        # Verificar que no queden restricciones o índices antiguos
        print("Limpiando cualquier restricción o índice pendiente...")
        await connection.execute_script("""
        DO $$ 
        BEGIN 
            -- Eliminar cualquier secuencia relacionada
            PERFORM pg_catalog.setval(pg_get_serial_sequence('animal_history', 'id'), 1, false);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar errores, la secuencia puede no existir todavía
        END $$;
        """)
        
    except Exception as e:
        print(f"Error al eliminar la tabla: {e}")
    
    # Regeneramos los esquemas
    print("\nRegenerando esquemas...")
    try:
        await Tortoise.generate_schemas(safe=False)
        print("Esquemas regenerados correctamente.")
        
        # Verificar que la tabla se creó con la estructura correcta
        print("\nVerificando estructura de la tabla:")
        result = await connection.execute_query("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'animal_history' 
        ORDER BY ordinal_position
        """)
        
        for row in result[1]:
            print(f"  - {row[0]}: {row[1]}")
            
    except Exception as e:
        print(f"Error al regenerar esquemas: {e}")
    
    await Tortoise.close_connections()
    print("\n¡Completado! La tabla animal_history ha sido regenerada.")

if __name__ == "__main__":
    asyncio.run(regenerar_tablas())
