from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.models.user import User
from typing import Optional
import jwt
from jwt.exceptions import PyJWTError
import logging

# Configurar logging
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[User]:
    """
    Verifica el token JWT y devuelve el usuario si es válido.
    """
    if not token:
        logger.warning("No se proporcionó token de autenticación")
        return None
        
    try:
        # Decodificar el token JWT
        logger.info(f"Intentando decodificar token: {token[:15]}...")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        
        if not username:
            logger.warning("Token no contiene campo 'sub'")
            return None
            
        # Buscar el usuario en la base de datos
        user = await User.get_or_none(username=username)
        if not user:
            logger.warning(f"Usuario {username} no encontrado en la base de datos")
            return None
            
        logger.info(f"Usuario autenticado correctamente: {username}, rol: {user.role}")
        return user
        
    except PyJWTError as e:
        logger.error(f"Error al verificar token JWT: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error inesperado en autenticación: {str(e)}")
        return None