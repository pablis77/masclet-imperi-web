#!/usr/bin/env python3
"""
Script para migrar datos de la base de datos local a la del contenedor Docker.
"""
import asyncio
import sys
import os
import logging
from tortoise import Tortoise
import datetime

# Agregar el directorio raíz al path para poder importar desde app
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(root_path)

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Conexiones a las bases de datos
DB_LOCAL = "postgresql://postgres:1234@localhost:5432/masclet_imperi"
DB_CONTAINER = "postgresql://postgres:1234@localhost:5433/masclet_imperi"  # Nuevo puerto 5433 para el contenedor

# Variables para almacenar las conexiones
local_conn = None
container_conn = None

async def init_db(db_url, connection_name):
    """Inicializar conexión a base de datos"""
    global local_conn, container_conn
    
    # Usamos una conexión directa a PostgreSQL para evitar problemas con Tortoise ORM
    import asyncpg
    
    try:
        if connection_name == "local":
            local_conn = await asyncpg.connect(db_url)
        else:
            container_conn = await asyncpg.connect(db_url)
        logger.info(f"Conexión establecida con {connection_name}")
    except Exception as e:
        logger.error(f"Error al conectar con {connection_name}: {str(e)}")

async def close_db():
    """Cerrar conexión a base de datos"""
    global local_conn, container_conn
    
    if local_conn:
        await local_conn.close()
    if container_conn:
        await container_conn.close()
    
    logger.info("Conexiones cerradas")

async def execute_query(query, connection_name, params=None):
    """Ejecuta una consulta SQL en la conexión especificada"""
    global local_conn, container_conn
    
    try:
        conn = local_conn if connection_name == "local" else container_conn
        if not conn:
            logger.error(f"No hay conexión establecida para {connection_name}")
            return []
        
        if params:
            results = await conn.fetch(query, *params)
        else:
            results = await conn.fetch(query)
            
        return results
    except Exception as e:
        logger.error(f"Error al ejecutar consulta en {connection_name}: {str(e)}")
        return []

async def migrar_datos():
    """Migra datos de local a contenedor"""
    # Obtener datos de animales de la base local
    logger.info("Obteniendo datos de animales de la base local...")
    animals = await execute_query("SELECT * FROM animals", "local")
    logger.info(f"Se encontraron {len(animals)} animales en base local")
    
    # Insertar animales en contenedor
    for animal in animals:
        query = """
        INSERT INTO animals 
        (id, explotacio, nom, genere, estado, pare, mare, quadra, cod, num_serie, dob, created_at, updated_at, part, alletar) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        """
        params = [
            animal['id'], 
            animal['explotacio'], 
            animal['nom'], 
            animal['genere'], 
            animal['estado'], 
            animal['pare'], 
            animal['mare'], 
            animal['quadra'],
            animal['cod'],
            animal['num_serie'],
            animal['dob'],
            animal['created_at'],
            animal['updated_at'],
            animal['part'],
            animal['alletar']
        ]
        
        try:
            await execute_query(query, "container", params)
        except Exception as e:
            logger.error(f"Error al insertar animal {animal['id']}: {str(e)}")
    
    # Obtener partos de la base local
    logger.info("Obteniendo datos de partos de la base local...")
    parts = await execute_query("SELECT * FROM part", "local")
    logger.info(f"Se encontraron {len(parts)} partos en base local")
    
    # Insertar partos en contenedor
    for part in parts:
        query = """
        INSERT INTO part 
        (id, part, "GenereT", "EstadoT", numero_part, observacions, created_at, updated_at, animal_id) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """
        params = [
            part['id'], 
            part['part'], 
            part['GenereT'], 
            part['EstadoT'], 
            part['numero_part'], 
            part['observacions'], 
            part['created_at'],
            part['updated_at'],
            part['animal_id']
        ]
        
        try:
            await execute_query(query, "container", params)
        except Exception as e:
            logger.error(f"Error al insertar parto {part['id']}: {str(e)}")
    
    # Obtener usuarios de la base local
    logger.info("Obteniendo datos de usuarios de la base local...")
    users = await execute_query("SELECT * FROM users", "local")
    logger.info(f"Se encontraron {len(users)} usuarios en base local")
    
    # Insertar usuarios en contenedor
    for user in users:
        query = """
        INSERT INTO users 
        (id, username, password_hash, email, role, is_active, created_at, updated_at) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
        """
        params = [
            user['id'], 
            user['username'], 
            user['password_hash'], 
            user['email'], 
            user['role'], 
            user['is_active'], 
            user['created_at'],
            user['updated_at']
        ]
        
        try:
            await execute_query(query, "container", params)
        except Exception as e:
            logger.error(f"Error al insertar usuario {user.get('id')}: {str(e)}")
    
    # Restablecer las secuencias de las tablas
    logger.info("Restableciendo secuencias de IDs...")
    await execute_query("SELECT setval('animals_id_seq', (SELECT MAX(id) FROM animals)+1)", "container")
    await execute_query("SELECT setval('part_id_seq', (SELECT MAX(id) FROM part)+1)", "container")
    await execute_query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users)+1)", "container")
    
    logger.info("Migración completada con éxito")

async def verificar_migracion():
    """Verifica que la migración se haya realizado correctamente"""
    # Verificar animales
    animales_local = await execute_query("SELECT COUNT(*) as count FROM animals", "local")
    animales_container = await execute_query("SELECT COUNT(*) as count FROM animals", "container")
    
    logger.info(f"Animales en base local: {animales_local[0]['count']}")
    logger.info(f"Animales en contenedor: {animales_container[0]['count']}")
    
    # Verificar partos
    partos_local = await execute_query("SELECT COUNT(*) as count FROM part", "local")
    partos_container = await execute_query("SELECT COUNT(*) as count FROM part", "container")
    
    logger.info(f"Partos en base local: {partos_local[0]['count']}")
    logger.info(f"Partos en contenedor: {partos_container[0]['count']}")
    
    # Verificar usuarios
    usuarios_local = await execute_query("SELECT COUNT(*) as count FROM users", "local")
    usuarios_container = await execute_query("SELECT COUNT(*) as count FROM users", "container")
    
    logger.info(f"Usuarios en base local: {usuarios_local[0]['count']}")
    logger.info(f"Usuarios en contenedor: {usuarios_container[0]['count']}")

async def main():
    """Función principal"""
    # Verificar argumentos
    if len(sys.argv) < 2:
        print("Uso: python migrar_datos.py <puerto_contenedor>")
        print("Ejemplo: python migrar_datos.py 5432")
        sys.exit(1)
    
    puerto_contenedor = sys.argv[1]
    global DB_CONTAINER
    DB_CONTAINER = f"postgresql://postgres:1234@localhost:{puerto_contenedor}/masclet_imperi"
    
    print(f"Base de datos local: {DB_LOCAL}")
    print(f"Base de datos contenedor: {DB_CONTAINER}")
    
    try:
        # Inicializar conexiones
        await init_db(DB_LOCAL, "local")
        await init_db(DB_CONTAINER, "container")
        
        # Migrar datos
        await migrar_datos()
        
        # Verificar migración
        await verificar_migracion()
    except Exception as e:
        logger.error(f"Error durante la migración: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        # Cerrar conexiones
        await close_db()

if __name__ == "__main__":
    asyncio.run(main())
