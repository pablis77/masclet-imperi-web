"""
Modelos para la gestión de animales
"""
from enum import Enum
from typing import Optional
from tortoise import fields, models
from datetime import date
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
    NO_ALLETAR = "NO"
    UN_TERNERO = "1"
    DOS_TERNEROS = "2"

class Animal(models.Model):
    """Modelo de Animal"""
    id = fields.IntField(pk=True)
    explotacio = fields.ForeignKeyField(
        "models.Explotacio", related_name="animals"
    )
    nom = fields.CharField(max_length=100)
    genere = fields.CharEnumField(Genere)
    estado = fields.CharEnumField(Estado, default=Estado.OK)
    alletar = fields.CharEnumField(
        EstadoAlletar,
        default=EstadoAlletar.NO_ALLETAR
    )
    dob = fields.DateField(null=True)  # Date of birth
    mare = fields.CharField(max_length=100, null=True)
    pare = fields.CharField(max_length=100, null=True)
    quadra = fields.CharField(max_length=50, null=True)
    cod = fields.CharField(max_length=20, null=True)
    num_serie = fields.CharField(max_length=50, null=True)
    part = fields.CharField(max_length=50, null=True)  # Cambiado de 'num_part' a 'part' para coincidir con el CSV
    genere_t = fields.CharEnumField(Genere, null=True)  # Género de transición
    estado_t = fields.CharEnumField(Estado, null=True)  # Estado de transición
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
            "explotacio": str(self.explotacio_id),
            "nom": self.nom,
            "genere": self.genere,
            "estado": self.estado,
            "alletar": self.alletar.value if self.alletar else EstadoAlletar.NO_ALLETAR.value,
            "dob": self.dob.strftime("%d/%m/%Y") if self.dob else None,
            "mare": self.mare,
            "pare": self.pare,
            "quadra": self.quadra,
            "cod": self.cod,
            "num_serie": self.num_serie,
            "part": self.part,
            "genere_t": self.genere_t,
            "estado_t": self.estado_t,
            "created_at": self.created_at.strftime("%d/%m/%Y") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%d/%m/%Y") if self.updated_at else None
        }

        if include_partos and self.genere == Genere.FEMELLA:
            try:
                # Obtener todos los partos ordenados por fecha descendente
                partos_list = await self.partos.all().order_by('-data', '-id')
                
                # Convertir a lista de diccionarios
                parto_dicts = []
                if partos_list:
                    # Convertir cada parto a diccionario
                    for parto in partos_list:
                        parto_dict = await parto.to_dict()
                        parto_dicts.append(parto_dict)
                    
                    # Asegurar ordenación por fecha descendente
                    parto_dicts.sort(key=lambda x: x['data'], reverse=True)
                    
                    data["partos"] = {
                        "total": len(parto_dicts),
                        "items": parto_dicts,
                        "first_date": partos_list[-1].data.strftime("%d/%m/%Y"),  # El más antiguo
                        "last_date": partos_list[0].data.strftime("%d/%m/%Y")     # El más reciente
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
        """Sobreescribe el método save para aplicar validaciones de negocio."""
        # Validar que solo las hembras pueden amamantar
        if self.genere == Genere.MASCLE and self.alletar != EstadoAlletar.NO_ALLETAR:
            raise ValueError("Solo las hembras pueden tener estado de amamantamiento")
        
        return await super().save(*args, **kwargs)
    class Meta:
        """Metadatos del modelo"""
        table = "animals"

class Part(models.Model):
    """Modelo de Parto"""
    id = fields.IntField(pk=True)
    animal = fields.ForeignKeyField(
        "models.Animal", related_name="partos"
    )
    data = fields.DateField()
    genere_fill = fields.CharEnumField(Genere)
    estat_fill = fields.CharEnumField(Estado, default=Estado.OK)  # Por defecto el ternero está vivo
    numero_part = fields.IntField()
    observacions = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    async def to_dict(self) -> dict:
        """Convierte el modelo a diccionario"""
        return {
            "id": self.id,
            "animal_id": self.animal_id,
            "data": self.data.strftime("%d/%m/%Y"),
            "genere_fill": self.genere_fill,
            "estat_fill": self.estat_fill,
            "numero_part": self.numero_part,
            "observacions": self.observacions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }