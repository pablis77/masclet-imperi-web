"""
Test de integración para verificar los flujos de trabajo completos con diferentes roles.
Valida que cada rol tenga acceso solo a las funcionalidades permitidas según sus permisos.
"""
import pytest
import logging
import io
import csv
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User, UserRole
from app.models.animal import Animal, Part
from app.models.explotacio import Explotacio
from app.core.auth import create_access_token, get_password_hash
from app.core.config import get_settings
from datetime import datetime, timedelta
from app.schemas.user import UserCreate

logger = logging.getLogger(__name__)
client = TestClient(app)

# Helpers para crear datos de prueba
async def create_test_user(username: str, role: UserRole) -> User:
    """Crea un usuario de prueba con el rol especificado."""
    return await User.create(
        username=username,
        email=f"{username}@example.com",
        password_hash=get_password_hash("password123"),
        role=role,
        is_active=True
    )

async def create_test_explotacio(nombre: str) -> Explotacio:
    """Crea una explotación de prueba."""
    return await Explotacio.create(nom=nombre, activa=True)

def create_test_csv():
    """Crea un CSV de prueba con datos de animales."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabecera
    writer.writerow(["explotacio", "nom", "genere", "estado", "alletar", "pare", "mare", "quadra", "cod", "num_serie", "dob", "part", "GenereT", "EstadoT"])
    
    # Datos de ejemplo
    data = [
        ["Test Explotacio", "Toro-001", "M", "OK", None, None, None, "C1", "T001", "ES123456789", "01/01/2020", None, None, None],
        ["Test Explotacio", "Vaca-001", "F", "OK", "1", None, None, "C2", "V001", "ES123456790", "10/05/2019", None, None, None]
    ]
    
    for row in data:
        writer.writerow(row)
    
    return output.getvalue()

def format_date_ddmmyyyy(date: datetime) -> str:
    """Formatea una fecha en DD/MM/YYYY."""
    return date.strftime("%d/%m/%Y")

def log_response(response, test_name, action_name, status_code=None):
    """Registra la respuesta de la API para diagnóstico."""
    status = response.status_code
    expected = f" (esperado: {status_code})" if status_code else ""
    
    logger.info(f"Test: {test_name} | Acción: {action_name} | Status: {status}{expected}")
    
    # Registrar contenido JSON si está disponible
    try:
        content = response.json()
        logger.info(f"Response: {content}")
    except:
        logger.info(f"Response no es JSON: {response.content}")

@pytest.mark.asyncio
async def test_admin_complete_workflow(db_session, clean_db):
    """Test del flujo completo con usuario administrador."""
    test_name = "admin_workflow"
    
    # 1. Crear usuario administrador y explotación
    admin = await create_test_user("admin_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio")
    
    # Generar token para el administrador
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Importar datos (solo admin puede hacerlo)
    csv_data = create_test_csv()
    files = {
        "file": ("test_animals.csv", csv_data, "text/csv")
    }
    
    response = client.post(
        "/api/v1/imports/csv",
        files=files,
        data={
            "encoding": "utf-8",
            "delimiter": ",",
            "explotacio": explotacio.id
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "importar_csv", 200)
    assert response.status_code == 200
    
    # 3. Verificar que los datos se han importado
    response = client.get(
        "/api/v1/animals",
        params={"explotacio": explotacio.id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "listar_animales", 200)
    assert response.status_code == 200
    animales = response.json()["data"]
    assert len(animales) >= 2
    
    # 4. Crear un nuevo animal
    new_animal_data = {
        "nom": "Nuevo-Animal-Admin",
        "explotacio": explotacio.id,
        "genere": "M",
        "estado": "OK",
        "cod": "NAA001",
        "num_serie": "ES987654321",
        "quadra": "Q1",
        "alletar": 0
    }
    
    response = client.post(
        "/api/v1/animals",
        json=new_animal_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "crear_animal", 201)
    assert response.status_code == 201
    nuevo_animal_id = response.json()["data"]["id"]
    
    # 5. Obtener el animal creado
    response = client.get(
        f"/api/v1/animals/{nuevo_animal_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "obtener_animal", 200)
    assert response.status_code == 200
    assert response.json()["data"]["nom"] == "Nuevo-Animal-Admin"
    
    # 6. Verificar estadísticas actualizadas
    response = client.get(
        "/api/v1/dashboard/stats",
        params={"explotacio": explotacio.id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "obtener_estadisticas", 200)
    assert response.status_code == 200
    stats = response.json()
    assert "animales" in stats
    
    # 7. Crear un usuario como admin
    new_user_data = {
        "email": "nuevo_usuario@test.com",
        "username": "nuevo_usuario",
        "password": "password123",
        "role": UserRole.USER,
        "is_active": True
    }
    
    response = client.post(
        "/api/v1/auth/signup",
        json=new_user_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "crear_usuario", 201)
    assert response.status_code == 201
    
    # 8. Listar usuarios
    response = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "listar_usuarios", 200)
    assert response.status_code == 200
    usuarios = response.json()
    assert len(usuarios["items"]) >= 2  # Al menos admin y el nuevo usuario

@pytest.mark.asyncio
async def test_gerente_workflow(db_session, clean_db):
    """Test del flujo con usuario gerente."""
    test_name = "gerente_workflow"
    
    # 1. Crear usuario gerente y explotación
    gerente = await create_test_user("gerente_test", UserRole.GERENTE)
    explotacio = await create_test_explotacio("Test Explotacio Gerente")
    
    # Generar token para el gerente
    settings = get_settings()
    gerente_token = create_access_token({"sub": gerente.username}, settings)
    
    # 2. Intentar importar datos (debe fallar)
    csv_data = create_test_csv()
    files = {
        "file": ("test_animals.csv", csv_data, "text/csv")
    }
    
    response = client.post(
        "/api/v1/imports/csv",
        files=files,
        data={
            "encoding": "utf-8",
            "delimiter": ",",
            "explotacio": explotacio.id
        },
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    log_response(response, test_name, "importar_csv", 403)
    assert response.status_code == 403  # Forbidden
    
    # 3. Listar animales (debe funcionar)
    response = client.get(
        "/api/v1/animals",
        params={"explotacio": explotacio.id},
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    log_response(response, test_name, "listar_animales", 200)
    assert response.status_code == 200
    
    # 4. Crear un nuevo animal (debe funcionar)
    new_animal_data = {
        "nom": "Nuevo-Animal-Gerente",
        "explotacio": explotacio.id,
        "genere": "F",
        "estado": "OK",
        "cod": "NAG001",
        "num_serie": "ES876543210",
        "quadra": "Q2",
        "alletar": 0
    }
    
    response = client.post(
        "/api/v1/animals",
        json=new_animal_data,
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    log_response(response, test_name, "crear_animal", 201)
    assert response.status_code == 201
    nuevo_animal_id = response.json()["data"]["id"]
    
    # 5. Crear un parto para el animal (debe funcionar)
    parto_data = {
        "data": format_date_ddmmyyyy(datetime.now() - timedelta(days=30)),
        "animal_id": nuevo_animal_id,
        "genere_fill": "M",
        "estat_fill": "OK",
        "observacions": "Parto creado por gerente",
        "numero_part": 1
    }
    
    response = client.post(
        "/api/v1/partos",
        json=parto_data,
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    log_response(response, test_name, "crear_parto", 201)
    assert response.status_code == 201
    
    # 6. Crear un usuario como gerente (debe funcionar)
    new_user_data = {
        "email": "nuevo_usuario_gerente@test.com",
        "username": "nuevo_usuario_gerente",
        "password": "password123",
        "role": UserRole.USER,
        "is_active": True
    }
    
    response = client.post(
        "/api/v1/auth/signup",
        json=new_user_data,
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    log_response(response, test_name, "crear_usuario", 201)
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_editor_workflow(db_session, clean_db):
    """Test del flujo con usuario editor."""
    test_name = "editor_workflow"
    
    # 1. Crear usuario editor, admin y explotación
    editor = await create_test_user("editor_test", UserRole.EDITOR)
    admin = await create_test_user("admin_for_editor_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio Editor")
    
    # Generar tokens
    settings = get_settings()
    editor_token = create_access_token({"sub": editor.username}, settings)
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Crear un animal con el admin para luego editarlo con el editor
    new_animal_data = {
        "nom": "Animal-Para-Editor",
        "explotacio": explotacio.id,
        "genere": "M",
        "estado": "OK",
        "cod": "APE001",
        "num_serie": "ES123987456",
        "quadra": "Q3",
        "alletar": 0
    }
    
    response = client.post(
        "/api/v1/animals",
        json=new_animal_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "crear_animal_con_admin", 201)
    assert response.status_code == 201
    animal_id = response.json()["data"]["id"]
    
    # 3. Listar animales con el editor (debe funcionar)
    response = client.get(
        "/api/v1/animals",
        params={"explotacio": explotacio.id},
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    log_response(response, test_name, "listar_animales", 200)
    assert response.status_code == 200
    
    # 4. Actualizar un animal existente con el editor (debe funcionar)
    update_data = {
        "nom": "Animal-Actualizado-Por-Editor"
    }
    
    response = client.patch(
        f"/api/v1/animals/{animal_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    log_response(response, test_name, "actualizar_animal", 200)
    assert response.status_code == 200
    
    # 5. Crear un nuevo animal con el editor (debe fallar)
    new_animal_data = {
        "nom": "Nuevo-Animal-Editor",
        "explotacio": explotacio.id,
        "genere": "M",
        "estado": "OK",
        "cod": "NAE001",
        "num_serie": "ES765432109"
    }
    
    response = client.post(
        "/api/v1/animals",
        json=new_animal_data,
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    log_response(response, test_name, "crear_animal", 403)
    assert response.status_code == 403  # Forbidden
    
    # 6. Intentar crear un usuario con el editor (debe fallar)
    new_user_data = {
        "email": "nuevo_usuario_editor@test.com",
        "username": "nuevo_usuario_editor",
        "password": "password123",
        "role": UserRole.USER,
        "is_active": True
    }
    
    response = client.post(
        "/api/v1/auth/signup",
        json=new_user_data,
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    log_response(response, test_name, "crear_usuario", 403)
    assert response.status_code == 403  # Forbidden

@pytest.mark.asyncio
async def test_cascade_operations(db_session, clean_db):
    """Test de operaciones en cascada."""
    test_name = "cascade_operations"
    
    # 1. Crear usuario admin y explotación
    admin = await create_test_user("admin_cascade_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio Cascade")
    
    # Generar token para el admin
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Crear un animal para pruebas
    new_animal_data = {
        "nom": "Animal-Cascade",
        "explotacio": explotacio.id,
        "genere": "F",
        "estado": "OK",
        "cod": "AC001",
        "num_serie": "ES123123123",
        "quadra": "QC",
        "alletar": 0
    }
    
    response = client.post(
        "/api/v1/animals",
        json=new_animal_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "crear_animal", 201)
    assert response.status_code == 201
    animal_id = response.json()["data"]["id"]
    
    # 3. Crear varios partos para este animal
    for i in range(3):
        parto_data = {
            "data": format_date_ddmmyyyy(datetime.now() - timedelta(days=30*(i+1))),
            "animal_id": animal_id,
            "genere_fill": "M" if i % 2 == 0 else "F",
            "estat_fill": "OK",
            "observacions": f"Parto {i+1} para prueba en cascada",
            "numero_part": i+1
        }
        
        response = client.post(
            "/api/v1/partos",
            json=parto_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        log_response(response, test_name, f"crear_parto_{i+1}", 201)
        assert response.status_code == 201
    
    # 4. Verificar que se crearon los partos
    response = client.get(
        "/api/v1/partos",
        params={"animal_id": animal_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "listar_partos", 200)
    assert response.status_code == 200
    partos = response.json()["data"]
    assert len(partos) == 4
    
    # 5. Eliminar el animal
    response = client.delete(
        f"/api/v1/animals/{animal_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "eliminar_animal", 200)
    assert response.status_code == 200
    
    # 6. Verificar que el animal ya no existe (eliminación completa, no soft delete)
    response = client.get(
        f"/api/v1/animals/{animal_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "verificar_animal_eliminado", 404)
    assert response.status_code == 404  # Not Found, animal ya no existe
    
    # 7. Verificar que los partos se mantienen después de eliminar el animal
    response = client.get(
        "/api/v1/partos",
        params={"animal_id": animal_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    log_response(response, test_name, "verificar_partos_post_eliminacion", 200)
    assert response.status_code == 200
    partos = response.json()["data"]
    assert len(partos) == 4
