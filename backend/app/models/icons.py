from enum import Enum
from dataclasses import dataclass

class IconPath(str, Enum):
    """Rutas a los iconos y assets"""
    BULL = "/assets/icons/toro.png"
    COW_NURSING = "⚪"
    COW_NOT_NURSING = "🔵"
    DECEASED = "❌"
    FAVICON = "/favico.ico"  # Actualizado al nombre correcto

class ImagePath(str, Enum):
    """Rutas a imágenes del sistema"""
    NO_PASSWORD = "/assets/images/no_password.png"
    LOGO_MAIN = "/assets/images/logo_main.png"
    LOGO_SMALL = "/assets/images/logo_small.png"

@dataclass
class AnimalIcon:
    """Representa el icono de un animal basado en su estado"""
    icon: str  # Puede ser una ruta a imagen o un carácter Unicode
    color: str = "black"
    is_image: bool = False

def get_animal_icon(genere: str, alletar: bool = False, estado: str = "activo") -> AnimalIcon:
    """
    Determina el icono apropiado para un animal
    Args:
        genere: "M" o "F"
        alletar: True si está amamantando
        estado: "activo" o "fallecido"
    Returns:
        AnimalIcon: Configuración del icono
    """
    if estado == "fallecido":
        return AnimalIcon(IconPath.DECEASED)
    
    if genere == "M":
        return AnimalIcon(IconPath.BULL, is_image=True)
    
    return AnimalIcon(
        IconPath.COW_NURSING if alletar else IconPath.COW_NOT_NURSING,
        "blue" if alletar else "black"
    )