"""
Tests para los endpoints de autenticación.
"""
import pytest
import logging
import os
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User, UserRole
from app.core.auth import create_access_token, verify_password, get_password_hash
from app.core.config import Action, get_settings
from tortoise import Tortoise

logger = logging.getLogger(__name__)
client = TestClient(app)
settings = get_settings()

# Asegurar que el modelo User se registre correctamente
@pytest.fixture(scope="session", autouse=True)
async def register_user_model(db_session):
    """
    Asegura que el modelo User se registre en la conexión de Tortoise
    y crea la tabla si no existe.
    """
    logger.info("Registrando modelo User y creando tabla users")
    conn = Tortoise.get_connection("default")
    
    # Verificar si la tabla users existe
    tables = await conn.execute_query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not tables[1]:
        # Si la tabla no existe, crearla manualmente
        await conn.execute_script("""
        CREATE TABLE IF NOT EXISTS "users" (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            "username" VARCHAR(50) NOT NULL UNIQUE,
            "password_hash" VARCHAR(128) NOT NULL,
            "email" VARCHAR(100) NOT NULL UNIQUE,
            "role" VARCHAR(20) NOT NULL,
            "is_active" BOOL NOT NULL DEFAULT 1,
            "created_at" TIMESTAMP NOT NULL,
            "updated_at" TIMESTAMP NOT NULL
        );
        """)
        logger.info("Tabla users creada manualmente")
    else:
        logger.info("La tabla users ya existe")
    
    yield

@pytest.fixture(scope="function")
async def clean_users(clean_db):
    """Limpia los datos de usuarios después de cada test."""
    yield
    # Eliminar todos los usuarios
    tables = await Tortoise.get_connection("default").execute_query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    )
    if tables[1]:
        await Tortoise.get_connection("default").execute_script("DELETE FROM users")
        logger.info("Tabla users limpiada")
    else:
        logger.warning("No se encontró la tabla users para limpiar")

@pytest.mark.asyncio
async def test_register_user(clean_users):
    """Test para registrar un nuevo usuario."""
    user_data = {
        "username": "testuser",
        "password": "securepassword123",
        "email": "test@example.com",
        "role": "usuario"
    }
    
    response = client.post("/api/v1/auth/signup", json=user_data)
    
    assert response.status_code == 201, f"Error en registro: {response.text}"
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["role"] == "usuario"
    assert "password" not in data  # Asegurar que la contraseña no se devuelve
    
    # Verificar que se ha creado en la base de datos
    user = await User.get_or_none(username="testuser")
    assert user is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    
    logger.info("Test de registro de usuario completado exitosamente")

@pytest.mark.asyncio
async def test_register_duplicate_username(clean_users):
    """Test para verificar que no se puede registrar un nombre de usuario duplicado."""
    # Crear un usuario primero
    password_hash = get_password_hash("securepassword123")
    await User.create(
        username="duplicate_test",
        password_hash=password_hash,
        email="duplicate@example.com",
        role="usuario"
    )
    
    # Intentar crear otro usuario con el mismo nombre
    user_data = {
        "username": "duplicate_test",
        "password": "anotherpassword",
        "email": "another@example.com",
        "role": "usuario"
    }
    
    response = client.post("/api/v1/auth/signup", json=user_data)
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "ya está en uso" in data["detail"]
    
    logger.info("Test de nombre de usuario duplicado completado exitosamente")

@pytest.mark.asyncio
async def test_register_duplicate_email(clean_users):
    """Test para verificar que no se puede registrar un email duplicado."""
    # Crear un usuario primero
    password_hash = get_password_hash("securepassword123")
    await User.create(
        username="email_test",
        password_hash=password_hash,
        email="duplicate_email@example.com",
        role="usuario"
    )
    
    # Intentar crear otro usuario con el mismo email
    user_data = {
        "username": "different_user",
        "password": "anotherpassword",
        "email": "duplicate_email@example.com",
        "role": "usuario"
    }
    
    response = client.post("/api/v1/auth/signup", json=user_data)
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "ya está en uso" in data["detail"]
    
    logger.info("Test de email duplicado completado exitosamente")

