"""
Script para restaurar el código mejorado de historial de animales
después de que la migración de la base de datos haya sido ejecutada.

Este script:
1. Verifica que las columnas necesarias existan en la base de datos
2. Restaura el código mejorado con los nuevos campos
"""
import os
import sys
import re
import logging
import datetime
import shutil
import asyncio
import asyncpg
from pathlib import Path

# Añadir directorio base al path para poder importar módulos
base_dir = str(Path(__file__).parent.parent.parent)
if base_dir not in sys.path:
    sys.path.append(base_dir)

def get_database_url():
    """
    Obtiene la URL de la base de datos a partir de los archivos .env
    """
    # Rutas de archivos .env a verificar
    env_files = [
        os.path.join(base_dir, '.env'),
        os.path.join(base_dir, 'backend', '.env'),
        os.path.join(base_dir, 'backend', 'docker', '.env')
    ]
    
    db_port = None
    env_file_usado = None
    
    # Buscar DB_PORT en los archivos .env
    for env_file in env_files:
        if os.path.exists(env_file):
            logging.info(f"Archivo .env encontrado: {env_file}")
            with open(env_file, 'r') as f:
                content = f.read()
                match = re.search(r'DB_PORT\s*=\s*(\d+)', content)
                if match:
                    db_port = match.group(1)
                    logging.info(f"  - DB_PORT={db_port}")
            
            if db_port:
                env_file_usado = env_file
                break
    
    # Si no se encontró en ninguno, usar valor predeterminado
    if not db_port:
        db_port = "5433"  # Valor predeterminado
        logging.warning(f"No se encontró DB_PORT en ninguno de los archivos .env. Usando valor predeterminado: {db_port}")
    else:
        logging.info(f"Usando archivo .env: {env_file_usado}")
        logging.info(f"DB_PORT cargado: {db_port}")
    
    # Construir DATABASE_URL
    database_url = f"postgres://postgres:1234@localhost:{db_port}/masclet_imperi"
    logging.info(f"DATABASE_URL generada: {database_url}")
    
    return database_url

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)8s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Archivo a modificar
ANIMALS_ENDPOINT_PATH = os.path.abspath(os.path.join(
    base_dir, "backend/app/api/endpoints/animals.py"
))

async def verificar_columnas_necesarias():
    """Verifica que las columnas necesarias existan en la base de datos"""
    logger.info("Verificando que las columnas necesarias existan en la base de datos...")
    
    database_url = get_database_url()
    if not database_url:
        logger.error("No se pudo obtener la URL de la base de datos")
        return False
    
    logger.info(f"Conectando a la base de datos: {database_url}")
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(database_url)
        
        # Columnas requeridas
        columnas_requeridas = [
            "action", "usuario_cambio", "timestamp", "field", 
            "description", "old_value", "new_value", "changes"
        ]
        
        for columna in columnas_requeridas:
            query = """
            SELECT EXISTS (
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'animal_history' AND column_name = $1
            );
            """
            exists = await conn.fetchval(query, columna)
            
            if not exists:
                logger.error(f"La columna '{columna}' no existe en la tabla animal_history")
                await conn.close()
                return False
        
        await conn.close()
        logger.info("Todas las columnas necesarias existen en la base de datos")
        return True
    
    except Exception as e:
        logger.error(f"Error al verificar columnas: {str(e)}")
        return False

def realizar_backup():
    """Realiza una copia de seguridad del archivo"""
    backup_path = f"{ANIMALS_ENDPOINT_PATH}.bak.{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    shutil.copy2(ANIMALS_ENDPOINT_PATH, backup_path)
    logger.info(f"Backup creado en: {backup_path}")
    return backup_path

