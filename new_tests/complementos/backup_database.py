"""
Script para realizar copias de seguridad automáticas de la base de datos.

Este script se puede configurar para ejecutarse periódicamente mediante
un planificador de tareas (Task Scheduler) para mantener copias 
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
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar configuración
try:
    from backend.app.core.config import settings
except ImportError:
    logger.error("No se pudo importar la configuración. Asegúrate de estar en el directorio correcto.")
    sys.exit(1)

# Configuración de respaldo
DEFAULT_BACKUP_DIR = Path(__file__).parent.parent.parent / "backend" / "backups"
BACKUP_DIR = Path(os.environ.get("BACKUP_DIR", DEFAULT_BACKUP_DIR))
RETENTION_DAYS = int(os.environ.get("BACKUP_RETENTION_DAYS", "7"))  # Días de retención

# Nombre del contenedor Docker de PostgreSQL
POSTGRES_CONTAINER = "masclet-db"

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
    for backup_file in BACKUP_DIR.glob("*.sql"):
        # Obtener la fecha de modificación del archivo
        mtime = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
        age_days = (now - mtime).days
        
        if age_days > RETENTION_DAYS:
            backup_file.unlink()
            logger.info(f"Eliminado backup antiguo: {backup_file.name} (edad: {age_days} días)")
            count += 1
    
    logger.info(f"Proceso de limpieza completado. {count} backups antiguos eliminados.")

def check_docker_container():
    """Verifica si el contenedor de PostgreSQL está en ejecución"""
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={POSTGRES_CONTAINER}", "--format", "{{.Names}}"],
            capture_output=True, 
            text=True
        )
        
        if POSTGRES_CONTAINER in result.stdout:
            logger.info(f"Contenedor {POSTGRES_CONTAINER} encontrado y en ejecución")
            return True
        else:
            logger.error(f"Contenedor {POSTGRES_CONTAINER} no encontrado o no está en ejecución")
            return False
    except Exception as e:
        logger.error(f"Error al verificar el contenedor Docker: {str(e)}")
        return False

def backup_postgresql():
    """Realiza un backup de la base de datos PostgreSQL usando Docker"""
    
    # Verificar si Docker está instalado
    if not shutil.which("docker"):
        logger.error("Docker no está instalado o no está en el PATH")
        return False
    
    # Verificar si el contenedor está en ejecución
    if not check_docker_container():
        return False
    
    # Obtener los datos de conexión
    user = settings.postgres_user
    db_name = settings.postgres_db
    
    # Crear nombre de archivo con timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"backup_{db_name}_{timestamp}.sql"
    
    # Comando Docker para realizar el backup directamente a archivo local
    logger.info(f"Iniciando backup de la base de datos {db_name} en {backup_file}...")
    
    try:
        # Ejecutar pg_dump dentro del contenedor y redirigir la salida al archivo local
        process = subprocess.run(
            ["docker", "exec", POSTGRES_CONTAINER, "pg_dump", "-U", user, db_name],
            stdout=open(backup_file, "w", encoding="utf-8"),
            stderr=subprocess.PIPE,
            text=True
        )
        
        if process.returncode != 0:
            logger.error(f"Error durante el backup: {process.stderr}")
            if os.path.exists(backup_file):
                os.unlink(backup_file)
            return False
        
        # Comprobar que el archivo de backup existe y tiene contenido
        if not os.path.exists(backup_file) or os.path.getsize(backup_file) == 0:
            logger.error("El archivo de backup está vacío o no se creó correctamente")
            return False
        
        logger.info(f"Backup completado exitosamente: {backup_file}")
        logger.info(f"Tamaño del backup: {os.path.getsize(backup_file) / (1024 * 1024):.2f} MB")
        
        return True
        
    except Exception as e:
        logger.error(f"Error durante el backup: {str(e)}")
        if os.path.exists(backup_file):
            os.unlink(backup_file)
        return False

def main():
    """Función principal"""
    logger.info("Iniciando proceso de backup de base de datos...")
    
    try:
        # Asegurar que el directorio de backups exista
        ensure_backup_dir()
        
        # Realizar backup
        if backup_postgresql():
            # Limpiar backups antiguos si el backup fue exitoso
            cleanup_old_backups()
            logger.info("Proceso de backup completado exitosamente")
            return 0
        else:
            logger.error("El backup no se completó correctamente")
            return 1
    except Exception as e:
        logger.error(f"Error en el proceso de backup: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
