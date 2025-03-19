from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

class AnimalBase(BaseModel):
    """Modelo base con campos comunes"""
    model_config = ConfigDict(from_attributes=True)
    
    explotacio: str = Field(..., description="Explotación del animal")
    nom: str = Field(..., description="Nombre único del animal")
    genere: str = Field(..., description="Género del animal")
    cod: str = Field(..., description="Código único del animal")
    estado: str = Field(..., description="Estado actual del animal")

class Animal(AnimalBase):
    """Modelo completo de Animal"""
    alletar: Optional[str] = Field(None, description="Estado de amamantamiento")
    pare: Optional[str] = Field(None, description="Código del padre")
    mare: Optional[str] = Field(None, description="Código de la madre")
    quadra: Optional[str] = Field(None, description="Cuadra asignada")
    num_serie: Optional[str] = Field(None, description="Número de serie")
    dob: Optional[date] = Field(None, description="Fecha de nacimiento")
    part: Optional[date] = Field(None, description="Fecha de parto")
    genere_t: Optional[str] = Field(None, description="Género temporal")
    estado_t: Optional[str] = Field(None, description="Estado temporal")

    class Config:
        json_schema_extra = {
            "example": {
                "explotacio": "Explotación 1",
                "nom": "Toro 1",
                "genere": "M",
                "cod": "T001",
                "estado": "Activo",
                "alletar": "No",
                "quadra": "Q1"
            }
        }

class AnimalCreate(AnimalBase):
    """Modelo para creación de Animal"""
    pass

class AnimalUpdate(BaseModel):
    """Modelo para actualización de Animal"""
    model_config = ConfigDict(from_attributes=True)
    
    explotacio: Optional[str] = None
    nom: Optional[str] = None
    genere: Optional[str] = None
    estado: Optional[str] = None
    alletar: Optional[str] = None
    pare: Optional[str] = None
    mare: Optional[str] = None
    quadra: Optional[str] = None
    num_serie: Optional[str] = None
    dob: Optional[date] = None
    part: Optional[date] = None
    genere_t: Optional[str] = None
    estado_t: Optional[str] = None

class User(BaseModel):
    """Modelo de Usuario"""
    model_config = ConfigDict(from_attributes=True)
    
    username: str = Field(..., description="Nombre de usuario")
    can_edit: bool = Field(default=False, description="Permiso de edición")
    is_admin: bool = Field(default=False, description="Permisos de administrador")