def restaurar_codigo_mejorado():
    """
    Restaura el código mejorado con los nuevos campos de historial
    """
    if not os.path.exists(ANIMALS_ENDPOINT_PATH):
        logger.error(f"Archivo no encontrado: {ANIMALS_ENDPOINT_PATH}")
        return False
    
    # Realizar backup
    backup_path = realizar_backup()
    
    # Leer el archivo completo
    with open(ANIMALS_ENDPOINT_PATH, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Importar el módulo json si no está ya importado
    if "import json" not in contenido:
        contenido = contenido.replace(
            "import subprocess", 
            "import subprocess\nimport json"
        )
        logger.info("Añadida importación de módulo json")
    
    # Buscar y reemplazar el código de creación de historial
    patron_historial = re.compile(
        r'(\s+# Registrar en historial\s+await AnimalHistory\.create\(\s+animal=animal,\s+usuario=current_user\.username,\s+cambio=descripcion,\s+campo=campo,\s+valor_anterior=.*?,\s+valor_nuevo=.*?\s+\))',
        re.DOTALL
    )
    
    # Código mejorado con todos los campos extendidos
    reemplazo_historial = '''            # Registrar en historial con compatibilidad para ambos formatos
            # (antiguo y nuevo esquema extendido)
            cambios_json = {campo: {"anterior": str(valor_anterior) if valor_anterior is not None else None, 
                                 "nuevo": str(nuevo_valor) if nuevo_valor is not None else None}}
            
            await AnimalHistory.create(
                # Campos del formato antiguo
                animal=animal,
                usuario=current_user.username,
                cambio=descripcion,
                campo=campo,
                valor_anterior=str(valor_anterior) if valor_anterior is not None else None,
                valor_nuevo=str(nuevo_valor) if nuevo_valor is not None else None,
                
                # Campos del nuevo formato extendido
                action="UPDATE",
                usuario_cambio=current_user.username,
                timestamp=datetime.now(),
                field=campo,
                description=descripcion,
                old_value=str(valor_anterior) if valor_anterior is not None else None,
                new_value=str(nuevo_valor) if nuevo_valor is not None else None,
                changes=json.dumps(cambios_json)
            )'''
    
    nuevo_contenido = patron_historial.sub(reemplazo_historial, contenido)
    
    # Verificar si se hizo el cambio
    if nuevo_contenido == contenido:
        patron_alt = re.compile(
            r'(\s+# Registrar en historial.*?await AnimalHistory\.create\(.*?animal=animal,.*?\))',
            re.DOTALL
        )
        nuevo_contenido = patron_alt.sub(reemplazo_historial, contenido)
    
    # Verificar si se hizo el cambio con el patrón alternativo
    if nuevo_contenido == contenido:
        logger.warning("No se encontró el patrón para el historial. El código podría ya estar actualizado o tener un formato diferente.")
        return False
    
    # Guardar el archivo modificado
    with open(ANIMALS_ENDPOINT_PATH, 'w', encoding='utf-8') as f:
        f.write(nuevo_contenido)
    
    logger.info("Se restauró exitosamente el código mejorado con soporte para campos extendidos")
    return True

async def main():
    """Función principal que ejecuta el script"""
    logger.info("Iniciando restauración del código mejorado...")
    
    # Verificar que las columnas necesarias existan en la base de datos
    columnas_existen = await verificar_columnas_necesarias()
    if not columnas_existen:
        logger.error("No se pueden restaurar las mejoras porque faltan columnas en la base de datos.")
        logger.error("Por favor, ejecute primero el script de migración (backend/scripts/migrations/extend_animal_history.py)")
        return False
    
    # Restaurar el código mejorado
    codigo_restaurado = restaurar_codigo_mejorado()
    if not codigo_restaurado:
        logger.error("No se pudo restaurar el código mejorado")
        return False
    
    logger.info("=== RESTAURACIÓN COMPLETADA EXITOSAMENTE ===")
    logger.info("El sistema ahora utilizará todos los campos extendidos del historial")
    logger.info("Reinicie el servidor para aplicar los cambios")
    
    return True

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    success = loop.run_until_complete(main())
    
    if not success:
        logger.error("Error al restaurar el código mejorado. Revise los mensajes de error anteriores.")
        sys.exit(1)
    
    sys.exit(0)
