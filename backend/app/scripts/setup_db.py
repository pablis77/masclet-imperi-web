import asyncio
import sys
import asyncpg
import socket
from tortoise import Tortoise
from app.database import DB_CONFIG, TORTOISE_ORM

async def check_postgres_port():
    """Verifica si el puerto de PostgreSQL está accesible"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        result = sock.connect_ex((DB_CONFIG['host'], int(DB_CONFIG['port'])))
        return result == 0
    finally:
        sock.close()

async def try_connect(retries=3, delay=2):
    """Intenta conectar a PostgreSQL con reintentos"""
    last_error = None
    
    # Verificar si el puerto está accesible
    if not await check_postgres_port():
        raise ConnectionError(f"Puerto {DB_CONFIG['port']} no accesible. ¿Está PostgreSQL ejecutándose?")
    
    for attempt in range(retries):
        try:
            print(f"Intento de conexión {attempt + 1}/{retries}...")
            conn = await asyncpg.connect(
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                database='postgres',
                command_timeout=10.0,
                timeout=10.0
            )
            
            # Verificar la conexión
            version = await conn.fetchval('SELECT version()')
            print(f"✅ Conectado a: {version}")
            return conn
            
        except asyncpg.PostgresError as e:
            last_error = e
            print(f"Error PostgreSQL: {type(e).__name__}: {str(e)}")
        except Exception as e:
            last_error = e
            print(f"Error general: {type(e).__name__}: {str(e)}")
        
        if attempt < retries - 1:
            print(f"Reintentando en {delay} segundos...")
            await asyncio.sleep(delay)
            delay *= 2
    
    raise last_error

async def setup_database():
    """Configura la base de datos desde cero"""
    system_conn = None
    try:
        # 1. Conectar a PostgreSQL
        print("\n1. Conectando a PostgreSQL...")
        system_conn = await try_connect()
        
        # 2. Verificar si existe la base de datos
        print("\n2. Verificando base de datos...")
        exists = await system_conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            DB_CONFIG['database']
        )
        
        if not exists:
            print(f"\n3. Creando base de datos {DB_CONFIG['database']}...")
            await system_conn.execute(f"CREATE DATABASE {DB_CONFIG['database']}")
            print("✅ Base de datos creada")
        
        # Cerrar conexión del sistema
        await system_conn.close()
        system_conn = None
        await asyncio.sleep(2)
        
        # 4. Inicializar Tortoise
        print("\n4. Inicializando ORM...")
        await Tortoise.init(config=TORTOISE_ORM)
        
        # 5. Generar esquemas
        print("\n5. Generando esquemas...")
        await Tortoise.generate_schemas(safe=True)
        
        print("\n✅ Configuración completada con éxito")
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}: {str(e)}", file=sys.stderr)
        raise
    finally:
        print("\n6. Limpiando conexiones...")
        if system_conn:
            await system_conn.close()
        try:
            await Tortoise.close_connections()
        except Exception:
            pass

if __name__ == "__main__":
    try:
        # Usar el selector de eventos de Windows
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(setup_database())
    except KeyboardInterrupt:
        print("\n⚠️ Operación cancelada por el usuario")
    except Exception as e:
        print(f"❌ Error fatal: {type(e).__name__}: {str(e)}", file=sys.stderr)
        sys.exit(1)