from tortoise import fields, models
from enum import Enum
from datetime import datetime


class NotificationType(str, Enum):
    """Tipo de notificación."""
    SYSTEM = "system"           # Alertas del sistema
    BACKUP = "backup"           # Relacionado con copias de seguridad
    IMPORT = "import"           # Relacionado con importaciones
    ANIMAL = "animal"           # Relacionado con animales
    USER = "user"               # Mensajes entre usuarios


class NotificationPriority(str, Enum):
    """Prioridad de la notificación."""
    LOW = "low"                 # Informativa
    MEDIUM = "medium"           # Importante
    HIGH = "high"               # Urgente


class Notification(models.Model):
    """Modelo para notificaciones del sistema."""
    id = fields.IntField(pk=True)
    user_id = fields.IntField()  # Usuario al que pertenece la notificación
    type = fields.CharEnumField(NotificationType, index=True)
    priority = fields.CharEnumField(NotificationPriority, default=NotificationPriority.MEDIUM)
    title = fields.CharField(max_length=255)
    message = fields.TextField()
    icon = fields.CharField(max_length=10, default="🔔")
    related_entity_id = fields.IntField(null=True)  # ID de entidad relacionada (animal, importación, etc.)
    related_entity_type = fields.CharField(max_length=50, null=True)  # Tipo de entidad relacionada
    created_at = fields.DatetimeField(auto_now_add=True)
    read = fields.BooleanField(default=False)
    read_at = fields.DatetimeField(null=True)
    
    class Meta:
        table = "notifications"
    
    def to_dict(self):
        """Convertir a diccionario para la API."""
        try:
            # Valor por defecto para campos que podrían ser None
            relative_time = "Hora desconocida"
            created_at_iso = None
            
            if self.created_at:
                # Intentar calcular la diferencia de tiempo de forma segura
                try:
                    # Convertir ambas fechas al mismo formato (sin zona horaria)
                    now = datetime.now()
                    if self.created_at.tzinfo:
                        created_at_naive = self.created_at.replace(tzinfo=None)
                        time_diff = now.replace(tzinfo=None) - created_at_naive
                    else:
                        # Si created_at no tiene zona horaria, asegurarse de que now tampoco la tenga
                        time_diff = now.replace(tzinfo=None) - self.created_at
                    
                    # Determinar texto de tiempo relativo
                    if time_diff.days > 30:
                        relative_time = f"Hace {time_diff.days // 30} meses"
                    elif time_diff.days > 0:
                        relative_time = f"Hace {time_diff.days} días"
                    elif time_diff.seconds // 3600 > 0:
                        relative_time = f"Hace {time_diff.seconds // 3600} horas"
                    elif time_diff.seconds // 60 > 0:
                        relative_time = f"Hace {time_diff.seconds // 60} minutos"
                    else:
                        relative_time = "Hace unos segundos"
                        
                    # Formatear la fecha como ISO string de forma segura
                    created_at_iso = self.created_at.isoformat()
                except Exception as e:
                    # Si hay algún error en el cálculo de tiempo, usar valor por defecto
                    print(f"Error al calcular tiempo relativo: {e}")
            
            # Construir el diccionario con valores seguros
            return {
                "id": self.id,
                "user_id": self.user_id,
                "type": str(self.type) if self.type else "",
                "priority": str(self.priority) if self.priority else "medium",
                "title": self.title if self.title else "",
                "message": self.message if self.message else "",
                "icon": self.icon if self.icon else "🔔",
                "created_at": created_at_iso,
                "relative_time": relative_time,
                "read": bool(self.read),
                "related_entity_id": self.related_entity_id,
                "related_entity_type": self.related_entity_type
            }
        except Exception as e:
            # Si ocurre cualquier error, devolver un objeto mínimo
            print(f"Error en to_dict: {e}")
            return {
                "id": self.id if hasattr(self, 'id') else 0,
                "title": "Error al cargar notificación",
                "message": "No se pudieron cargar los detalles",
                "read": False
            }
