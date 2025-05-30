import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.notification import Notification, NotificationType, NotificationPriority
from app.core.auth import get_current_active_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_active_user),
    unread_only: bool = Query(False),
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0)
):
    """
    Obtener notificaciones del usuario actual.
    
    - unread_only: Si es True, solo devuelve notificaciones no leídas
    - limit: Número máximo de notificaciones a devolver
    - skip: Número de notificaciones a omitir (para paginación)
    """
    try:
        logger.info(f"Usuario {current_user.username} solicitando notificaciones")
        
        # Asegurarse de que el ID de usuario sea válido
        user_id = current_user.id if hasattr(current_user, 'id') else 1
        
        query = Notification.filter(user_id=user_id)
        
        if unread_only:
            query = query.filter(read=False)
        
        # Obtener total de notificaciones no leídas de forma segura
        try:
            unread_count = await Notification.filter(user_id=user_id, read=False).count()
        except Exception as e:
            logger.error(f"Error al contar notificaciones no leídas: {e}")
            unread_count = 0
        
        # Obtener notificaciones paginadas y ordenadas por fecha (más recientes primero)
        try:
            notifications = await query.order_by("-created_at").offset(skip).limit(limit).all()
            total_count = await query.count()
        except Exception as e:
            logger.error(f"Error al obtener notificaciones: {e}")
            notifications = []
            total_count = 0
        
        # Convertir a diccionario para la respuesta de forma segura
        result = []
        for notification in notifications:
            try:
                result.append(notification.to_dict())
            except Exception as e:
                logger.error(f"Error al convertir notificación a diccionario: {e}")
        
        # Agregar metadatos
        return {
            "items": result,
            "unread_count": unread_count,
            "total": total_count,
            "has_more": (skip + limit) < total_count
        }
    except Exception as e:
        logger.error(f"Error general en get_notifications: {e}")
        return {
            "items": [],
            "unread_count": 0,
            "total": 0,
            "has_more": False
        }

@router.post("/mark-read/{notification_id}", response_model=dict)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Marcar una notificación como leída."""
    notification = await Notification.get_or_none(id=notification_id, user_id=current_user.id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notification.read = True
    notification.read_at = datetime.now()
    await notification.save()
    
    return {"success": True, "message": "Notificación marcada como leída"}

@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user)
):
    """Marcar todas las notificaciones del usuario como leídas."""
    await Notification.filter(user_id=current_user.id, read=False).update(read=True, read_at=datetime.now())
    
    return {"success": True, "message": "Todas las notificaciones marcadas como leídas"}

@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Eliminar una notificación."""
    notification = await Notification.get_or_none(id=notification_id, user_id=current_user.id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    await notification.delete()
    
    return {"success": True, "message": "Notificación eliminada"}

@router.delete("/", response_model=dict)
async def delete_all_notifications(
    current_user: User = Depends(get_current_active_user),
    read_only: bool = Query(True)
):
    """
    Eliminar notificaciones.
    
    - read_only: Si es True, solo elimina notificaciones leídas. Si es False, elimina todas.
    """
    query = Notification.filter(user_id=current_user.id)
    
    if read_only:
        query = query.filter(read=True)
    
    deleted_count = await query.delete()
    
    return {
        "success": True, 
        "message": f"Notificaciones eliminadas: {deleted_count}"
    }

# Endpoint para crear notificaciones de prueba (solo para desarrollo)
@router.post("/test", response_model=dict)
async def create_test_notification(
    current_user: User = Depends(get_current_active_user)
):
    """Crear una notificación de prueba para el usuario actual."""
    # Verificar que el usuario tiene permisos de administrador
    if current_user.role not in ["administrador", "Ramon"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear notificaciones de prueba")
    
    # Crear diferentes tipos de notificaciones administrativas
    notifications = [
        Notification(
            user_id=current_user.id,
            type=NotificationType.BACKUP,
            priority=NotificationPriority.LOW,
            title="Backup automático completado",
            message="El backup diario programado de las 2:00 AM se ha completado con éxito",
            icon="💾",
            related_entity_type="backup_success"
        ),
        Notification(
            user_id=current_user.id,
            type=NotificationType.BACKUP,
            priority=NotificationPriority.MEDIUM,
            title="Recordatorio de backup",
            message="Han pasado 8 días desde el último backup manual. Se recomienda realizar uno pronto.",
            icon="📆",
            related_entity_type="backup_reminder"
        ),
        Notification(
            user_id=current_user.id,
            type=NotificationType.SYSTEM,
            priority=NotificationPriority.HIGH,
            title="Actualización del sistema pendiente",
            message="Hay una actualización importante de seguridad pendiente. Se recomienda actualizar lo antes posible.",
            icon="⚠️",
            related_entity_type="system_update"
        ),
        Notification(
            user_id=current_user.id,
            type=NotificationType.IMPORT,
            priority=NotificationPriority.MEDIUM,
            title="Importación masiva completada",
            message="La importación de 234 animales se ha completado con éxito. Sin errores detectados.",
            icon="📂",
            related_entity_type="import_success"
        ),
        Notification(
            user_id=current_user.id,
            type=NotificationType.SYSTEM,
            priority=NotificationPriority.LOW,
            title="Mantenimiento programado",
            message="El sistema estará en mantenimiento el 05/06/2025 de 22:00 a 23:00 horas.",
            icon="🛠️",
            related_entity_type="system_maintenance"
        )
    ]
    
    # Guardar notificaciones
    for notification in notifications:
        await notification.save()
    
    return {"success": True, "message": f"Creadas {len(notifications)} notificaciones de prueba"}
