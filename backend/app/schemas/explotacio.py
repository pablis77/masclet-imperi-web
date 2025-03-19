"""
Schemas de Pydantic para explotaciones ganaderas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExplotacioBase(BaseModel):
    """Schema base para explotaciones."""
    nom: str
    ubicacio: Optional[str] = None
    activa: bool = True

class ExplotacioCreate(ExplotacioBase):
    """Schema para crear explotaciones."""
    pass

class ExplotacioUpdate(BaseModel):
    """Schema para actualizar explotaciones."""
    nom: Optional[str] = None
    ubicacio: Optional[str] = None
    activa: Optional[bool] = None

class ExplotacioResponse(ExplotacioBase):
    """Schema para respuestas de explotaciones."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True