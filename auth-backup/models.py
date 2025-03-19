from tortoise import fields, models
from app.core.config import UserRole
import bcrypt

class User(models.Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    password_hash = fields.CharField(max_length=128)
    email = fields.CharField(max_length=255, unique=True)
    role = fields.CharEnumField(UserRole, default=UserRole.USER)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "users"

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    @classmethod
    async def create_user(cls, username: str, password: str, email: str, role: UserRole = UserRole.USER):
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        return await cls.create(
            username=username,
            password_hash=password_hash,
            email=email,
            role=role
        )