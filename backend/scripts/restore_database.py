"""
Script para restaurar la base de datos desde una copia de seguridad.

Este script permite restaurar la base de datos en caso de emergencia o migración
a partir de un backup generado por el script backup_database.py.
"""
import os
import sys
import logging
import argparse
import subprocess
import glob
from pathlib import Path
import gzip
import tempfile

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(str(Path(__file__).parent.parent))

# Importar configuración
try:
    from app.core.config import settings
except ImportError:
    logger.error("No se pudo importar la configuración. Asegúrate de estar en el directorio correcto.")
    sys.exit(1)

# Configuración de respaldo
DEFAULT_BACKUP_DIR = Path(__file__).parent.parent / "backups"
BACKUP_DIR = Path(os.environ.get("BACKUP_DIR", DEFAULT_BACKUP_DIR))

def list_available_backups():
    """Lista los backups disponibles para restaurar"""
    if not BACKUP_DIR.exists():
        logger.error(f"El directorio de backups no existe: {BACKUP_DIR}")
        return []
    
    # Buscar todos los archivos .sql.gz
    backups = list(BACKUP_DIR.glob("*.sql.gz"))
    
    # Ordenar por fecha de modificación (más reciente primero)
    backups.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not backups:
        logger.warning("No se encontraron backups disponibles.")
    
    return backups

def confirm_action(message):
    """Solicita confirmación al usuario antes de continuar"""
    response = input(f"{message} (s/n): ").lower()
    return response in ['s', 'si', 'sí', 'y', 'yes']

def validate_db_url():
    """Valida que la URL de la base de datos sea correcta"""
    db_url = settings.db_url
    
    if not db_url.startswith("postgresql://"):
        logger.error("Solo se soporta PostgreSQL para la restauración de backups.")
        return False, None, None, None, None, None
    
    try:
        # Parsear la URL de la base de datos
        parsed = db_url.replace("postgresql://", "").split(":")
        
        user_part = parsed[0]
        password_host = parsed[1].split("@")
        password = password_host[0]
        host = password_host[1]
        
        port_db = parsed[2].split("/")
        port = port_db[0]
        db_name = port_db[1]
        
        return True, user_part, password, host, port, db_name
    except Exception as e:
        logger.error(f"Error al parsear la URL de la base de datos: {str(e)}")
        return False, None, None, None, None, None

