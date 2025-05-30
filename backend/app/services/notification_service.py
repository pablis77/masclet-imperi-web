"""
Servicio para la gestión de notificaciones en tiempo real
"""
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any, Union

from app.models.notification import Notification, NotificationType, NotificationPriority
from app.models.user import User

# Configuración de logging
logger = logging.getLogger(__name__)

class NotificationService:
    """
    Servicio para la creación y gestión de notificaciones del sistema basadas en eventos reales.
    Este servicio centraliza la creación de notificaciones para asegurar consistencia.
    """
    
    @classmethod
    async def create_notification(
        cls,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        icon: str = "🔔",
        related_entity_id: Optional[int] = None,
        related_entity_type: Optional[str] = None
    ) -> Notification:
        """
        Crea una nueva notificación en la base de datos.
        
        Args:
            user_id: ID del usuario destinatario
            type: Tipo de notificación
            title: Título de la notificación
            message: Mensaje detallado
            priority: Prioridad (default: MEDIUM)
            icon: Emoji o icono para la notificación
            related_entity_id: ID de la entidad relacionada (opcional)
            related_entity_type: Tipo de entidad relacionada (opcional)
            
        Returns:
            La notificación creada
        """
        try:
            notification = Notification(
                user_id=user_id,
                type=type,
                title=title,
                message=message,
                priority=priority,
                icon=icon,
                related_entity_id=related_entity_id,
                related_entity_type=related_entity_type
            )
            
            await notification.save()
            logger.info(f"Notificación creada: {title} para usuario {user_id}")
            return notification
            
        except Exception as e:
            logger.error(f"Error al crear notificación: {e}")
            return None

    @classmethod
    async def create_backup_notification(
        cls,
        user_id: int,
        backup_type: str,
        success: bool,
        details: Dict[str, Any]
    ) -> Notification:
        """
        Crea una notificación específica para eventos de backup.
        
        Args:
            user_id: ID del usuario destinatario
            backup_type: Tipo de backup (daily, manual, etc.)
            success: Si el backup fue exitoso
            details: Detalles del backup
            
        Returns:
            La notificación creada
        """
        if success:
            title = f"Backup {backup_type} completado"
            message = f"El backup {backup_type} se ha completado exitosamente."
            if "filename" in details:
                message += f" Archivo: {details['filename']}"
            if "size" in details:
                message += f" Tamaño: {details['size']}"
            priority = NotificationPriority.LOW
            icon = "💾"
        else:
            title = f"Error en backup {backup_type}"
            message = f"El backup {backup_type} ha fallado."
            if "error" in details:
                message += f" Error: {details['error']}"
            priority = NotificationPriority.HIGH
            icon = "⚠️"
            
        return await cls.create_notification(
            user_id=user_id,
            type=NotificationType.BACKUP,
            title=title,
            message=message,
            priority=priority,
            icon=icon,
            related_entity_type="backup"
        )
        
    @classmethod
    async def create_import_notification(
        cls,
        user_id: int,
        success: bool,
        total_records: int,
        errors: int = 0,
        details: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """
        Crea una notificación para eventos de importación.
        
        Args:
            user_id: ID del usuario destinatario
            success: Si la importación fue exitosa
            total_records: Total de registros procesados
            errors: Número de errores (si los hubo)
            details: Detalles adicionales
            
        Returns:
            La notificación creada
        """
        if success and errors == 0:
            title = "Importación completada exitosamente"
            message = f"Se han importado {total_records} registros sin errores."
            priority = NotificationPriority.MEDIUM
            icon = "📥"
        elif success and errors > 0:
            title = "Importación completada con advertencias"
            message = f"Se han importado {total_records - errors} de {total_records} registros. ({errors} errores)"
            priority = NotificationPriority.MEDIUM
            icon = "⚠️"
        else:
            title = "Error en la importación"
            message = f"La importación ha fallado con {errors} errores de {total_records} registros."
            priority = NotificationPriority.HIGH
            icon = "❌"
            
        if details and "import_id" in details:
            related_entity_id = details["import_id"]
        else:
            related_entity_id = None
            
        return await cls.create_notification(
            user_id=user_id,
            type=NotificationType.IMPORT,
            title=title,
            message=message,
            priority=priority,
            icon=icon,
            related_entity_id=related_entity_id,
            related_entity_type="import"
        )
    
    @classmethod
    async def create_system_notification(
        cls,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        send_to_all_admins: bool = True
    ) -> List[Notification]:
        """
        Crea una notificación del sistema y la envía a todos los administradores.
        
        Args:
            title: Título de la notificación
            message: Mensaje detallado
            priority: Prioridad
            send_to_all_admins: Si se debe enviar a todos los usuarios admin
            
        Returns:
            Lista de notificaciones creadas
        """
        notifications = []
        try:
            # Obtener usuarios con rol administrador
            if send_to_all_admins:
                admins = await User.filter(role__in=["administrador", "Ramon"]).all()
                for admin in admins:
                    notif = await cls.create_notification(
                        user_id=admin.id,
                        type=NotificationType.SYSTEM,
                        title=title,
                        message=message,
                        priority=priority,
                        icon="🔧" if priority == NotificationPriority.LOW else "⚠️",
                        related_entity_type="system"
                    )
                    if notif:
                        notifications.append(notif)
            
            return notifications
        except Exception as e:
            logger.error(f"Error al crear notificaciones de sistema: {e}")
            return []
            
    @classmethod
    async def create_animal_notification(
        cls,
        user_id: int,
        animal_id: int,
        action: str,
        details: Dict[str, Any]
    ) -> Notification:
        """
        Crea una notificación relacionada con animales.
        
        Args:
            user_id: ID del usuario destinatario
            animal_id: ID del animal
            action: Acción realizada (created, updated, etc.)
            details: Detalles adicionales
            
        Returns:
            La notificación creada
        """
        animal_name = details.get('nom', f"ID:{animal_id}")
        
        if action == "created":
            title = f"Nuevo animal registrado"
            message = f"Se ha registrado un nuevo animal: {animal_name}"
            icon = "🆕"
        elif action == "updated":
            title = f"Animal actualizado"
            message = f"Se ha actualizado el animal: {animal_name}"
            icon = "📝"
        elif action == "deleted":
            title = f"Animal eliminado"
            message = f"Se ha eliminado el animal: {animal_name}"
            icon = "🗑️"
        else:
            title = f"Acción en animal"
            message = f"Se ha realizado la acción '{action}' en el animal: {animal_name}"
            icon = "🐄"
            
        return await cls.create_notification(
            user_id=user_id,
            type=NotificationType.ANIMAL,
            title=title,
            message=message,
            priority=NotificationPriority.LOW,
            icon=icon,
            related_entity_id=animal_id,
            related_entity_type="animal"
        )
