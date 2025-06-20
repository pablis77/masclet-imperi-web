"""
Schemas para la gestión de partos
"""
from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime, date
from typing import Optional, List

from app.models.animal import Genere, Estado
from app.core.date_utils import DateConverter

class PartoBase(BaseModel):
    """Schema base para partos"""
    part: str = Field(..., description="Fecha del parto en formato DD/MM/YYYY")
    GenereT: Genere = Field(..., description="Género de la cría (M/F)")
    EstadoT: Estado = Field(default=Estado.OK, description="Estado de la cría (OK/DEF)")

    @validator('part')
    def validate_part(cls, v):
        """Valida y convierte la fecha al formato de almacenamiento"""
        if not v:
            return None
        try:
            return DateConverter.to_db_format(v)
        except ValueError as e:
            raise ValueError(f'Fecha inválida: {str(e)}')

    model_config = ConfigDict(
        json_encoders={
            date: lambda v: DateConverter.get_display_format(v),
            datetime: lambda v: DateConverter.get_display_format(v),
            Genere: lambda v: v.value,
            Estado: lambda v: v.value
        }
    )

class PartoCreate(PartoBase):
    """Schema para crear partos"""
    animal_id: Optional[int] = Field(None, description="ID del animal (madre)")
    animal_nom: Optional[str] = Field(None, description="Nombre del animal (madre)")
    numero_part: Optional[int] = Field(None, description="Número de parto")
    observacions: Optional[str] = Field(None, description="Observaciones sobre el parto")
    
    @validator('animal_id', 'animal_nom')
    def validate_animal_ref(cls, v, values, **kwargs):
        # Simplemente devolver el valor, la validación se hará en el endpoint
        return v

class PartoUpdate(BaseModel):
    """Schema para actualizar partos"""
    part: Optional[str] = Field(None, description="Fecha del parto en formato DD/MM/YYYY")
    GenereT: Optional[Genere] = None
    EstadoT: Optional[Estado] = None
    numero_part: Optional[int] = None
    observacions: Optional[str] = Field(None, description="Observaciones sobre el parto")

    @validator('part')
    def validate_part(cls, v):
        """Valida y convierte la fecha al formato de almacenamiento"""
        if not v:
            return None
        try:
            return DateConverter.to_db_format(v)
        except ValueError as e:
            raise ValueError(f'Fecha inválida: {str(e)}')

    model_config = ConfigDict(
        json_encoders={
            date: lambda v: DateConverter.get_display_format(v),
            datetime: lambda v: DateConverter.get_display_format(v),
            Genere: lambda v: v.value,
            Estado: lambda v: v.value
        }
    )

class PartoData(BaseModel):
    """Schema para los datos del parto"""
    id: int
    animal_id: int
    part: str
    GenereT: str  # Cambiado de Genere (enum) a str para mejor compatibilidad
    EstadoT: str  # Cambiado de Estado (enum) a str para mejor compatibilidad
    numero_part: int
    created_at: str
    observacions: Optional[str] = None
    
    @validator('GenereT')
    def validate_genere(cls, v):
        # Validar y convertir GenereT a string si es un enum
        if hasattr(v, 'value'):
            return v.value
        return v
    
    @validator('EstadoT')
    def validate_estado(cls, v):
        # Validar y convertir EstadoT a string si es un enum
        if hasattr(v, 'value'):
            return v.value
        return v

    @validator('part', pre=True)
    def format_part(cls, v):
        """Formatea la fecha del parto para la respuesta"""
        if isinstance(v, date):
            return DateConverter.get_display_format(v)
        return v

    @validator('created_at', pre=True)
    def format_created_at(cls, v):
        """Formatea la fecha de creación para la respuesta"""
        if isinstance(v, datetime):
            return v.strftime("%d/%m/%Y %H:%M:%S")
        return v

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            date: lambda v: DateConverter.get_display_format(v),
            datetime: lambda v: v.strftime("%d/%m/%Y %H:%M:%S"),
            Genere: lambda v: v.value,
            Estado: lambda v: v.value
        }
    )

class PartosListData(BaseModel):
    """Schema para lista paginada de partos"""
    total: int
    offset: int
    limit: int
    items: List[PartoData]

class PartoResponse(BaseModel):
    """Schema para respuestas con partos individuales"""
    status: str = "success"
    data: PartoData

class PartosListResponse(BaseModel):
    """Schema para respuestas con listas de partos"""
    status: str = "success"
    data: PartosListData

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            Genere: lambda v: v.value,
            Estado: lambda v: v.value
        }
    )