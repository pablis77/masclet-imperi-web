from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..models.notification import Notification, NotificationType, NotificationPriority
from ..utils.auth import get_current_user, get_current_active_user
from ..models.user import User
import random
from datetime import datetime

router = APIRouter()

@router.get("/api/v1/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener notificaciones para el usuario actual.
    """
    # Construir query para buscar notificaciones del usuario
    query = Notification.filter(user_id=current_user.id)
    
    # Filtrar por no leídas si se solicita
    if unread_only:
        query = query.filter(read=False)
    
    # Contar total de notificaciones
    total = await query.count()
    
    # Contar notificaciones no leídas
    unread_count = await Notification.filter(
        user_id=current_user.id,
        read=False
    ).count()
    
    # Obtener notificaciones paginadas, ordenadas por más recientes primero
    notifications = await query.order_by("-created_at").offset(skip).limit(limit).all()
    
    # Convertir a formato de respuesta
    items = [notification.to_dict() for notification in notifications]
    
    return {
        "items": items,
        "total": total,
        "unread_count": unread_count,
        "has_more": (skip + limit) < total
    }

@router.post("/api/v1/notifications/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Marcar una notificación como leída.
    """
    notification = await Notification.filter(
        id=notification_id,
        user_id=current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    notification.read = True
    notification.read_at = datetime.now()
    await notification.save()
    
    return {"success": True}

@router.post("/api/v1/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user)
):
    """
    Marcar todas las notificaciones como leídas.
    """
    await Notification.filter(
        user_id=current_user.id,
        read=False
    ).update(read=True, read_at=datetime.now())
    
    return {"success": True}

@router.delete("/api/v1/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Eliminar una notificación.
    """
    notification = await Notification.filter(
        id=notification_id,
        user_id=current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    await notification.delete()
    
    return {"success": True}

@router.delete("/api/v1/notifications")
async def delete_all_notifications(
    current_user: User = Depends(get_current_active_user)
):
    """
    Eliminar todas las notificaciones del usuario.
    """
    await Notification.filter(user_id=current_user.id).delete()
    
    return {"success": True}

@router.post("/api/v1/notifications/test")
async def create_test_notification(
    current_user: User = Depends(get_current_active_user)
):
    """
    Crear una notificación de prueba para el usuario actual.
    Solo para desarrollo y pruebas.
    """
    # Solo permitir esto para administradores
    if current_user.role != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Solo los administradores pueden crear notificaciones de prueba"
        )
    
    # Crear tipos aleatorios de notificación para pruebas
    notification_types = list(NotificationType)
    priorities = list(NotificationPriority)
    
    notification = await Notification.create(
        user_id=current_user.id,
        type=random.choice(notification_types),
        priority=random.choice(priorities),
        title=f"Notificación de prueba {datetime.now().strftime('%H:%M:%S')}",
        message=f"Esta es una notificación de prueba creada el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        icon=random.choice(["🔔", "⚠️", "🚨", "💬", "📊", "🐄"]),
    )
    
    return {"success": True, "notification_id": notification.id}
