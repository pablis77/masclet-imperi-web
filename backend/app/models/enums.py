from enum import Enum, auto
from typing import TypedDict  

class Genere(str, Enum):
    MASCLE = "M"     # Macho
    FEMELLA = "F"    # Hembra
    M = "M"          
    F = "F"          
    MASCULINO = "M"  
    FEMENINO = "F"  

class Estat(str, Enum):
    OK = "OK"        # Estado activo normal
    DEF = "DEF"      # Defunción/Baja

class IconType(str, Enum):
    BULL = "toro"               # Icono cabeza toro
    COW_EMPTY = "vaca"         # Círculo blanco (vaca sin amamantar)
    COW_NURSING = "nursing"    # Círculo azul (vaca/ternero amamantando)
    DECEASED = "deceased"      # X negrita (fallecido)
    SUCCESS = "success"        # ✓ Verde (operación exitosa)
    WARNING = "warning"        # ⚠️ Advertencia
    ERROR = "error"           # ❌ (error)

class UIStyle(TypedDict):
    color: str
    duration: int

class UIStyles(TypedDict):
    success: UIStyle
    warning: UIStyle
    error: UIStyle
    info: UIStyle

class ImportStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    COMPLETED_ERR = "completed_err"
    FAILED = "failed"
    CANCELLED = "cancelled"