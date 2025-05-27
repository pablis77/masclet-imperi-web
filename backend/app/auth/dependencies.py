from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings, Action
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        # Si hay un rol en el token, lo recordamos
        token_role = payload.get("role")
    except JWTError:
        raise credentials_exception

    user = await User.get_or_none(username=username)
    if user is None:
        raise credentials_exception
        
    # Caso especial para el usuario Ramon - asignamos directamente el valor 'Ramon'
    if username.lower() == "ramon":
        import logging
        logger = logging.getLogger(__name__)
        
        # Guardamos el rol original antes de modificarlo
        old_role = user.role
        
        # Asignamos el valor directamente sin usar la enumeración
        user.role = "Ramon"
        logger.info(f"get_current_user: Asignando rol 'Ramon' directamente para usuario Ramon")
        
        # Importante: También guardamos un indicador para el frontend
        user.is_ramon_user = True
        
        logger.info(f"get_current_user: Rol original: {old_role}, Nuevo rol: {user.role}")
        
    return user

def check_permission(required_action: Action):
    async def permission_dependency(current_user: User = Depends(get_current_user)):
        if required_action not in settings.ROLES[current_user.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos suficientes"
            )
        return current_user
    return permission_dependency