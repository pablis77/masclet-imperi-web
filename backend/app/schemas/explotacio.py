"""
Schemas de Pydantic para explotaciones ganaderas.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ExplotacioBase(BaseModel):
    """
    Schema base para explotaciones.
    
    IMPORTANTE: Reglas de nomenclatura en el sistema:
    - 'explotacio' es el ÚNICO campo para identificar/nombrar la explotación
    - NO debe existir un campo 'nom' en explotaciones (reservado para ANIMALES)
    - NO debe existir un campo 'activa' (no está en las reglas de negocio)
    - 'id' es solo un campo técnico para la base de datos sin significado de negocio
    """
    explotacio: str = Field(..., description="Código único de la explotación (OBLIGATORIO)")

class ExplotacioCreate(ExplotacioBase):
    """Schema para crear explotaciones."""
    pass

class ExplotacioUpdate(BaseModel):
    """Schema para actualizar explotaciones."""
    explotacio: str = Field(..., description="Nuevo código de la explotación (OBLIGATORIO)")

class ExplotacioResponse(ExplotacioBase):
    """Schema para respuestas de explotaciones."""
    id: int = Field(..., description="ID técnico (uso interno)")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "explotacio": "ES12345678",
                "created_at": "2023-01-01T12:00:00",
                "updated_at": "2023-01-01T12:00:00"
            }
        }