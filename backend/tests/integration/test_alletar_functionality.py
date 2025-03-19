"""
Test de funcionalidad alletar con datos reales.
"""
import pytest
import logging
from fastapi.testclient import TestClient
from app.main import app
from app.models.animal import Animal
from app.models.animal import Part
from app.models.explotacio import Explotacio
from tortoise.contrib.test import initializer, finalizer

logger = logging.getLogger(__name__)
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def initialize_tests():
    initializer(
        modules=["app.models.animal", "app.models.parto", "app.models.explotacio"]
    )
    yield
    finalizer()

@pytest.mark.asyncio
async def test_gurans_alletar_state():
    """Test para verificar el estado alletar de los animales de Gurans."""
    try:
        # Obtener la explotación Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        if not gurans:
            gurans = await Explotacio.create(nom="Gurans", activa=True)
            logger.info(f"Explotación Gurans creada con ID: {gurans.id}")
        
        # Verificar vacas con alletar activo
        vacas_amamantando = await Animal.filter(
            explotacio=gurans,
            genere="F",
            alletar__gt=0
        ).all()
        
        # Contar totales
        total_terneros = sum(vaca.alletar for vaca in vacas_amamantando if vaca.alletar is not None)
        
        logger.info(f"Vacas amamantando en Gurans: {len(vacas_amamantando)}")
        logger.info(f"Total de terneros: {total_terneros}")
        
        # Verificar que cada toro (M) tenga alletar=None
        toros = await Animal.filter(explotacio=gurans, genere="M").all()
        for toro in toros:
            assert toro.alletar is None, f"Toro {toro.nom} tiene alletar={toro.alletar}, debe ser None"
        
        logger.info(f"Verificados {len(toros)} toros con alletar=None")
        
        # Mostrar distribución de estados alletar en vacas
        vacas = await Animal.filter(explotacio=gurans, genere="F").all()
        
        alletar_0 = len([v for v in vacas if v.alletar == 0])
        alletar_1 = len([v for v in vacas if v.alletar == 1])
        alletar_2 = len([v for v in vacas if v.alletar == 2])
        alletar_null = len([v for v in vacas if v.alletar is None])
        
        logger.info(f"Distribución alletar en vacas de Gurans:")
        logger.info(f"  - No amamantando (0): {alletar_0}")
        logger.info(f"  - Un ternero (1): {alletar_1}")
        logger.info(f"  - Dos terneros (2): {alletar_2}")
        logger.info(f"  - Sin datos (null): {alletar_null}")
        
        # Verificar coherencia entre partos y alletar
        vacas_con_partos = await Animal.filter(
            explotacio=gurans,
            genere="F"
        ).prefetch_related("parts").all()
        
        for vaca in vacas_con_partos:
            partos = await Part.filter(animal=vaca).all()
            if len(partos) > 0 and vaca.alletar is not None:
                logger.info(f"Vaca {vaca.nom}: {len(partos)} partos, alletar={vaca.alletar}")
        
    except Exception as e:
        logger.error(f"Error en test alletar: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_update_alletar_state():
    """Test para actualizar el estado alletar y verificar las estadísticas."""
    try:
        # Obtener la explotación Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        assert gurans is not None, "No se encontró la explotación Gurans"
        
        # Crear una vaca de prueba
        vaca_test = await Animal.create(
            nom="Test-Alletar",
            explotacio=gurans,
            genere="F",
            estado="OK",
            alletar=0  # Inicialmente sin amamantar
        )
        
        # Crear un parto para esta vaca
        await Part.create(
            animal=vaca_test,
            data="01/03/2025",
            genere_fill="M",
            estat_fill="OK",
            numero_part=1
        )
        
        # Verificar estado inicial
        response = client.get(f"/api/animals/{vaca_test.id}")
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 0
        
        # Obtener estadísticas iniciales
        response = client.get("/api/dashboard/stats", params={"explotacio_id": gurans.id})
        assert response.status_code == 200
        initial_stats = response.json()["data"]
        initial_terneros = initial_stats.get("total_terneros", 0)
        
        # Actualizar a alletar=1 (un ternero)
        update_data = {"alletar": 1}
        response = client.put(f"/api/animals/{vaca_test.id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 1
        
        # Verificar que las estadísticas se actualizan
        response = client.get("/api/dashboard/stats", params={"explotacio_id": gurans.id})
        assert response.status_code == 200
        updated_stats = response.json()["data"]
        updated_terneros = updated_stats.get("total_terneros", 0)
        
        assert updated_terneros == initial_terneros + 1, "El contador de terneros no aumentó correctamente"
        
        # Actualizar a alletar=2 (dos terneros)
        update_data = {"alletar": 2}
        response = client.put(f"/api/animals/{vaca_test.id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["data"]["alletar"] == 2
        
        # Verificar nuevamente las estadísticas
        response = client.get("/api/dashboard/stats", params={"explotacio_id": gurans.id})
        assert response.status_code == 200
        final_stats = response.json()["data"]
        final_terneros = final_stats.get("total_terneros", 0)
        
        assert final_terneros == initial_terneros + 2, "El contador de terneros no aumentó correctamente a 2"
        
        # Limpiar - Eliminar la vaca de prueba
        await vaca_test.delete()
        logger.info("Test de actualización de alletar completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de actualización alletar: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_alletar_validation():
    """Test para verificar las validaciones del campo alletar."""
    try:
        # Obtener la explotación Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        assert gurans is not None, "No se encontró la explotación Gurans"
        
        # 1. Crear un toro e intentar establecer alletar=1 (debería fallar)
        toro_data = {
            "nom": "Toro-Alletar-Test",
            "explotacio_id": gurans.id,
            "genere": "M",
            "estado": "OK",
            "alletar": 1  # Esto debería ser rechazado
        }
        
        response = client.post("/api/animals", json=toro_data)
        assert response.status_code in [400, 422], "Se permitió crear un toro con alletar=1"
        
        # 2. Crear una vaca con valor alletar inválido (debería fallar)
        vaca_data_invalid = {
            "nom": "Vaca-Alletar-Invalid",
            "explotacio_id": gurans.id,
            "genere": "F",
            "estado": "OK",
            "alletar": 3  # Valor inválido, solo 0, 1, 2 son válidos
        }
        
        response = client.post("/api/animals", json=vaca_data_invalid)
        assert response.status_code in [400, 422], "Se permitió crear una vaca con alletar=3"
        
        # 3. Crear una vaca con alletar válido (debería funcionar)
        vaca_data_valid = {
            "nom": "Vaca-Alletar-Valid",
            "explotacio_id": gurans.id,
            "genere": "F",
            "estado": "OK",
            "alletar": 1
        }
        
        response = client.post("/api/animals", json=vaca_data_valid)
        assert response.status_code == 201, f"Error al crear vaca con alletar válido: {response.text}"
        
        # Limpiar - Eliminar la vaca creada
        vaca_id = response.json()["data"]["id"]
        vaca = await Animal.get(id=vaca_id)
        await vaca.delete()
        
        logger.info("Test de validación de alletar completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de validación alletar: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_alletar_api_filters():
    """Test para verificar los filtros de API para el campo alletar."""
    try:
        # Obtener la explotación Gurans
        gurans = await Explotacio.get_or_none(nom="Gurans")
        assert gurans is not None, "No se encontró la explotación Gurans"
        
        # Crear vacas con diferentes estados de alletar para las pruebas
        vacas_test = []
        
        # Vaca sin amamantar
        vaca1 = await Animal.create(
            nom="Vaca-Filter-0",
            explotacio=gurans,
            genere="F",
            estado="OK",
            alletar=0
        )
        vacas_test.append(vaca1)
        
        # Vaca con un ternero
        vaca2 = await Animal.create(
            nom="Vaca-Filter-1",
            explotacio=gurans,
            genere="F",
            estado="OK",
            alletar=1
        )
        vacas_test.append(vaca2)
        
        # Vaca con dos terneros
        vaca3 = await Animal.create(
            nom="Vaca-Filter-2",
            explotacio=gurans,
            genere="F",
            estado="OK",
            alletar=2
        )
        vacas_test.append(vaca3)
        
        # Probar filtros de API
        
        # 1. Filtrar por alletar=0
        response = client.get(f"/api/animals", params={
            "explotacio_id": gurans.id,
            "alletar": 0
        })
        assert response.status_code == 200
        data = response.json()
        
        alletar0_animals = [a for a in data["data"] if a["alletar"] == 0]
        logger.info(f"Filtro alletar=0: {len(alletar0_animals)} vacas")
        assert len(alletar0_animals) >= 1, "No se encontraron vacas con alletar=0"
        
        # 2. Filtrar por alletar=1
        response = client.get(f"/api/animals", params={
            "explotacio_id": gurans.id,
            "alletar": 1
        })
        assert response.status_code == 200
        data = response.json()
        
        alletar1_animals = [a for a in data["data"] if a["alletar"] == 1]
        logger.info(f"Filtro alletar=1: {len(alletar1_animals)} vacas")
        assert len(alletar1_animals) >= 1, "No se encontraron vacas con alletar=1"
        
        # 3. Filtrar por alletar=2
        response = client.get(f"/api/animals", params={
            "explotacio_id": gurans.id,
            "alletar": 2
        })
        assert response.status_code == 200
        data = response.json()
        
        alletar2_animals = [a for a in data["data"] if a["alletar"] == 2]
        logger.info(f"Filtro alletar=2: {len(alletar2_animals)} vacas")
        assert len(alletar2_animals) >= 1, "No se encontraron vacas con alletar=2"
        
        # Limpiar - Eliminar las vacas de prueba
        for vaca in vacas_test:
            await vaca.delete()
        
        logger.info("Test de filtros API para alletar completado correctamente")
        
    except Exception as e:
        logger.error(f"Error en test de filtros API alletar: {str(e)}")
        raise