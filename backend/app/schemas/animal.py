"""
Schemas para la gestión de animales
"""
from pydantic import BaseModel, ConfigDict, validator
from typing import Optional, Dict, List
from datetime import date, datetime
from app.core.date_utils import DateConverter
from app.models.animal import Genere, Estado, EstadoAlletar

class PartoInfo(BaseModel):
    """Esquema para información resumida de partos"""
    total: int
    ultimo: Optional[Dict] = None
    items: List[Dict] = []
    first_date: Optional[str] = None
    last_date: Optional[str] = None

    @validator('items')
    def sort_items(cls, v):
        """Ordena los partos por fecha descendente"""
        if not v:
            return v
        return sorted(v, key=lambda x: x.get('data', ''), reverse=True)
    
    @validator('first_date', 'last_date', 'items', always=True)
    def set_dates(cls, v, values):
        """Calcula las fechas del primer y último parto"""
        items = values.get('items', [])
        if not items:
            return None if v in ['first_date', 'last_date'] else v
            
        if v == 'first_date':
            return items[-1].get('data')
        if v == 'last_date':
            return items[0].get('data')
        return v

class AnimalBase(BaseModel):
    """Esquema base para animales"""
    nom: str
    genere: str  # Validado como enum en el endpoint
    explotacio: int  # ID de la explotación
    estado: str = "OK"  # Validado como enum en el endpoint (OK/DEF)
    alletar: int = 0  # Validado como enum en el endpoint
    dob: Optional[str] = None  # Fecha de nacimiento (dd/mm/yyyy)
    mare: Optional[str] = None
    pare: Optional[str] = None
    quadra: Optional[str] = None
    cod: Optional[str] = None
    num_serie: Optional[str] = None
    part: Optional[str] = None
    genere_t: Optional[str] = None  # Validado como enum en el endpoint
    estado_t: Optional[str] = None  # Validado como enum en el endpoint

    @validator('dob')
    def validate_dob(cls, v):
        """Validar y normalizar formato de fecha"""
        if not v:
            return None
        
        import re
        # Primero validar el formato con regex
        if not re.match(r'^\d{2}/\d{2}/\d{4}$', v):
            raise ValueError('La fecha debe estar en formato DD/MM/YYYY')
            
        try:
            # Intentar parsear la fecha
            parsed_date = DateConverter.parse_date(v)
            if parsed_date:
                # Devolver siempre en formato DD/MM/YYYY
                return parsed_date.strftime('%d/%m/%Y')
            return None
        except ValueError:
            raise ValueError('La fecha es inválida para el formato DD/MM/YYYY')

    @validator('genere')
    def validate_genere(cls, v):
        try:
            return Genere(v).value
        except ValueError:
            raise ValueError('Género inválido')

    @validator('estado')
    def validate_estado(cls, v):
        try:
            return Estado(v).value
        except ValueError:
            raise ValueError('Estado inválido')

    @validator('alletar')
    def validate_alletar(cls, v):
        try:
            return EstadoAlletar(v).value
        except ValueError:
            raise ValueError('Estado de amamantamiento inválido')

    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True
    )

class AnimalCreate(AnimalBase):
    """Esquema para crear animales"""
    pass

class AnimalUpdate(BaseModel):
    """Esquema para actualizar animales"""
    nom: Optional[str] = None
    estado: Optional[str] = None  # Validado como enum en el endpoint
    alletar: Optional[int] = None  # Validado como enum en el endpoint
    mare: Optional[str] = None
    pare: Optional[str] = None
    quadra: Optional[str] = None
    cod: Optional[str] = None
    num_serie: Optional[str] = None
    part: Optional[str] = None
    genere_t: Optional[str] = None  # Validado como enum en el endpoint
    estado_t: Optional[str] = None  # Validado como enum en el endpoint
    dob: Optional[str] = None  # Fecha de nacimiento (dd/mm/yyyy)

    model_config = ConfigDict(
        extra='forbid',
        from_attributes=True,
        json_schema_extra={
            "example": {
                "nom": "Nombre Animal",
                "estado": "OK",
                "alletar": 0,
                "dob": "01/01/2020"
            }
        }
    )

class AnimalResponseData(AnimalBase):
    """Esquema para datos de respuesta de animales"""
    id: int
    partos: Optional[PartoInfo] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class AnimalResponse(BaseModel):
    """Esquema para respuestas de animales"""
    status: str = "success"
    data: AnimalResponseData
    
    model_config = ConfigDict(
        from_attributes=True
    )

class PaginatedResponse(BaseModel):
    """Esquema para respuestas paginadas"""
    total: int
    offset: int
    limit: int
    items: List[AnimalResponseData]

class AnimalListResponse(BaseModel):
    """Esquema para respuestas de listas de animales"""
    status: str = "success"
    data: PaginatedResponse

    model_config = ConfigDict(
        from_attributes=True
    )