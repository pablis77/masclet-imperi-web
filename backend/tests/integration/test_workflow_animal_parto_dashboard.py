"""
Test de integración para el flujo completo: creación de animal -> añadir parto -> verificar dashboard.
Verifica que los datos se propagan correctamente a través del sistema y las estadísticas se actualizan.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.main import app
from app.models.animal import Animal, Genere, Estado, Part
from app.models.explotacio import Explotacio
from app.models.user import User, UserRole
from app.core.auth import create_access_token
from app.core.config import get_settings

logger = logging.getLogger(__name__)
client = TestClient(app)

async def create_test_user(username, role=UserRole.ADMIN):
    """Crea un usuario de prueba"""
    return await User.create_user(
        username=username,
        password="testpassword",
        email=f"{username}@test.com",
        role=role
    )

async def create_test_explotacio(nombre):
    """Crea una explotación de prueba"""
    return await Explotacio.create(
        nom=nombre,
        activa=True
    )

def get_valid_test_date(days_ago=30):
    """Genera una fecha válida para tests (en el pasado)"""
    return datetime.now() - timedelta(days=days_ago)

@pytest.mark.asyncio
async def test_create_animal_add_parto_verify_dashboard():
    """
    Test que verifica el flujo completo:
    1. Crear una explotación
    2. Crear un animal (hembra)
    3. Añadir un parto al animal
    4. Verificar que los datos se reflejan correctamente en el dashboard
    """
    # 1. Crear usuario admin y obtener token
    admin = await create_test_user("admin_workflow", UserRole.ADMIN)
    settings = get_settings()
    admin_token = create_access_token({"sub": admin.username}, settings)
    
    # 2. Crear una explotación
    explotacio = await create_test_explotacio("Explotación Test Workflow")
    
    # 3. Obtener estadísticas iniciales del dashboard
    response_dashboard_inicial = client.get(
        "/api/v1/dashboard/resumen",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response_dashboard_inicial.status_code == 200, f"Status code incorrecto: {response_dashboard_inicial.status_code}"
    dashboard_inicial = response_dashboard_inicial.json()
    total_animales_inicial = dashboard_inicial["total_animales"]
    animales_activos_inicial = dashboard_inicial["animales_activos"]
    logger.info(f"Estadísticas iniciales: {total_animales_inicial} animales, {animales_activos_inicial} activos")
    
    # 4. Crear un animal (hembra)
    dob = get_valid_test_date(days_ago=365)  # 1 año de edad
    animal_data = {
        "nom": "Vaca Test Workflow",
        "cod": "VTW001",
        "num_serie": "ES123456789",
        "explotacio": explotacio.id,
        "genere": Genere.FEMELLA.value,
        "estado": Estado.OK.value,
        "alletar": True,
        "dob": dob.strftime("%d/%m/%Y"),
        "quadra": "Q1"
    }
    
    response_animal = client.post(
        "/api/v1/animals/",
        json=animal_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_animal.status_code == 201, f"Status code incorrecto: {response_animal.status_code}"
    animal_creado = response_animal.json()
    assert "data" in animal_creado, f"No se encontró el campo 'data' en la respuesta: {animal_creado}"
    animal_id = animal_creado["data"]["id"]
    logger.info(f"Animal creado con ID: {animal_id}")
    
    # 5. Verificar que el dashboard se ha actualizado con el nuevo animal
    response_dashboard_post_animal = client.get(
        "/api/v1/dashboard/resumen",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    dashboard_post_animal = response_dashboard_post_animal.json()
    assert dashboard_post_animal["total_animales"] == total_animales_inicial + 1, \
        f"Total de animales incorrecto: {dashboard_post_animal['total_animales']} vs {total_animales_inicial + 1}"
    assert dashboard_post_animal["animales_activos"] == animales_activos_inicial + 1, \
        f"Animales activos incorrecto: {dashboard_post_animal['animales_activos']} vs {animales_activos_inicial + 1}"
    
    # 6. Añadir un parto al animal
    parto_date = get_valid_test_date(days_ago=30)  # Parto hace 30 días
    parto_data = {
        "animal_id": animal_id,
        "data": parto_date.strftime("%d/%m/%Y"),
        "genere_fill": Genere.MASCLE.value,
        "estat_fill": Estado.OK.value,
        "numero_part": 1,
        "observacions": "Parto de prueba para workflow"
    }
    
    response_parto = client.post(
        "/api/v1/partos/",
        json=parto_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_parto.status_code == 201, f"Status code incorrecto: {response_parto.status_code}"
    parto_creado = response_parto.json()
    assert "data" in parto_creado, f"No se encontró el campo 'data' en la respuesta: {parto_creado}"
    parto_id = parto_creado["data"]["id"]
    logger.info(f"Parto creado con ID: {parto_id}")
    
    # 7. Verificar que el animal tiene el parto registrado
    response_animal_con_parto = client.get(
        f"/api/v1/animals/{animal_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_animal_con_parto.status_code == 200, f"Status code incorrecto: {response_animal_con_parto.status_code}"
    animal_con_parto = response_animal_con_parto.json()
    
    # Verificar que hay partos asociados al animal
    response_partos_animal = client.get(
        f"/api/v1/partos/",
        params={"animal_id": animal_id},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_partos_animal.status_code == 200, f"Status code incorrecto: {response_partos_animal.status_code}"
    partos_animal = response_partos_animal.json()
    assert "data" in partos_animal, "No se encontró el campo 'data' en la respuesta"
    assert "items" in partos_animal["data"], "No se encontró el campo 'items' en la respuesta"
    partos = partos_animal["data"]["items"]
    assert len(partos) == 1, f"Se esperaba 1 parto, se encontraron {len(partos)}"
    assert partos[0]["id"] == parto_id, f"ID de parto incorrecto: {partos[0]['id']} vs {parto_id}"
    
    # 8. Verificar dashboard por explotación
    response_dashboard_explotacion = client.get(
        f"/api/v1/dashboard/explotacions/{explotacio.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_dashboard_explotacion.status_code == 200, f"Status code incorrecto: {response_dashboard_explotacion.status_code}"
    dashboard_explotacion = response_dashboard_explotacion.json()
        
    # Verificar que la explotación tiene 1 animal
    assert dashboard_explotacion["animales"]["total"] == 1, \
        f"Total de animales incorrecto: {dashboard_explotacion['animales']['total']} vs 1"
    assert dashboard_explotacion["animales"]["hembras"] == 1, \
        f"Total de hembras incorrecto: {dashboard_explotacion['animales']['hembras']} vs 1"
    assert dashboard_explotacion["animales"]["machos"] == 0, \
        f"Total de machos incorrecto: {dashboard_explotacion['animales']['machos']} vs 0"
            
    # Verificar que se registró el parto
    assert dashboard_explotacion["partos"]["total"] == 1, \
        f"Total de partos incorrecto: {dashboard_explotacion['partos']['total']} vs 1"
    logger.info("Verificación de dashboard por explotación completada con éxito")
    
    # 9. Verificar listado de partos
    response_partos = client.get(
        "/api/v1/partos/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_partos.status_code == 200, f"Status code incorrecto: {response_partos.status_code}"
    partos_data = response_partos.json()
    assert "data" in partos_data, "No se encontró el campo 'data' en la respuesta"
    assert "items" in partos_data["data"], "No se encontró el campo 'items' en la respuesta"
    
    # Verificar que el parto creado está en el listado
    partos_items = partos_data["data"]["items"]
    assert any(p["id"] == parto_id for p in partos_items), f"No se encontró el parto con ID {parto_id} en el listado"
    
    # 10. Generar otro animal y verificar dashboard
    animal_data_2 = {
        "nom": "Toro Test Workflow",
        "cod": "TTW001",
        "num_serie": "ES987654321",
        "explotacio": explotacio.id,
        "genere": Genere.MASCLE.value,
        "estado": Estado.OK.value,
        "alletar": False,
        "data_naixement": get_valid_test_date(days_ago=730).strftime("%d/%m/%Y"),  # 2 años
        "quadra": "Q2"
    }
    
    response_animal_2 = client.post(
        "/api/v1/animals/",
        json=animal_data_2,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_animal_2.status_code == 201, f"Status code incorrecto: {response_animal_2.status_code}"
    
    # Verificar dashboard final
    response_dashboard_final = client.get(
        "/api/v1/dashboard/resumen",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_dashboard_final.status_code == 200, f"Status code incorrecto: {response_dashboard_final.status_code}"
    dashboard_final = response_dashboard_final.json()
    
    # Verificar que hay 2 animales más que al inicio
    assert dashboard_final["total_animales"] == total_animales_inicial + 2, \
        f"Total de animales final incorrecto: {dashboard_final['total_animales']} vs {total_animales_inicial + 2}"
    
    # Verificar dashboard de la explotación nuevamente
    response_dashboard_explotacion_final = client.get(
        f"/api/v1/dashboard/explotacions/{explotacio.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response_dashboard_explotacion_final.status_code == 200, f"Status code incorrecto: {response_dashboard_explotacion_final.status_code}"
    dashboard_explotacion_final = response_dashboard_explotacion_final.json()
    
    # Verificar que la explotación tiene 2 animales
    assert dashboard_explotacion_final["animales"]["total"] == 2, \
        f"Total de animales incorrecto para la explotación: {dashboard_explotacion_final['animales']['total']}"
