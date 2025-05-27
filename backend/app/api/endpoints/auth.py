# Verificar rutas y lógica de auth
class AuthRouter:
    """Gestión de autenticación y permisos"""
    
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from tortoise.exceptions import IntegrityError
from tortoise import Tortoise
from app.core.config import Settings, get_settings, UserRole, Action
from app.models.user import User
from app.core.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    check_permissions,
    get_password_hash
)
import json

router = APIRouter()

# Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    username: Optional[str] = None
    
class UserBase(BaseModel):
    username: str
    email: str  # Cambiado de EmailStr a str para permitir dominios especiales como .local
    role: Optional[UserRole] = UserRole.USER
    
class UserCreate(UserBase):
    password: str

class PasswordChange(BaseModel):
    current_password: Optional[str] = None
    new_password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True
        
class UsersListResponse(BaseModel):
    total: int
    items: List[UserResponse]
    
    class Config:
        orm_mode = True

# Endpoints
@router.post("/login", response_model=Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    settings: Settings = Depends(get_settings)
):
    """
    Obtener token JWT para autenticación
    """
    print(f"Intento de login con usuario: {form_data.username}")
    print(f"Headers de la solicitud: {request.headers}")
    
    try:
        # Intentar serializar la respuesta para depuración
        print("Intentando crear una respuesta simplificada para depuración")
        simple_response = {"status": "test", "message": "Prueba de serialización JSON"}
        test_json = json.dumps(simple_response)
        print(f"Serialización de prueba exitosa: {test_json}")
        
        # Verificar que el modelo de usuario esté correctamente registrado
        print(f"Modelos registrados: {Tortoise.apps}")
        
        print(f"Verificando credenciales para usuario: {form_data.username}")
        user = await authenticate_user(form_data.username, form_data.password)
        if not user:
            print(f"Autenticación fallida para usuario: {form_data.username}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Credenciales incorrectos"}
            )
            
        if not user.is_active:
            print(f"Usuario inactivo: {form_data.username}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Usuario inactivo"}
            )
            
        # Crear el token JWT
        print(f"Generando token JWT para usuario: {form_data.username}")
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Imprimir el valor de user.role para depuración
        print(f"Valor de user.role: {user.role}, tipo: {type(user.role)}")
        
        # Convertir el rol a un formato consistente
        # Si es un objeto UserRole, extraemos solo el nombre del rol en minúsculas
        if hasattr(user.role, "name"):
            role_str = user.role.name.lower()
        else:
            # Si ya es una cadena, la dejamos como está
            role_str = str(user.role)
            
        # Caso especial para Ramon
        if user.username.lower() == "ramon":
            role_str = "Ramon"  # Usar siempre el mismo formato para Ramon
            
        print(f"Role procesado: {role_str}")
        
        access_token = create_access_token(
            data={"sub": user.username, "role": role_str},
            settings=settings,
            expires_delta=access_token_expires
        )
        
        print(f"Login exitoso para usuario: {form_data.username}")
        
        # Crear un diccionario simple y probarlo
        response_dict = {
            "access_token": access_token, 
            "token_type": "bearer",
            "username": user.username,
            "role": role_str
        }
        
        # Probar la serialización del diccionario
        try:
            test_response = json.dumps(response_dict)
            print(f"Serializando respuesta de prueba: OK")
        except Exception as json_error:
            print(f"Error al serializar respuesta de prueba: {str(json_error)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": f"Error al serializar respuesta: {str(json_error)}"}
            )
        
        # Respuesta simplificada para evitar problemas de serialización
        return response_dict
        
    except Exception as e:
        print(f"Error durante el login: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Devolver un error más detallado para depuración
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Error en el servidor: {str(e)}", "traceback": traceback.format_exc()}
        )

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate, 
    current_user: User = Depends(get_current_user)
):
    """
    Registrar un nuevo usuario en el sistema.
    Solo usuarios con rol ADMIN o GERENTE pueden crear usuarios.
    """
    # Verificar permisos para crear usuarios (solo ADMIN y GERENTE)
    if current_user.role not in [UserRole.ADMIN, UserRole.RAMON]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para crear usuarios. Se requiere rol ADMIN o GERENTE."
        )
    
    # Verificar si el username ya existe
    existing_username = await User.get_or_none(username=user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )
        
    # Verificar si el email ya existe
    existing_email = await User.get_or_none(email=user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está en uso"
        )
    
    # Hashear la contraseña
    hashed_password = get_password_hash(user_data.password)
    
    try:
        # Crear el usuario
        user = await User.create(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        
        return user
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear el usuario"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual autenticado
    """
    # Caso especial para Ramon - aseguramos consistencia en el rol
    if current_user.username.lower() == "ramon":
        import logging
        logger = logging.getLogger(__name__)
        # Guardamos el rol original antes de modificarlo
        old_role = current_user.role
        # Asignamos el valor directamente sin usar la enumeración
        current_user.role = "Ramon"
        logger.info(f"get_current_user_info: Asignando rol 'Ramon' para Ramon. Rol anterior: {old_role}")
    
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_settings)
):
    """
    Renovar el token de acceso
    """
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Preparamos los datos para el token asegurando consistencia del rol
    role_value = current_user.role
    
    # Caso especial para Ramon
    if current_user.username.lower() == "ramon":
        role_value = "Ramon"  # Usar siempre el mismo formato para Ramon
        
    access_token = create_access_token(
        data={"sub": current_user.username, "role": role_value},
        settings=settings,
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", response_model=UsersListResponse)
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de usuarios (solo para administradores)
    """
    # Verificar permisos - solo administradores pueden listar usuarios
    await check_permissions(current_user, Action.GESTIONAR_USUARIOS)
    
    total = await User.all().count()
    users = await User.all().offset(skip).limit(limit)
    
    return {"total": total, "items": users}

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar un usuario por su ID (solo administradores)
    """
    # Verificar permisos - solo administradores pueden borrar usuarios
    await check_permissions(current_user, Action.BORRAR_USUARIOS)
    
    # No permitir eliminar al propio usuario
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )
    
    # Buscar el usuario
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Eliminar el usuario
    await user.delete()
    return None

@router.patch("/users/{user_id}/password", status_code=status.HTTP_200_OK)
async def change_user_password(
    user_id: int,
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user)
):
    """
    Cambiar la contraseña de un usuario (propio usuario o administrador)
    """
    # Buscar el usuario objetivo
    target_user = await User.get_or_none(id=user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Si el usuario intenta cambiar su propia contraseña, verificar la contraseña actual
    if current_user.id == user_id:
        if not password_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Se requiere la contraseña actual para cambiar tu propia contraseña"
            )
            
        user = await authenticate_user(current_user.username, password_data.current_password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña actual incorrecta"
            )
    else:
        # Si es otro usuario, verificar que sea administrador
        await check_permissions(current_user, Action.CAMBIAR_CONTRASEÑAS)
    
    # Actualizar la contraseña
    hashed_password = get_password_hash(password_data.new_password)
    target_user.password_hash = hashed_password
    await target_user.save()
    
    return {"message": "Contraseña actualizada correctamente"}