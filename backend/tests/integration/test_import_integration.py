"""
Test de integración para la importación de datos.
Verifica el flujo completo de importación de CSV y la correcta creación de entidades.
"""
import pytest
import io
import csv
from fastapi.testclient import TestClient
from tortoise.transactions import in_transaction
from app.main import app
from app.models.user import User, UserRole
from app.models.animal import Animal, Part, Genere, Estado, EstadoAlletar
from app.models.explotacio import Explotacio
from app.core.auth import create_access_token, get_password_hash
from app.core.config import get_settings
from datetime import datetime, timedelta
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)
client = TestClient(app)

# Helpers para crear datos de prueba
async def create_test_user(username: str, role: UserRole) -> User:
    """Crea un usuario de prueba con el rol especificado"""
    user = await User.create_user(
        username=username,
        email=f"{username}@test.com",
        password="password",
        role=role
    )
    return user

async def create_test_explotacio(name: str) -> Explotacio:
    """Crea una explotación de prueba con el nombre dado"""
    explotacio = await Explotacio.create(
        nom=name,
        direccion="Test Address",
        municipio="Test City",
        provincia="Test Province",
        codigo_postal="12345",
        telefono="123456789"
    )
    return explotacio

def generate_test_csv(filename: str, rows: List[Dict]) -> io.BytesIO:
    """
    Genera un archivo CSV de prueba en memoria
    
    Args:
        filename: Nombre del archivo (sólo para registro)
        rows: Lista de diccionarios con los datos
    
    Returns:
        BytesIO: Contenido del CSV en memoria
    """
    # Definir todos los campos posibles que pueden aparecer en cualquier fila
    all_fields = [
        "nom", "cod", "num_serie", "explotacio", "genere", "estado", 
        "alletar", "data_naixement", "quadra", "mare", "pare",
        "part", "genere_t", "estado_t"
    ]
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=all_fields)
    writer.writeheader()
    writer.writerows(rows)
    
    logger.info(f"Generado CSV de prueba {filename} con {len(rows)} filas")
    return io.BytesIO(output.getvalue().encode('utf-8'))

def verify_import_response(response, expected_total, expected_success, expected_errors=0):
    """Verifica que la respuesta de importación sea correcta"""
    assert response.status_code == 200, f"Status code incorrecto: {response.status_code}"
    data = response.json()
    
    assert "result" in data, "No se encontró el campo 'result' en la respuesta"
    result = data["result"]
    
    assert result["total"] == expected_total, f"Total incorrecto: {result['total']} != {expected_total}"
    assert result["success"] == expected_success, f"Success incorrecto: {result['success']} != {expected_success}"
    assert result["errors"] == expected_errors, f"Errors incorrecto: {result['errors']} != {expected_errors}"
    
    return data

