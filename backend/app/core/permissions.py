from enum import Enum
from typing import List
from fastapi import Depends, HTTPException
from app.auth.models import User  # Corregida importación para usar el modelo de auth
from app.core.config import UserRole, Action, get_settings  # Importamos UserRole y Action desde config

# Redirigimos a la implementación actual en config.py
async def check_permissions(user: User, required_action: Action):
    """Versión moderna del has_permission original"""
    settings = get_settings()
    # Obtener los roles desde la configuración
    ROLES = settings.ROLES
    
    # Verificar si el usuario tiene permiso para la acción requerida
    if required_action not in ROLES.get(user.role, []):
        raise HTTPException(status_code=403, detail="Acción no permitida")