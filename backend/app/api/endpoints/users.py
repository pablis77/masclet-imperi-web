"""
Endpoints para gestión de usuarios
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from tortoise.exceptions import DoesNotExist
from pydantic import BaseModel
from app.models.user import User, UserRole
from app.core.auth import get_current_user, verify_user_role, get_password_hash
from app.api.endpoints.auth import UserResponse, UserCreate

# Definición de modelos de respuesta
class PaginatedUserResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    pages: int

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual autenticado
    """
    return current_user

@router.get("/", response_model=PaginatedUserResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Página actual"),
    limit: int = Query(10, ge=1, le=100, description="Número de elementos por página"),
    current_user: User = Depends(get_current_user)
) -> PaginatedUserResponse:
    """
    Obtener lista paginada de usuarios (solo administrador y gerente/Ramon)
    """
    # Verificar si el usuario tiene permisos (admin o Ramon)
    if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver la lista de usuarios"
        )

    # Calcular offset para paginación
    skip = (page - 1) * limit

    # Obtener usuarios con paginación
    users = await User.all().offset(skip).limit(limit)
    total = await User.all().count()

    # Calcular número total de páginas
    pages = (total + limit - 1) // limit  # Ceil division

    return {
        "items": users,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Obtener usuario por ID (solo admin, gerente o el propio usuario)
    """
    # Solo admin, Ramon o el propio usuario pueden ver detalles
    if not (verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]) or current_user.id == user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este usuario"
        )

    try:
        user = await User.get(id=user_id)
        return user
    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo usuario (solo admin y gerente/Ramon)
    """
    # Verificar permisos
    if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para crear usuarios"
        )

    # Verificar si ya existe un usuario con ese username
    existing_user = await User.filter(username=user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese nombre de usuario"
        )

    # Validar roles únicos (solo puede haber un administrador y un gerente)
    if user_data.role == UserRole.ADMIN:
        admin_exists = await User.filter(role=UserRole.ADMIN).first()
        if admin_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con rol de administrador"
            )
    
    if user_data.role == "Ramon":  # Rol de gerente
        gerente_exists = await User.filter(role="Ramon").first()
        if gerente_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con rol de gerente"
            )
    
    # Verificar si se intenta crear un administrador y el usuario actual no es admin
    if user_data.role == UserRole.ADMIN and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede crear otros administradores"
        )

    # Crear el usuario
    hashed_password = get_password_hash(user_data.password)
    new_user = await User.create(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,  # Corregido a password_hash según el modelo
        role=user_data.role,
        is_active=user_data.is_active if user_data.is_active is not None else True
    )

    return new_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar usuario por ID (solo admin, gerente o el propio usuario)
    """
    try:
        user = await User.get(id=user_id)

        # Verificar permisos
        # El propio usuario puede actualizar sus datos, pero no su rol
        # Admin puede actualizar cualquier usuario
        # Ramon puede actualizar cualquier usuario excepto administradores
        is_self_update = current_user.id == user_id
        is_admin = verify_user_role(current_user, [UserRole.ADMIN])
        is_ramon = verify_user_role(current_user, ["Ramon"])
        target_is_admin = user.role == UserRole.ADMIN

        # Comprobar permisos según casos
        if not is_self_update and not is_admin and not is_ramon:
            # No es admin ni gerente ni el propio usuario
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para modificar este usuario"
            )

        if is_ramon and target_is_admin:
            # Gerente intentando modificar a un admin
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes modificar a un administrador"
            )

        if is_self_update and not is_admin and user_data.role is not None:
            # Usuario intentando cambiar su propio rol sin ser admin
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes cambiar tu propio rol"
            )

        # Validar roles únicos (solo puede haber un administrador y un gerente)
        if user_data.role == UserRole.ADMIN:
            admin_exists = await User.filter(role=UserRole.ADMIN).exclude(id=user_id).first()
            if admin_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe un usuario con rol de administrador"
                )
        
        if user_data.role == "Ramon":  # Rol de gerente
            gerente_exists = await User.filter(role="Ramon").exclude(id=user_id).first()
            if gerente_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe un usuario con rol de gerente"
                )
        
        # Aplicar cambios
        if user_data.username is not None:
            # Verificar si el username ya existe
            existing_user = await User.filter(username=user_data.username).first()
            if existing_user and existing_user.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este nombre de usuario ya está en uso"
                )
            user.username = user_data.username
            
        if user_data.email is not None:
            user.email = user_data.email

        # Nota: No hay campo full_name en la base de datos

        if user_data.password is not None:
            user.hashed_password = get_password_hash(user_data.password)

        if user_data.role is not None and (is_admin or (is_ramon and not target_is_admin)):
            # Solo cambiamos rol si es admin o es gerente modificando a no-admin
            user.role = user_data.role

        if user_data.is_active is not None and (is_admin or is_ramon):
            # Solo admin o gerente pueden activar/desactivar
            user.is_active = user_data.is_active

        # Guardar cambios
        await user.save()
        return user

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar usuario por ID (solo admin y gerente, con restricciones)
    """
    # Verificar permisos básicos
    if not verify_user_role(current_user, [UserRole.ADMIN, "Ramon"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar usuarios"
        )

    try:
        user = await User.get(id=user_id)

        # Verificar si es uno mismo (no permitido)
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes eliminar tu propio usuario"
            )

        # Verificar si Ramon intenta eliminar admin
        if verify_user_role(current_user, ["Ramon"]) and user.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes eliminar a un administrador"
            )

        # Verificar que no se está eliminando al último administrador
        if user.role == UserRole.ADMIN:
            admin_count = await User.filter(role=UserRole.ADMIN).count()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede eliminar al único administrador del sistema"
                )
        
        # Verificar que no se está eliminando al único gerente
        if user.role == "Ramon":
            gerente_count = await User.filter(role="Ramon").count()
            if gerente_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede eliminar al único gerente del sistema"
                )
                
        await User.filter(id=user_id).delete()
        return {"detail": "Usuario eliminado correctamente"}

    except DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
