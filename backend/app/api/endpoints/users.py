"""
Endpoints para gestión de usuarios
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.core.auth import get_current_user
from app.api.endpoints.auth import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual autenticado
    """
    return current_user
