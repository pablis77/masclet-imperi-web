"""
Modelos para la gestión de animales
"""
from enum import Enum
from typing import Optional
from tortoise import fields, models
from datetime import date, datetime
import logging

logger = logging.getLogger(__name__)

class Genere(str, Enum):
    """Género del animal"""
    MASCLE = "M"
    FEMELLA = "F"

class Estado(str, Enum):
    """Estado del animal"""
    OK = "OK"     # Animal en estado normal/activo
    DEF = "DEF"   # Animal muerto/defunción

class EstadoAlletar(str, Enum):
    """Estado de amamantamiento"""
    NO_ALLETAR = "0"  # Cambiado de "NO" a "0" según estándares
    UN_TERNERO = "1"
    DOS_TERNEROS = "2"

class Animal(models.Model):
    """Modelo de Animal"""
    id = fields.IntField(pk=True)
    # Cambiamos la definición de explotacio para que coincida con la estructura de la base de datos
    # En lugar de ForeignKeyField, usamos CharField ya que en la base de datos es character varying
    explotacio = fields.CharField(max_length=100)
    nom = fields.CharField(max_length=100)
    genere = fields.CharEnumField(Genere)
    estado = fields.CharEnumField(Estado, default=Estado.OK)
    alletar = fields.CharEnumField(EstadoAlletar, default=EstadoAlletar.NO_ALLETAR)  # "0" para todos, incluyendo machos
    dob = fields.DateField(null=True)  # Date of birth
    mare = fields.CharField(max_length=100, null=True)
    pare = fields.CharField(max_length=100, null=True)
    origen = fields.CharField(max_length=50, null=True)
    cod = fields.CharField(max_length=20, null=True)
    num_serie = fields.CharField(max_length=50, null=True)
    part = fields.CharField(max_length=50, null=True)  # Cambiado de 'num_part' a 'part' para coincidir con el CSV
    observaciones = fields.TextField(null=True)  # Campo para notas y observaciones adicionales
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    @classmethod
    def validate_date(cls, date_str: str) -> date:
        """Valida y convierte una fecha de string a date"""
        from app.core.date_utils import DateConverter
        return DateConverter.parse_date(date_str)

    async def to_dict(self, include_partos: bool = True) -> dict:
        """Convierte el modelo a diccionario"""
        data = {
            "id": self.id,
            "explotacio": self.explotacio,
            "nom": self.nom,
            "genere": self.genere,
            "estado": self.estado,
            "alletar": self.alletar,
            "dob": self.dob.strftime("%d/%m/%Y") if self.dob else None,
            "mare": self.mare,
            "pare": self.pare,
            "origen": self.origen,
            "cod": self.cod,
            "num_serie": self.num_serie,
            "part": self.part,
            "observaciones": self.observaciones,
            "created_at": self.created_at.strftime("%d/%m/%Y") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%d/%m/%Y") if self.updated_at else None
        }

        if include_partos and self.genere == Genere.FEMELLA:
            try:
                # Obtener todos los partos ordenados por fecha descendente
                partos_list = await self.parts.all().order_by('-part', '-id')
                
                # Convertir a lista de diccionarios
                parto_dicts = []
                if partos_list:
                    # Convertir cada parto a diccionario
                    for parto in partos_list:
                        parto_dict = await parto.to_dict()
                        parto_dicts.append(parto_dict)
                    
                    # Asegurar ordenación por fecha descendente
                    parto_dicts.sort(key=lambda x: x.get('part', ''), reverse=True)
                    
                    data["partos"] = {
                        "total": len(parto_dicts),
                        "items": parto_dicts,
                        "first_date": partos_list[-1].part.strftime("%d/%m/%Y"),  # El más antiguo
                        "last_date": partos_list[0].part.strftime("%d/%m/%Y")     # El más reciente
                    }
                else:
                    data["partos"] = {
                        "total": 0,
                        "items": [],
                        "first_date": None,
                        "last_date": None
                    }
            except Exception as e:
                logger.error(f"Error processing partos for animal {self.id}: {str(e)}")
                data["partos"] = {
                    "total": 0,
                    "items": [],
                    "first_date": None,
                    "last_date": None
                }

        return data

    async def save(self, *args, **kwargs):
        """Sobreescribes el método save para aplicar validaciones de negocio."""
        # Validar que solo las hembras pueden amamantar
        if self.genere == Genere.MASCLE and self.alletar != EstadoAlletar.NO_ALLETAR:
            raise ValueError("Solo las hembras pueden tener estado de amamantamiento")
        
        return await super().save(*args, **kwargs)
    class Meta:
        """Metadatos del modelo"""
        table = "animals"

