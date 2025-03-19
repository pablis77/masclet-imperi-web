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
    data: str = Field(..., description="Fecha del parto en formato DD/MM/YYYY")
    genere_fill: Genere = Field(..., description="Género de la cría (M/F)")
    estat_fill: Estado = Field(default=Estado.OK, description="Estado de la cría (OK/DEF)")

    @validator('data')
    def validate_data(cls, v):
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
    animal_id: int = Field(..., description="ID del animal (madre)")
    numero_part: int = Field(..., description="Número de parto")

class PartoUpdate(BaseModel):
    """Schema para actualizar partos"""
    data: Optional[str] = Field(None, description="Fecha del parto en formato DD/MM/YYYY")
    genere_fill: Optional[Genere] = None
    estat_fill: Optional[Estado] = None
    numero_part: Optional[int] = None

    @validator('data')
    def validate_data(cls, v):
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
    data: str
    genere_fill: Genere
    estat_fill: Estado
    numero_part: int
    created_at: str
    observacions: Optional[str] = None

    @validator('data', pre=True)
    def format_data(cls, v):
        """Formatea la fecha del parto para la respuesta"""
        if not v:
            return None
        return DateConverter.get_display_format(v)

    @validator('created_at', pre=True)
    def format_created_at(cls, v):
        """Formatea la fecha de creación para la respuesta"""
        if not v:
            return None
        # Convertir datetime a formato DD/MM/YYYY
        if isinstance(v, str):
            try:
                dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                return dt.strftime('%d/%m/%Y')
            except ValueError:
                return v
        return v.strftime('%d/%m/%Y') if isinstance(v, datetime) else v

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