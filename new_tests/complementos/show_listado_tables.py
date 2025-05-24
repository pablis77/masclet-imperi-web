import asyncio
import logging
import os
import sys
from pathlib import Path

# Configurar el path para incluir el directorio raíz del proyecto
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Importar las dependencias necesarias
from backend.app.core.config import get_settings
from backend.app.db.session import init_db
from tortoise import Tortoise, connections

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)8s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

async def show_table_structure(table_name):
    """Mostrar la estructura detallada de una tabla específica"""
    conn = connections.get("default")
    
    # Obtener columnas
    columns_query = f"""
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = '{table_name}'
    ORDER BY ordinal_position;
    """
    columns = await conn.execute_query(columns_query)
    
    if not columns[1]:
        logger.info(f"No se encontraron columnas para la tabla {table_name}.")
        return
    
    logger.info(f"\n=== ESTRUCTURA DE LA TABLA: {table_name} ===\n")
    logger.info("COLUMNAS:")
    print("+---------------+--------------------------+----------------+-------------------------------------+")
    print("| Nombre        | Tipo de dato             | Permite NULL   | Valor por defecto                   |")
    print("+===============+==========================+================+=====================================+")
    
    for column in columns[1]:
        name = column[0]
        data_type = column[1]
        nullable = "YES" if column[2] == "YES" else "NO"
        default = column[3] if column[3] else " " * 40
        
        # Formatear para que se vea bien en la tabla
        name_formatted = name.ljust(15)
        type_formatted = data_type.ljust(26)
        null_formatted = nullable.ljust(16)
        default_formatted = str(default).ljust(37)
        
        print(f"| {name_formatted}| {type_formatted}| {null_formatted}| {default_formatted}|")
    
    print("+---------------+--------------------------+----------------+-------------------------------------+")
    
    # Obtener restricciones
    constraints_query = f"""
    SELECT tc.constraint_name, tc.constraint_type, 
           kcu.column_name, ccu.table_name as referenced_table,
           ccu.column_name as referenced_column
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = '{table_name}'
    ORDER BY tc.constraint_name;
    """
    constraints = await conn.execute_query(constraints_query)
    
    logger.info("\nRESTRICCIONES:")
    if not constraints[1]:
        logger.info(f"No se encontraron restricciones para la tabla {table_name}.")
    else:
        print("+--------------+-------------+------------+----------------------+--------------------------+")
        print("| Nombre       | Tipo        | Columnas   | Tabla referenciada   | Columnas referenciadas   |")
        print("+==============+=============+============+======================+==========================+")
        
        for constraint in constraints[1]:
            name = constraint[0]
            type_desc = constraint[1]
            column = constraint[2] if constraint[2] else ""
            ref_table = constraint[3] if constraint[3] else ""
            ref_column = constraint[4] if constraint[4] else ""
            
            # Formatear para que se vea bien en la tabla
            name_formatted = name.ljust(14)
            type_formatted = type_desc.ljust(13)
            column_formatted = column.ljust(12)
            ref_table_formatted = ref_table.ljust(22)
            ref_column_formatted = ref_column.ljust(26)
            
            print(f"| {name_formatted}| {type_formatted}| {column_formatted}| {ref_table_formatted}| {ref_column_formatted}|")
        
        print("+--------------+-------------+------------+----------------------+--------------------------+")
    
    # Obtener índices
    indices_query = f"""
    SELECT i.relname as index_name, 
           a.attname as column_name,
           ix.indisunique as is_unique,
           ix.indisprimary as is_primary
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = '{table_name}'
    ORDER BY i.relname;
    """
    indices = await conn.execute_query(indices_query)
    
    logger.info("\nÍNDICES:")
    if not indices[1]:
        logger.info(f"No se encontraron índices para la tabla {table_name}.")
    else:
        print("+--------------+-----------+------------+---------+")
        print("| Nombre       | Columna   | Es único   | Es PK   |")
        print("+==============+===========+============+=========+")
        
        for index in indices[1]:
            name = index[0]
            column = index[1]
            is_unique = "True" if index[2] else "False"
            is_primary = "True" if index[3] else "False"
            
            # Formatear para que se vea bien en la tabla
            name_formatted = name.ljust(14)
            column_formatted = column.ljust(11)
            unique_formatted = is_unique.ljust(12)
            primary_formatted = is_primary.ljust(9)
            
            print(f"| {name_formatted}| {column_formatted}| {unique_formatted}| {primary_formatted}|")
        
        print("+--------------+-----------+------------+---------+")

async def main():
    # Inicializar la conexión a la base de datos
    settings = get_settings()
    logger.info(f"Conexión establecida con la base de datos en {settings.DB_HOST}:{settings.DB_PORT}")
    
    await init_db(settings)
    
    # Mostrar la estructura de las tablas listado_animal y listados
    await show_table_structure("listado_animal")
    await show_table_structure("listados")
    
    # Mostrar los datos actuales de la tabla listado_animal
    conn = connections.get("default")
    listado_animal_data = await conn.execute_query("SELECT * FROM listado_animal LIMIT 10;")
    
    logger.info("\n=== DATOS DE LA TABLA listado_animal (primeros 10 registros) ===\n")
    if not listado_animal_data[1]:
        logger.info("No hay datos en la tabla listado_animal.")
    else:
        # Obtener nombres de columnas
        columns_query = """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'listado_animal'
        ORDER BY ordinal_position;
        """
        columns_result = await conn.execute_query(columns_query)
        column_names = [col[0] for col in columns_result[1]]
        
        # Imprimir encabezados
        header = " | ".join(column_names)
        logger.info(header)
        logger.info("-" * len(header))
        
        # Imprimir datos
        for row in listado_animal_data[1]:
            row_str = " | ".join(str(val) for val in row)
            logger.info(row_str)
    
    # Cerrar la conexión
    await Tortoise.close_connections()
    logger.info("Conexión cerrada")

if __name__ == "__main__":
    asyncio.run(main())