class AnimalHistory(models.Model):
    """Modelo para registrar el historial de cambios en animales"""
    id = fields.IntField(pk=True)
    animal = fields.ForeignKeyField(
        "models.Animal", related_name="history_records", on_delete=fields.CASCADE
    )
    # Campos obligatorios (NOT NULL) según la estructura de la base de datos
    usuario = fields.CharField(max_length=100, default="admin")  # Usuario que realizó el cambio
    cambio = fields.TextField(default="Sin descripción")  # Descripción del cambio
    campo = fields.CharField(max_length=50, default="general")  # Campo modificado
    valor_anterior = fields.TextField(null=True)  # Valor anterior
    valor_nuevo = fields.TextField(null=True)  # Valor nuevo
    
    # Campos del nuevo formato extendido
    action = fields.CharField(max_length=20, default="UPDATE")  # Tipo de acción (CREATE, UPDATE, DELETE)
    usuario_cambio = fields.CharField(max_length=100, null=True)  # Duplicado de usuario para compatibilidad
    timestamp = fields.DatetimeField(auto_now_add=True)  # Fecha y hora del cambio
    field = fields.CharField(max_length=100, null=True)  # Duplicado de campo para compatibilidad
    description = fields.TextField(null=True)  # Duplicado de cambio para compatibilidad
    old_value = fields.TextField(null=True)  # Duplicado de valor_anterior para compatibilidad
    new_value = fields.TextField(null=True)  # Duplicado de valor_nuevo para compatibilidad
    changes = fields.JSONField(null=True)  # Datos completos del cambio en formato JSON
    
    class Meta:
        """Metadatos del modelo"""
        table = "animal_history"
        ordering = ["-timestamp", "-id"]
    
    async def to_dict(self) -> dict:
        """Convierte el modelo a diccionario"""
        return {
            "id": self.id,
            "animal_id": self.animal_id,
            "usuario": self.usuario,
            "cambio": self.cambio,
            "campo": self.campo,
            "valor_anterior": self.valor_anterior,
            "valor_nuevo": self.valor_nuevo,
            "action": self.action,
            "timestamp": self.timestamp.strftime("%d/%m/%Y %H:%M:%S") if self.timestamp else None,
            "field": self.field,
            "description": self.description,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "changes": self.changes
        }

class Part(models.Model):
    """Modelo de Parto"""
    id = fields.IntField(pk=True)
    animal: fields.ForeignKeyRelation["Animal"] = fields.ForeignKeyField(
        "models.Animal", related_name="parts", on_delete=fields.CASCADE
    )
    part = fields.DateField()  # Fecha del parto
    # Cambiado de max_length=1 a max_length=10 para aceptar 'esforrada'
    GenereT = fields.CharField(max_length=10, description="Gènere del terner (M/F/esforrada)")
    EstadoT = fields.CharField(max_length=3, default="OK", description="Estat del terner (OK/DEF)")
    numero_part = fields.IntField(default=1)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    observacions = fields.TextField(null=True)

    class Meta:
        table = "part"
        ordering = ["-part", "animal"]

    async def to_dict(self) -> dict:
        """Convierte el modelo a diccionario"""
        try:
            # Tratamos cada valor para asegurar que sea serializable
            return {
                "id": self.id,
                "animal_id": self.animal_id,
                "part": self.part.strftime("%d/%m/%Y") if hasattr(self.part, 'strftime') and callable(self.part.strftime) else str(self.part) if self.part else None,
                "GenereT": self.GenereT if not hasattr(self.GenereT, 'value') else self.GenereT.value,
                "EstadoT": self.EstadoT if not hasattr(self.EstadoT, 'value') else self.EstadoT.value,
                "numero_part": self.numero_part,
                "observacions": self.observacions if self.observacions else None,
                "created_at": self.created_at.strftime("%d/%m/%Y %H:%M:%S") if hasattr(self.created_at, 'strftime') and callable(self.created_at.strftime) else str(self.created_at) if self.created_at else None,
                "updated_at": self.updated_at.strftime("%d/%m/%Y") if hasattr(self.updated_at, 'strftime') and callable(self.updated_at.strftime) else str(self.updated_at) if self.updated_at else None
            }
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error en Part.to_dict(): {str(e)}")
            
            # Devolver un diccionario mínimo en caso de error
            return {
                "id": self.id if hasattr(self, 'id') else None,
                "animal_id": self.animal_id if hasattr(self, 'animal_id') else None,
                "part": str(self.part) if hasattr(self, 'part') else None,
                "GenereT": str(self.GenereT) if hasattr(self, 'GenereT') else None,
                "EstadoT": str(self.EstadoT) if hasattr(self, 'EstadoT') else None,
                "error": f"Error de serialización: {str(e)}"
            }