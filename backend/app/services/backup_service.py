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
# Importar servicio de notificaciones
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType, NotificationPriority

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
    def get_readable_file_size(cls, size_bytes: int) -> str:
        """Convierte un tamaño en bytes a un formato legible (KB, MB, GB, etc.)"""
        if size_bytes < 1024:
            return f"{size_bytes} bytes"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
            
    @classmethod
    async def cleanup_old_backups(cls):
        """Elimina los backups antiguos que exceden el número máximo permitido"""
        try:
            # Verificar que el directorio de backups existe
            if not os.path.exists(cls.BACKUP_DIR):
                logger.warning(f"Directorio de backups no encontrado: {cls.BACKUP_DIR}")
                return
            
            # Listar todos los archivos de backup
            backup_files = [f for f in os.listdir(cls.BACKUP_DIR) if f.startswith("backup_") and f.endswith(".sql")]
            
            # Si no hay suficientes archivos, no hace falta limpiar
            if len(backup_files) <= cls.MAX_BACKUPS:
                logger.info(f"No es necesario limpiar backups antiguos. Archivos: {len(backup_files)}, Máximo: {cls.MAX_BACKUPS}")
                return
            
            # Ordenar por fecha de modificación (más antiguo primero)
            backup_files.sort(key=lambda x: os.path.getmtime(os.path.join(cls.BACKUP_DIR, x)))
            
            # Calcular cuántos archivos eliminar
            files_to_delete = len(backup_files) - cls.MAX_BACKUPS
            logger.info(f"Eliminando {files_to_delete} backups antiguos")
            
            # Eliminar los archivos más antiguos que exceden el límite
            for i in range(files_to_delete):
                file_to_delete = os.path.join(cls.BACKUP_DIR, backup_files[i])
                os.remove(file_to_delete)
                logger.info(f"Backup antiguo eliminado: {backup_files[i]}")
                
            logger.info(f"Limpieza de backups completada. Quedan {cls.MAX_BACKUPS} archivos.")
            
        except Exception as e:
            logger.error(f"Error al limpiar backups antiguos: {e}")
            # No lanzamos la excepción para no interrumpir el proceso principal
    
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
            
            # Tamaño del archivo en bytes
            size_bytes = os.path.getsize(backup_path)
            # Tamaño en formato legible (KB, MB, etc)
            size_str = cls.get_readable_file_size(size_bytes)
            
            # Limpieza de backups antiguos
            await cls.cleanup_old_backups()
            
            # Registro el backup en el historial
            await cls.register_backup_history(
                filename=filename, 
                backup_type=options.backup_type,
                created_by=options.created_by,
                description=options.description or f"Backup {options.backup_type}",
                size_bytes=size_bytes
            )
            
            # Crear notificación de backup exitoso
            try:
                # Si el backup fue creado por un usuario específico, notificar a ese usuario
                user_id = 1  # Por defecto para admin
                
                # Intentamos encontrar el ID del usuario si es posible
                if options.created_by != "sistema":
                    user = await User.filter(username=options.created_by).first()
                    if user:
                        user_id = user.id
                
                # Crear la notificación
                details = {
                    "filename": filename,
                    "size": size_str,
                    "backup_type": options.backup_type
                }
                await NotificationService.create_backup_notification(
                    user_id=user_id,
                    backup_type=options.backup_type,
                    success=True,
                    details=details
                )
                
                # Si es un backup programado o automático, notificar a todos los administradores
                if options.backup_type in ["daily", "weekly", "automatic"]:
                    await NotificationService.create_system_notification(
                        title=f"Backup {options.backup_type} completado",
                        message=f"Se ha realizado un backup {options.backup_type} automático. Tamaño: {size_str}",
                        priority=NotificationPriority.LOW,
                        send_to_all_admins=True
                    )
            except Exception as e:
                logger.error(f"Error al crear notificación de backup: {e}")
                # Continuamos aunque falle la notificación
            
            return BackupInfo(
                filename=filename,
                date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                size=size_str,
                size_bytes=size_bytes,
                created_by=options.created_by,
                backup_type=options.backup_type,
                description=options.description or ""
            )
            
        except Exception as e:
            logger.error(f"Error durante el proceso de backup: {str(e)}")
            # Si se creó un archivo parcial, eliminarlo
            if os.path.exists(backup_path):
                os.unlink(backup_path)
            
            # Crear notificación de error en el backup
            try:
                # Intentamos notificar al usuario que inició el backup
                user_id = 1  # Por defecto para admin
                if options.created_by != "sistema":
                    user = await User.filter(username=options.created_by).first()
                    if user:
                        user_id = user.id
                
                # Notificar el error
                details = {"error": str(e), "backup_type": options.backup_type}
                await NotificationService.create_backup_notification(
                    user_id=user_id,
                    backup_type=options.backup_type,
                    success=False,
                    details=details
                )
                
                # Si era un backup importante, notificar a todos los administradores
                if options.backup_type in ["daily", "weekly", "automatic"]:
                    await NotificationService.create_system_notification(
                        title=f"Error en backup {options.backup_type}",
                        message=f"Ha ocurrido un error en el backup {options.backup_type}: {str(e)}",
                        priority=NotificationPriority.HIGH,
                        send_to_all_admins=True
                    )
            except Exception as notification_error:
                logger.error(f"Error al crear notificación de error de backup: {notification_error}")
                
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear backup: {str(e)}"
            )

    @classmethod
    async def list_backups(cls) -> List[BackupInfo]:
        """Obtiene la lista de backups disponibles"""
        try:
            logger.info(f"Intentando listar backups desde directorio: {cls.BACKUP_DIR}")
            
            # Asegurar que existe el directorio de backups
            if not os.path.exists(cls.BACKUP_DIR):
                logger.info(f"El directorio de backups no existe, creándolo: {cls.BACKUP_DIR}")
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
                    # Continuar sin historial
            else:
                logger.info(f"No existe archivo de historial: {history_path}")
            
            # Crear un diccionario con la información del historial para búsqueda rápida
            history_dict = {entry.get("filename"): entry for entry in history} if history else {}
            
            # Listar archivos en el directorio
            logger.info(f"Listando archivos en: {cls.BACKUP_DIR}")
            all_files = os.listdir(cls.BACKUP_DIR)
            logger.info(f"Total de archivos encontrados: {len(all_files)}")
            
            for filename in all_files:
                try:
                    if filename.startswith("backup_masclet_imperi_") and filename.endswith(".sql"):
                        file_path = os.path.join(cls.BACKUP_DIR, filename)
                        logger.info(f"Procesando archivo de backup: {filename}")
                        
                        # Extraer fecha del nombre
                        match = pattern.match(filename)
                        if match:
                            date_str = match.group(1)
                            try:
                                # Convertir YYYYMMDD_HHMMSS a dd/mm/yyyy HH:MM
                                date_obj = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                                formatted_date = date_obj.strftime("%d/%m/%Y %H:%M")
                            except ValueError as e:
                                logger.error(f"Error al formatear fecha de {filename}: {str(e)}")
                                formatted_date = "Fecha desconocida"
                        else:
                            formatted_date = "Fecha desconocida"
                        
                        # Obtener tamaño del archivo
                        size_bytes = os.path.getsize(file_path)
                        size = cls.get_readable_file_size(size_bytes)
                        
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
                except Exception as e:
                    logger.error(f"Error al procesar archivo {filename}: {str(e)}")
                    # Continuar con el siguiente archivo
            
            logger.info(f"Total de backups encontrados: {len(backup_files)}")
            
            # Ordenar por fecha (más reciente primero)
            return sorted(backup_files, key=lambda x: x.filename, reverse=True)
        except Exception as e:
            logger.error(f"Error inesperado al listar backups: {str(e)}")
            # Re-lanzar la excepción para que pueda ser manejada por el endpoint
            raise e

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
    async def get_backup_path(cls, filename: str) -> str:
        """Obtiene la ruta completa de un archivo de backup"""
        backup_path = os.path.join(cls.BACKUP_DIR, filename)
        
        # Verificar que el archivo existe
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
            
        return backup_path
    
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
        
    @classmethod
    async def register_backup_history(cls, filename: str, backup_type: str, created_by: str, description: str, size_bytes: int) -> None:
        """Registra un backup en el historial de backups"""
        try:
            # Ruta al archivo de historial
            history_path = os.path.join(cls.BACKUP_DIR, "backup_history.json")
            
            # Cargar historial existente o crear uno nuevo
            history = []
            if os.path.exists(history_path):
                try:
                    with open(history_path, "r", encoding="utf-8") as f:
                        history = json.load(f)
                except Exception as e:
                    logger.error(f"Error al cargar historial de backups: {str(e)}")
            
            # Añadir entrada al historial
            entry = {
                "filename": filename,
                "date": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "backup_type": backup_type,
                "created_by": created_by,
                "description": description,
                "size_bytes": size_bytes,
                "size": cls.get_readable_file_size(size_bytes)
            }
            
            history.append(entry)
            
            # Guardar historial actualizado
            with open(history_path, "w", encoding="utf-8") as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
                
            logger.info(f"Backup registrado en el historial: {filename}")
            
        except Exception as e:
            logger.error(f"Error al registrar backup en historial: {str(e)}")
            # No lanzamos excepción para no interrumpir el flujo principal