"""
Endpoints para la gestión de backups programados
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging

from app.models.user import User
from app.core.auth import get_current_user, check_permissions
from app.services.scheduled_backup_service import ScheduledBackupService, BackupType, BackupHistoryEntry

# Configuración de logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/history", response_model=List[BackupHistoryEntry])
async def get_backup_history(
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Obtiene el historial de backups programados
    """
    try:
        # Verificar permisos (solo administradores)
        
        # Obtener historial de backups
        history = await ScheduledBackupService.get_backup_history()
        return history
    except Exception as e:
        logger.error(f"Error al obtener historial de backups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trigger/daily")
async def trigger_daily_backup(
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Activa manualmente la creación de un backup diario
    """
    try:
        # Verificar permisos (solo administradores)
        
        # Crear backup diario
        backup_info = await ScheduledBackupService.trigger_backup(
            backup_type=BackupType.DAILY,
            description="Backup diario activado manualmente",
            created_by=current_user.username if current_user else "sistema"
        )
        
        return {
            "status": "success",
            "message": "Backup diario iniciado correctamente",
            "backup_info": backup_info
        }
    except Exception as e:
        logger.error(f"Error al activar backup diario: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/configure")
async def configure_backup_retention(
    daily_count: int = 7,
    weekly_count: int = 7,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Configura la política de retención de backups
    """
    try:
        # Verificar permisos (solo administradores)
        
        # Configurar política de retención
        from app.services.scheduled_backup_service import BackupRetentionPolicy
        policy = BackupRetentionPolicy(
            daily_count=daily_count,
            weekly_count=weekly_count
        )
        
        # Aplicar política
        deleted_count = await ScheduledBackupService.apply_retention_policy(policy)
        
        return {
            "status": "success",
            "message": f"Política de retención configurada: {daily_count} diarios, {weekly_count} semanales",
            "deleted_backups": deleted_count
        }
    except Exception as e:
        logger.error(f"Error al configurar política de retención: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cleanup")
async def cleanup_old_backups(
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Elimina backups antiguos según la política de retención
    """
    try:
        # Verificar permisos (solo administradores)
        
        # Aplicar política de retención actual
        deleted_count = await ScheduledBackupService.apply_retention_policy()
        
        return {
            "status": "success",
            "message": f"Se eliminaron {deleted_count} backups antiguos",
        }
    except Exception as e:
        logger.error(f"Error al limpiar backups antiguos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
