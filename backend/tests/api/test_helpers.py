"""
Utilidades para los tests de API que requieren configuración especial.
"""
import sys
import logging
from typing import List

logger = logging.getLogger(__name__)

def hide_problematic_modules(modules_list: List[str]) -> List[str]:
    """
    Filtra una lista de módulos eliminando aquellos que causan warnings en Tortoise.
    
    Args:
        modules_list: Lista de módulos a filtrar
        
    Returns:
        Lista filtrada sin los módulos problemáticos
    """
    # Lista de módulos que queremos ocultar
    problematic_modules = ['app.models.parto', 'app.models.base']
    problematic_suffixes = ('.parto', '.base')
    
    # Filtrar la lista
    filtered_list = [
        mod for mod in modules_list 
        if mod not in problematic_modules and not any(mod.endswith(suffix) for suffix in problematic_suffixes)
    ]
    
    # Registrar los módulos que se eliminaron
    removed = set(modules_list) - set(filtered_list)
    if removed:
        logger.warning(f"Módulos filtrados para evitar warnings: {removed}")
    
    return filtered_list
