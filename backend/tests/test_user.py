import pytest
from app.models.user import User
from datetime import datetime, timedelta

@pytest.mark.db
async def test_user_creation():
    """Test creación básica de usuario"""
    user = User(
        username="test_user",
        password_hash=User.hash_password("password123"),
        full_name="Test User"
    )
    await user.save()
    
    assert user.id is not None
    assert user.is_active
    assert not user.is_admin
    assert user.created_at is not None
    assert user.last_login is None

@pytest.mark.db
async def test_user_password():
    """Test de manejo de contraseñas"""
    user = User(
        username="test_user",
        password_hash=User.hash_password("password123"),
        full_name="Test User"
    )
    await user.save()
    
    assert user.verify_password("password123")
    assert not user.verify_password("wrong_password")

@pytest.mark.db
async def test_user_unique_username():
    """Test de username único"""
    user1 = User(
        username="unique_user", 
        password_hash=User.hash_password("pass1"),
        full_name="User One"
    )
    await user1.save()
    
    with pytest.raises(Exception):
        user2 = User(
            username="unique_user", 
            password_hash=User.hash_password("pass2"),
            full_name="User Two"
        )
        await user2.save()

@pytest.mark.db
async def test_user_login_update():
    """Test actualización de último login"""
    user = User(
        username="login_user",
        password_hash=User.hash_password("pass123"),
        full_name="Login User"
    )
    await user.save()
    
    before_login = datetime.utcnow()
    await user.update_last_login()
    after_login = datetime.utcnow()
    
    assert user.last_login >= before_login
    assert user.last_login <= after_login