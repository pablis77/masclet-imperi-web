from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List
from .enums import Genere, Estat, IconType

class AnimalBase(BaseModel):
    explotacio: str
    nom: str
    genere: Genere
    estado: Estat
    alletar: Optional[bool] = None
    pare: Optional[str] = None
    mare: Optional[str] = None
    quadra: Optional[str] = None
    cod: Optional[str] = None
    num_serie: Optional[str] = None
    dob: Optional[date] = None

class AnimalCreate(AnimalBase):
    pass

class AnimalResponse(AnimalBase):
    id: int
    icon_type: IconType
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True