from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from .models import User
from .schemas import Token, UserCreate, UserResponse
from .security import authenticate_user, create_access_token
from .dependencies import get_current_user, check_permission
from app.core.config import Action

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    # Verificar si el usuario ya existe
    if await User.get_or_none(username=user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )
    if await User.get_or_none(email=user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está en uso"
        )
    
    # Crear nuevo usuario
    user = await User.create_user(
        username=user_data.username,
        password=user_data.password,
        email=user_data.email,
        role=user_data.role
    )
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
async def get_users(current_user: User = Depends(check_permission(Action.GESTIONAR_USUARIOS))):
    import logging
    logger = logging.getLogger(__name__)
    
    # Obtenemos todos los usuarios
    usuarios = await User.all()
    
    # Agregamos logs detallados
    logger.info(f"Endpoint /users: Se encontraron {len(usuarios)} usuarios")
    
    for idx, usuario in enumerate(usuarios):
        logger.info(f"Usuario {idx+1}: {usuario.username} (role: {usuario.role})")
    
    # Convertimos explícitamente a lista para asegurar serialización correcta
    respuesta = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "updated_at": u.updated_at.isoformat() if u.updated_at else None
    } for u in usuarios]
    
    logger.info(f"Respuesta final serializada: {respuesta}")
    
    return respuesta