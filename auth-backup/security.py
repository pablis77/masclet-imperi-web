from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
from .models import User
import bcrypt

async def authenticate_user(username: str, password: str) -> User | None:
    user = await User.get_or_none(username=username)
    if not user or not user.verify_password(password):
        return None
    return user

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()