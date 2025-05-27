from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional
import os
import logging

from app.services.backup_service import BackupService, BackupInfo, BackupOptions
from app.api.deps.auth import get_current_user
from app.models.user import User
from app.core.auth import verify_user_role
from app.core.config import UserRole

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/list", response_model=List[BackupInfo])
async def list_backups(
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Lista todos los backups disponibles.
    """
    try:
        # Verificar permisos (solo administradores y Ramon)
        if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
            raise HTTPException(status_code=403, detail="No tienes permisos para ver la lista de backups")
        
        # Obtener lista de backups
        backups = await BackupService.list_backups()
        return backups
    except Exception as e:
        logger.error(f"Error al listar backups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=BackupInfo)
async def create_backup(
    options: Optional[BackupOptions] = None,
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Crea un nuevo backup del sistema.
    """
    try:
        # Verificar permisos (solo administradores y Ramon)
        if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
            raise HTTPException(status_code=403, detail="No tienes permisos para crear backups")
        
        # Si no se proporcionan opciones, usar valores predeterminados
        if options is None:
            options = BackupOptions()
        
        # Establecer el usuario que creó el backup (si está autenticado)
        if current_user:
            options.created_by = current_user.email
        else:
            # Si no hay usuario autenticado, usar un valor predeterminado
            options.created_by = 'sistema'
        
        # Ejecutar backup (en segundo plano si se proporciona background_tasks)
        if background_tasks:
            # Crear backup en segundo plano
            background_tasks.add_task(BackupService.create_backup, options)
            return JSONResponse(
                status_code=202,
                content={"message": "Backup iniciado en segundo plano"}
            )
        else:
            # Crear backup ahora
            backup_info = await BackupService.create_backup(options)
            return backup_info
    except Exception as e:
        logger.error(f"Error al crear backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore/{filename}")
async def restore_backup(
    filename: str,
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Restaura el sistema desde un backup existente.
    """
    try:
        # Verificar permisos (solo administradores pueden restaurar)
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            raise HTTPException(status_code=403, detail="Solo los administradores pueden restaurar backups")
        
        # Verificar que el archivo existe
        backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        # Restaurar backup (en segundo plano si se proporciona background_tasks)
        if background_tasks:
            # Restaurar en segundo plano
            background_tasks.add_task(BackupService.restore_backup, filename)
            return JSONResponse(
                status_code=202,
                content={"message": f"Restauración desde {filename} iniciada en segundo plano"}
            )
        else:
            # Restaurar ahora
            await BackupService.restore_backup(filename)
            return JSONResponse(
                status_code=200,
                content={"message": f"Sistema restaurado correctamente desde {filename}"}
            )
    except Exception as e:
        logger.error(f"Error al restaurar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_backup(
    filename: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Elimina un backup existente.
    """
    try:
        # Verificar permisos (solo administradores, Ramon no puede eliminar)
        if not verify_user_role(current_user, [UserRole.ADMIN]):
            raise HTTPException(status_code=403, detail="Solo los administradores pueden eliminar backups")
        
        # Comprobar si existe el archivo y eliminarlo
        file_path = await BackupService.get_backup_path(filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Backup {filename} no encontrado")
            
        # Eliminar el archivo
        os.remove(file_path)
        
        return JSONResponse(
            status_code=200,
            content={"message": f"Backup {filename} eliminado correctamente"}
        )
    except Exception as e:
        logger.error(f"Error al eliminar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{filename}")
async def download_backup(
    filename: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Descarga un backup existente.
    """
    try:
        # Verificar permisos (administradores y Ramon pueden descargar)
        if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
            raise HTTPException(status_code=403, detail="No tienes permisos para descargar backups")
        
        # Verificar que el archivo existe
        backup_path = os.path.join(BackupService.BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            raise HTTPException(status_code=404, detail=f"El archivo de backup {filename} no existe")
        
        # Devolver archivo para descarga
        return FileResponse(
            path=backup_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        logger.error(f"Error al descargar backup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
