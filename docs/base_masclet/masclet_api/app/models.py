from pydantic import BaseModel
from typing import Optional
from datetime import date

class Animal(BaseModel):
    alletar: Optional[str] = None
    explotacio: str
    nom: str
    genere: str
    pare: Optional[str] = None
    mare: Optional[str] = None
    quadra: Optional[str] = None
    cod: str
    num_serie: Optional[str] = None
    dob: Optional[date] = None
    estado: str
    part: Optional[date] = None
    genere_t: Optional[str] = None
    estado_t: Optional[str] = None

class AnimalCreate(BaseModel):
    # Similar to Animal but without optional fields that are required for creation
    explotacio: str
    nom: str
    genere: str
    cod: str
    estado: str

class AnimalUpdate(BaseModel):
    # All fields optional for updates
    alletar: Optional[str] = None
    explotacio: Optional[str] = None
    nom: Optional[str] = None
    genere: Optional[str] = None
    pare: Optional[str] = None
    mare: Optional[str] = None
    quadra: Optional[str] = None
    num_serie: Optional[str] = None
    dob: Optional[date] = None
    estado: Optional[str] = None
    part: Optional[date] = None
    genere_t: Optional[str] = None
    estado_t: Optional[str] = None

class User(BaseModel):
    username: str
    can_edit: bool = False
    is_admin: bool = False