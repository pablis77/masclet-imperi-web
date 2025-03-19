"""
Tests para los endpoints de partos.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
client = TestClient(app)

# Usamos los fixtures de conftest.py en la carpeta api

@pytest.mark.asyncio
async def test_create_parto(clean_db):
    """Test para crear un parto mediante API."""
    # Primero crear una explotación
    explotacio = await Explotacio.create(nom="Partos API Test", activa=True)
    
    # Crear una vaca madre
    madre = await Animal.create(
        nom="Madre-API",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Datos para el parto
    fecha_parto = "15/03/2025"
    parto_data = {
        "animal_id": madre.id,
        "data": fecha_parto,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    # Crear el parto
    response = client.post("/api/partos", json=parto_data)
    
    # Verificar respuesta
    assert response.status_code == 201
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
    
    # Crear un parto
    fecha = datetime.strptime("01/01/2025", "%d/%m/%Y").date()
    parto = await Part.create(
        animal=madre,
        data=fecha,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    # Obtener el parto por su ID
    response = client.get(f"/api/partos/{parto.id}")
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["data"]["id"] == parto.id
    assert data["data"]["animal_id"] == madre.id
    assert data["data"]["genere_fill"] == "M"
    assert data["data"]["data"] == "01/01/2025"
    
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
    
    # Crear varios partos para la misma madre
    fechas = ["01/01/2024", "15/03/2024", "10/06/2024"]
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
    response = client.get("/api/partos", params={"animal_id": madre.id})
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 3  # Debe haber 3 partos
    
    # Verificar que todos los partos pertenecen a la madre
    for parto in data["data"]:
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
    
    # Crear un parto
    fecha = datetime.strptime("01/01/2025", "%d/%m/%Y").date()
    parto = await Part.create(
        animal=madre,
        data=fecha,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    # Datos actualizados
    parto_update_data = {
        "data": "15/01/2025",
        "genere_fill": "F",  # Cambiar género
        "estat_fill": "MUERTO",  # Cambiar estado
        "numero_part": 1
    }
    
    # Actualizar el parto
    response = client.put(f"/api/partos/{parto.id}", json=parto_update_data)
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert data["data"]["id"] == parto.id
    assert data["data"]["genere_fill"] == "F"  # Verificar cambio de género
    assert data["data"]["estat_fill"] == "MUERTO"  # Verificar cambio de estado
    assert data["data"]["data"] == "15/01/2025"  # Verificar cambio de fecha
    
    # Verificar que los cambios se guardaron en la base de datos
    parto_actualizado = await Part.get(id=parto.id)
    assert parto_actualizado.genere_fill == "F"
    assert parto_actualizado.estat_fill == "MUERTO"
    
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
        "data": "01/01/2025",
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post("/api/partos", json=parto_data)
    assert response.status_code == 400
    assert "solo las hembras" in response.json()["detail"].lower()
    
    # 2. Validación: Animal debe existir
    parto_data = {
        "animal_id": 99999,  # ID que no existe
        "data": "01/01/2025",
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post("/api/partos", json=parto_data)
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
        "data": "01/01/2025",
        "genere_fill": "X",  # Género inválido
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post("/api/partos", json=parto_data)
    assert response.status_code == 400
    assert "género" in response.json()["detail"].lower()
    
    logger.info("Test de validaciones de parto completado exitosamente")

@pytest.mark.asyncio
async def test_delete_parto_not_allowed(clean_db):
    """Test para verificar que no se permite eliminar partos (historial permanente)."""
    # Crear los datos necesarios
    explotacio = await Explotacio.create(nom="No Delete Parto", activa=True)
    madre = await Animal.create(
        nom="Madre-NoDelete",
        explotacio=explotacio,
        genere="F",
        estado="OK"
    )
    
    # Crear un parto
    fecha = datetime.strptime("01/01/2025", "%d/%m/%Y").date()
    parto = await Part.create(
        animal=madre,
        data=fecha,
        genere_fill="M",
        estat_fill="OK",
        numero_part=1
    )
    
    # Intentar eliminar el parto
    response = client.delete(f"/api/partos/{parto.id}")
    
    # Verificar que se rechaza la eliminación
    assert response.status_code in [403, 405]  # Forbidden o Method Not Allowed
    
    # Verificar que el parto sigue existiendo
    parto_exists = await Part.exists(id=parto.id)
    assert parto_exists is True
    
    logger.info("Test de prohibición de eliminación de partos completado exitosamente")

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
    
    # Crear partos con diferentes fechas
    fechas = ["01/01/2024", "15/03/2024", "10/06/2024", "25/12/2024", "15/03/2025"]
    for idx, fecha_str in enumerate(fechas, 1):
        fecha = datetime.strptime(fecha_str, "%d/%m/%Y").date()
        await Part.create(
            animal=madre,
            data=fecha,
            genere_fill="M",
            estat_fill="OK",
            numero_part=idx
        )
    
    # Filtrar partos de 2024
    response = client.get("/api/partos", params={"year": 2024})
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 4  # 4 partos en 2024
    
    # Filtrar partos de marzo
    response = client.get("/api/partos", params={"month": 3})
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2  # 2 partos en marzo (15/03/2024 y 15/03/2025)
    
    # Filtrar partos por rango de fechas
    response = client.get("/api/partos", params={
        "start_date": "01/06/2024",
        "end_date": "31/12/2024"
    })
    
    # Verificar respuesta
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2  # 2 partos entre junio y diciembre 2024
    
    logger.info("Test de filtrado de partos por fecha completado exitosamente")

@pytest.mark.asyncio
async def test_parto_date_validations(clean_db):
    """Test para verificar validaciones específicas de fechas en partos."""
    # Crear datos para las pruebas
    explotacio = await Explotacio.create(nom="Fecha Validación", activa=True)
    
    # Crear una vaca madre con fecha de nacimiento
    fecha_nacimiento = datetime.strptime("01/01/2023", "%d/%m/%Y").date()
    madre = await Animal.create(
        nom="Madre-Fecha-Val",
        explotacio=explotacio,
        genere="F",
        estado="OK",
        dob=fecha_nacimiento
    )
    
    # Caso 1: Fecha futura (no permitida)
    future_date = datetime.now().date() + timedelta(days=30)
    future_date_str = future_date.strftime("%d/%m/%Y")
    
    parto_data = {
        "data": future_date_str,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"/api/partos?animal_id={madre.id}", json=parto_data)
    assert response.status_code == 400
    assert "fecha del parto no puede ser futura" in response.json()["detail"].lower()
    
    # Caso 2: Animal demasiado joven
    # La madre tiene menos de 15 meses (asumiendo que ese es el requisito mínimo)
    young_date = fecha_nacimiento + timedelta(days=200)  # ~6.5 meses
    young_date_str = young_date.strftime("%d/%m/%Y")
    
    parto_data = {
        "data": young_date_str,
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"/api/partos?animal_id={madre.id}", json=parto_data)
    assert response.status_code == 400
    assert "demasiado joven" in response.json()["detail"].lower()
    
    # Caso 3: Formato de fecha inválido
    parto_data = {
        "data": "fecha-invalida",
        "genere_fill": "M",
        "estat_fill": "OK",
        "numero_part": 1
    }
    
    response = client.post(f"/api/partos?animal_id={madre.id}", json=parto_data)
    assert response.status_code == 400
    
    logger.info("Test de validaciones de fechas de parto completado exitosamente")

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
    
    # Crear 15 partos con diferentes fechas para probar paginación
    for i in range(15):
        # Fechas en orden descendente (más reciente primero)
        fecha = datetime.now().date() - timedelta(days=i*30)
        await Part.create(
            animal=madre,
            data=fecha,
            genere_fill="M" if i % 2 == 0 else "F",  # Alternar géneros
            estat_fill="OK",
            numero_part=i+1
        )
    
    # Test 1: Verificar paginación por defecto (10 items)
    response = client.get("/api/partos")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["data"]) == 10  # Por defecto devuelve 10 items
    
    # Test 2: Verificar paginación con offset
    response = client.get("/api/partos", params={"offset": 10})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5  # Quedan 5 items después del offset 10
    
    # Test 3: Verificar paginación con límite personalizado
    response = client.get("/api/partos", params={"limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5  # Solicitamos solo 5 items
    
    # Test 4: Verificar ordenación por fecha (ascendente)
    response = client.get("/api/partos", params={"sort": "data", "order": "asc"})
    assert response.status_code == 200
    data = response.json()
    dates = [datetime.strptime(item["data"], "%d/%m/%Y").date() for item in data["data"]]
    assert dates == sorted(dates)  # Verificar que las fechas están ordenadas ascendentemente
    
    # Test 5: Verificar ordenación por fecha (descendente)
    response = client.get("/api/partos", params={"sort": "data", "order": "desc"})
    assert response.status_code == 200
    data = response.json()
    dates = [datetime.strptime(item["data"], "%d/%m/%Y").date() for item in data["data"]]
    assert dates == sorted(dates, reverse=True)  # Verificar que las fechas están ordenadas descendentemente
    
    # Test 6: Verificar filtrado por género del ternero
    response = client.get("/api/partos", params={"genere_fill": "M"})
    assert response.status_code == 200
    data = response.json()
    assert all(item["genere_fill"] == "M" for item in data["data"])
    
    # Test 7: Verificar paginación y filtrado combinados
    response = client.get("/api/partos", params={"genere_fill": "F", "limit": 3, "offset": 2})
    assert response.status_code == 200
    data = response.json()
    assert all(item["genere_fill"] == "F" for item in data["data"])
    assert len(data["data"]) <= 3  # Puede ser menor si no hay suficientes items que cumplan el filtro
    
    logger.info("Test de paginación y ordenación de partos completado exitosamente")
