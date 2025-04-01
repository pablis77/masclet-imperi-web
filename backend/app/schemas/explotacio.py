"""
Schemas de Pydantic para explotaciones ganaderas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExplotacioBase(BaseModel):
    """
    Schema base para explotaciones.
    
    IMPORTANTE: Reglas de nomenclatura en el sistema:
    - 'explotacio' es el identificador único obligatorio que identifica la explotación
    - 'id' es un campo técnico autogenerado por la base de datos
    """
    explotacio: str  # Identificador único de la explotación

class ExplotacioCreate(ExplotacioBase):
    """Schema para crear explotaciones."""
    pass

class ExplotacioUpdate(BaseModel):
    """Schema para actualizar explotaciones."""
    explotacio: Optional[str] = None

class ExplotacioResponse(ExplotacioBase):
    """Schema para respuestas de explotaciones."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True