from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "administrador"
    GERENTE = "gerente"
    EDITOR = "editor"
    USER = "usuario"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: UserRole = UserRole.USER
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True