def restore_postgresql(backup_file, recreate_db=False):
    """Restaura una base de datos PostgreSQL desde un backup"""
    # Validar URL de la base de datos
    valid, user, password, host, port, db_name = validate_db_url()
    
    if not valid:
        return False
    
    # Comprobar que el archivo de backup existe
    if not Path(backup_file).exists():
        logger.error(f"El archivo de backup no existe: {backup_file}")
        return False
    
    # Configurar variables de entorno temporales para pg_restore
    env = os.environ.copy()
    env["PGPASSWORD"] = password
    
    try:
        # Si se solicita recrear la BD
        if recreate_db:
            # Paso 1: Conectarse a template1 para poder eliminar la BD existente
            drop_command = [
                "psql",
                "-h", host,
                "-p", port,
                "-U", user,
                "-d", "postgres",
                "-c", f"DROP DATABASE IF EXISTS {db_name};"
            ]
            
            logger.info(f"Eliminando base de datos {db_name} si existe...")
            process = subprocess.run(
                drop_command,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if process.returncode != 0:
                logger.error(f"Error al eliminar la base de datos: {process.stderr}")
                return False
                
            # Paso 2: Crear la base de datos nuevamente
            create_command = [
                "psql",
                "-h", host,
                "-p", port,
                "-U", user,
                "-d", "postgres",
                "-c", f"CREATE DATABASE {db_name};"
            ]
            
            logger.info(f"Creando base de datos {db_name}...")
            process = subprocess.run(
                create_command,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if process.returncode != 0:
                logger.error(f"Error al crear la base de datos: {process.stderr}")
                return False
        
        # Extraer el archivo .gz
        logger.info(f"Descomprimiendo archivo de backup {backup_file}...")
        with tempfile.NamedTemporaryFile(suffix='.sql', delete=False) as temp_file:
            temp_path = temp_file.name
            
            with gzip.open(backup_file, 'rb') as f_in:
                temp_file.write(f_in.read())
        
        # Restaurar utilizando psql (ya que pg_dump se guardó en formato plano)
        logger.info(f"Restaurando base de datos {db_name} desde {backup_file}...")
        
        restore_command = [
            "psql",
            "-h", host,
            "-p", port,
            "-U", user,
            "-d", db_name,
            "-f", temp_path
        ]
        
        process = subprocess.run(
            restore_command,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Eliminar archivo temporal
        os.unlink(temp_path)
        
        if process.returncode != 0:
            logger.error(f"Error al restaurar la base de datos: {process.stderr}")
            return False
        
        logger.info(f"¡Base de datos {db_name} restaurada con éxito!")
        return True
        
    except Exception as e:
        logger.error(f"Error durante la restauración: {str(e)}")
        # Intentar limpiar archivo temporal si existe
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass
        return False

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Restaurar base de datos desde backup")
    parser.add_argument("--file", help="Ruta al archivo de backup a restaurar")
    parser.add_argument("--list", action="store_true", help="Listar backups disponibles")
    parser.add_argument("--recreate", action="store_true", help="Recrear la base de datos (drop y create)")
    parser.add_argument("--latest", action="store_true", help="Restaurar el backup más reciente")
    args = parser.parse_args()
    
    # Verificar que el directorio de backups existe
    if not BACKUP_DIR.exists():
        logger.error(f"El directorio de backups no existe: {BACKUP_DIR}")
        return 1
    
    # Listar backups disponibles
    if args.list:
        backups = list_available_backups()
        if backups:
            logger.info("Backups disponibles:")
            for i, backup in enumerate(backups, 1):
                size_mb = backup.stat().st_size / 1024 / 1024
                logger.info(f"{i}. {backup.name} ({size_mb:.2f} MB)")
        return 0
    
    backup_file = None
    
    # Utilizar el archivo específico si se proporciona
    if args.file:
        backup_file = args.file
        if not Path(backup_file).exists():
            logger.error(f"El archivo especificado no existe: {backup_file}")
            return 1
    
    # Utilizar el backup más reciente
    elif args.latest:
        backups = list_available_backups()
        if not backups:
            return 1
        backup_file = str(backups[0])
        logger.info(f"Utilizando el backup más reciente: {Path(backup_file).name}")
    
    # Si no se especifica archivo ni --latest, permitir selección interactiva
    else:
        backups = list_available_backups()
        if not backups:
            return 1
            
        logger.info("Backups disponibles:")
        for i, backup in enumerate(backups, 1):
            size_mb = backup.stat().st_size / 1024 / 1024
            logger.info(f"{i}. {backup.name} ({size_mb:.2f} MB)")
            
        selection = input("Seleccione el número del backup a restaurar (o 'q' para salir): ")
        if selection.lower() in ['q', 'quit', 'exit']:
            logger.info("Operación cancelada por el usuario")
            return 0
            
        try:
            selection_idx = int(selection) - 1
            if 0 <= selection_idx < len(backups):
                backup_file = str(backups[selection_idx])
            else:
                logger.error("Selección fuera de rango")
                return 1
        except ValueError:
            logger.error("Entrada no válida")
            return 1
    
    # Confirmar antes de restaurar
    warning = (
        "⚠️ ADVERTENCIA ⚠️\n"
        "Está a punto de restaurar la base de datos. "
        f"{'Esto eliminará todos los datos existentes.' if args.recreate else 'Esto sobrescribirá datos existentes.'}\n"
        "¿Está seguro de que desea continuar?"
    )
    
    if not confirm_action(warning):
        logger.info("Operación cancelada por el usuario")
        return 0
    
    # Realizar la restauración
    success = restore_postgresql(backup_file, recreate_db=args.recreate)
    
    if success:
        logger.info("Restauración completada con éxito")
        return 0
    else:
        logger.error("Error en el proceso de restauración")
        return 1

if __name__ == "__main__":
    sys.exit(main())
