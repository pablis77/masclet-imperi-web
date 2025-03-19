"""
Tests para los endpoints de partos.
Este archivo contiene pruebas completas para los endpoints de API relacionados con partos,
siguiendo las mejores prácticas y principios definidos en la estrategia de testing.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from tortoise.exceptions import OperationalError
from app.main import app
from app.models.animal import Animal, Part  # Importar Part directamente desde animal.py, NO desde parto.py
from app.models.explotacio import Explotacio
from datetime import datetime, timedelta, date

# Importar utilidades de test
from tests.api.test_utils import get_valid_test_date, assert_date_equals

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cliente para pruebas
client = TestClient(app)

# Base URL para los endpoints de partos
API_BASE_URL = "/api/v1"

from conftest import initialize_tortoise_test_db

@pytest.fixture(scope="module", autouse=True)
async def initialize_tests(initialize_tortoise_test_db):
    """
    Fixture para inicializar los tests de partos.
    No incluimos app.models.parto porque el modelo Part está en app.models.animal.
    """
    logger.info("Inicializando pruebas de partos con modelo Part desde app.models.animal")
    # No necesitamos hacer nada adicional, ya que el fixture initialize_tortoise_test_db
    # ya se ejecuta como dependencia de este fixture
    yield
    logger.info("Finalizando pruebas de partos")

@pytest.mark.asyncio
async def test_create_parto(clean_db):
    """Test para crear un parto mediante API."""
    logger.info("Iniciando test de creación de parto")
    
    # Primero crear una explotación
    explotacio = await Explotacio.create(nom="Partos API Test", activa=True)
    
    # Crear una vaca madre
    madre = await Animal.create(
        nom="Madre-API",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Datos para el parto (usar fecha dinámica en el pasado)
    fecha_parto = get_valid_test_date(days_in_past=60, format_string="%d/%m/%Y")
    parto_data = {
        "animal_id": madre.id,
        "data": fecha_parto,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    # Crear el parto
    response = client.post(f"{API_BASE_URL}/partos", json=parto_data)
    
    # Verificar respuesta
    assert response.status_code == 201, f"Error al crear parto: {response.text}"
    data = response.json()
    assert "data" in data
    assert data["data"]["animal_id"] == madre.id
    assert data["data"]["genere_fill"] == "M"
    
    # Verificar que el parto se creó en la base de datos
    parto_id = data["data"]["id"]
    parto = await Part.get(id=parto_id)
    assert parto is not None
    assert parto.animal_id == madre.id
    
    # Verificar que la madre ahora tiene un ternero (alletar = 1)
    madre_actualizada = await Animal.get(id=madre.id)
    assert madre_actualizada.alletar == 1
    
    logger.info("Test de creación de parto completado exitosamente")

@pytest.mark.asyncio
async def test_get_parto_by_id(clean_db):
    """Test para obtener un parto específico por su ID."""
    # Crear los datos necesarios
    explotacio = await Explotacio.create(nom="Get Parto Test", activa=True)
    madre = await Animal.create(
        nom="Madre-Get",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Crear un parto (usar fecha dinámica en el pasado)
    fecha_str = get_valid_test_date(days_in_past=90, format_string="%d/%m/%Y")
    fecha = datetime.strptime(fecha_str, "%d/%m/%Y").date()
    parto = await Part.create(
        animal=madre,
        data=fecha,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    # Obtener el parto por su ID
    response = client.get(f"{API_BASE_URL}/partos/{parto.id}")
    
    # Verificar respuesta
    assert response.status_code == 200, f"Error al obtener parto: {response.text}"
    data = response.json()
    assert "data" in data
    assert data["data"]["id"] == parto.id
    assert data["data"]["animal_id"] == madre.id
    assert data["data"]["genere_fill"] == "M"
    # Verificar que la fecha es correcta usando el helper de comparación de fechas
    assert assert_date_equals(data["data"]["data"], fecha_str)
    
    logger.info("Test de obtención de parto por ID completado exitosamente")

@pytest.mark.asyncio
async def test_get_partos_by_madre(clean_db):
    """Test para obtener todos los partos de una madre."""
    # Crear los datos necesarios
    explotacio = await Explotacio.create(nom="Partos Madre Test", activa=True)
    madre = await Animal.create(
        nom="Madre-Multiple",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Crear varios partos para la misma madre (todos con fechas dinámicas en el pasado)
    fechas = [
        get_valid_test_date(days_in_past=120, format_string="%d/%m/%Y"),
        get_valid_test_date(days_in_past=90, format_string="%d/%m/%Y"),
        get_valid_test_date(days_in_past=60, format_string="%d/%m/%Y")
    ]
    for idx, fecha_str in enumerate(fechas, 1):
        fecha = datetime.strptime(fecha_str, "%d/%m/%Y").date()
        await Part.create(
            animal=madre,
            data=fecha,
            genere_fill="M" if idx % 2 == 0 else "F",
            estat_fill="OK",
            numero_part=idx
        )
    
    # Obtener los partos de la madre
    response = client.get(f"{API_BASE_URL}/partos", params={"animal_id": madre.id})
    
    # Verificar respuesta
    assert response.status_code == 200, f"Error al obtener partos por madre: {response.text}"
    data = response.json()
    assert "data" in data
    assert "items" in data["data"]
    assert len(data["data"]["items"]) == 3  # Debe haber 3 partos
    
    # Verificar que todos los partos pertenecen a la madre
    for parto in data["data"]["items"]:
        assert parto["animal_id"] == madre.id
    
    logger.info("Test de obtención de partos por madre completado exitosamente")

@pytest.mark.asyncio
async def test_update_parto(clean_db):
    """Test para actualizar datos de un parto."""
    # Crear los datos necesarios
    explotacio = await Explotacio.create(nom="Update Parto Test", activa=True)
    madre = await Animal.create(
        nom="Madre-Update",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Crear un parto (usar fecha dinámica en el pasado)
    fecha_str = get_valid_test_date(days_in_past=90, format_string="%d/%m/%Y")
    fecha = datetime.strptime(fecha_str, "%d/%m/%Y").date()
    parto = await Part.create(
        animal=madre,
        data=fecha,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    # Datos actualizados (usar fecha dinámica en el pasado)
    nueva_fecha = get_valid_test_date(days_in_past=80, format_string="%d/%m/%Y")
    parto_update_data = {
        "data": nueva_fecha,
        "genere_fill": "F",  # Cambiar género
        "estat_fill": "DEF",  # Cambiar estado (DEF = Defunción/Muerto)
        "numero_part": 1
    }
    
    # Actualizar el parto
    response = client.put(f"{API_BASE_URL}/partos/{parto.id}", json=parto_update_data)
    
    # Verificar respuesta
    assert response.status_code == 200, f"Error al actualizar parto: {response.text}"
    data = response.json()
    assert "data" in data
    assert data["data"]["id"] == parto.id
    assert data["data"]["genere_fill"] == "F"  # Verificar cambio de género
    assert data["data"]["estat_fill"] == "DEF"  # Verificar cambio de estado
    # Verificar cambio de fecha usando el helper de comparación
    assert assert_date_equals(data["data"]["data"], nueva_fecha)
    
    # Verificar que los cambios se guardaron en la base de datos
    parto_actualizado = await Part.get(id=parto.id)
    assert parto_actualizado.genere_fill == "F"
    assert parto_actualizado.estat_fill == "DEF"
    
    logger.info("Test de actualización de parto completado exitosamente")

@pytest.mark.asyncio
async def test_parto_validations(clean_db):
    """Test para verificar validaciones de partos."""
    # Crear datos para las pruebas
    explotacio = await Explotacio.create(nom="Validación Partos", activa=True)
    
    # 1. Validación: Solo hembras pueden tener partos
    macho = await Animal.create(
        nom="Toro-Validación",
        explotacio=explotacio,
        genere="M",  # Macho
        estado="OK"
    )
    
    parto_data = {
        "animal_id": macho.id,
        "data": get_valid_test_date(days_in_past=45, format_string="%d/%m/%Y"),
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"{API_BASE_URL}/partos", json=parto_data)
    assert response.status_code == 400  # Este es un error de negocio, no de validación de esquema
    assert "solo las hembras" in response.json()["detail"].lower()
    
    # 2. Validación: Animal debe existir
    parto_data = {
        "animal_id": 99999,  # ID que no existe
        "data": get_valid_test_date(days_in_past=45, format_string="%d/%m/%Y"),
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"{API_BASE_URL}/partos", json=parto_data)
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()
    
    # 3. Validación: Género del ternero debe ser válido
    hembra = await Animal.create(
        nom="Vaca-Validación",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    parto_data = {
        "animal_id": hembra.id,
        "data": get_valid_test_date(days_in_past=45, format_string="%d/%m/%Y"),
        "genere_fill": "X",  # Género inválido
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"{API_BASE_URL}/partos", json=parto_data)
    assert response.status_code == 422  # Código de error para validación de esquema
    # Verificar que el error está relacionado con el género
    error_details = response.json()["detail"]
    assert any("genere_fill" in error["loc"] for error in error_details)
    
    logger.info("Test de validaciones de parto completado exitosamente")

@pytest.mark.asyncio
async def test_filter_partos_by_date(clean_db):
    """Test para filtrar partos por fecha."""
    # Crear datos para las pruebas
    explotacio = await Explotacio.create(nom="Filtro Fechas", activa=True)
    madre = await Animal.create(
        nom="Madre-Filtro-Fecha",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Importar utilidades de fechas
    from tests.api.test_utils import get_valid_test_date
    
    # Crear partos con diferentes fechas (todas en el pasado)
    # Usar fechas dinámicas relativas a la fecha actual
    fechas = [
        get_valid_test_date(days_in_past=400, format_string="%d/%m/%Y"),  # ~1 año y 1 mes atrás
        get_valid_test_date(days_in_past=300, format_string="%d/%m/%Y"),  # ~10 meses atrás
        get_valid_test_date(days_in_past=200, format_string="%d/%m/%Y"),  # ~6-7 meses atrás
        get_valid_test_date(days_in_past=100, format_string="%d/%m/%Y"),  # ~3 meses atrás
        get_valid_test_date(days_in_past=30, format_string="%d/%m/%Y")    # 1 mes atrás
    ]
    
    # Guardar el año de la fecha más reciente para usar en las pruebas
    fecha_reciente = datetime.strptime(fechas[4], "%d/%m/%Y").date()
    año_reciente = fecha_reciente.year
    
    # Crear los partos en la base de datos
    for idx, fecha_str in enumerate(fechas, 1):
        fecha = datetime.strptime(fecha_str, "%d/%m/%Y").date()
        await Part.create(
            animal=madre,
            data=fecha,
            genere_fill="M",
            estat_fill="OK",
            numero_part=idx
        )
    
    # Filtrar partos del año más reciente
    response = client.get(f"{API_BASE_URL}/partos", params={"year": año_reciente})
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    # Contar cuántos partos hay del año reciente
    partos_año_reciente = sum(1 for fecha in fechas if datetime.strptime(fecha, "%d/%m/%Y").year == año_reciente)
    assert len(data["data"]["items"]) == partos_año_reciente
    
    # Filtrar partos por el mes de la segunda fecha
    mes_segunda_fecha = datetime.strptime(fechas[1], "%d/%m/%Y").month
    response = client.get(f"{API_BASE_URL}/partos", params={"month": mes_segunda_fecha})
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    # Contar cuántos partos hay de ese mes
    partos_mes = sum(1 for fecha in fechas if datetime.strptime(fecha, "%d/%m/%Y").month == mes_segunda_fecha)
    assert len(data["data"]["items"]) == partos_mes
    
    # Filtrar partos por rango de fechas (entre la tercera y quinta fecha)
    fecha_inicio = fechas[2]  # Tercera fecha
    fecha_fin = fechas[4]     # Quinta fecha
    
    response = client.get(f"{API_BASE_URL}/partos", params={
        "start_date": fecha_inicio,
        "end_date": fecha_fin
    })
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    
    # Contar cuántos partos hay en ese rango
    inicio_dt = datetime.strptime(fecha_inicio, "%d/%m/%Y").date()
    fin_dt = datetime.strptime(fecha_fin, "%d/%m/%Y").date()
    partos_en_rango = sum(1 for fecha in fechas if 
                         inicio_dt <= datetime.strptime(fecha, "%d/%m/%Y").date() <= fin_dt)
    
    assert len(data["data"]["items"]) == partos_en_rango
    
    logger.info("Test de filtrado de partos por fecha completado exitosamente")

@pytest.mark.asyncio
async def test_parto_pagination_and_sorting(clean_db):
    """Test para verificar la paginación y ordenación en el listado de partos."""
    # Crear datos para las pruebas
    explotacio = await Explotacio.create(nom="Paginación Test", activa=True)
    madre = await Animal.create(
        nom="Madre-Paginación",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Importar utilidades de fechas si no se ha hecho antes
    from tests.api.test_utils import get_valid_test_date
    
    # Crear 15 partos con diferentes fechas para probar paginación
    # Usar fechas dinámicas siempre en el pasado
    fechas_paginacion = []
    for i in range(15):
        # Generar fechas espaciadas por 15 días, todas en el pasado
        fecha = get_valid_test_date(days_in_past=15 + i*15)
        fechas_paginacion.append(fecha)
        
        await Part.create(
            animal=madre,
            data=fecha,
            genere_fill="M" if i % 2 == 0 else "F",  # Alternar géneros
            estat_fill="OK",
            numero_part=i+1
        )
    
    # Test 1: Verificar paginación por defecto (10 items)
    response = client.get(f"{API_BASE_URL}/partos")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["total"] == 15
    assert len(data["data"]["items"]) == 10  # Por defecto devuelve 10 items
    
    # Test 2: Verificar paginación con offset
    response = client.get(f"{API_BASE_URL}/partos", params={"offset": 10})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]["items"]) == 5  # Quedan 5 items después del offset 10
    
    # Test 3: Verificar paginación con límite personalizado
    response = client.get(f"{API_BASE_URL}/partos", params={"limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]["items"]) == 5  # Solicitamos solo 5 items
    
    # Test 4: Verificar ordenación por fecha (ascendente)
    response = client.get(f"{API_BASE_URL}/partos", params={"sort": "data", "order": "asc"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    dates = [datetime.strptime(item["data"], "%d/%m/%Y").date() for item in data["data"]["items"]]
    assert dates == sorted(dates)  # Verificar que las fechas están ordenadas ascendentemente
    
    # Test 5: Verificar ordenación por fecha (descendente)
    response = client.get(f"{API_BASE_URL}/partos", params={"sort": "data", "order": "desc"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    dates = [datetime.strptime(item["data"], "%d/%m/%Y").date() for item in data["data"]["items"]]
    assert dates == sorted(dates, reverse=True)  # Verificar que las fechas están ordenadas descendentemente
    
    # Test 6: Verificar filtrado por género del ternero
    response = client.get(f"{API_BASE_URL}/partos", params={"genere_fill": "M"})
    assert response.status_code == 200
    data = response.json()
    assert all(item["genere_fill"] == "M" for item in data["data"]["items"])
    
    # Test 7: Verificar paginación y filtrado combinados
    response = client.get(f"{API_BASE_URL}/partos", params={"genere_fill": "F", "limit": 3, "offset": 2})
    assert response.status_code == 200
    data = response.json()
    assert all(item["genere_fill"] == "F" for item in data["data"]["items"])
    assert len(data["data"]["items"]) <= 3  # Puede ser menor si no hay suficientes items que cumplan el filtro
    
    logger.info("Test de paginación y ordenación de partos completado exitosamente")
