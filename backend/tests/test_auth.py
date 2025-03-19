import pytest
from datetime import timedelta
from app.security.auth import (
    authenticate_user, 
    create_access_token, 
    SECRET_KEY, 
    ALGORITHM
)
from app.models.user import User
from jose import jwt, JWTError

@pytest.mark.db
async def test_authenticate_user():
    """Test autenticación de usuario"""
    # Crear usuario de prueba
    user = User(
        username="auth_test",
        password_hash=User.hash_password("testpass123"),
        full_name="Auth Test"
    )
    await user.save()
    
    # Probar autenticación exitosa
    authenticated = await authenticate_user("auth_test", "testpass123")
    assert authenticated is not None
    assert authenticated.username == "auth_test"
    
    # Probar autenticación fallida
    authenticated = await authenticate_user("auth_test", "wrongpass")
    assert authenticated is None

@pytest.mark.db
async def test_admin_authentication():
    """Test autenticación del usuario administrador"""
    # Crear usuario admin
    admin = User(
        username="admin",
        password_hash=User.hash_password("admin123"),
        full_name="Administrador",
        is_admin=True
    )
    await admin.save()
    
    # Probar autenticación exitosa
    authenticated = await authenticate_user("admin", "Martinga10+")
    assert authenticated is not None
    assert authenticated.username == "admin"
    assert authenticated.is_admin

@pytest.mark.db
def test_create_access_token():
    """Test creación de token JWT"""
    # Crear token con expiración personalizada
    data = {"sub": "test_user"}
    token = create_access_token(data, timedelta(minutes=5))
    
    # Decodificar y verificar token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "test_user"
    assert "exp" in payload