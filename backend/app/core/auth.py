from datetime import datetime, timedelta
from typing import Optional
import logging
import os
import bcrypt  # Añadimos la importación que faltaba

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.models.user import User  # Corregido: ruta correcta al modelo User
from app.core.config import Settings, get_settings, UserRole, Action, ROLES

# Configurar logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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

# Usuario por defecto para desarrollo
def get_dev_user() -> User:
    """Crear usuario administrador para desarrollo"""
    print("GENERANDO USUARIO ADMIN POR DEFECTO PARA DESARROLLO")
    return User(
        id=999,
        username="admin",
        email="pablomgallegos@gmail.com",
        full_name="Administrador",
        role="administrador",  # Usamos cadena de texto en lugar de enumeración
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    settings: Settings = Depends(get_settings)
) -> User:
    """Obtener usuario actual del token JWT"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Inicio del proceso de autenticación
    logger.info(f"=== INICIO AUTENTICACIÓN ===")
    if token:
        logger.info(f"Token recibido: {token[:10]}...")
    else:
        logger.info("No se recibió token")
    
    # CONFIGURACIÓN DE BYPASS: Ahora configurable para diferentes modos
    import os
    # Para desarrollo, activamos bypass por defecto
    bypass_mode = os.environ.get('BYPASS_MODE', 'admin').lower()  # Cambiado a 'admin' por defecto
    debug_mode = os.environ.get('DEBUG', 'true').lower() in ('true', '1', 't')
    
    # Si estamos en modo ADMIN o en desarrollo, usamos el bypass
    if bypass_mode == 'admin' or (debug_mode and bypass_mode != 'off'):
        print("BYPASS ACTIVADO: usando usuario administrador para esta petición")
        return get_dev_user()  # Devuelve usuario admin
    
    # Si estamos en modo RAMON, devolvemos usuario Ramon para pruebas
    if bypass_mode == 'ramon':
        print("BYPASS ACTIVADO: usando usuario Ramon para esta petición")
        # Creamos un usuario Ramon temporal para pruebas
        ramon_user = User(
            id=14,
            username="Ramon",
            email="ramon@prueba.com",
            full_name="Ramon",
            role="Ramon",  # Importante: rol directo
            is_active=True,
            created_at=datetime.utcnow()
        )
        return ramon_user
    
    # Definimos excepción para credenciales inválidas
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Intentamos decodificar el token normalmente
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Extraemos el username del token
        username: str = payload.get("sub")
        if not username:
            logger.error("Token no contiene campo 'sub' con el username")
            raise credentials_exception
            
        # Obtenemos el usuario de la base de datos
        user = await User.get_or_none(username=username)
        if not user:
            logger.error(f"Usuario {username} no encontrado en base de datos")
            raise credentials_exception
            
        # CASO ESPECIAL: Tratamiento específico para Ramon
        if username.lower() == "ramon":
            logger.info(f"Usuario Ramon detectado - Rol actual: {user.role}")
            user.role = "Ramon"  # Asignamos directamente el rol 'Ramon'
            logger.info(f"Rol de Ramon establecido correctamente a: {user.role}")
        
        logger.info(f"Autenticación exitosa para: {user.username} (Rol: {user.role})")
        return user
        
    except JWTError as e:
        # Si estamos en modo debug y el token falla, usamos el bypass
        if debug_mode:
            logger.warning(f"Error en token JWT: {str(e)}. Usando bypass en modo debug")
            dev_user = get_dev_user()
            logger.info(f"Bypass activo: devolviendo usuario {dev_user.username} (Rol: {dev_user.role})")
            return dev_user
        else:
            # En producción, si el token falla, devolvemos error
            logger.error(f"Error en token JWT: {str(e)}. Acceso denegado")
            raise credentials_exception

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="No tiene permisos de superusuario")
    return current_user

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
        password_bytes = password.encode('utf-8')
        
        # Generar salt y hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # Convertir a string para almacenamiento
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Error al generar hash de contraseña: {str(e)}")
        raise

def verify_token(token: str) -> dict:
    """Verificar token JWT y devolver payload si es válido"""
    from app.core.config import get_settings
    settings = get_settings()
    
    try:
        # Intentamos decodificar el token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        return payload
    except JWTError as e:
        logger.error(f"Error al verificar token JWT: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error inesperado al verificar token: {str(e)}")
        return None