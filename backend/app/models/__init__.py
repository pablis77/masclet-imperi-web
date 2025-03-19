"""
⚠️ ARCHIVO CRÍTICO - NO MODIFICAR ⚠️
Este archivo mantiene las importaciones principales de los modelos.
Modificar este archivo puede causar problemas de importación circular.

Última modificación segura: 12/03/2025
"""

from .animal import Animal, Part  # Importamos Part desde animal.py en lugar de parto.py
from .enums import Estat, Genere, IconType

__all__ = ['Animal', 'Part', 'Estat', 'Genere', 'IconType']