@pytest.mark.asyncio
async def test_login_success(clean_users):
    """Test para verificar el inicio de sesión exitoso."""
    # Usar el método de User para crear un usuario con hash de contraseña
    password_hash = get_password_hash("loginpassword123")
    
    # Crear un usuario para la prueba
    await User.create(
        username="login_test",
        password_hash=password_hash,
        email="login@example.com",
        role="usuario"
    )
    
    # Datos de inicio de sesión
    login_data = {
        "username": "login_test",
        "password": "loginpassword123"
    }
    
    response = client.post(
        "/api/v1/auth/login", 
        data=login_data,  
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    logger.info("Test de inicio de sesión exitoso completado")

@pytest.mark.asyncio
async def test_login_invalid_credentials(clean_users):
    """Test para verificar el rechazo de credenciales inválidas."""
    # Crear un usuario para la prueba
    password_hash = get_password_hash("correctpassword")
    await User.create(
        username="invalid_login",
        password_hash=password_hash,
        email="invalid@example.com",
        role="usuario"
    )
    
    # Datos de inicio de sesión incorrectos
    login_data = {
        "username": "invalid_login",
        "password": "wrongpassword"
    }
    
    response = client.post(
        "/api/v1/auth/login", 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "incorrectos" in data["detail"].lower()
    
    logger.info("Test de credenciales inválidas completado")

@pytest.mark.asyncio
async def test_get_current_user(clean_users):
    """Test para obtener información del usuario actual."""
    # Crear un usuario para la prueba
    password_hash = get_password_hash("userpassword")
    user = await User.create(
        username="current_user",
        password_hash=password_hash,
        email="current@example.com",
        role="usuario"
    )
    
    # Crear token de acceso
    access_token = create_access_token(
        data={"sub": user.username},
        settings=settings
    )
    
    # Hacer solicitud con el token
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "current_user"
    assert data["email"] == "current@example.com"
    
    logger.info("Test de obtención de usuario actual completado")

@pytest.mark.asyncio
async def test_get_current_user_invalid_token(clean_users):
    """Test para verificar el rechazo de tokens inválidos."""
    # Token inválido
    invalid_token = "invalid.token.string"
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {invalid_token}"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "inválidas" in data["detail"].lower() or "invalidas" in data["detail"].lower()
    
    logger.info("Test de token inválido completado")

@pytest.mark.asyncio
async def test_refresh_token(clean_users):
    """Test para renovar el token de acceso."""
    # Crear un usuario para la prueba
    password_hash = get_password_hash("refreshpassword")
    user = await User.create(
        username="refresh_user",
        password_hash=password_hash,
        email="refresh@example.com",
        role="usuario"
    )
    
    # Crear token de acceso
    access_token = create_access_token(
        data={"sub": user.username},
        settings=settings
    )
    
    # Hacer solicitud para renovar el token
    response = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert access_token != data["access_token"]  # El nuevo token debe ser diferente
    
    logger.info("Test de renovación de token completado")

@pytest.mark.asyncio
async def test_get_users_with_permission(clean_users):
    """Test para obtener lista de usuarios con permisos adecuados."""
    # Crear un usuario admin para la prueba
    password_hash = get_password_hash("adminpassword")
    admin = await User.create(
        username="admin_user",
        password_hash=password_hash,
        email="admin@example.com",
        role="administrador"
    )
    
    # Crear token de acceso para el admin
    admin_token = create_access_token(
        data={"sub": admin.username, "role": admin.role},
        settings=settings
    )
    
    # Hacer solicitud para obtener lista de usuarios
    response = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    
    logger.info("Test de obtención de usuarios completado")

@pytest.mark.asyncio
async def test_get_users_without_permission(clean_users):
    """Test para verificar el rechazo de acceso a usuarios sin permisos."""
    # Crear un usuario normal para la prueba
    password_hash = get_password_hash("userpassword")
    user = await User.create(
        username="normal_user",
        password_hash=password_hash,
        email="normal@example.com",
        role="usuario"
    )
    
    # Crear token de acceso para el usuario normal
    user_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        settings=settings
    )
    
    # Hacer solicitud para obtener lista de usuarios
    response = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "permisos" in data["detail"].lower()
    
    logger.info("Test de rechazo de acceso completado")

@pytest.mark.asyncio
async def test_delete_user_with_permission(clean_users):
    """Test para eliminar usuario con permisos de administrador."""
    # Crear un usuario admin para la prueba
    password_hash = get_password_hash("adminpassword")
    admin = await User.create(
        username="admin_delete",
        password_hash=password_hash,
        email="admin_delete@example.com",
        role="administrador"
    )
    
    # Crear un usuario normal para eliminarlo
    password_hash = get_password_hash("userpassword")
    user_to_delete = await User.create(
        username="user_to_delete",
        password_hash=password_hash,
        email="to_delete@example.com",
        role="usuario"
    )
    
    # Crear token de acceso para el admin
    admin_token = create_access_token(
        data={"sub": admin.username, "role": admin.role},
        settings=settings
    )
    
    # Hacer solicitud para eliminar el usuario
    response = client.delete(
        f"/api/v1/auth/users/{user_to_delete.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 204
    
    # Verificar que el usuario ha sido eliminado
    deleted_user = await User.get_or_none(id=user_to_delete.id)
    assert deleted_user is None
    
    logger.info("Test de eliminación de usuario completado")

@pytest.mark.asyncio
async def test_delete_user_without_permission(clean_users):
    """Test para verificar que un usuario normal no puede eliminar usuarios."""
    # Crear un usuario normal para la prueba
    password_hash = get_password_hash("userpassword")
    user = await User.create(
        username="normal_delete",
        password_hash=password_hash,
        email="normal_delete@example.com",
        role="usuario"
    )
    
    # Crear un usuario para intentar eliminarlo
    password_hash = get_password_hash("userpassword")
    user_to_delete = await User.create(
        username="another_to_delete",
        password_hash=password_hash,
        email="another_delete@example.com",
        role="usuario"
    )
    
    # Crear token de acceso para el usuario normal
    user_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        settings=settings
    )
    
    # Hacer solicitud para eliminar el usuario
    response = client.delete(
        f"/api/v1/auth/users/{user_to_delete.id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    
    # Verificar que el usuario no ha sido eliminado
    non_deleted_user = await User.get_or_none(id=user_to_delete.id)
    assert non_deleted_user is not None
    
    logger.info("Test de rechazo de eliminación de usuario completado")

@pytest.mark.asyncio
async def test_delete_self(clean_users):
    """Test para verificar que un usuario no puede eliminarse a sí mismo."""
    # Crear un usuario admin para la prueba
    password_hash = get_password_hash("adminpassword")
    admin = await User.create(
        username="admin_self_delete",
        password_hash=password_hash,
        email="admin_self@example.com",
        role="administrador"
    )
    
    # Crear token de acceso para el admin
    admin_token = create_access_token(
        data={"sub": admin.username, "role": admin.role},
        settings=settings
    )
    
    # Hacer solicitud para eliminar al propio admin
    response = client.delete(
        f"/api/v1/auth/users/{admin.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "propio usuario" in data["detail"].lower()
    
    # Verificar que el usuario no ha sido eliminado
    non_deleted_admin = await User.get_or_none(id=admin.id)
    assert non_deleted_admin is not None
    
    logger.info("Test de rechazo de auto-eliminación completado")

@pytest.mark.asyncio
async def test_change_own_password(clean_users):
    """Test para cambiar la propia contraseña."""
    # Crear un usuario para la prueba
    password_hash = get_password_hash("oldpassword123")
    user = await User.create(
        username="password_change",
        password_hash=password_hash,
        email="password@example.com",
        role="usuario"
    )
    
    # Crear token de acceso
    user_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        settings=settings
    )
    
    # Datos para cambiar la contraseña
    password_data = {
        "current_password": "oldpassword123",
        "new_password": "newpassword456"
    }
    
    # Hacer solicitud para cambiar la contraseña
    response = client.patch(
        f"/api/v1/auth/users/{user.id}/password",
        json=password_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "actualizada" in data["message"].lower()
    
    # Verificar que la contraseña ha cambiado intentando iniciar sesión
    login_data = {
        "username": "password_change",
        "password": "newpassword456"
    }
    
    login_response = client.post(
        "/api/v1/auth/login", 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert login_response.status_code == 200
    
    logger.info("Test de cambio de propia contraseña completado")

@pytest.mark.asyncio
async def test_change_own_password_with_wrong_current(clean_users):
    """Test para verificar que no se puede cambiar la contraseña con la actual incorrecta."""
    # Crear un usuario para la prueba
    password_hash = get_password_hash("correctpassword")
    user = await User.create(
        username="wrong_password",
        password_hash=password_hash,
        email="wrong@example.com",
        role="usuario"
    )
    
    # Crear token de acceso
    user_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        settings=settings
    )
    
    # Datos incorrectos para cambiar la contraseña
    password_data = {
        "current_password": "wrongpassword",
        "new_password": "newpassword456"
    }
    
    # Hacer solicitud para cambiar la contraseña
    response = client.patch(
        f"/api/v1/auth/users/{user.id}/password",
        json=password_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "incorrecta" in data["detail"].lower()
    
    logger.info("Test de rechazo de cambio de contraseña con contraseña actual incorrecta completado")

@pytest.mark.asyncio
async def test_admin_change_user_password(clean_users):
    """Test para que un administrador cambie la contraseña de otro usuario."""
    # Crear un usuario admin para la prueba
    password_hash = get_password_hash("adminpassword")
    admin = await User.create(
        username="admin_password",
        password_hash=password_hash,
        email="admin_pw@example.com",
        role="administrador"
    )
    
    # Crear un usuario normal para cambiarle la contraseña
    password_hash = get_password_hash("userpassword")
    user = await User.create(
        username="user_for_password",
        password_hash=password_hash,
        email="user_pw@example.com",
        role="usuario"
    )
    
    # Crear token de acceso para el admin
    admin_token = create_access_token(
        data={"sub": admin.username, "role": admin.role},
        settings=settings
    )
    
    # Datos para cambiar la contraseña (el admin no necesita la contraseña actual)
    password_data = {
        "new_password": "adminsetpassword"
    }
    
    # Hacer solicitud para cambiar la contraseña
    response = client.patch(
        f"/api/v1/auth/users/{user.id}/password",
        json=password_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "actualizada" in data["message"].lower()
    
    # Verificar que la contraseña ha cambiado intentando iniciar sesión
    login_data = {
        "username": "user_for_password",
        "password": "adminsetpassword"
    }
    
    login_response = client.post(
        "/api/v1/auth/login", 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert login_response.status_code == 200
    
    logger.info("Test de cambio de contraseña por admin completado")

@pytest.mark.asyncio
async def test_non_admin_change_other_password(clean_users):
    """Test para verificar que un usuario normal no puede cambiar la contraseña de otro usuario."""
    # Crear un usuario normal para la prueba
    password_hash = get_password_hash("userpassword1")
    user1 = await User.create(
        username="normal_user1",
        password_hash=password_hash,
        email="normal1@example.com",
        role="usuario"
    )
    
    # Crear otro usuario normal
    password_hash = get_password_hash("userpassword2")
    user2 = await User.create(
        username="normal_user2",
        password_hash=password_hash,
        email="normal2@example.com",
        role="usuario"
    )
    
    # Crear token de acceso para el usuario normal
    user_token = create_access_token(
        data={"sub": user1.username, "role": user1.role},
        settings=settings
    )
    
    # Datos para intentar cambiar la contraseña
    password_data = {
        "new_password": "hackedpassword"
    }
    
    # Hacer solicitud para cambiar la contraseña de otro usuario
    response = client.patch(
        f"/api/v1/auth/users/{user2.id}/password",
        json=password_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
    assert "permisos" in data["detail"].lower()
    
    logger.info("Test de rechazo de cambio de contraseña de otro usuario completado")
