from datetime import datetime
import os
import json
import shutil
import subprocess
import logging
import re
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from fastapi import HTTPException

from app.models.animal import Animal
from app.models.explotacio import Explotacio
# Importamos solo los modelos necesarios
from app.models.animal import Animal
from app.models.user import User
from app.core.config import settings

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Modelos para la API
class BackupInfo(BaseModel):
    filename: str
    date: str
    size: str
    size_bytes: int
    created_by: str = "sistema"
    is_complete: bool = True
    content_type: str = "SQL"
    can_restore: bool = True
    backup_type: Optional[str] = "manual"  # Tipo de backup: daily, animal_created, animal_updated, import, manual
    description: Optional[str] = ""  # Descripción del backup
    
    class Config:
        # Permitir campos adicionales para mayor compatibilidad
        extra = "ignore"

class BackupOptions(BaseModel):
    include_animals: bool = True
    include_births: bool = True
    include_config: bool = True
    created_by: str = "admin"
    description: str = ""
    backup_type: str = "manual"  # Tipo de backup: daily, animal_created, animal_updated, import, manual

class BackupService:
    # Directorio de backups
    BACKUP_DIR = os.path.normpath(settings.backup_dir)
    if not os.path.isabs(BACKUP_DIR):
        # Si es una ruta relativa, la convertimos en absoluta
        # Ubicada en el mismo directorio que el backend
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        BACKUP_DIR = os.path.join(current_dir, BACKUP_DIR)
    # Número máximo de backups a mantener
    MAX_BACKUPS = 7
    # Nombre del contenedor PostgreSQL
    POSTGRES_CONTAINER = "masclet-db-new"
    
    @classmethod
    async def create_backup(cls, options: Optional[BackupOptions] = None) -> BackupInfo:
        """Crea un backup de la base de datos PostgreSQL"""
        if options is None:
            options = BackupOptions()
            
        # Crear timestamp y nombre de archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_masclet_imperi_{timestamp}.sql"
        
        # Asegurar que existe el directorio de backups
        if not os.path.exists(cls.BACKUP_DIR):
            os.makedirs(cls.BACKUP_DIR, exist_ok=True)
            logger.info(f"Directorio de backups creado: {cls.BACKUP_DIR}")
        
        # Ruta completa del archivo de backup
        backup_path = os.path.join(cls.BACKUP_DIR, filename)
        
        try:
            # Verificar si Docker está disponible
            if not shutil.which("docker"):
                raise HTTPException(status_code=500, detail="Docker no está disponible en el sistema")
            
            # Verificar si el contenedor está en ejecución
            container_check = subprocess.run(
                ["docker", "ps", "--filter", f"name={cls.POSTGRES_CONTAINER}", "--format", "{{.Names}}"],
                capture_output=True, text=True
            )
            
            if cls.POSTGRES_CONTAINER not in container_check.stdout:
                raise HTTPException(
                    status_code=500, 
                    detail=f"El contenedor {cls.POSTGRES_CONTAINER} no está en ejecución"
                )
            
            # Obtener datos de conexión
            user = settings.postgres_user
            db_name = settings.postgres_db
            
            logger.info(f"Iniciando backup de la base de datos {db_name} en {backup_path}...")
            
            # Ejecutar pg_dump dentro del contenedor
            process = subprocess.run(
                ["docker", "exec", cls.POSTGRES_CONTAINER, "pg_dump", "-U", user, db_name],
                stdout=open(backup_path, "w", encoding="utf-8"),
                stderr=subprocess.PIPE,
                text=True
            )
            
            if process.returncode != 0:
                logger.error(f"Error durante el backup: {process.stderr}")
                if os.path.exists(backup_path):
                    os.unlink(backup_path)
                raise HTTPException(status_code=500, detail=f"Error al crear backup: {process.stderr}")
            
            # Comprobar que el archivo de backup existe y tiene contenido
            if not os.path.exists(backup_path) or os.path.getsize(backup_path) == 0:
                logger.error("El archivo de backup está vacío o no se creó correctamente")
                raise HTTPException(status_code=500, detail="El archivo de backup está vacío")
            
            # Obtener información del backup
            file_size_bytes = os.path.getsize(backup_path)
            file_size = cls._format_size(file_size_bytes)
            
            logger.info(f"Backup completado exitosamente: {filename}")
            logger.info(f"Tamaño del backup: {file_size}")
            
            # Rotar backups antiguos
            await cls.rotate_backups()
            
            # Crear y devolver información del backup
            backup_info = BackupInfo(
                filename=filename,
                date=datetime.now().strftime("%d/%m/%Y %H:%M"),
                size=file_size,
                size_bytes=file_size_bytes,
                created_by=options.created_by,
                is_complete=True,
                content_type="SQL",
                can_restore=True,
                backup_type=options.backup_type if hasattr(options, 'backup_type') else "manual",
                description=options.description if options.description else "Backup manual"
            )
            
            return backup_info
            
        except Exception as e:
            logger.error(f"Error durante el proceso de backup: {str(e)}")
            # Si se creó un archivo parcial, eliminarlo
            if os.path.exists(backup_path):
                os.unlink(backup_path)
            raise HTTPException(status_code=500, detail=str(e))

    @classmethod
    async def list_backups(cls) -> List[BackupInfo]:
        """Obtiene la lista de backups disponibles"""
        # Asegurar que existe el directorio de backups
        if not os.path.exists(cls.BACKUP_DIR):
            os.makedirs(cls.BACKUP_DIR, exist_ok=True)
            return []
        
        backup_files = []
        
        # Patrón para extraer la fecha del nombre del archivo
        pattern = re.compile(r'backup_masclet_imperi_(\d{8}_\d{6})\.sql')
        
        # Cargar el historial de backups para obtener la información adicional
        history_path = os.path.join(cls.BACKUP_DIR, "backup_log.json")
        history = []
        
        if os.path.exists(history_path):
            try:
                with open(history_path, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except Exception as e:
                logger.error(f"Error al cargar historial de backups: {str(e)}")
        
        # Crear un diccionario con la información del historial para búsqueda rápida
        history_dict = {entry.get("filename"): entry for entry in history}
        
        for filename in os.listdir(cls.BACKUP_DIR):
            if filename.startswith("backup_masclet_imperi_") and filename.endswith(".sql"):
                file_path = os.path.join(cls.BACKUP_DIR, filename)
                
                # Extraer fecha del nombre
                match = pattern.match(filename)
                if match:
                    date_str = match.group(1)
                    try:
                        # Convertir YYYYMMDD_HHMMSS a dd/mm/yyyy HH:MM
                        date_obj = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                        formatted_date = date_obj.strftime("%d/%m/%Y %H:%M")
                    except ValueError:
                        formatted_date = "Fecha desconocida"
                else:
                    formatted_date = "Fecha desconocida"
                
                # Obtener tamaño del archivo
                size_bytes = os.path.getsize(file_path)
                size = cls._format_size(size_bytes)
                
                # Obtener información adicional del historial si existe
                history_entry = history_dict.get(filename, {})
                
                backup_info = BackupInfo(
                    filename=filename,
                    date=formatted_date,
                    size=size,
                    size_bytes=size_bytes,
                    created_by=history_entry.get("created_by", "sistema"),
                    is_complete=True,
                    content_type="SQL",
                    can_restore=True,
                    backup_type=history_entry.get("backup_type", "manual"),
                    description=history_entry.get("description", "")
                )
                
                backup_files.append(backup_info)
        
        # Ordenar por fecha (más reciente primero)
        return sorted(backup_files, key=lambda x: x.filename, reverse=True)

    @classmethod
    async def restore_backup(cls, filename: str) -> bool:
        """Restaura la base de datos desde un backup"""
        backup_path = os.path.join(cls.BACKUP_DIR, filename)
        
        # Verificar que el archivo existe
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        try:
            # Verificar si Docker está disponible
            if not shutil.which("docker"):
                raise HTTPException(status_code=500, detail="Docker no está disponible en el sistema")
            
            # Verificar si el contenedor está en ejecución
            container_check = subprocess.run(
                ["docker", "ps", "--filter", f"name={cls.POSTGRES_CONTAINER}", "--format", "{{.Names}}"],
                capture_output=True, text=True
            )
            
            if cls.POSTGRES_CONTAINER not in container_check.stdout:
                raise HTTPException(
                    status_code=500, 
                    detail=f"El contenedor {cls.POSTGRES_CONTAINER} no está en ejecución"
                )
            
            # Obtener datos de conexión
            user = settings.postgres_user
            db_name = settings.postgres_db
            
            logger.info(f"Iniciando restauración de la base de datos {db_name} desde {backup_path}...")
            
            # Crear backup antes de restaurar (por seguridad)
            pre_restore_backup = await cls.create_backup(
                BackupOptions(created_by="sistema", description="Backup automático pre-restauración")
            )
            
            # Restaurar la base de datos
            with open(backup_path, "r", encoding="utf-8") as f:
                process = subprocess.run(
                    ["docker", "exec", "-i", cls.POSTGRES_CONTAINER, "psql", "-U", user, "-d", db_name],
                    stdin=f,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
            if process.returncode != 0:
                logger.error(f"Error durante la restauración: {process.stderr}")
                raise HTTPException(status_code=500, detail=f"Error al restaurar: {process.stderr}")
            
            logger.info(f"Restauración completada exitosamente desde: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error durante el proceso de restauración: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @classmethod
    async def delete_backup(cls, filename: str) -> bool:
        """Elimina un archivo de backup"""
        backup_path = os.path.join(cls.BACKUP_DIR, filename)
        
        # Verificar que el archivo existe
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        try:
            os.remove(backup_path)
            logger.info(f"Backup eliminado: {filename}")
            return True
        except Exception as e:
            logger.error(f"Error al eliminar backup {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error al eliminar backup: {str(e)}")

    @classmethod
    async def rotate_backups(cls):
        """Mantiene solo los últimos MAX_BACKUPS backups"""
        if not os.path.exists(cls.BACKUP_DIR):
            return
            
        backups = sorted(
            [f for f in os.listdir(cls.BACKUP_DIR) if f.startswith("backup_masclet_imperi_") and f.endswith(".sql")]
        )
        
        # Eliminar backups más antiguos si excedemos el límite
        while len(backups) > cls.MAX_BACKUPS:
            oldest_backup = backups.pop(0)
            oldest_path = os.path.join(cls.BACKUP_DIR, oldest_backup)
            try:
                os.remove(oldest_path)
                logger.info(f"Backup antiguo eliminado: {oldest_backup}")
            except Exception as e:
                logger.error(f"Error al eliminar backup antiguo {oldest_backup}: {str(e)}")
    
    @staticmethod
    def _format_size(size_bytes: int) -> str:
        """Formatea el tamaño en bytes a una representación legible"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0 or unit == 'GB':
                break
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} {unit}"