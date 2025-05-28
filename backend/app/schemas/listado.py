from typing import List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime, date


class ListadoAnimalBase(BaseModel):
    animal_id: int
    notas: Optional[str] = None


class ListadoAnimalCreate(ListadoAnimalBase):
    pass


class ListadoAnimalResponse(ListadoAnimalBase):
    id: int
    listado_id: int

    class Config:
        from_attributes = True


class ListadoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    categoria: Optional[str] = Field(None, max_length=100)
    is_completed: Optional[bool] = False


class ListadoCreate(ListadoBase):
    animales: Optional[List[int]] = []  # Lista de IDs de animales


class ListadoUpdate(ListadoBase):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    animales: Optional[List[int]] = None  # Lista de IDs de animales para actualizar


class AnimalBasico(BaseModel):
    id: int
    nom: str
    explotacio: str
    genere: str
    estado: str
    confirmacion: str = "NO"  # Estado de confirmación en el listado (OK/NO)
    observaciones: Optional[str] = None  # Observaciones del animal en el listado
    cod: Optional[str] = None
    num_serie: Optional[str] = None
    dob: Optional[Any] = None  # Acepta cualquier tipo para validación flexible
    
    # Validador para convertir objetos date a datetime si es necesario
    @validator('dob', pre=True)
    def validate_date(cls, v):
        if v is None:
            return None
        if isinstance(v, date) and not isinstance(v, datetime):
            # Convertir date a datetime
            return datetime.combine(v, datetime.min.time())
        return v
    
    class Config:
        from_attributes = True


class ListadoResponse(ListadoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    animales_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class ListadoDetalleResponse(ListadoResponse):
    animales: List[AnimalBasico] = []


class ListadoConAnimalesResponse(ListadoResponse):
    animales: List[ListadoAnimalResponse] = []


class AnimalUpdateData(BaseModel):
    id: int
    confirmacion: str  # OK o NO
    observaciones: Optional[str] = None


class ListadoAnimalesUpdate(BaseModel):
    animales: List[AnimalUpdateData]


class ExportarListadoConfig(BaseModel):
    incluir_observaciones: bool = True
    formato: str = "pdf"  # pdf, csv, etc.
    orientacion: str = "portrait"  # portrait, landscape
