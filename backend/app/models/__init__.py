"""
⚠️ ARCHIVO CRÍTICO - NO MODIFICAR ⚠️
Este archivo mantiene las importaciones principales de los modelos.
Modificar este archivo puede causar problemas de importación circular.

Última modificación segura: 12/03/2025
"""

from app.models.animal import Animal, Part
from app.models.enums import Estat, Genere, IconType
from app.models.import_model import Import

__all__ = ['Animal', 'Part', 'Estat', 'Genere', 'IconType', 'Import']