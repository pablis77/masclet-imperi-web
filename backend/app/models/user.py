from tortoise import fields, models
from enum import Enum
import bcrypt
from typing import Optional

class UserRole(str, Enum):
    ADMIN = "administrador"
    GERENTE = "gerente"
    EDITOR = "editor"
    USER = "usuario"

class User(models.Model):
    """Modelo para usuarios del sistema"""
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    password_hash = fields.CharField(max_length=128)  # Renombrado para coherencia
    email = fields.CharField(max_length=255, unique=True)
    role = fields.CharEnumField(UserRole, max_length=15, default=UserRole.USER)  # Este campo falta en la BD
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "users"

    @classmethod
    async def create_user(cls, username: str, password: str, email: str, role: str = UserRole.USER):
        """
        Método de ayuda para crear un nuevo usuario con la contraseña hasheada
        """
        hashed_password = bcrypt.hashpw(
            password.encode(),
            bcrypt.gensalt()
        ).decode()
        
        return await cls.create(
            username=username,
            password_hash=hashed_password,
            email=email,
            role=role,
            is_active=True
        )

# Verificar estructura y roles