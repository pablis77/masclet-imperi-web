from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import ROLES, Action, UserRole, Settings, get_settings
from app.models.user import User
import bcrypt

# Configura OAuth2 con la ruta correcta
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def authenticate_user(username: str, password: str) -> Optional[User]:
    """Autenticar usuario contra base de datos"""
    print(f"Intentando autenticar usuario: {username}")
    try:
        print(f"Buscando usuario en la base de datos: {username}")
        user = await User.get_or_none(username=username)
        if not user:
            print(f"Usuario no encontrado: {username}")
            return None
        
        print(f"Usuario encontrado: {username}, verificando contraseña")
        if not verify_password(password, user.password_hash):
            print(f"Contraseña incorrecta para usuario: {username}")
            return None
            
        print(f"Autenticación exitosa para usuario: {username} con rol: {user.role}")
        return user
    except Exception as e:
        print(f"Error durante la autenticación: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    settings: Settings = Depends(get_settings)
) -> User:
    """Obtener usuario actual del token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await User.get_or_none(username=username)
    if user is None:
        raise credentials_exception
    return user

def create_access_token(
    data: dict,
    settings: Settings,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

async def check_permissions(
    user: User,
    required_action: Action,
    resource: str = None
) -> bool:
    """
    Verifica permisos con contexto adicional
    Args:
        user: Usuario actual
        required_action: Acción requerida
        resource: Recurso opcional (ej: 'explotacion_1')
    """
    if required_action not in ROLES.get(user.role, []):
        raise HTTPException(
            status_code=403,
            detail=f"No tienes permisos para: {required_action}"
        )
    
    return True

def verify_user_role(user: User, allowed_roles: list) -> bool:
    """
    Verifica si el usuario tiene alguno de los roles permitidos
    Args:
        user: Usuario actual
        allowed_roles: Lista de roles permitidos
    Returns:
        True si el usuario tiene alguno de los roles permitidos, False en caso contrario
    """
    if not user:
        return False
    
    if user.role in allowed_roles:
        return True
    
    return False

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña contra hash almacenado"""
    try:
        print(f"Verificando contraseña (hash truncado): {hashed_password[:10]}...")
        
        # Asegurarse de que la contraseña esté en bytes
        password_bytes = plain_password.encode('utf-8')
        
        # Comprobar si el hash ya está en bytes o necesita ser codificado
        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode('utf-8')
        else:
            hashed_bytes = hashed_password
        
        # Asegurarse de que el hash tenga el formato correcto para bcrypt
        if not hashed_bytes.startswith(b'$2'):
            print("Error: El hash no tiene el formato correcto de bcrypt")
            return False
            
        result = bcrypt.checkpw(password_bytes, hashed_bytes)
        print(f"Verificación de contraseña: {'exitosa' if result else 'fallida'}")
        return result
    except Exception as e:
        print(f"Error al verificar contraseña: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_password_hash(password: str) -> str:
    """Generar hash de contraseña"""
    try:
        # Asegurarse de que la contraseña esté en bytes
        password_bytes = password.encode('utf-8') if isinstance(password, str) else password
        
        # Generar el hash y devolverlo como string
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Error al generar hash de contraseña: {e}")
        raise