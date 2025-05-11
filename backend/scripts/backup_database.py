"""
Script para realizar copias de seguridad automáticas de la base de datos.

Este script se puede configurar para ejecutarse periódicamente mediante
un planificador de tareas (cron, Task Scheduler) para mantener copias 
de seguridad actualizadas de la base de datos de producción.
"""
import os
import sys
import logging
import datetime
import subprocess
import shutil
from pathlib import Path

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
RETENTION_DAYS = int(os.environ.get("BACKUP_RETENTION_DAYS", "30"))  # Días de retención

def ensure_backup_dir():
    """Asegura que el directorio de backups exista"""
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir(parents=True)
        logger.info(f"Directorio de backups creado: {BACKUP_DIR}")
    return BACKUP_DIR

def cleanup_old_backups():
    """Elimina backups antiguos basados en el período de retención"""
    logger.info(f"Limpiando backups anteriores a {RETENTION_DAYS} días...")
    
    now = datetime.datetime.now()
    count = 0
    
    for backup_file in BACKUP_DIR.glob("*.sql.gz"):
        # Obtener la fecha de modificación
        file_time = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
        age_days = (now - file_time).days
        
        if age_days > RETENTION_DAYS:
            try:
                backup_file.unlink()
                count += 1
                logger.info(f"Eliminado backup antiguo: {backup_file.name} ({age_days} días)")
            except Exception as e:
                logger.error(f"Error al eliminar backup antiguo {backup_file}: {str(e)}")
    
    logger.info(f"Proceso de limpieza completado. {count} backups antiguos eliminados.")

def backup_postgresql():
    """Realiza un backup de la base de datos PostgreSQL"""
    # Parsear la URL de la base de datos
    db_url = settings.db_url
    parsed = db_url.replace("postgresql://", "").split(":")
    
    if len(parsed) < 3:
        logger.error(f"URL de base de datos no válida: {db_url}")
        return False
    
    # Extraer componentes de la URL
    user_part = parsed[0]
    password_host = parsed[1].split("@")
    
    if len(password_host) < 2:
        logger.error("No se pudo extraer la contraseña y el host de la URL de la base de datos")
        return False
    
    password = password_host[0]
    host = password_host[1]
    
    port_db = parsed[2].split("/")
    if len(port_db) < 2:
        logger.error("No se pudo extraer el puerto y el nombre de la base de datos")
        return False
    
    port = port_db[0]
    db_name = port_db[1]
    
    # Crear nombre de archivo con timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"backup_{db_name}_{timestamp}.sql"
    
    # Configurar variables de entorno temporales para pg_dump
    env = os.environ.copy()
    env["PGPASSWORD"] = password
    
    # Comando para Windows (pg_dump suele estar en el PATH con instalaciones estándar)
    dump_command = [
        "pg_dump",
        "-h", host,
        "-p", port,
        "-U", user_part,
        "-d", db_name,
        "-f", str(backup_file),
        "--format=plain",
        "--no-owner",
        "--no-acl"
    ]
    
    try:
        # Ejecutar pg_dump
        logger.info(f"Iniciando backup de la base de datos {db_name}...")
        process = subprocess.run(
            dump_command,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        if backup_file.exists():
            # Comprimir el archivo SQL
            logger.info(f"Comprimiendo archivo de backup...")
            compressed_file = f"{backup_file}.gz"
            
            with open(backup_file, 'rb') as f_in:
                import gzip
                with gzip.open(f"{backup_file}.gz", 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            # Eliminar el archivo sin comprimir
            backup_file.unlink()
            
            backup_size = Path(f"{backup_file}.gz").stat().st_size
            logger.info(f"Backup completado: {backup_file}.gz ({backup_size/1024/1024:.2f} MB)")
            return True
        else:
            logger.error("El archivo de backup no se creó correctamente")
            return False
            
    except subprocess.CalledProcessError as e:
        logger.error(f"Error al ejecutar pg_dump: {e}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Error durante el backup: {str(e)}")
        return False

def main():
    """Función principal"""
    logger.info("Iniciando proceso de backup de base de datos...")
    
    try:
        # Asegurar directorio de backups
        ensure_backup_dir()
        
        # Realizar backup
        success = backup_postgresql()
        
        # Limpiar backups antiguos
        if success:
            cleanup_old_backups()
            logger.info("Proceso de backup completado con éxito")
            return 0
        else:
            logger.error("El backup no se completó correctamente")
            return 1
            
    except Exception as e:
        logger.error(f"Error en el proceso de backup: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
