from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
from .models import User
import bcrypt

async def authenticate_user(username: str, password: str) -> User | None:
    # Obtener el usuario de la base de datos
    user = await User.get_or_none(username=username)
    if not user or not user.verify_password(password):
        return None
    
    # Caso especial para el usuario Ramon
    if username.lower() == "ramon":
        import logging
        logger = logging.getLogger(__name__)
        
        # Guardamos el rol original antes de modificarlo
        old_role = user.role
        
        # Asignamos el valor directamente sin usar la enumeración
        user.role = "Ramon"
        logger.info(f"authenticate_user: Asignando rol 'Ramon' directamente para usuario Ramon")
        
        # Importante: También guardamos un indicador para el frontend
        user.is_ramon_user = True
        
        logger.info(f"authenticate_user: Rol original: {old_role}, Nuevo rol: {user.role}")
    
    return user

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()