@pytest.mark.asyncio
async def test_csv_import_successful(db_session, clean_db):
    """Test de importación exitosa de CSV con datos completos"""
    test_name = "csv_import_successful"
    
    # 1. Crear un usuario admin y una explotación
    admin = await create_test_user("admin_import_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio Import")
    
    # Generar token
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Preparar datos para el CSV
    csv_data = [
        {
            "nom": "Animal Test 1",
            "cod": "A001",
            "num_serie": "1234567890",
            "explotacio": "Test Explotacio Import",
            "genere": "F",
            "estado": "OK",
            "alletar": "1",
            "data_naixement": "01/01/2022",
            "quadra": "Q1",
            "mare": "Madre Test",
            "pare": "Padre Test"
        },
        {
            "nom": "Animal Test 2",
            "cod": "A002",
            "num_serie": "0987654321",
            "explotacio": "Test Explotacio Import",
            "genere": "M",
            "estado": "OK",
            "data_naixement": "02/02/2022",
            "quadra": "Q2"
        },
        {
            "nom": "Animal Test 3",
            "cod": "A003",
            "num_serie": "1122334455",
            "explotacio": "Test Explotacio Import",
            "genere": "F",
            "estado": "OK",
            "alletar": "1",
            "data_naixement": "03/03/2022",
            "quadra": "Q1",
            "part": "01/01/2023",
            "genere_t": "M",
            "estado_t": "OK"
        }
    ]
    
    # 3. Generar archivo CSV de prueba
    csv_file = generate_test_csv("test_import.csv", csv_data)
    
    # 4. Realizar la importación
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_import.csv", csv_file, "text/csv")},
        data={"description": "Test import for integration testing"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 5. Verificar que la respuesta sea correcta
    data = verify_import_response(response, expected_total=3, expected_success=3)
    logger.info(f"Importación exitosa con ID: {data['id']}")
    
    # 6. Verificar que los animales se hayan creado en la base de datos
    animals = await Animal.all()
    assert len(animals) == 3, f"Se crearon {len(animals)} animales, se esperaban 3"
    
    # Verificar que el animal con parto tenga el parto registrado
    animal_with_parto = await Animal.filter(nom="Animal Test 3").first().prefetch_related("partos")
    assert animal_with_parto is not None, "No se encontró el animal con parto"
    
    partos = await animal_with_parto.partos.all()
    assert len(partos) == 1, f"El animal tiene {len(partos)} partos, se esperaba 1"
    assert partos[0].genere_fill == Genere.MASCLE, f"El género del ternero es incorrecto: {partos[0].genere_fill}"

@pytest.mark.asyncio
async def test_csv_import_with_errors(db_session, clean_db):
    """Test de importación de CSV con algunos errores en los datos"""
    test_name = "csv_import_with_errors"
    
    # 1. Crear un usuario admin y una explotación
    admin = await create_test_user("admin_error_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio Errors")
    
    # Generar token
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Preparar datos para el CSV (con errores)
    csv_data = [
        {
            "nom": "Animal Correcto",
            "cod": "E001",
            "explotacio": "Test Explotacio Errors",
            "genere": "F",
            "estado": "OK",
            "data_naixement": "01/01/2022"
        },
        {
            # Sin nombre (error)
            "cod": "E002",
            "explotacio": "Test Explotacio Errors",
            "genere": "M",
            "estado": "OK"
        },
        {
            "nom": "Animal Macho Con Parto",
            "cod": "E003",
            "explotacio": "Test Explotacio Errors",
            "genere": "M",  # Macho con parto (error)
            "estado": "OK",
            "part": "01/01/2023"
        },
        {
            "nom": "Animal Explotacion Invalida",
            "cod": "E004",
            "explotacio": "Explotacion Inexistente",  # No existe (error)
            "genere": "F",
            "estado": "OK"
        }
    ]
    
    # 3. Generar archivo CSV de prueba
    csv_file = generate_test_csv("test_import_errors.csv", csv_data)
    
    # 4. Realizar la importación
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_import_errors.csv", csv_file, "text/csv")},
        data={"description": "Test import with errors"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 5. Verificar que la respuesta sea correcta (1 éxito, 3 errores)
    data = verify_import_response(response, expected_total=4, expected_success=1, expected_errors=3)
    logger.info(f"Importación con errores completada. ID: {data['id']}")
    
    # 6. Verificar que solo se haya creado un animal en la base de datos
    animals = await Animal.all()
    assert len(animals) == 1, f"Se crearon {len(animals)} animales, se esperaba 1"
    assert animals[0].nom == "Animal Correcto", f"El nombre del animal es incorrecto: {animals[0].nom}"

@pytest.mark.asyncio
async def test_csv_import_by_non_admin(db_session, clean_db):
    """Test de intentar importar un CSV por un usuario no administrador"""
    test_name = "csv_import_by_non_admin"
    
    # 1. Crear usuarios con diferentes roles
    editor = await create_test_user("editor_import_test", UserRole.EDITOR)
    gerente = await create_test_user("gerente_import_test", UserRole.GERENTE)
    user = await create_test_user("user_import_test", UserRole.USER)
    explotacio = await create_test_explotacio("Test Explotacio Permisos")
    
    # Generar tokens
    settings = get_settings()
    editor_token = create_access_token({"sub": editor.username}, settings)
    gerente_token = create_access_token({"sub": gerente.username}, settings)
    user_token = create_access_token({"sub": user.username}, settings)
    
    # 2. Preparar datos para el CSV
    csv_data = [
        {
            "nom": "Animal Test Permisos",
            "cod": "P001",
            "explotacio": "Test Explotacio Permisos",
            "genere": "F",
            "estado": "OK"
        }
    ]
    
    # 3. Generar archivo CSV de prueba
    csv_file = generate_test_csv("test_permisos.csv", csv_data)
    
    # 4. Intentar importar con un usuario EDITOR
    response_editor = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_permisos.csv", csv_file, "text/csv")},
        data={"description": "Test permisos editor"},
        headers={"Authorization": f"Bearer {editor_token}"}
    )
    assert response_editor.status_code == 403, f"Status code incorrecto para EDITOR: {response_editor.status_code}"
    
    # Rebobinar el archivo para usarlo de nuevo
    csv_file.seek(0)
    
    # 5. Intentar importar con un usuario GERENTE
    response_gerente = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_permisos.csv", csv_file, "text/csv")},
        data={"description": "Test permisos gerente"},
        headers={"Authorization": f"Bearer {gerente_token}"}
    )
    assert response_gerente.status_code == 403, f"Status code incorrecto para GERENTE: {response_gerente.status_code}"
    
    # Rebobinar el archivo para usarlo de nuevo
    csv_file.seek(0)
    
    # 6. Intentar importar con un usuario USER
    response_user = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_permisos.csv", csv_file, "text/csv")},
        data={"description": "Test permisos user"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response_user.status_code == 403, f"Status code incorrecto para USER: {response_user.status_code}"
    
    # 7. Verificar que no se haya creado ningún animal
    animals = await Animal.all()
    assert len(animals) == 0, f"Se crearon {len(animals)} animales cuando no debería haberse creado ninguno"

@pytest.mark.asyncio
async def test_invalid_csv_file(db_session, clean_db):
    """Test de intentar importar un archivo que no es CSV"""
    test_name = "invalid_csv_file"
    
    # 1. Crear un usuario admin
    admin = await create_test_user("admin_file_test", UserRole.ADMIN)
    
    # Generar token
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Crear un archivo no-CSV
    text_file = io.BytesIO(b"Este no es un archivo CSV")
    
    # 3. Intentar importar el archivo
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test.txt", text_file, "text/plain")},
        data={"description": "Test archivo inválido"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 4. Verificar que se rechace el archivo
    assert response.status_code == 400, f"Status code incorrecto: {response.status_code}"
    assert "El archivo debe ser CSV" in response.text, f"Mensaje de error incorrecto: {response.text}"

@pytest.mark.asyncio
async def test_csv_import_and_query(db_session, clean_db):
    """Test de importación CSV y posterior consulta de los datos importados"""
    test_name = "csv_import_and_query"
    
    # 1. Crear un usuario admin y una explotación
    admin = await create_test_user("admin_query_test", UserRole.ADMIN)
    explotacio = await create_test_explotacio("Test Explotacio Query")
    
    # Generar token
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Preparar datos para el CSV
    current_year = datetime.now().year
    csv_data = [
        {
            "nom": "Animal Query 1",
            "cod": "Q001",
            "explotacio": "Test Explotacio Query",
            "genere": "F",
            "estado": "OK",
            "alletar": "1",
            "data_naixement": f"01/01/{current_year-2}",  # 2 años
            "quadra": "QA",
            "mare": "Madre Query",
            "part": f"01/01/{current_year}",  # Este año
            "genere_t": "M",
            "estado_t": "OK"
        },
        {
            "nom": "Animal Query 2",
            "cod": "Q002",
            "explotacio": "Test Explotacio Query",
            "genere": "F",
            "estado": "OK",
            "alletar": "1",
            "data_naixement": f"01/01/{current_year-3}",  # 3 años
            "quadra": "QB",
            "part": f"01/02/{current_year}",  # Este año
            "genere_t": "M",
            "estado_t": "OK"
        },
        {
            "nom": "Animal Query 3",
            "cod": "Q003",
            "explotacio": "Test Explotacio Query",
            "genere": "M",
            "estado": "OK",
            "data_naixement": f"01/01/{current_year-1}",  # 1 año
            "quadra": "QC"
        }
    ]
    
    # 3. Generar archivo CSV de prueba
    csv_file = generate_test_csv("test_query.csv", csv_data)
    
    # 4. Realizar la importación
    response = client.post(
        "/api/v1/imports/csv",
        files={"file": ("test_query.csv", csv_file, "text/csv")},
        data={"description": "Test import for querying"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    # 5. Verificar que la importación sea exitosa
    verify_import_response(response, expected_total=3, expected_success=3)
    
    # 6. Consultar animales
    response_animals = client.get(
        "/api/v1/animals/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response_animals.status_code == 200, f"Status code incorrecto: {response_animals.status_code}"
    animals_data = response_animals.json()
    
    # Comprobar que se devuelven datos
    assert "data" in animals_data, "No se encontró el campo 'data' en la respuesta"
    
    # Verificar la estructura de la respuesta
    data = animals_data["data"]
    assert "items" in data, "No se encontró el campo 'items' en la respuesta"
    assert "total" in data, "No se encontró el campo 'total' en la respuesta"
    assert data["total"] == 3, f"Total de animales incorrecto: {data['total']}"
    
    # Verificar que los animales tienen los datos correctos
    animals = data["items"]
    assert len(animals) == 3, f"Número de animales incorrecto: {len(animals)}"
    assert any(a["nom"] == "Animal Query 1" for a in animals), "No se encontró el Animal Query 1"
    assert any(a["nom"] == "Animal Query 2" for a in animals), "No se encontró el Animal Query 2"
    assert any(a["nom"] == "Animal Query 3" for a in animals), "No se encontró el Animal Query 3"
    
    # 7. Consultar partos
    response_partos = client.get(
        "/api/v1/partos/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response_partos.status_code == 200, f"Status code incorrecto: {response_partos.status_code}"
    partos_data = response_partos.json()
    
    # Comprobar que se devuelven datos
    assert "data" in partos_data, "No se encontró el campo 'data' en la respuesta"
    
    # Verificar la estructura de la respuesta
    data_partos = partos_data["data"]
    assert "items" in data_partos, "No se encontró el campo 'items' en los datos de partos"
    assert "total" in data_partos, "No se encontró el campo 'total' en los datos de partos"
    assert data_partos["total"] == 2, f"Total de partos incorrecto: {data_partos['total']}"
    
    # Verificar que los partos se corresponden con los animales importados
    partos = data_partos["items"]
    assert len(partos) == 2, f"Número de partos incorrecto: {len(partos)}"
    
    # 8. Consultar dashboard para verificar estadísticas
    response_dashboard = client.get(
        "/api/v1/dashboard/resumen",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response_dashboard.status_code == 200, f"Status code incorrecto: {response_dashboard.status_code}"
    dashboard_data = response_dashboard.json()
    
    # Verificar que el dashboard contiene los datos correctos
    assert "total_animales" in dashboard_data, "No se encontró el campo 'total_animales' en el dashboard"
    assert dashboard_data["total_animales"] == 3, f"Total de animales en dashboard incorrecto: {dashboard_data['total_animales']}"
    
    # Verificar animales activos
    assert "animales_activos" in dashboard_data, "No se encontró el campo 'animales_activos' en el dashboard"
    assert dashboard_data["animales_activos"] == 3, f"Animales activos incorrecto: {dashboard_data['animales_activos']}"
    
    # Verificar porcentaje
    assert "porcentaje_activos" in dashboard_data, "No se encontró el campo 'porcentaje_activos' en el dashboard"
    assert dashboard_data["porcentaje_activos"] == 100.0, f"Porcentaje activos incorrecto: {dashboard_data['porcentaje_activos']}"
